import { posts } from "@/lib/db/schema";
import { notifications } from "@/lib/db/schema/notification";
import { users } from "@/lib/db/schema/user";
import { inferRouterOutputs } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { AppRouter } from ".";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const actorAlias = alias(users, "actor");
      const userAlias = alias(users, "user");
      const postAlias = alias(posts, "post");

      const items = await ctx.db
        .select({
          id: notifications.id,
          userId: notifications.userId,
          userUsername: userAlias.username,
          actorId: notifications.actorId,
          actorUsername: actorAlias.username,
          actorImage: actorAlias.image,
          type: notifications.type,
          read: notifications.read,
          createdAt: notifications.createdAt,
          targetId: notifications.targetId,
          targetType: notifications.targetType,
          postContent: sql<string>`
            CASE
              WHEN ${notifications.targetType} = 'post' THEN ${postAlias.content}
              WHEN ${notifications.targetType} = 'user' THEN 'user'
              ELSE ''
            END
          `.as('post_content'),
        })
        .from(notifications)
        .innerJoin(actorAlias, eq(notifications.actorId, actorAlias.id))
        .innerJoin(userAlias, eq(notifications.userId, userAlias.id))
        .leftJoin(postAlias, eq(notifications.targetId, postAlias.id))
        .where(
          and(
            eq(notifications.userId, ctx.session.user.id),
            sql`(
              (${notifications.targetType} = 'post' AND ${postAlias.id} IS NOT NULL) OR
              (${notifications.targetType} != 'post')
            )`
          )
        )
        .orderBy(desc(notifications.createdAt))
        .offset(cursor)
        .limit(limit + 1);

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

  markAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.session.user.id)
          )
        );
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await ctx.db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, ctx.session.user.id));
    }),

  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const [result] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.session.user.id),
            eq(notifications.read, false)
          )
        );

      return result.count;
    }),
});

export type Notification = inferRouterOutputs<AppRouter>["notification"]["list"]["items"][number];