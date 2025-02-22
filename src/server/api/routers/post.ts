import { likes, posts, reposts } from "@/lib/db/schema";
import { postView } from "@/lib/db/schema/post";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(280),
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.insert(posts).values({
        content: input.content,
        authorId: ctx.session.id,
      }).returning();

      return post[0];
    }),

  feed: protectedProcedure
    .input(z.object({
      type: z.enum(["for-you", "following"]).default("for-you"),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      await ctx.db.execute(sql`SET app.user_id = ${sql.raw(ctx.session.id.toString())}`);

      const items = await ctx.db
        .select()
        .from(postView)
        .where(cursor ? lt(postView.id, cursor) : undefined)
        .orderBy(desc(sql`COALESCE(${postView.repostCreatedAt}, ${postView.createdAt})`))
        .limit(limit + 1);

      let nextCursor: typeof cursor = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  like: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(likes).values({
        postId: input.postId,
        userId: ctx.session.id,
      });
    }),

  unlike: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(likes)
        .where(and(
          eq(likes.postId, input.postId),
          eq(likes.userId, ctx.session.id)
        ));
    }),

  delete: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [deletedPost] = await ctx.db
        .delete(posts)
        .where(
          and(
            eq(posts.id, input.postId),
            eq(posts.authorId, ctx.session.id)
          )
        )
        .returning();

      if (!deletedPost) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found or you don't have permission to delete it",
        });
      }

      return deletedPost;
    }),

  repost: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(reposts).values({
        postId: input.postId,
        userId: ctx.session.id,
      });
    }),

  unrepost: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(reposts)
        .where(and(
          eq(reposts.postId, input.postId),
          eq(reposts.userId, ctx.session.id)
        ));
    }),


  getById: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      await ctx.db.execute(sql`SET app.user_id = ${sql.raw(ctx.session.id.toString())}`);

      const post = await ctx.db.select().from(postView).where(eq(postView.id, input.postId));

      if (!post[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post[0];
    }),
  // Benzer şekilde save/unsave ve repost/unrepost mutasyonları
}); 