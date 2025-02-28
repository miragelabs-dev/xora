import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { messages } from "./message";
import { users } from "./user";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  initiatorId: integer("initiator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  initiator: one(users, {
    fields: [conversations.initiatorId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [conversations.recipientId],
    references: [users.id],
  }),
  messages: many(messages),
})); 