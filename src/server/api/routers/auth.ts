import { processReferral } from "@/server/utils/referral";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({
    ctx
  }) => {
    return ctx.session.user
  }),

  validateWithReferral: protectedProcedure
    .input(z.object({ referralCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await processReferral(ctx.session.user.id, input.referralCode);

      return true;
    }),
});
