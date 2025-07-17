import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userStreaks, userActivities, badges, userBadges } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const streakRouter = createTRPCRouter({
  getStreak: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      let userStreak = await ctx.db.query.userStreaks.findFirst({
        where: eq(userStreaks.userId, userId),
      });

      if (!userStreak) {
        [userStreak] = await ctx.db.insert(userStreaks).values({
          userId,
          currentStreak: 0,
          longestStreak: 0,
        }).returning();
      }

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (userStreak.lastActivityDate === yesterday) {
        return {
          ...userStreak,
          canExtendToday: true,
        };
      } else if (userStreak.lastActivityDate === today) {
        return {
          ...userStreak,
          canExtendToday: false,
        };
      } else {
        return {
          ...userStreak,
          currentStreak: 0,
          canExtendToday: true,
        };
      }
    }),

  updateStreak: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const today = new Date().toISOString().split('T')[0];
      
      let userStreak = await ctx.db.query.userStreaks.findFirst({
        where: eq(userStreaks.userId, userId),
      });

      if (!userStreak) {
        [userStreak] = await ctx.db.insert(userStreaks).values({
          userId,
          currentStreak: 0,
          longestStreak: 0,
        }).returning();
      }

      if (userStreak.lastActivityDate === today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Streak already updated today",
        });
      }

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const isConsecutive = userStreak.lastActivityDate === yesterday;
      const newStreak = isConsecutive ? userStreak.currentStreak + 1 : 1;
      const newLongestStreak = Math.max(userStreak.longestStreak, newStreak);

      const [updatedStreak] = await ctx.db
        .update(userStreaks)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastActivityDate: today,
          updatedAt: new Date(),
        })
        .where(eq(userStreaks.userId, userId))
        .returning();

      await ctx.db.insert(userActivities).values({
        userId,
        activityType: "streak",
        points: 10,
        metadata: JSON.stringify({ streak: newStreak }),
      });

      await checkAndAwardBadges(ctx.db, userId, newStreak);

      return {
        ...updatedStreak,
        canExtendToday: false,
      };
    }),

  getStreakStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      const stats = await ctx.db
        .select({
          totalStreaks: sql<number>`count(*)`,
          totalPoints: sql<number>`sum(${userActivities.points})`,
          longestStreak: sql<number>`max(${userStreaks.longestStreak})`,
        })
        .from(userActivities)
        .leftJoin(userStreaks, eq(userStreaks.userId, userActivities.userId))
        .where(
          and(
            eq(userActivities.userId, userId),
            eq(userActivities.activityType, "streak")
          )
        )
        .groupBy(userActivities.userId);

      return stats[0] || {
        totalStreaks: 0,
        totalPoints: 0,
        longestStreak: 0,
      };
    }),

  getRecentActivities: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const activities = await ctx.db
        .select()
        .from(userActivities)
        .where(eq(userActivities.userId, userId))
        .orderBy(desc(userActivities.createdAt))
        .limit(input.limit);

      return activities;
    }),
});

async function checkAndAwardBadges(db: any, userId: number, currentStreak: number) {
  const streakBadges = await db.query.badges.findMany({
    where: eq(badges.requirementType, "streak"),
  });

  for (const badge of streakBadges) {
    if (currentStreak >= badge.requirementValue) {
      const existingBadge = await db.query.userBadges.findFirst({
        where: and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badge.id)
        ),
      });

      if (!existingBadge) {
        await db.insert(userBadges).values({
          userId,
          badgeId: badge.id,
        });

        await db.insert(userActivities).values({
          userId,
          activityType: "badge",
          points: 50,
          metadata: JSON.stringify({ badgeId: badge.id, badgeName: badge.name }),
        });
      }
    }
  }
}