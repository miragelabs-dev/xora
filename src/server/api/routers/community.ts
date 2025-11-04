import { communities, communityMembers, users } from "@/lib/db/schema";
import type { Db } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

type ProtectedContext = {
  db: Db;
  session: {
    user: {
      id: number;
    };
  };
};

async function assertCommunityAdmin(ctx: ProtectedContext, communityId: number) {
  const community = await ctx.db.query.communities.findFirst({
    where: eq(communities.id, communityId),
  });

  if (!community) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
  }

  if (community.createdById === ctx.session.user.id) {
    return community;
  }

  const membership = await ctx.db.query.communityMembers.findFirst({
    where: and(
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, ctx.session.user.id),
      eq(communityMembers.role, "admin"),
      eq(communityMembers.isApproved, true),
    ),
  });

  if (!membership) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only community admins can perform this action" });
  }

  return community;
}

export const communityRouter = createTRPCRouter({
  list: publicProcedure
    .query(async ({ ctx }) => {
      const sessionUserId = ctx.session?.user?.id;

      const isMemberExpr = sessionUserId
        ? sql<boolean>`coalesce(bool_or(${communityMembers.userId} = ${sessionUserId} AND ${communityMembers.isApproved}), false)`
        : sql<boolean>`false`;

      const hasPendingRequestExpr = sessionUserId
        ? sql<boolean>`coalesce(bool_or(${communityMembers.userId} = ${sessionUserId} AND ${communityMembers.isApproved} = false), false)`
        : sql<boolean>`false`;

      const isAdminExpr = sessionUserId
        ? sql<boolean>`coalesce(bool_or(${communityMembers.userId} = ${sessionUserId} AND ${communityMembers.role} = 'admin' AND ${communityMembers.isApproved}), false)`
        : sql<boolean>`false`;

      return ctx.db
        .select({
          id: communities.id,
          title: communities.title,
          cover: communities.cover,
          description: communities.description,
          createdById: communities.createdById,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
          memberCount: sql<number>`count(*) filter (where ${communityMembers.isApproved})`,
          isMember: isMemberExpr,
          hasPendingRequest: hasPendingRequestExpr,
          isAdmin: sessionUserId
            ? sql<boolean>`(${communities.createdById} = ${sessionUserId}) OR (${isAdminExpr})`
            : sql<boolean>`false`,
        })
        .from(communities)
        .leftJoin(communityMembers, eq(communities.id, communityMembers.communityId))
        .groupBy(communities.id)
        .orderBy(desc(communities.createdAt));
    }),
  joined: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db
        .select({
          id: communities.id,
          title: communities.title,
          cover: communities.cover,
          description: communities.description,
          createdById: communities.createdById,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
          role: communityMembers.role,
          joinedAt: communityMembers.createdAt,
          isAdmin: sql<boolean>`(${communities.createdById} = ${ctx.session.user.id}) OR (${communityMembers.role} = 'admin')`,
        })
        .from(communityMembers)
        .innerJoin(communities, eq(communityMembers.communityId, communities.id))
        .where(
          and(
            eq(communityMembers.userId, ctx.session.user.id),
            eq(communityMembers.isApproved, true),
          )
        )
        .orderBy(desc(communityMembers.createdAt));
    }),
  getById: publicProcedure
    .input(z.object({
      communityId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const sessionUserId = ctx.session?.user?.id;

      const isMemberExpr = sessionUserId
        ? sql<boolean>`coalesce(bool_or(${communityMembers.userId} = ${sessionUserId} AND ${communityMembers.isApproved}), false)`
        : sql<boolean>`false`;

      const hasPendingRequestExpr = sessionUserId
        ? sql<boolean>`coalesce(bool_or(${communityMembers.userId} = ${sessionUserId} AND ${communityMembers.isApproved} = false), false)`
        : sql<boolean>`false`;

      const isAdminExpr = sessionUserId
        ? sql<boolean>`coalesce(bool_or(${communityMembers.userId} = ${sessionUserId} AND ${communityMembers.role} = 'admin' AND ${communityMembers.isApproved}), false)`
        : sql<boolean>`false`;

      const pendingRequestsCountExpr = sql<number>`count(*) filter (where ${communityMembers.isApproved} = false)`;

      const result = await ctx.db
        .select({
          id: communities.id,
          title: communities.title,
          cover: communities.cover,
          description: communities.description,
          createdById: communities.createdById,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
          memberCount: sql<number>`count(*) filter (where ${communityMembers.isApproved})`,
          pendingRequestCount: pendingRequestsCountExpr,
          isMember: isMemberExpr,
          hasPendingRequest: hasPendingRequestExpr,
          isAdmin: sessionUserId
            ? sql<boolean>`(${communities.createdById} = ${sessionUserId}) OR (${isAdminExpr})`
            : sql<boolean>`false`,
        })
        .from(communities)
        .leftJoin(communityMembers, eq(communities.id, communityMembers.communityId))
        .where(eq(communities.id, input.communityId))
        .groupBy(communities.id);

      if (!result.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
      }

      return result[0];
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      cover: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [community] = await ctx.db.insert(communities).values({
        title: input.title,
        cover: input.cover ?? null,
        description: input.description ?? null,
        createdById: ctx.session.user.id,
      }).returning();

      await ctx.db.insert(communityMembers).values({
        communityId: community.id,
        userId: ctx.session.user.id,
        role: "admin",
        isApproved: true,
      });

      return community;
    }),

  update: protectedProcedure
    .input(z.object({
      communityId: z.number(),
      title: z.string().min(1).optional(),
      cover: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
    }).refine(
      data => data.title !== undefined || data.cover !== undefined || data.description !== undefined,
      { message: "At least one field must be provided" },
    ))
    .mutation(async ({ ctx, input }) => {
      await assertCommunityAdmin(ctx, input.communityId);

      const updateData: Partial<typeof communities.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (input.title !== undefined) {
        updateData.title = input.title;
      }

      if (input.cover !== undefined) {
        updateData.cover = input.cover;
      }

      if (input.description !== undefined) {
        updateData.description = input.description;
      }

      const [updated] = await ctx.db
        .update(communities)
        .set(updateData)
        .where(eq(communities.id, input.communityId))
        .returning();

      return updated;
    }),

  requestToJoin: protectedProcedure
    .input(z.object({
      communityId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const community = await ctx.db.query.communities.findFirst({
        where: eq(communities.id, input.communityId),
      });

      if (!community) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
      }

      const existingMembership = await ctx.db.query.communityMembers.findFirst({
        where: and(
          eq(communityMembers.communityId, input.communityId),
          eq(communityMembers.userId, ctx.session.user.id),
        ),
      });

      if (existingMembership) {
        if (existingMembership.isApproved) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Already a member" });
        }

        return existingMembership;
      }

      const [membership] = await ctx.db.insert(communityMembers).values({
        communityId: input.communityId,
        userId: ctx.session.user.id,
        role: "member",
        isApproved: false,
      }).returning();

      return membership;
    }),

  cancelJoinRequest: protectedProcedure
    .input(z.object({
      communityId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.query.communityMembers.findFirst({
        where: and(
          eq(communityMembers.communityId, input.communityId),
          eq(communityMembers.userId, ctx.session.user.id),
        ),
      });

      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Join request not found" });
      }

      if (membership.isApproved) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already a member" });
      }

      await ctx.db
        .delete(communityMembers)
        .where(eq(communityMembers.id, membership.id));

      return { success: true };
    }),

  approveJoinRequest: protectedProcedure
    .input(z.object({
      communityId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertCommunityAdmin(ctx, input.communityId);

      const membership = await ctx.db.query.communityMembers.findFirst({
        where: and(
          eq(communityMembers.communityId, input.communityId),
          eq(communityMembers.userId, input.userId),
        ),
      });

      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Join request not found" });
      }

      if (membership.isApproved) {
        return membership;
      }

      const [updated] = await ctx.db
        .update(communityMembers)
        .set({
          isApproved: true,
          updatedAt: new Date(),
        })
        .where(eq(communityMembers.id, membership.id))
        .returning();

      return updated;
    }),

  rejectJoinRequest: protectedProcedure
    .input(z.object({
      communityId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertCommunityAdmin(ctx, input.communityId);

      const membership = await ctx.db.query.communityMembers.findFirst({
        where: and(
          eq(communityMembers.communityId, input.communityId),
          eq(communityMembers.userId, input.userId),
        ),
      });

      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Join request not found" });
      }

      if (membership.isApproved) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot reject an approved membership" });
      }

      await ctx.db
        .delete(communityMembers)
        .where(eq(communityMembers.id, membership.id));

      return { success: true };
    }),

  getMembers: publicProcedure
    .input(z.object({
      communityId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: communityMembers.id,
          userId: communityMembers.userId,
          role: communityMembers.role,
          joinedAt: communityMembers.createdAt,
          username: users.username,
          image: users.image,
        })
        .from(communityMembers)
        .innerJoin(users, eq(users.id, communityMembers.userId))
        .where(
          and(
            eq(communityMembers.communityId, input.communityId),
            eq(communityMembers.isApproved, true),
          )
        )
        .orderBy(desc(communityMembers.createdAt));
    }),

  getJoinRequests: protectedProcedure
    .input(z.object({
      communityId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      await assertCommunityAdmin(ctx, input.communityId);

      return ctx.db
        .select({
          id: communityMembers.id,
          userId: communityMembers.userId,
          requestedAt: communityMembers.createdAt,
          username: users.username,
          image: users.image,
        })
        .from(communityMembers)
        .innerJoin(users, eq(users.id, communityMembers.userId))
        .where(
          and(
            eq(communityMembers.communityId, input.communityId),
            eq(communityMembers.isApproved, false),
          )
        )
        .orderBy(desc(communityMembers.createdAt));
    }),
});
