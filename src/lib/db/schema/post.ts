import { desc, eq, relations, sql } from "drizzle-orm";
import { alias, BuildAliasTable, integer, pgTable, pgView, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
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

const firstRepostSubquery = (qb: typeof posts.$inferSelect) =>
  qb
    .selectDistinct({
      id: reposts.id,
      userId: reposts.userId,
      postId: reposts.postId,
      createdAt: reposts.createdAt,
    })
    .from(reposts)
    .orderBy(desc(reposts.createdAt))
    .as('first_repost');

const buildRepostJson = (
  repostTable: BuildAliasTable<typeof reposts, 'repost'>,
  userTable: BuildAliasTable<typeof users, 'reposter_user'>
) =>
  sql<{
    id: number;
    createdAt: Date;
    user: {
      id: number;
      username: string;
    };
  } | null>`
    CASE WHEN ${repostTable.id} IS NULL THEN NULL
    ELSE json_build_object(
      'id', ${repostTable.id},
      'createdAt', ${repostTable.createdAt},
      'user', json_build_object(
        'id', ${repostTable.userId},
        'username', ${userTable.username}
      )
    )
    END`.as('repost');

// const buildReplyToJson = (
//   replyTable: BuildAliasTable<typeof posts, 'reply_to'>,
//   authorTable: BuildAliasTable<typeof users, 'reply_to_author'>,
//   likesTable: BuildAliasTable<typeof likes, 'reply_to_likes'>,
//   savesTable: BuildAliasTable<typeof saves, 'reply_to_saves'>,
//   repostsTable: BuildAliasTable<typeof reposts, 'reply_to_reposts'>,
//   repliesTable: BuildAliasTable<typeof posts, 'reply_to_replies'>
// ) =>
//   sql<
//     {
//       id: number;
//       content: string;
//       image: string;
//       createdAt: Date;
//       author: {
//         id: number;
//         username: string;
//         image: string;
//         address: string;
//       };
//       stats: {
//         repostsCount: number;
//         likesCount: number;
//         savesCount: number;
//         repliesCount: number;
//       };
//       viewer: {
//         isLiked: boolean;
//         isSaved: boolean;
//         isReposted: boolean;
//         isOwner: boolean;
//       };
//     } | null
//   >`
//     CASE
//       WHEN ${replyTable.id} IS NULL THEN NULL
//       ELSE json_build_object(
//         'id', ${replyTable.id},
//         'content', ${replyTable.content},
//         'image', ${replyTable.image},
//         'createdAt', ${replyTable.createdAt},
//         'author', json_build_object(
//           'id', ${authorTable.id},
//           'username', ${authorTable.username},
//           'image', ${authorTable.image},
//           'address', ${authorTable.address}
//         ),
//         'stats', json_build_object(
//           'repostsCount', COUNT(DISTINCT ${repostsTable.id}),
//           'likesCount', COUNT(DISTINCT ${likesTable.id}),
//           'savesCount', COUNT(DISTINCT ${savesTable.id}),
//           'repliesCount', COUNT(DISTINCT ${repliesTable.id})
//         ),
//         'viewer', json_build_object(
//           'isLiked', COALESCE(bool_or(${likesTable.userId} = current_setting('app.user_id')::integer), false),
//           'isSaved', COALESCE(bool_or(${savesTable.userId} = current_setting('app.user_id')::integer), false),
//           'isReposted', COALESCE(bool_or(${repostsTable.userId} = current_setting('app.user_id')::integer), false),
//           'isOwner', ${replyTable.authorId} = current_setting('app.user_id')::integer
//         )
//       )
//     END`.as('reply_to');

const statsSelect = {
  repostsCount: sql<number>`COUNT(DISTINCT ${reposts.id})`.as('reposts_count'),
  likesCount: sql<number>`COUNT(DISTINCT ${likes.id})`.as('likes_count'),
  savesCount: sql<number>`COUNT(DISTINCT ${saves.id})`.as('saves_count'),
  repliesCount: sql<number>`COUNT(DISTINCT ${alias(posts, 'replies').id})`.as('replies_count'),
};

const viewerSelect = {
  isLiked: sql<boolean>`COALESCE(bool_or(${likes.userId} = current_setting('app.user_id')::integer), false)`.as('is_liked'),
  isSaved: sql<boolean>`COALESCE(bool_or(${saves.userId} = current_setting('app.user_id')::integer), false)`.as('is_saved'),
  isReposted: sql<boolean>`COALESCE(bool_or(${reposts.userId} = current_setting('app.user_id')::integer), false)`.as('is_reposted'),
  isOwner: sql<boolean>`${posts.authorId} = current_setting('app.user_id')::integer`.as('is_owner'),
};

export const postView = pgView('post_view').as((qb) => {
  const repliesAlias = alias(posts, 'replies');
  // const replyToAlias = alias(posts, 'reply_to');
  // const replyToAuthorAlias = alias(users, 'reply_to_author');
  // const replyToLikesAlias = alias(likes, 'reply_to_likes');
  // const replyToSavesAlias = alias(saves, 'reply_to_saves');
  // const replyToRepostsAlias = alias(reposts, 'reply_to_reposts');
  // const replyToRepliesAlias = alias(posts, 'reply_to_replies');

  const fr = firstRepostSubquery(qb);

  return qb
    .select({
      id: posts.id,
      content: posts.content,
      image: sql<string>`${posts.image}`.as('post_image'),
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      author: {
        username: users.username,
        address: users.address,
        image: sql<string>`${users.image}`.as('author_image'),
      },
      reposterId: sql<number | null>`${fr.userId}`.as('reposter_id'),
      repost: buildRepostJson(fr, alias(users, 'reposter_user')),
      stats: statsSelect,
      viewer: viewerSelect,
      replyToId: posts.replyToId,
      // TODO: Add replyTo
      // replyTo: buildReplyToJson(
      //   replyToAlias,
      //   replyToAuthorAlias,
      //   replyToLikesAlias,
      //   replyToSavesAlias,
      //   replyToRepostsAlias,
      //   replyToRepliesAlias
      // ),
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(fr, eq(sql`${fr.postId}`, posts.id))
    .leftJoin(alias(users, 'reposter_user'), eq(sql`${fr.userId}`, alias(users, 'reposter_user').id))
    .leftJoin(reposts, eq(reposts.postId, posts.id))
    .leftJoin(likes, eq(likes.postId, posts.id))
    .leftJoin(saves, eq(saves.postId, posts.id))
    .leftJoin(repliesAlias, eq(repliesAlias.replyToId, posts.id))
    // .leftJoin(replyToAlias, eq(posts.replyToId, replyToAlias.id))
    // .leftJoin(
    //   replyToAuthorAlias,
    //   eq(replyToAlias.authorId, replyToAuthorAlias.id)
    // )
    // .leftJoin(
    //   replyToLikesAlias,
    //   eq(replyToLikesAlias.postId, replyToAlias.id)
    // )
    // .leftJoin(
    //   replyToSavesAlias,
    //   eq(replyToSavesAlias.postId, replyToAlias.id)
    // )
    // .leftJoin(
    //   replyToRepostsAlias,
    //   eq(replyToRepostsAlias.postId, replyToAlias.id)
    // )
    // .leftJoin(
    //   replyToRepliesAlias,
    //   eq(replyToRepliesAlias.replyToId, replyToAlias.id)
    // )
    .groupBy(
      posts.id,
      posts.content,
      posts.createdAt,
      posts.authorId,
      posts.image,
      users.username,
      users.address,
      users.image,
      sql`${fr.id}`,
      sql`${fr.userId}`,
      sql`${fr.createdAt}`,
      sql`${alias(users, 'reposter_user').username}`,
      posts.replyToId,
      // sql`${alias(posts, 'reply_to').id}`,
      // sql`${alias(posts, 'reply_to').content}`,
      // sql`${alias(posts, 'reply_to').image}`,
      // sql`${alias(posts, 'reply_to').createdAt}`,
      // sql`${alias(posts, 'reply_to').authorId}`,
      // sql`${alias(users, 'reply_to_author').id}`,
      // sql`${alias(users, 'reply_to_author').username}`,
      // sql`${alias(users, 'reply_to_author').image}`,
      // sql`${alias(users, 'reply_to_author').address}`,
    );
});

export type PostView = typeof postView.$inferSelect;