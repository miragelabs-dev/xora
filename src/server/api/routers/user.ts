import { getCelestiaTransactionCount } from "@/lib/celestia";
import { follows, likes, posts, reposts, saves, users } from "@/lib/db/schema";
import { createNotification, deleteNotification } from "@/server/utils/notifications";
import { TRPCError } from "@trpc/server";
import type { InferSelectModel } from "drizzle-orm";
import { and, count, desc, eq, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

type DBUser = InferSelectModel<typeof users>;

export type ProfileResponse = DBUser & {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isCurrentUser: boolean;
  isFollowing: boolean;
};

export const userRouter = createTRPCRouter({
  follow: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot follow yourself"
        });
      }

      await ctx.db.insert(follows).values({
        followerId: ctx.session.user.id,
        followingId: input.userId,
      });

      await createNotification(ctx.db, {
        userId: input.userId,
        actorId: ctx.session.user.id,
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
          eq(follows.followerId, ctx.session.user.id),
          eq(follows.followingId, input.userId)
        ));

      await deleteNotification(ctx.db, {
        actorId: ctx.session.user.id,
        type: "follow",
        targetId: input.userId,
        targetType: "profile",
      });
    }),

  getFollowers: publicProcedure
    .input(z.object({
      username: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { username, limit, cursor } = input;

      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const items = await ctx.db
        .select({
          id: users.id,
          username: users.username,
          name: users.username,
          image: users.image,
        })
        .from(follows)
        .innerJoin(users, eq(users.id, follows.followerId))
        .where(
          and(
            eq(follows.followingId, targetUser.id),
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

  getFollowing: publicProcedure
    .input(z.object({
      username: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { username, limit, cursor } = input;

      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const items = await ctx.db
        .select({
          id: users.id,
          username: users.username,
          image: users.image,
        })
        .from(follows)
        .innerJoin(users, eq(users.id, follows.followingId))
        .where(
          and(
            eq(follows.followerId, targetUser.id),
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
    .input(
      z.object({
        username: z.string()
          .min(3, "Username must be at least 3 characters")
          .max(20, "Username must be less than 20 characters")
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
          ),
        bio: z.string()
          .max(160, "Bio must be less than 160 characters")
          .nullable(),
        image: z.string().nullable(),
        cover: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existingUser = await ctx.db.query.users.findFirst({
          where: and(
            sql`LOWER(${users.username}) = LOWER(${input.username})`,
            sql`${users.id} != ${ctx.session.user.id}`
          ),
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This username is already taken"
          });
        }

        const updatedUser = await ctx.db
          .update(users)
          .set({
            username: input.username,
            bio: input.bio,
            image: input.image,
            cover: input.cover,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.session.user.id))
          .returning();

        if (!updatedUser[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
          });
        }

        return updatedUser[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again later"
        });
      }
    }),

  updateWalletAddress: protectedProcedure
    .input(
      z.object({
        walletAddress: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedUser = await ctx.db
          .update(users)
          .set({
            walletAddress: input.walletAddress,
          })
          .where(eq(users.id, ctx.session.user.id))
          .returning();

        if (!updatedUser[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
          });
        }

        return updatedUser[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again later"
        });
      }
    }),


  getProfileByUsername: publicProcedure
    .input(z.object({
      username: z.string(),
    }))
    .query(async ({ ctx, input }): Promise<ProfileResponse> => {
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

      let isFollowing: boolean | undefined;

      if (ctx.session?.user?.id) {
        const following = await ctx.db.query.follows.findFirst({
          where: and(
            eq(follows.followerId, ctx.session.user.id),
            eq(follows.followingId, user.id)
          ),
        });

        isFollowing = !!following;
      }

      return {
        ...user,
        followersCount: followersCount[0].value,
        followingCount: followingCount[0].value,
        postsCount: postsCountResult[0].value,
        isCurrentUser: user.address === ctx.session?.user?.address,
        isFollowing: !!isFollowing,
      };
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(50),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;

      const searchResults = await ctx.db
        .select({
          id: users.id,
          username: users.username,
          image: users.image,
        })
        .from(users)
        .where(
          sql`(${users.username} ILIKE ${`%${query}%`})`
        )
        .limit(limit);

      return searchResults;
    }),

  getRandomUsers: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(3),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(users).orderBy(sql`RANDOM()`).limit(input.limit);
    }),

  getRandomSuggestions: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(3),
    }))
    .query(async ({ ctx, input }) => {
      const suggestions = await ctx.db
        .select({
          id: users.id,
          username: users.username,
          image: users.image,
        })
        .from(users)
        .where(
          and(
            eq(users.isCryptoBot, false),
            sql`${users.id} != ${ctx.session.user.id} AND NOT EXISTS (
              SELECT 1 FROM ${follows}
              WHERE ${follows.followerId} = ${ctx.session.user.id}
              AND ${follows.followingId} = ${users.id}
            )`
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(input.limit);

      return suggestions;
    }),

  getLandingStats: publicProcedure
    .query(async ({ ctx }) => {
      const [stats] = await ctx.db
        .select({
          usersCount: sql<number>`count(distinct ${users.id})`,
          postsCount: sql<number>`count(distinct ${posts.id})`,
          interactionsCount: sql<number>`(
            select count(*) from (
              select id from ${likes}
              union all
              select id from ${reposts}
              union all
              select id from ${saves}
            ) as interactions
          )`
        })
        .from(users);

      return {
        usersCount: Math.floor(stats.usersCount * 1.5),
        postsCount: Math.floor(stats.postsCount * 1.2),
        interactionsCount: Math.floor(stats.interactionsCount * 1.3)
      };
    }),

  getTopCryptoAccounts: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in"
        });
      }

      const cryptoAccounts = await ctx.db
        .select()
        .from(users)
        .leftJoin(
          follows,
          and(
            eq(follows.followerId, ctx.session.user.id),
            eq(follows.followingId, users.id)
          )
        )
        .where(
          and(
            eq(users.isCryptoBot, true),
            eq(users.isVerified, true)
          )
        )
        .orderBy(users.username)
        .then(rows => rows.map(row => ({
          id: row.users.id,
          address: row.users.address,
          username: row.users.username,
          image: row.users.image,
          isVerified: row.users.isVerified,
          isFollowing: !!row.follows
        })));

      return cryptoAccounts;
    }),

  getById: protectedProcedure
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

      return user;
    }),

  updateTransactionCount: publicProcedure
    .input(z.object({
      userUsername: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.userUsername),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!user.walletAddress) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has no wallet address"
        });
      }

      const transactionCount = await getCelestiaTransactionCount(user.walletAddress);

      await ctx.db
        .update(users)
        .set({
          transactionsCount: transactionCount,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return { success: true };
    }),
}); 