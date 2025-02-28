'use client';

import { Post } from "@/components/post";
import { PostSkeleton } from "@/components/post-skeleton";
import { api } from "@/utils/api";
import { notFound } from "next/navigation";

export function PostDetailView({ postId }: { postId: string }) {
  const { data: post, isLoading } = api.post.getById.useQuery({
    postId: parseInt(postId),
  });

  if (isLoading) {
    return <PostSkeleton />;
  }

  if (!post) {
    return notFound();
  }

  return <Post post={post} showReplies />;
} 