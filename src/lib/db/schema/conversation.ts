import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, serial, timestamp } from "drizzle-orm/pg-core";
import { messages } from "./message";
import { users } from "./user";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationMember = pgTable("conversation_member", {
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.conversationId, t.userId] }),
}));

export type ConversationMember = typeof conversationMember.$inferSelect;

export const conversationMemberRelations = relations(conversationMember, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationMember.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationMember.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
  members: many(conversationMember),
})); 