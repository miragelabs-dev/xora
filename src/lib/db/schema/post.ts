import { relations } from "drizzle-orm";
import { foreignKey, integer, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  image: varchar("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  replyToId: integer("reply_to_id"),
}, (table): [ReturnType<typeof foreignKey>] => [
  foreignKey({
    columns: [table.replyToId],
    foreignColumns: [posts.id],
    name: "posts_reply_to_fk",
  })
])

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    relationName: "posts_author",
    fields: [posts.authorId],
    references: [users.id],
  }),
  replyTo: one(posts, {
    relationName: "posts_reply_to",
    fields: [posts.replyToId],
    references: [posts.id],
  }),
  replies: many(posts),
}));

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueLike: unique().on(table.userId, table.postId),
}));

export const saves = pgTable("saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueSave: unique().on(table.userId, table.postId),
}));

export const reposts = pgTable("reposts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRepost: unique().on(table.userId, table.postId),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;