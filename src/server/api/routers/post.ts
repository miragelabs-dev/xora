import { likes, posts, reposts, saves, users } from "@/lib/db/schema";
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
      const { type, limit, cursor } = input;

      const query = ctx.db
        .select({
          post: posts,
          author: {
            id: users.id,
            username: users.username,
            address: users.address,
          },
          commentsCount: sql<number>`'0'`, // TODO: Add comments count
          repostsCount: sql<number>`count(distinct ${reposts.id})`,
          likesCount: sql<number>`count(distinct ${likes.id})`,
          savesCount: sql<number>`count(distinct ${saves.id})`,
          isLiked: sql<boolean>`bool_or(${likes.userId} = ${ctx.session.id})`,
          isSaved: sql<boolean>`bool_or(${saves.userId} = ${ctx.session.id})`,
          isReposted: sql<boolean>`bool_or(${reposts.userId} = ${ctx.session.id})`,
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .leftJoin(likes, eq(likes.postId, posts.id))
        .leftJoin(saves, eq(saves.postId, posts.id))
        .leftJoin(reposts, eq(reposts.postId, posts.id))
        .groupBy(posts.id, users.id, users.username, users.address)
        .orderBy(desc(posts.createdAt));

      if (type === "following") {
        // TODO: Add following filter
      }

      if (cursor) {
        query.where(lt(posts.id, cursor));
      }

      query.limit(limit + 1);

      const items = await query;

      let nextCursor: typeof cursor = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.post.id;
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

  // Benzer şekilde save/unsave ve repost/unrepost mutasyonları
}); 