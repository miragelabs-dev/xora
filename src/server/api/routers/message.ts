import { conversations, messages, users } from "@/lib/db/schema";
import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const messageRouter = createTRPCRouter({
  getConversations: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const recipientUser = alias(users, "recipientUser");
      const initiatorUser = alias(users, "initiatorUser");
      const lastMessage = alias(messages, "lastMessage");

      const items = await ctx.db
        .select({
          id: conversations.id,
          lastMessageAt: conversations.lastMessageAt,
          recipient: {
            id: conversations.recipientId,
            username: recipientUser.username,
            image: recipientUser.image,
          },
          initiator: {
            id: conversations.initiatorId,
            username: initiatorUser.username,
            image: initiatorUser.image,
          },
          lastMessage: {
            id: lastMessage.id,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
          },
        })
        .from(conversations)
        .where(
          or(
            eq(conversations.initiatorId, ctx.session.user.id),
            eq(conversations.recipientId, ctx.session.user.id)
          )
        )
        .leftJoin(recipientUser, eq(conversations.recipientId, recipientUser.id))
        .leftJoin(initiatorUser, eq(conversations.initiatorId, initiatorUser.id))
        .leftJoin(
          lastMessage,
          and(
            eq(lastMessage.conversationId, conversations.id),
            eq(
              lastMessage.id,
              sql`(SELECT id FROM messages WHERE conversation_id = ${conversations.id} ORDER BY created_at DESC LIMIT 1)`
            )
          )
        )
        .orderBy(desc(conversations.lastMessageAt))
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
        .orderBy(desc(messages.id))
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
      recipientId: z.number(),
      content: z.string().min(1).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      let conversation = await ctx.db.query.conversations.findFirst({
        where: or(
          and(
            eq(conversations.initiatorId, ctx.session.user.id),
            eq(conversations.recipientId, input.recipientId)
          ),
          and(
            eq(conversations.initiatorId, input.recipientId),
            eq(conversations.recipientId, ctx.session.user.id)
          )
        ),
      });

      if (!conversation) {
        [conversation] = await ctx.db.insert(conversations).values({
          initiatorId: ctx.session.user.id,
          recipientId: input.recipientId,
        }).returning();
      }

      const [message] = await ctx.db.insert(messages).values({
        conversationId: conversation.id,
        senderId: ctx.session.user.id,
        content: input.content,
      }).returning();

      await ctx.db
        .update(conversations)
        .set({ lastMessageAt: message.createdAt })
        .where(eq(conversations.id, conversation.id));

      return message;
    }),

  getConversation: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.db.query.conversations.findFirst({
        where: or(
          and(
            eq(conversations.initiatorId, ctx.session.user.id),
            eq(conversations.recipientId, input.userId)
          ),
          and(
            eq(conversations.initiatorId, input.userId),
            eq(conversations.recipientId, ctx.session.user.id)
          )
        ),
      });

      return conversation;
    }),
}); 