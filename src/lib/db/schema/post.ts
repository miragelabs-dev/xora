import { desc, eq, relations, sql } from "drizzle-orm";
import { alias, integer, pgTable, pgView, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  replyToId: integer("reply_to_id")
    .references(() => posts.id, { onDelete: "cascade" }),
});

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
  replies: many(posts, {
    relationName: "posts_replies",
    fields: [posts.id],
    references: [posts.replyToId],
  }),
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
});

export const saves = pgTable("saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reposts = pgTable("reposts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postView = pgView("post_view").as((qb) =>
  qb
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorName: users.name,
      authorUsername: users.username,
      authorAddress: users.address,
      reposterId: sql<number | null>`first_repost.user_id`.as('reposter_id'),
      reposterUsername: sql<string | null>`ru.username`.as('reposter_username'),
      repostId: sql<number | null>`first_repost.id`.as('repost_id'),
      repostCreatedAt: sql<Date | null>`first_repost.created_at`.as('repost_created_at'),
      commentsCount: sql<number>`0`.as('comments_count'), // TODO: add comments count
      repostsCount: sql<number>`COUNT(DISTINCT ${reposts.id})`.as('reposts_count'),
      likesCount: sql<number>`COUNT(DISTINCT ${likes.id})`.as('likes_count'),
      savesCount: sql<number>`COUNT(DISTINCT ${saves.id})`.as('saves_count'),
      isLiked: sql<boolean>`COALESCE(bool_or(${likes.userId} = current_setting('app.user_id')::integer), false)`.as('is_liked'),
      isSaved: sql<boolean>`COALESCE(bool_or(${saves.userId} = current_setting('app.user_id')::integer), false)`.as('is_saved'),
      isReposted: sql<boolean>`COALESCE(bool_or(${reposts.userId} = current_setting('app.user_id')::integer), false)`.as('is_reposted'),
      isOwner: sql<boolean>`${posts.authorId} = current_setting('app.user_id')::integer`.as('is_owner'),
      replyToId: posts.replyToId,
      repliesCount: sql<number>`COUNT(DISTINCT replies.id)`.as('replies_count'),
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(
      qb.selectDistinct({
        id: reposts.id,
        userId: reposts.userId,
        postId: reposts.postId,
        createdAt: reposts.createdAt,
      })
        .from(reposts)
        .orderBy(desc(reposts.createdAt))
        .as('first_repost'),
      eq(sql`first_repost.post_id`, posts.id)
    )
    .leftJoin(alias(users, 'ru'), eq(sql`first_repost.user_id`, alias(users, 'ru').id))
    .leftJoin(reposts, eq(reposts.postId, posts.id))
    .leftJoin(likes, eq(likes.postId, posts.id))
    .leftJoin(saves, eq(saves.postId, posts.id))
    .leftJoin(
      alias(posts, 'replies'),
      eq(alias(posts, 'replies').replyToId, posts.id)
    )
    .groupBy(
      posts.id,
      posts.content,
      posts.createdAt,
      posts.authorId,
      users.name,
      users.username,
      users.address,
      sql`first_repost.id`,
      sql`first_repost.user_id`,
      sql`first_repost.created_at`,
      sql`ru.username`,
      posts.replyToId,
    )
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostView = typeof postView.$inferSelect;