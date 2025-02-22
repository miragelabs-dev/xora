import { likes, posts, reposts, saves, users } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
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

      const items = await ctx.db
        .select({
          post: {
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            authorId: posts.authorId
          },
          author: {
            id: users.id,
            username: users.username,
            address: users.address,
          },
          repostedBy: {
            id: alias(users, "reposters").id,
            username: alias(users, "reposters").username,
          },
          repost: {
            id: reposts.id,
            createdAt: reposts.createdAt
          },
          commentsCount: sql<number>`'0'`,
          repostsCount: sql<number>`count(distinct ${reposts.id})`,
          likesCount: sql<number>`count(distinct ${likes.id})`,
          savesCount: sql<number>`count(distinct ${saves.id})`,
          isLiked: sql<boolean>`bool_or(${likes.userId} = ${ctx.session.id})`,
          isSaved: sql<boolean>`bool_or(${saves.userId} = ${ctx.session.id})`,
          isReposted: sql<boolean>`bool_or(${reposts.userId} = ${ctx.session.id})`,
        })
        .from(posts)
        .leftJoin(reposts, eq(reposts.postId, posts.id))
        .innerJoin(users, eq(users.id, posts.authorId))
        .leftJoin(
          alias(users, "reposters"),
          eq(reposts.userId, alias(users, "reposters").id)
        )
        .leftJoin(likes, eq(likes.postId, posts.id))
        .leftJoin(saves, eq(saves.postId, posts.id))
        .groupBy(
          posts.id,
          posts.content,
          posts.createdAt,
          posts.authorId,
          users.id,
          users.username,
          users.address,
          alias(users, "reposters").id,
          alias(users, "reposters").username,
          reposts.id,
          reposts.createdAt
        )
        .orderBy(desc(sql`COALESCE(${reposts.createdAt}, ${posts.createdAt})`))
        .where(cursor ? lt(posts.id, cursor) : undefined)
        .limit(limit + 1);

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

  // Benzer şekilde save/unsave ve repost/unrepost mutasyonları
}); 