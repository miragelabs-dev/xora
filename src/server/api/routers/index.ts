import { createTRPCRouter } from "../trpc";
import { authRouter } from "./auth";
import { leaderboardRouter } from "./leaderboard";
import { messageRouter } from "./message";
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
  message: messageRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
