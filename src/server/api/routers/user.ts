import { follows, posts, users } from "@/lib/db/schema";
import { createNotification, deleteNotification } from "@/server/utils/notifications";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const postsCountResult = await ctx.db
        .select({ value: count() })
        .from(posts)
        .where(eq(posts.authorId, input.userId));

      const followersCount = await ctx.db
        .select({ value: count() })
        .from(follows)
        .where(eq(follows.followingId, input.userId));

      const followingCount = await ctx.db
        .select({ value: count() })
        .from(follows)
        .where(eq(follows.followerId, input.userId));

      const isFollowing = await ctx.db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, ctx.session.id),
          eq(follows.followingId, input.userId)
        ),
      });

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        bio: user.bio,
        followersCount: followersCount[0].value,
        followingCount: followingCount[0].value,
        postsCount: postsCountResult[0].value,
        isCurrentUser: user.id === ctx.session.id,
        isFollowing: !!isFollowing,
      };
    }),

  follow: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot follow yourself"
        });
      }

      await ctx.db.insert(follows).values({
        followerId: ctx.session.id,
        followingId: input.userId,
      });

      await createNotification(ctx.db, {
        userId: input.userId,
        actorId: ctx.session.id,
        type: "follow",
        targetId: input.userId,
        targetType: "profile",
      });
    }),

  unfollow: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(follows)
        .where(and(
          eq(follows.followerId, ctx.session.id),
          eq(follows.followingId, input.userId)
        ));

      await deleteNotification(ctx.db, {
        actorId: ctx.session.id,
        type: "follow",
        targetId: input.userId,
        targetType: "profile",
      });
    }),

  getFollowers: protectedProcedure
    .input(z.object({
      userId: z.number(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      const items = await ctx.db
        .select({
          id: users.id,
          username: users.username,
          name: users.username,
        })
        .from(follows)
        .innerJoin(users, eq(users.id, follows.followerId))
        .where(
          and(
            eq(follows.followingId, userId),
            cursor ? lt(follows.id, cursor) : undefined
          )
        )
        .orderBy(desc(follows.id))
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

  getFollowing: protectedProcedure
    .input(z.object({
      userId: z.number(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      const items = await ctx.db
        .select({
          id: users.id,
          username: users.username,
          name: users.username,
        })
        .from(follows)
        .innerJoin(users, eq(users.id, follows.followingId))
        .where(
          and(
            eq(follows.followerId, userId),
            cursor ? lt(follows.id, cursor) : undefined
          )
        )
        .orderBy(desc(follows.id))
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

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50).optional(),
      bio: z.string().max(160).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          name: input.name,
          bio: input.bio,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.session.id))
        .returning();

      if (!updatedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found"
        });
      }

      return updatedUser;
    }),

  getProfileByUsername: protectedProcedure
    .input(z.object({
      username: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const postsCountResult = await ctx.db
        .select({ value: count() })
        .from(posts)
        .where(eq(posts.authorId, user.id));

      const followersCount = await ctx.db
        .select({ value: count() })
        .from(follows)
        .where(eq(follows.followingId, user.id));

      const followingCount = await ctx.db
        .select({ value: count() })
        .from(follows)
        .where(eq(follows.followerId, user.id));

      const isFollowing = await ctx.db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, ctx.session.id),
          eq(follows.followingId, user.id)
        ),
      });

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        bio: user.bio,
        followersCount: followersCount[0].value,
        followingCount: followingCount[0].value,
        postsCount: postsCountResult[0].value,
        isCurrentUser: user.id === ctx.session.id,
        isFollowing: !!isFollowing,
      };
    }),
}); 