import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(async () => {
    // TODO: implement me

    return {
      id: 1,
      username: "test",
    };
  }),
});
