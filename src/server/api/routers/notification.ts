import { notifications, notificationView } from "@/lib/db/schema/notification";
import { and, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const items = await ctx.db
        .select()
        .from(notificationView)
        .where(
          and(
            eq(notificationView.userId, ctx.session.user.id),
            cursor ? lt(notificationView.id, cursor) : undefined
          )
        )
        .orderBy(desc(notificationView.createdAt))
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
}); 