import { and, inArray } from "drizzle-orm";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { likes, posts, reposts, saves } from "@/lib/db/schema";
import { getAllPostQuery } from "./get-all-post-query";

export async function enrichPosts(results: Awaited<ReturnType<typeof getAllPostQuery>>, sessionUserId: number) {
    const postIds = results.map(r => r.id);

    const [liked, reposted, saved] = await Promise.all([
        db.select({ postId: likes.postId }).from(likes).where(
            and(eq(likes.userId, sessionUserId), inArray(likes.postId, postIds))
        ),
        db.select({ postId: reposts.postId }).from(reposts).where(
            and(eq(reposts.userId, sessionUserId), inArray(reposts.postId, postIds))
        ),
        db.select({ postId: saves.postId }).from(saves).where(
            and(eq(saves.userId, sessionUserId), inArray(saves.postId, postIds))
        ),
    ]);

    const likedSet = new Set(liked.map(l => l.postId));
    const repostedSet = new Set(reposted.map(r => r.postId));
    const savedSet = new Set(saved.map(s => s.postId));

    return results.map((r) => ({
        ...r,
        isLiked: likedSet.has(r.id),
        isReposted: repostedSet.has(r.id),
        isSaved: savedSet.has(r.id),
        isOwner: r.authorId === sessionUserId,
    }));
}

export type BaseEnrichedPost = Awaited<ReturnType<typeof enrichPosts>>[number];

export type EnrichedPost = BaseEnrichedPost & {
    replyTo: BaseEnrichedPost | null;
};

export type ReplyEnrichedPost = Omit<EnrichedPost, 'replyTo' | 'replyToId' | 'repostedUsername' | 'repostedById' | 'repostedAt'>;

export async function enrichReplyTo(enrichedPosts: BaseEnrichedPost[], sessionUserId: number): Promise<EnrichedPost[]> {
    const replyToIds = enrichedPosts.filter(r => r.replyToId).map(r => r.replyToId);
    let parentMap = new Map<string, BaseEnrichedPost>();

    if (replyToIds.length > 0) {
        const parentRaw = await getAllPostQuery({}).where(inArray(posts.id, replyToIds.filter(id => id !== null)));
        const enrichedParents = await enrichPosts(parentRaw, sessionUserId);
        parentMap = new Map(enrichedParents.map(p => [p.id.toString(), p]));
    }

    return enrichedPosts.map((r) => ({
        ...r,
        replyTo: r.replyToId ? parentMap.get(r.replyToId.toString()) || null : null,
    }));
}