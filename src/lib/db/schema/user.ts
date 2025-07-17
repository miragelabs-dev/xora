import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { likes, posts, reposts, saves } from "./post";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  username: text("username").notNull(),
  bio: text("bio"),
  image: varchar("image"),
  cover: varchar("cover"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isCryptoBot: boolean("is_crypto_bot").default(false).notNull(),
  walletAddress: text("wallet_address"),
  transactionsCount: integer("transactions_count").default(0),

  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username"),
  discordAvatar: text("discord_avatar"),

  referralCode: text("referral_code"),

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
}, (table) => {
  return {
    followerFollowingUnique: unique().on(table.followerId, table.followingId),
  }
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  likes: many(likes),
  saves: many(saves),
  reposts: many(reposts),
  followers: many(follows),
  following: many(follows),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;