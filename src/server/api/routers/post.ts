import { follows, likes, posts, reposts, saves, users } from "@/lib/db/schema";
import { setUserId } from "@/server/utils/db";
import { enrichPosts, enrichReplyTo } from "@/server/utils/enrich-posts";
import { getAllPostQuery } from "@/server/utils/get-all-post-query";
import { createNotification, deleteNotification } from "@/server/utils/notifications";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(280),
      image: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [result] = await ctx.db.insert(posts).values({
        content: input.content,
        authorId: ctx.session.user.id,
        image: input.image || null,
      }).returning();

      return result;
    }),

  feed: publicProcedure
    .input(z.object({
      type: z.enum(["for-you", "following", "user", "replies", "interests"]).default("for-you"),
      userId: z.number().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { type, limit, cursor, userId } = input;

      const sessionUserId = ctx.session?.user?.id ?? 0;

      const conditions = [];

      if (type === 'user' && userId) {
        const userPostsCondition = sql`(
          (${posts.authorId} = ${userId} AND ${posts.replyToId} IS NULL AND ${reposts.id} IS NULL) OR 
          (${reposts.userId} = ${userId} AND ${posts.replyToId} IS NULL)
        )`;
        conditions.push(userPostsCondition);
      }

      if (type === 'interests') {
        const subquery = ctx.db
          .select({ followingId: follows.followingId })
          .from(follows)
          .leftJoin(users, eq(follows.followingId, users.id))
          .where(
            and(
              eq(users.isCryptoBot, true),
              userId ? eq(follows.followerId, userId) : ctx.session?.user?.id ? eq(follows.followerId, ctx.session.user.id) : undefined
            )
          );

        conditions.push(sql`${posts.authorId} IN (${subquery})`);
      }

      if (type === 'replies' && userId) {
        conditions.push(eq(posts.authorId, userId));
        conditions.push(sql`${posts.replyToId} IS NOT NULL`);
      }

      if (type === 'following') {
        const subquery = ctx.db
          .select({ followingId: follows.followingId })
          .from(follows)
          .leftJoin(users, eq(follows.followingId, users.id))
          .where(
            and(
              ctx.session?.user?.id ? eq(follows.followerId, ctx.session.user.id) : undefined,
              eq(users.isCryptoBot, false)
            )
          );

        conditions.push(sql`${posts.authorId} IN (${subquery})`);
      }

      const results = await getAllPostQuery({ userId })
        .where(and(...conditions))
        .orderBy(desc(sql`COALESCE(${reposts.createdAt}, ${posts.createdAt})`))
        .limit(limit + 1)
        .offset(cursor);


      let nextCursor: number | null = null;

      if (results.length > limit) {
        results.pop();
        nextCursor = input.cursor + input.limit;
      }

      const enriched = await enrichPosts(results, sessionUserId);
      const items = await enrichReplyTo(enriched, sessionUserId);

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
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.insert(likes).values({
        postId: input.postId,
        userId: ctx.session.user.id,
      });

      if (post.authorId !== ctx.session.user.id) {
        await createNotification(ctx.db, {
          userId: post.authorId,
          actorId: ctx.session.user.id,
          type: "like",
          targetId: input.postId,
          targetType: "post",
        });
      }
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
          eq(likes.userId, ctx.session.user.id)
        ));

      await deleteNotification(ctx.db, {
        actorId: ctx.session.user.id,
        type: "like",
        targetId: input.postId,
        targetType: "post",
      });
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
            eq(posts.authorId, ctx.session.user.id)
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
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.insert(reposts).values({
        postId: input.postId,
        userId: ctx.session.user.id,
      });

      if (post.authorId !== ctx.session.user.id) {
        await createNotification(ctx.db, {
          userId: post.authorId,
          actorId: ctx.session.user.id,
          type: "repost",
          targetId: input.postId,
          targetType: "post",
        });
      }
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
          eq(reposts.userId, ctx.session.user.id)
        ));

      await deleteNotification(ctx.db, {
        actorId: ctx.session.user.id,
        type: "repost",
        targetId: input.postId,
        targetType: "post",
      });
    }),

  getById: publicProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .query(async ({ input }) => {
      const post = await getAllPostQuery({})
        .where(
          and(
            eq(posts.id, input.postId),
          )
        );

      if (!post[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const enriched = await enrichPosts([post[0]], 0);
      return (await enrichReplyTo(enriched, 0))[0];
    }),

  save: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.insert(saves).values({
        postId: input.postId,
        userId: ctx.session.user.id,
      });
    }),

  unsave: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(saves)
        .where(and(
          eq(saves.postId, input.postId),
          eq(saves.userId, ctx.session.user.id)
        ));

      await deleteNotification(ctx.db, {
        actorId: ctx.session.user.id,
        type: "save",
        targetId: input.postId,
        targetType: "post",
      });
    }),

  bookmarks: protectedProcedure
    .query(async ({ ctx }) => {
      await setUserId(ctx.db, ctx.session.user.id);

      const results = await getAllPostQuery({})
        .innerJoin(saves, eq(saves.postId, posts.id))
        .where(eq(saves.userId, ctx.session.user.id))
        .orderBy(desc(posts.createdAt));

      const enriched = await enrichPosts(results, ctx.session.user.id);
      const items = await enrichReplyTo(enriched, ctx.session.user.id);

      return items.map(item => ({
        ...item,
        repostedUsername: null,
        repostId: null,
        repostCount: null
      }));
    }),

  reply: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(280),
      image: z.string().nullable().optional(),
      replyToId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const parentPost = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.replyToId),
      });

      if (!parentPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [post] = await ctx.db.insert(posts).values({
        content: input.content,
        authorId: ctx.session.user.id,
        image: input.image || null,
        replyToId: input.replyToId,
      }).returning();

      if (parentPost.authorId !== ctx.session.user.id) {
        await createNotification(ctx.db, {
          userId: parentPost.authorId,
          actorId: ctx.session.user.id,
          type: "comment",
          targetId: input.replyToId,
          targetType: "post",
        });
      }

      return post;
    }),

  getReplies: publicProcedure
    .input(z.object({
      postId: z.number(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      console.log("getReplies", input);
      await setUserId(ctx.db, ctx.session?.user?.id);

      const results = await getAllPostQuery({})
        .where(
          and(
            eq(posts.replyToId, input.postId),
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor);

      const enriched = await enrichPosts(results, 0);
      const items = await enrichReplyTo(enriched, 0);
      let nextCursor: number | null = null;

      if (items.length > input.limit) {
        items.pop();
        nextCursor = input.cursor + input.limit;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getTrendingHashtags: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const hashtags = await ctx.db
        .select({
          tag: sql<string>`substring(${posts.content} from '#([A-Za-z0-9_]+)')`,
          count: sql<number>`count(*)`
        })
        .from(posts)
        .where(sql`
          ${posts.createdAt} > NOW() - INTERVAL '7 days'
          AND ${posts.content} ~ '#[A-Za-z0-9_]+'
        `)
        .groupBy(sql`substring(${posts.content} from '#([A-Za-z0-9_]+)')`)
        .having(sql`substring(${posts.content} from '#([A-Za-z0-9_]+)') IS NOT NULL`)
        .orderBy(sql`count(*) DESC`)
        .limit(input.limit + 1);

      return hashtags.map(({ tag, count }) => ({
        tag,
        count: Number(count)
      }));
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      await setUserId(ctx.db, ctx.session.user.id);

      const results = await getAllPostQuery({})
        .where(
          input.query.startsWith('#')
            ? sql`${posts.content} ~* ${input.query.toLowerCase().replace('#', '#[A-Za-z0-9_]*')}`
            : sql`${posts.content} ~* ${input.query}`
        )
        .orderBy(desc(posts.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor);

      const enriched = await enrichPosts(results, ctx.session.user.id);
      const items = await enrichReplyTo(enriched, ctx.session.user.id);

      let nextCursor: number | null = null;

      if (items.length > input.limit) {
        items.pop();
        nextCursor = input.cursor + input.limit;
      }

      return {
        items,
        nextCursor,
      };
    }),
}); 