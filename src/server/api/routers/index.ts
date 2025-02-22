import { createTRPCRouter } from "../trpc";
import { authRouter } from "./auth";
import { notificationRouter } from "./notification";
import { postRouter } from "./post";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  notification: notificationRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
