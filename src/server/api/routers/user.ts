import { posts, users } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const postsCountResult = await ctx.db
        .select({ value: count() })
        .from(posts)
        .where(eq(posts.authorId, input.userId));

      return {
        id: user.id,
        username: user.username,
        name: user.username,
        avatarUrl: undefined,
        coverUrl: undefined,
        followersCount: 1000, // TODO: Implement followers count
        followingCount: 500, // TODO: Implement following count
        postsCount: postsCountResult[0].value,
        isCurrentUser: user.id === ctx.session.id,
      };
    }),
}); 