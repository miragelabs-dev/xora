import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(eq(posts.id, postId))
    .limit(1);

  return post[0] || null;
}

export type PostMetadata = Awaited<ReturnType<typeof getPostForMetadata>>;