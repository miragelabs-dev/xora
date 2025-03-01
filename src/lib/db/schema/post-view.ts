import { eq, sql, SQL } from "drizzle-orm";
import { alias, BuildAliasTable, pgView } from "drizzle-orm/pg-core";
import { nfts } from "./nft";
import { likes, posts, reposts, saves } from "./post";
import { users } from "./user";

const buildNftJson = (postIdColumn: SQL<unknown>) =>
  sql<{
    tokenId: number;
    collectionId: number;
    owner: string;
  } | null>`
    COALESCE(
      (SELECT json_build_object(
        'tokenId', n.token_id,
        'collectionId', n.collection_id,
        'owner', n.owner
      )
      FROM ${nfts} n
      WHERE n.post_id = ${postIdColumn}
      LIMIT 1),
      NULL
    )
  `;

const buildReplyToJson = (
  replyTable: BuildAliasTable<typeof posts, 'reply_to'>,
  authorTable: BuildAliasTable<typeof users, 'reply_to_author'>,
  likesTable: BuildAliasTable<typeof likes, 'reply_to_likes'>,
  savesTable: BuildAliasTable<typeof saves, 'reply_to_saves'>,
  repostsTable: BuildAliasTable<typeof reposts, 'reply_to_reposts'>,
  repliesTable: BuildAliasTable<typeof posts, 'reply_to_replies'>,
) =>
  sql<
    {
      id: number;
      content: string;
      image: string;
      createdAt: Date;
      author: {
        id: number;
        username: string;
        image: string;
        address: string;
        isCryptoBot: boolean;
        isVerified: boolean;
      };
      authorId: number;
      stats: {
        repostsCount: number;
        likesCount: number;
        savesCount: number;
        repliesCount: number;
      };
      viewer: {
        isLiked: boolean;
        isSaved: boolean;
        isReposted: boolean;
        isOwner: boolean;
      };
      nft: {
        tokenId: number;
        collectionId: number;
        owner: string;
      } | null;
    } | null
  >`
    CASE
      WHEN ${replyTable.id} IS NULL THEN NULL
      ELSE json_build_object(
        'id', ${replyTable.id},
        'content', ${replyTable.content},
        'image', ${replyTable.image},
        'createdAt', ${replyTable.createdAt},
        'author', json_build_object(
          'id', ${authorTable.id},
          'username', ${authorTable.username},
          'image', ${authorTable.image},
          'address', ${authorTable.address},
          'isCryptoBot', ${authorTable.isCryptoBot},
          'isVerified', ${authorTable.isVerified}
        ),
        'authorId', ${replyTable.authorId},
        'stats', json_build_object(
          'repostsCount', COUNT(DISTINCT ${repostsTable.id}),
          'likesCount', COUNT(DISTINCT ${likesTable.id}),
          'savesCount', COUNT(DISTINCT ${savesTable.id}),
          'repliesCount', COUNT(DISTINCT ${repliesTable.id})
        ),
        'viewer', json_build_object(
          'isLiked', COALESCE(bool_or(${likesTable.userId} = current_setting('app.user_id')::integer), false),
          'isSaved', COALESCE(bool_or(${savesTable.userId} = current_setting('app.user_id')::integer), false),
          'isReposted', COALESCE(bool_or(${repostsTable.userId} = current_setting('app.user_id')::integer), false),
          'isOwner', ${replyTable.authorId} = current_setting('app.user_id')::integer
        ),
        'nft', ${buildNftJson(sql`${replyTable.id}`)}
      )
    END`.as('reply_to');

export const postView = pgView('post_view').as((qb) => {
  const repliesAlias = alias(posts, 'replies');
  const replyToAlias = alias(posts, 'reply_to');
  const replyToAuthorAlias = alias(users, 'reply_to_author');
  const replyToLikesAlias = alias(likes, 'reply_to_likes');
  const replyToSavesAlias = alias(saves, 'reply_to_saves');
  const replyToRepostsAlias = alias(reposts, 'reply_to_reposts');
  const replyToRepliesAlias = alias(posts, 'reply_to_replies');
  const repostsAlias = alias(reposts, 'r');
  const repostUsersAlias = alias(users, 'reposter');

  const postsWithReposts = qb
    .with()
    .select({
      postId: posts.id,
      content: posts.content,
      image: sql<string>`${posts.image}`.as('post_image'),
      createdAt: sql<Date>`${posts.createdAt}`.as('post_created_at'),
      authorId: posts.authorId,
      replyToId: posts.replyToId,
      repostedById: repostsAlias.userId,
      repostedUsername: sql<string>`${repostUsersAlias.username}`.as('reposted_username'),
      repostedAt: repostsAlias.createdAt,
      authorUsername: users.username,
      authorAddress: users.address,
      authorImage: users.image,
      authorIsCryptoBot: users.isCryptoBot,
      authorIsVerified: users.isVerified,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .leftJoin(repostsAlias, eq(repostsAlias.postId, posts.id))
    .leftJoin(repostUsersAlias, eq(repostUsersAlias.id, repostsAlias.userId))
    .union(
      qb
        .select({
          postId: posts.id,
          content: posts.content,
          image: sql<string>`${posts.image}`.as('repost_image'),
          createdAt: posts.createdAt,
          authorId: posts.authorId,
          replyToId: posts.replyToId,
          repostedById: sql<number>`NULL`.as('reposted_by_id'),
          repostedUsername: sql<string>`NULL`.as('reposted_username'),
          repostedAt: sql<Date>`NULL`.as('reposted_at'),
          authorUsername: users.username,
          authorAddress: users.address,
          authorImage: users.image,
          authorIsCryptoBot: users.isCryptoBot,
          authorIsVerified: users.isVerified,
        })
        .from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
    )
    .as('posts_with_reposts');

  return qb
    .select({
      id: postsWithReposts.postId,
      content: postsWithReposts.content,
      image: sql<string>`${postsWithReposts.image}`.as('post_image'),
      createdAt: sql<Date>`${postsWithReposts.createdAt}`.as('post_created_at'),
      authorId: postsWithReposts.authorId,
      author: {
        username: postsWithReposts.authorUsername,
        address: postsWithReposts.authorAddress,
        image: sql<string>`${postsWithReposts.authorImage}`.as('author_image'),
        isCryptoBot: postsWithReposts.authorIsCryptoBot,
        isVerified: postsWithReposts.authorIsVerified,
      },
      stats: {
        repostsCount: sql<number>`COUNT(DISTINCT ${reposts.id})`.as('reposts_count'),
        likesCount: sql<number>`COUNT(DISTINCT ${likes.id})`.as('likes_count'),
        savesCount: sql<number>`COUNT(DISTINCT ${saves.id})`.as('saves_count'),
        repliesCount: sql<number>`COUNT(DISTINCT ${repliesAlias.id})`.as('replies_count'),
      },
      viewer: {
        isLiked: sql<boolean>`COALESCE(bool_or(${likes.userId} = current_setting('app.user_id')::integer), false)`.as('is_liked'),
        isSaved: sql<boolean>`COALESCE(bool_or(${saves.userId} = current_setting('app.user_id')::integer), false)`.as('is_saved'),
        isReposted: sql<boolean>`COALESCE(bool_or(${reposts.userId} = current_setting('app.user_id')::integer), false)`.as('is_reposted'),
        isOwner: sql<boolean>`${postsWithReposts.authorId} = current_setting('app.user_id')::integer`.as('is_owner'),
      },
      replyToId: postsWithReposts.replyToId,
      replyTo: buildReplyToJson(
        replyToAlias,
        replyToAuthorAlias,
        replyToLikesAlias,
        replyToSavesAlias,
        replyToRepostsAlias,
        replyToRepliesAlias
      ),
      nft: buildNftJson(sql`${postsWithReposts.postId}`).as('nft'),
      repostedById: postsWithReposts.repostedById,
      repostedUsername: postsWithReposts.repostedUsername,
      repostedAt: postsWithReposts.repostedAt,
    })
    .from(postsWithReposts)
    .leftJoin(reposts, eq(reposts.postId, postsWithReposts.postId))
    .leftJoin(likes, eq(likes.postId, postsWithReposts.postId))
    .leftJoin(saves, eq(saves.postId, postsWithReposts.postId))
    .leftJoin(repliesAlias, eq(repliesAlias.replyToId, postsWithReposts.postId))
    .leftJoin(replyToAlias, eq(postsWithReposts.replyToId, replyToAlias.id))
    .leftJoin(replyToAuthorAlias, eq(replyToAlias.authorId, replyToAuthorAlias.id))
    .leftJoin(replyToLikesAlias, eq(replyToLikesAlias.postId, replyToAlias.id))
    .leftJoin(replyToSavesAlias, eq(replyToSavesAlias.postId, replyToAlias.id))
    .leftJoin(replyToRepostsAlias, eq(replyToRepostsAlias.postId, replyToAlias.id))
    .leftJoin(replyToRepliesAlias, eq(replyToRepliesAlias.replyToId, replyToAlias.id))
    .groupBy(
      postsWithReposts.postId,
      postsWithReposts.content,
      postsWithReposts.createdAt,
      postsWithReposts.authorId,
      postsWithReposts.image,
      postsWithReposts.authorUsername,
      postsWithReposts.authorAddress,
      postsWithReposts.authorImage,
      postsWithReposts.authorIsCryptoBot,
      postsWithReposts.authorIsVerified,
      postsWithReposts.replyToId,
      postsWithReposts.repostedById,
      postsWithReposts.repostedAt,
      postsWithReposts.repostedUsername,
      sql`${replyToAlias.id}`,
      sql`${replyToAlias.content}`,
      sql`${replyToAlias.image}`,
      sql`${replyToAlias.createdAt}`,
      sql`${replyToAlias.authorId}`,
      sql`${replyToAuthorAlias.id}`,
      sql`${replyToAuthorAlias.username}`,
      sql`${replyToAuthorAlias.image}`,
      sql`${replyToAuthorAlias.address}`,
      sql`${replyToAuthorAlias.isCryptoBot}`,
      sql`${replyToAuthorAlias.isVerified}`,
    );
});

export type PostView = typeof postView.$inferSelect;