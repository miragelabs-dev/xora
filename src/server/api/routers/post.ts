import { follows, likes, posts, reposts, saves, users } from "@/lib/db/schema";
import { postView } from "@/lib/db/schema/post-view";
import { setUserId } from "@/server/utils/db";
import { createNotification, deleteNotification } from "@/server/utils/notifications";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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

  feed: protectedProcedure
    .input(z.object({
      type: z.enum(["for-you", "following", "user", "replies", "interests"]).default("for-you"),
      userId: z.number().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { type, limit, cursor, userId } = input;

      await setUserId(ctx.db, ctx.session.user.id);

      const baseQuery = ctx.db
        .select()
        .from(postView)
        .orderBy(desc(sql`COALESCE(${postView.repostedAt}, ${postView.createdAt})`));

      const conditions = [];

      if (type === 'user' && userId) {
        const userPostsCondition = sql`(
          (${postView.authorId} = ${userId} AND ${postView.replyToId} IS NULL AND ${postView.repostedById} IS NULL) OR 
          (${postView.repostedById} = ${userId} AND ${postView.replyToId} IS NULL)
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
              userId ? eq(follows.followerId, userId) : eq(follows.followerId, ctx.session.user.id)
            )
          );

        conditions.push(sql`${postView.authorId} IN (${subquery})`);
      }

      if (type === 'replies' && userId) {
        conditions.push(eq(postView.authorId, userId));
        conditions.push(sql`${postView.replyToId} IS NOT NULL`);
      }

      if (type === 'following') {
        const subquery = ctx.db
          .select({ followingId: follows.followingId })
          .from(follows)
          .leftJoin(users, eq(follows.followingId, users.id))
          .where(
            and(
              eq(follows.followerId, ctx.session.user.id),
              eq(users.isCryptoBot, false)
            )
          );

        conditions.push(sql`${postView.authorId} IN (${subquery})`);
      }

      if (cursor) {
        conditions.push(lt(postView.id, cursor));
      }

      const items = await baseQuery
        .where(and(...conditions))
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

  getById: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      await setUserId(ctx.db, ctx.session.user.id);

      const post = await ctx.db.select()
        .from(postView)
        .where(
          and(
            eq(postView.id, input.postId),
            isNull(postView.repostedById)
          )
        );

      if (!post[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post[0];
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

      const posts = await ctx.db
        .select()
        .from(postView)
        .innerJoin(saves, eq(saves.postId, postView.id))
        .where(eq(saves.userId, ctx.session.user.id))
        .orderBy(desc(postView.createdAt));

      return posts.map(({ post_view: post }) => post);
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

  getReplies: protectedProcedure
    .input(z.object({
      postId: z.number(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      await setUserId(ctx.db, ctx.session.user.id);

      const items = await ctx.db
        .select()
        .from(postView)
        .where(
          and(
            eq(postView.replyToId, input.postId),
            input.cursor ? lt(postView.id, input.cursor) : undefined
          )
        )
        .orderBy(desc(postView.createdAt))
        .limit(input.limit + 1);

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getTrendingHashtags: protectedProcedure
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
        .limit(input.limit);

      return hashtags.map(({ tag, count }) => ({
        tag,
        count: Number(count)
      }));
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      await setUserId(ctx.db, ctx.session.user.id);

      const items = await ctx.db
        .select()
        .from(postView)
        .where(
          input.query.startsWith('#')
            ? sql`${postView.content} ~* ${input.query.toLowerCase().replace('#', '#[A-Za-z0-9_]*')}`
            : sql`${postView.content} ~* ${input.query}`
        )
        .orderBy(desc(postView.createdAt))
        .limit(input.limit + 1);

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
}); 