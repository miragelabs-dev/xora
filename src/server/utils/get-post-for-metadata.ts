import { db } from "@/lib/db";
import { posts, users, likes, reposts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getPostForMetadata(postId: number) {
  const post = await db
    .select({
      id: posts.id,
      content: posts.content,
      image: posts.image,
      createdAt: posts.createdAt,
      authorUsername: users.username,
      authorImage: users.image,
      authorIsVerified: users.isVerified,
      authorIsCryptoBot: users.isCryptoBot,
      likesCount: sql<number>`(SELECT COUNT(*) FROM likes WHERE likes.post_id = ${posts.id})`,
      repostsCount: sql<number>`(SELECT COUNT(*) FROM reposts WHERE reposts.post_id = ${posts.id})`,
      repliesCount: sql<number>`(SELECT COUNT(*) FROM posts AS replies WHERE replies.reply_to_id = ${posts.id})`,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(eq(posts.id, postId))
    .limit(1);

  return post[0] || null;
}

export type PostMetadata = Awaited<ReturnType<typeof getPostForMetadata>>;