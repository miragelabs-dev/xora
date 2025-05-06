import { db } from "@/lib/db";
import { nfts } from "@/lib/db/schema/nft";
import { likes, posts, reposts, saves } from "@/lib/db/schema/post";
import { users } from "@/lib/db/schema/user";
import { eq, isNotNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export function getAllPostQuery() {
    const replies = alias(posts, 'replies');
    const repostUser = alias(users, 'repostUser');
    const nftAlias = alias(nfts, 'nft');

    const likeCountsQuery = db
        .select({
            postId: likes.postId,
            likeCount: sql<number>`count(*)`.as('likeCount'),
        })
        .from(likes)
        .groupBy(likes.postId)
        .as('like_counts');

    const replyCountsQuery = db
        .select({
            postId: replies.replyToId,
            replyCount: sql<number>`count(*)`.as('replyCount'),
        })
        .from(replies)
        .where(
            isNotNull(replies.replyToId)
        )
        .groupBy(replies.replyToId)
        .as('reply_counts');

    const repostCountsQuery = db
        .select({
            postId: reposts.postId,
            repostCount: sql<number>`count(*)`.as('repostCount'),
        })
        .from(reposts)
        .groupBy(reposts.postId)
        .as('repost_counts');

    const saveCountsQuery = db
        .select({
            postId: saves.postId,
            saveCount: sql<number>`count(*)`.as('saveCount'),
        })
        .from(saves)
        .groupBy(saves.postId)
        .as('save_counts');

    return db
        .select({
            id: posts.id,
            replyToId: posts.replyToId,
            repostId: reposts.id,
            content: posts.content,
            image: posts.image,
            authorId: posts.authorId,
            authorUsername: users.username,
            authorImage: users.image,
            authorIsCryptoBot: users.isCryptoBot,
            authorIsVerified: users.isVerified,
            repostedUsername: repostUser.username,
            activityDate: sql`COALESCE(${reposts.createdAt}, ${posts.createdAt})`.as('activity_date'),
            postCreatedAt: posts.createdAt,
            nftTokenId: nftAlias.tokenId,
            nftCollectionId: nftAlias.collectionId,
            nftOwner: nftAlias.owner,
            likeCount: sql`COALESCE(${likeCountsQuery.likeCount}, 0)`.as('likeCount'),
            replyCount: sql`COALESCE(${replyCountsQuery.replyCount}, 0)`.as('replyCount'),
            repostCount: sql`COALESCE(${repostCountsQuery.repostCount}, 0)`.as('repostCount'),
            saveCount: sql`COALESCE(${saveCountsQuery.saveCount}, 0)`.as('saveCount'),
        })
        .from(posts)
        .leftJoin(users, eq(users.id, posts.authorId))
        .leftJoin(reposts, eq(reposts.postId, posts.id))
        .leftJoin(repostUser, eq(repostUser.id, reposts.userId))
        .leftJoin(nftAlias, eq(nftAlias.postId, posts.id))
        .leftJoin(
            likeCountsQuery,
            sql`${likeCountsQuery.postId} = ${posts.id}`
        )
        .leftJoin(
            replyCountsQuery,
            sql`${replyCountsQuery.postId} = ${posts.id}`
        )
        .leftJoin(
            repostCountsQuery,
            sql`${repostCountsQuery.postId} = ${posts.id}`
        )
        .leftJoin(
            saveCountsQuery,
            sql`${saveCountsQuery.postId} = ${posts.id}`
        )
}