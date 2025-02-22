import { db } from "@/lib/db";
import { validateRequest } from "@/lib/session";
import { TRPCError, initTRPC } from "@trpc/server";

export const createTRPCContext = async () => {
  const session = await validateRequest();

  return {
    session,
    db,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
