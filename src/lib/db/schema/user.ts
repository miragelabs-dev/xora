import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { likes, posts, reposts, saves } from "./post";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  username: text("username").notNull(),
  name: text("name"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: integer("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  likes: many(likes),
  saves: many(saves),
  reposts: many(reposts),
  followers: many(follows, {
    relationName: "user_followers",
    fields: [users.id],
    references: [follows.followingId],
  }),
  following: many(follows, {
    relationName: "user_following",
    fields: [users.id],
    references: [follows.followerId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
