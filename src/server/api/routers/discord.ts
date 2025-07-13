import { users } from "@/lib/db/schema/user";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const DISCORD_API_BASE = "https://discord.com/api/v10";

interface DiscordUser {
    id: string;
    username: string;
    avatar: string | null;
}

interface DiscordTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export const discordRouter = createTRPCRouter({
    getAuthUrl: publicProcedure.query(() => {
        const params = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            redirect_uri: process.env.DISCORD_REDIRECT_URI!,
            response_type: "code",
            scope: "identify email",
        });

        return {
            url: `https://discord.com/oauth2/authorize?${params.toString()}`,
        };
    }),

    handleCallback: protectedProcedure
        .input(z.object({
            code: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            try {
                const userId = ctx.session.user.id;

                const tokenResponse = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        client_id: process.env.DISCORD_CLIENT_ID!,
                        client_secret: process.env.DISCORD_CLIENT_SECRET!,
                        grant_type: "authorization_code",
                        code: input.code,
                        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
                    }),
                });

                if (!tokenResponse.ok) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Discord token alınamadı",
                    });
                }

                const tokenData: DiscordTokenResponse = await tokenResponse.json();

                const userResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                    },
                });

                if (!userResponse.ok) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Discord kullanıcı bilgileri alınamadı",
                    });
                }

                const discordUser: DiscordUser = await userResponse.json();

                const existingConnection = await ctx.db
                    .select()
                    .from(users)
                    .where(eq(users.discordId, discordUser.id))
                    .limit(1);

                if (existingConnection.length > 0 && existingConnection[0]?.id !== userId) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Bu Discord hesabı başka bir kullanıcı tarafından kullanılıyor",
                    });
                }

                await ctx.db
                    .update(users)
                    .set({
                        discordId: discordUser.id,
                        discordUsername: discordUser.username,
                        discordAvatar: discordUser.avatar,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));

                return {
                    success: true,
                    discordUser: {
                        id: discordUser.id,
                        username: discordUser.username,
                        avatar: discordUser.avatar,
                    },
                };
            } catch (error) {
                throw error;
            }
        }),

    disconnect: protectedProcedure
        .mutation(async ({ ctx }) => {
            const userId = ctx.session.user.id;
            const user = await ctx.db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user[0]?.discordId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Discord bağlantısı bulunamadı",
                });
            }

            await ctx.db
                .update(users)
                .set({
                    discordId: null,
                    discordUsername: null,
                    discordAvatar: null,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            return { success: true };
        }),

    getConnectionStatus: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;
            const user = await ctx.db
                .select({
                    discordId: users.discordId,
                    discordUsername: users.discordUsername,
                    discordAvatar: users.discordAvatar,
                })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user[0]) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Kullanıcı bulunamadı",
                });
            }

            const isConnected = !!user[0].discordId;

            return {
                isConnected,
                discordUser: isConnected ? {
                    id: user[0].discordId,
                    username: user[0].discordUsername,
                    avatar: user[0].discordAvatar,
                } : null,
            };
        }),
});