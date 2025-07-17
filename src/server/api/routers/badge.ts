import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { badges, userBadges, userActivities, users } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const badgeRouter = createTRPCRouter({
  getUserBadges: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      const userBadgesList = await ctx.db
        .select({
          id: userBadges.id,
          earnedAt: userBadges.earnedAt,
          badge: {
            id: badges.id,
            name: badges.name,
            description: badges.description,
            icon: badges.icon,
            requirementType: badges.requirementType,
            requirementValue: badges.requirementValue,
          },
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, userId))
        .orderBy(desc(userBadges.earnedAt));

      return userBadgesList;
    }),

  getUserBadgesByUsername: publicProcedure
    .input(z.object({
      username: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: sql`LOWER(${users.username}) = LOWER(${input.username})`
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found"
        });
      }
      
      const userBadgesList = await ctx.db
        .select({
          id: userBadges.id,
          earnedAt: userBadges.earnedAt,
          badge: {
            id: badges.id,
            name: badges.name,
            description: badges.description,
            icon: badges.icon,
            requirementType: badges.requirementType,
            requirementValue: badges.requirementValue,
          },
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, user.id))
        .orderBy(desc(userBadges.earnedAt));

      return userBadgesList;
    }),

  getAllBadges: publicProcedure
    .query(async ({ ctx }) => {
      const allBadges = await ctx.db
        .select()
        .from(badges)
        .orderBy(badges.requirementValue);

      return allBadges;
    }),

  getBadgeProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      const allBadges = await ctx.db
        .select()
        .from(badges)
        .orderBy(badges.requirementValue);

      const userBadgesList = await ctx.db
        .select({ badgeId: userBadges.badgeId })
        .from(userBadges)
        .where(eq(userBadges.userId, userId));

      const earnedBadgeIds = new Set(userBadgesList.map(ub => ub.badgeId));

      const progressData = await Promise.all(
        allBadges.map(async (badge) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          let currentProgress = 0;

          if (!isEarned) {
            switch (badge.requirementType) {
              case "streak":
                const streakQuery = await ctx.db
                  .select({ longestStreak: sql<number>`max(longest_streak)` })
                  .from(ctx.db.query.userStreaks.findFirst({
                    where: eq(ctx.db.query.userStreaks.userId, userId),
                  }));
                currentProgress = streakQuery[0]?.longestStreak || 0;
                break;
              
              case "likes":
                const likesQuery = await ctx.db
                  .select({ count: sql<number>`count(*)` })
                  .from(userActivities)
                  .where(
                    and(
                      eq(userActivities.userId, userId),
                      eq(userActivities.activityType, "like")
                    )
                  );
                currentProgress = likesQuery[0]?.count || 0;
                break;
              
              case "posts":
                const postsQuery = await ctx.db
                  .select({ count: sql<number>`count(*)` })
                  .from(userActivities)
                  .where(
                    and(
                      eq(userActivities.userId, userId),
                      eq(userActivities.activityType, "post")
                    )
                  );
                currentProgress = postsQuery[0]?.count || 0;
                break;
              
              case "points":
                const pointsQuery = await ctx.db
                  .select({ total: sql<number>`sum(points)` })
                  .from(userActivities)
                  .where(eq(userActivities.userId, userId));
                currentProgress = pointsQuery[0]?.total || 0;
                break;
            }
          }

          return {
            ...badge,
            isEarned,
            currentProgress,
            progressPercentage: isEarned ? 100 : Math.min((currentProgress / badge.requirementValue) * 100, 100),
          };
        })
      );

      return progressData;
    }),

  checkAndAwardBadges: protectedProcedure
    .input(z.object({
      activityType: z.enum(["like", "post", "streak", "points"]),
      currentValue: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const eligibleBadges = await ctx.db
        .select()
        .from(badges)
        .where(eq(badges.requirementType, input.activityType));

      const newBadges = [];

      for (const badge of eligibleBadges) {
        if (input.currentValue >= badge.requirementValue) {
          const existingBadge = await ctx.db.query.userBadges.findFirst({
            where: and(
              eq(userBadges.userId, userId),
              eq(userBadges.badgeId, badge.id)
            ),
          });

          if (!existingBadge) {
            await ctx.db.insert(userBadges).values({
              userId,
              badgeId: badge.id,
            });

            await ctx.db.insert(userActivities).values({
              userId,
              activityType: "badge",
              points: 50,
              metadata: JSON.stringify({ 
                badgeId: badge.id, 
                badgeName: badge.name,
                requirementType: badge.requirementType,
                requirementValue: badge.requirementValue
              }),
            });

            newBadges.push(badge);
          }
        }
      }

      return { newBadges };
    }),

  getBadgeStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      const stats = await ctx.db
        .select({
          totalBadges: sql<number>`count(*)`,
          totalBadgePoints: sql<number>`sum(${userActivities.points})`,
        })
        .from(userBadges)
        .leftJoin(userActivities, 
          and(
            eq(userActivities.userId, userBadges.userId),
            eq(userActivities.activityType, "badge")
          )
        )
        .where(eq(userBadges.userId, userId))
        .groupBy(userBadges.userId);

      const totalAvailableBadges = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(badges);

      return {
        earnedBadges: stats[0]?.totalBadges || 0,
        totalBadges: totalAvailableBadges[0]?.count || 0,
        badgePoints: stats[0]?.totalBadgePoints || 0,
      };
    }),
});