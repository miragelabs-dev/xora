import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { Post, posts } from "./post";
import { User, users } from "./user";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 255 }).notNull(),
  description: text("description"),
  baseUri: varchar("base_uri", { length: 255 }),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  totalSupply: integer("total_supply").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  tokenId: integer("token_id").notNull(),
  metadata: jsonb("metadata").notNull(),
  owner: varchar("owner", { length: 42 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.collectionId, table.tokenId)
]);

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  creator: one(users, {
    fields: [collections.creatorId],
    references: [users.id],
  }),
  nfts: many(nfts),
}));

export const nftsRelations = relations(nfts, ({ one }) => ({
  collection: one(collections, {
    fields: [nfts.collectionId],
    references: [collections.id],
  }),
  post: one(posts, {
    fields: [nfts.postId],
    references: [posts.id],
  }),
}));

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type NFT = typeof nfts.$inferSelect;
export type NFTWithRelations = NFT & {
  post: Post & {
    author: User;
  };
};
export type NewNFT = typeof nfts.$inferInsert;

export type CollectionWithCreator = {
  id: number;
  name: string;
  symbol: string;
  description: string | null;
  baseUri: string | null;
  creator: {
    id: number;
    username: string;
    image: string | null;
  };
  nftsCount: number;
};