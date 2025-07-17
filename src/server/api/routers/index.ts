import { createTRPCRouter } from "../trpc";
import { authRouter } from "./auth";
import { badgeRouter } from "./badge";
import { discordRouter } from "./discord";
import { messageRouter } from "./message";
import { nftRouter } from "./nft";
import { notificationRouter } from "./notification";
import { pointsRouter } from "./points";
import { postRouter } from "./post";
import { referralRouter } from "./referral";
import { streakRouter } from "./streak";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  badge: badgeRouter,
  post: postRouter,
  notification: notificationRouter,
  points: pointsRouter,
  streak: streakRouter,
  user: userRouter,
  nft: nftRouter,
  message: messageRouter,
  discord: discordRouter,
  referral: referralRouter,
});

export type AppRouter = typeof appRouter;
