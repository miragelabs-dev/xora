import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { userActivities, users } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const pointsRouter = createTRPCRouter({
  getUserPoints: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      const pointsData = await ctx.db
        .select({
          totalPoints: sql<number>`sum(${userActivities.points})`,
          activityCount: sql<number>`count(*)`,
        })
        .from(userActivities)
        .where(eq(userActivities.userId, userId))
        .groupBy(userActivities.userId);

      const pointsByType = await ctx.db
        .select({
          activityType: userActivities.activityType,
          points: sql<number>`sum(${userActivities.points})`,
          count: sql<number>`count(*)`,
        })
        .from(userActivities)
        .where(eq(userActivities.userId, userId))
        .groupBy(userActivities.activityType);

      return {
        totalPoints: pointsData[0]?.totalPoints || 0,
        totalActivities: pointsData[0]?.activityCount || 0,
        breakdown: pointsByType.map(item => ({
          activityType: item.activityType,
          points: item.points,
          count: item.count,
        })),
      };
    }),

  addPoints: protectedProcedure
    .input(z.object({
      activityType: z.enum(["like", "post", "streak", "badge", "follow", "comment"]),
      points: z.number().min(1).max(100),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const [activity] = await ctx.db
        .insert(userActivities)
        .values({
          userId,
          activityType: input.activityType,
          points: input.points,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        })
        .returning();

      const newTotal = await ctx.db
        .select({ totalPoints: sql<number>`sum(${userActivities.points})` })
        .from(userActivities)
        .where(eq(userActivities.userId, userId));

      return {
        activity,
        newTotalPoints: newTotal[0]?.totalPoints || 0,
      };
    }),

  getPointsHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().default(0),
      activityType: z.enum(["like", "post", "streak", "badge", "follow", "comment"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const conditions = [eq(userActivities.userId, userId)];
      
      if (input.activityType) {
        conditions.push(eq(userActivities.activityType, input.activityType));
      }

      const activities = await ctx.db
        .select()
        .from(userActivities)
        .where(and(...conditions))
        .orderBy(desc(userActivities.createdAt))
        .limit(input.limit + 1)
        .offset(input.cursor);

      let nextCursor: number | null = null;
      if (activities.length > input.limit) {
        activities.pop();
        nextCursor = input.cursor + input.limit;
      }

      return {
        activities: activities.map(activity => ({
          ...activity,
          metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
        })),
        nextCursor,
      };
    }),

  getLeaderboard: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      timeframe: z.enum(["all", "week", "month"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      let dateCondition = sql`1=1`;
      
      if (input.timeframe === "week") {
        dateCondition = sql`${userActivities.createdAt} >= NOW() - INTERVAL '7 days'`;
      } else if (input.timeframe === "month") {
        dateCondition = sql`${userActivities.createdAt} >= NOW() - INTERVAL '30 days'`;
      }

      const leaderboard = await ctx.db
        .select({
          userId: userActivities.userId,
          username: users.username,
          image: users.image,
          isVerified: users.isVerified,
          totalPoints: sql<number>`sum(${userActivities.points})`,
          activityCount: sql<number>`count(*)`,
        })
        .from(userActivities)
        .innerJoin(users, eq(userActivities.userId, users.id))
        .where(dateCondition)
        .groupBy(userActivities.userId, users.username, users.image, users.isVerified)
        .orderBy(sql`sum(${userActivities.points}) DESC`)
        .limit(input.limit);

      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));
    }),

  getPointsStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [totalStats] = await ctx.db
        .select({
          totalPoints: sql<number>`sum(${userActivities.points})`,
          totalActivities: sql<number>`count(*)`,
        })
        .from(userActivities)
        .where(eq(userActivities.userId, userId));

      const [todayStats] = await ctx.db
        .select({
          todayPoints: sql<number>`sum(${userActivities.points})`,
          todayActivities: sql<number>`count(*)`,
        })
        .from(userActivities)
        .where(
          and(
            eq(userActivities.userId, userId),
            sql`DATE(${userActivities.createdAt}) = ${today}`
          )
        );

      const [weekStats] = await ctx.db
        .select({
          weekPoints: sql<number>`sum(${userActivities.points})`,
          weekActivities: sql<number>`count(*)`,
        })
        .from(userActivities)
        .where(
          and(
            eq(userActivities.userId, userId),
            sql`${userActivities.createdAt} >= ${weekAgo}`
          )
        );

      const userRank = await ctx.db
        .select({
          rank: sql<number>`row_number() over (order by sum(${userActivities.points}) desc)`,
          userId: userActivities.userId,
        })
        .from(userActivities)
        .groupBy(userActivities.userId)
        .having(eq(userActivities.userId, userId));

      return {
        totalPoints: totalStats?.totalPoints || 0,
        totalActivities: totalStats?.totalActivities || 0,
        todayPoints: todayStats?.todayPoints || 0,
        todayActivities: todayStats?.todayActivities || 0,
        weekPoints: weekStats?.weekPoints || 0,
        weekActivities: weekStats?.weekActivities || 0,
        globalRank: userRank[0]?.rank || 0,
      };
    }),
});