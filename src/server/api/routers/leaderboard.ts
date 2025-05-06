import { users } from "@/lib/db/schema";
import { and, desc, isNotNull, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const leaderboardRouter = createTRPCRouter({
    getTopUsers: protectedProcedure.query(async ({ ctx }) => {
        const topUsers = await ctx.db
            .select({
                id: users.id,
                username: users.username,
                image: users.image,
                walletAddress: users.walletAddress,
                transactionsCount: users.transactionsCount,
                interopScore: sql<number>`${users.transactionsCount} * 10`.as('interop_score'),
            })
            .from(users)
            .where(
                and(
                    isNotNull(users.walletAddress),
                    sql`${users.walletAddress} != ''`
                )
            )
            .orderBy(desc(sql`interop_score`))
            .limit(100);

        return topUsers;
    }),
}); 