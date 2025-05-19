import { db } from "@/lib/db";
import { conversationMember, conversations, Message, messages, User, users } from "@/lib/db/schema";
import { and, asc, eq, inArray, lt, not, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const messageRouter = createTRPCRouter({
  getConversations: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const items = await getConversationsQuery(ctx.session.user.id)
        // .where(hasOtherMembersExpr(ctx.session.user.id))
        .groupBy(conversations.id)
        .limit(input.limit + 1);

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop() as { id: number };
        nextCursor = nextItem.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  createConversation: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      const allUserIds = Array.from(new Set([...input.userIds, ctx.session.user.id])).sort((a, b) => a - b);

      const candidateConversationIds = await ctx.db
        .selectDistinct({ conversationId: conversationMember.conversationId })
        .from(conversationMember)
        .where(inArray(conversationMember.userId, allUserIds));

      for (const { conversationId } of candidateConversationIds) {
        const members = await ctx.db.query.conversationMember.findMany({
          where: eq(conversationMember.conversationId, conversationId),
          columns: { userId: true },
        });

        const memberIds = members.map(m => m.userId).sort((a, b) => a - b);
        const isExactMatch = memberIds.length === allUserIds.length &&
          memberIds.every((id, i) => id === allUserIds[i]);

        if (isExactMatch) {
          const conversation = await ctx.db.query.conversations.findFirst({
            where: eq(conversations.id, conversationId),
          });
          if (conversation) return conversation;
        }
      }

      return await ctx.db.transaction(async (tx) => {
        const [conversation] = await tx.insert(conversations).values({
          createdAt: new Date(),
        }).returning();

        const members = allUserIds.map(userId => ({
          conversationId: conversation.id,
          userId,
        }));

        await tx.insert(conversationMember).values(members);

        return conversation;
      });
    }),

  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select({
          id: messages.id,
          content: messages.content,
          createdAt: messages.createdAt,
          sender: {
            id: users.id,
            username: users.username,
            image: users.image,
          },
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            input.cursor ? lt(messages.id, input.cursor) : undefined
          )
        )
        .orderBy(asc(messages.id))
        .limit(input.limit + 1);

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      let conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
      });

      if (!conversation) {
        [conversation] = await ctx.db.insert(conversations).values({
          id: input.conversationId,
        }).returning();
      }

      const [message] = await ctx.db.insert(messages).values({
        conversationId: conversation.id,
        senderId: ctx.session.user.id,
        content: input.content,
      }).returning();

      return message;
    }),

  getConversation: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const [result] = await getConversationsQuery(ctx.session.user.id)
        .where(
          and(
            eq(conversations.id, input.conversationId),
            // hasOtherMembersExpr(ctx.session.user.id)
          )
        )
        .limit(1);

      return result;
    }),

  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const [result] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .innerJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(
          and(
            eq(messages.read, false),
            not(eq(messages.senderId, ctx.session.user.id))
          )
        );

      return result.count;
    }),

  markConversationAsRead: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(messages)
        .set({ read: true })
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(messages.read, false),
            not(eq(messages.senderId, ctx.session.user.id))
          )
        );
    }),
});

export type GetConversationsItem = NonNullable<Awaited<ReturnType<typeof messageRouter.getConversations>>["items"]>[number];

function hasOtherMembersExpr(userId: number) {
  return sql`
    SELECT COUNT(*) 
    FROM conversation_member cm
    WHERE cm.conversation_id = ${conversations.id}
      AND cm.user_id != ${userId}
    ) > 0
  `
}

function getConversationsQuery(userId: number) {
  return db
    .select({
      id: conversations.id,
      createdAt: conversations.createdAt,
      lastMessageAt: sql<Date>`(
    SELECT MAX(${messages.createdAt} AT TIME ZONE 'UTC')
    FROM ${messages}
    WHERE ${messages.conversationId} = ${conversations.id}
  )`.as("last_message_at"),
      lastMessage: sql<Message>`
  (
    SELECT json_build_object(
      'id', m.id,
      'content', m.content,
      'createdAt', m.created_at,
      'senderId', m.sender_id
    )
    FROM ${messages} m
    WHERE m.conversation_id = ${conversations.id}
    ORDER BY m.created_at DESC
    LIMIT 1
  )
`.as("lastMessage"),
      members: sql<User[]>`
    (
      SELECT json_agg(json_build_object(
        'id', u.id,
        'username', u.username,
        'image', u.image
      ))
      FROM conversation_member cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = ${conversations.id} AND cm.user_id != ${userId}
    )
  `.as("members"),
      unreadCount: sql<number>`
    (
      SELECT COUNT(*)
      FROM ${messages} m
      WHERE m.conversation_id = ${conversations.id} AND m.read = false
    )
    `.as("unreadCount"),
    })
    .from(conversations)
    .leftJoin(conversationMember, eq(conversations.id, conversationMember.conversationId));
}