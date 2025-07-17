import { referrals, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const referralRouter = createTRPCRouter({
  generateReferralCode: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const referralCode = `${ctx.session.user.username}_${userId}`;

      await ctx.db.update(users)
        .set({ referralCode })
        .where(eq(users.id, userId));

      return { referralCode };
    }),

  getReferralCode: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: { referralCode: true }
      });

      return user?.referralCode;
    }),

  getReferralStats: protectedProcedure
    .query(async ({ ctx }) => {
      const referredUsers = await ctx.db.query.referrals.findMany({
        where: eq(referrals.referrerUserId, ctx.session.user.id),
        with: {
          referred: {
            columns: {
              username: true,
              image: true,
              createdAt: true
            }
          }
        }
      });

      return {
        totalReferrals: referredUsers.length,
        referredUsers: referredUsers.map(r => r.referred)
      };
    }),

  getUserByReferralCode: publicProcedure
    .input(z.object({ referralCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.referralCode, input.referralCode),
        columns: {
          id: true,
          username: true,
          image: true
        }
      });

      return user;
    }),

  createReferral: protectedProcedure
    .input(z.object({ referralCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const referrer = await ctx.db.query.users.findFirst({
        where: eq(users.referralCode, input.referralCode),
        columns: { id: true }
      });

      if (!referrer) {
        throw new Error("Invalid referral code");
      }

      if (referrer.id === ctx.session.user.id) {
        throw new Error("Cannot refer yourself");
      }

      const existingReferral = await ctx.db.query.referrals.findFirst({
        where: eq(referrals.referredUserId, ctx.session.user.id)
      });

      if (existingReferral) {
        throw new Error("User already has a referrer");
      }

      await ctx.db.insert(referrals).values({
        referrerUserId: referrer.id,
        referredUserId: ctx.session.user.id
      });

      return { success: true };
    }),
});