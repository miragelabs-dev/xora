import { createTRPCRouter } from "../trpc";
import { authRouter } from "./auth";
import { notificationRouter } from "./notification";
import { postRouter } from "./post";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
