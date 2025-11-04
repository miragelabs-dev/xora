import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const communityMemberRoleEnum = pgEnum("community_member_role", [
  "member",
  "admin",
]);

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  cover: varchar("cover"),
  description: text("description"),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id")
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: communityMemberRoleEnum("role").default("member").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueCommunityMember: unique().on(table.communityId, table.userId),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  creator: one(users, {
    relationName: "communities_creator",
    fields: [communities.createdById],
    references: [users.id],
  }),
  members: many(communityMembers),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    relationName: "community_members_community",
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    relationName: "community_members_user",
    fields: [communityMembers.userId],
    references: [users.id],
  }),
}));

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;

export type CommunityMember = typeof communityMembers.$inferSelect;
export type NewCommunityMember = typeof communityMembers.$inferInsert;
