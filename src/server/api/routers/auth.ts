import { createTRPCRouter, protectedProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({
    ctx
  }) => {
    return ctx.session
  }),
});
