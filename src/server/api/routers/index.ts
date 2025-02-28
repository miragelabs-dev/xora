import { createTRPCRouter } from "../trpc";
import { authRouter } from "./auth";
import { nftRouter } from "./nft";
import { notificationRouter } from "./notification";
import { postRouter } from "./post";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  notification: notificationRouter,
  user: userRouter,
  nft: nftRouter,
});

export type AppRouter = typeof appRouter;
