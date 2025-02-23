'use client';

import { PageHeader } from "@/components/page-header";
import { Post } from "@/components/post";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

export default function PostPage({
  params
}: {
  params: { userUsername: string; postId: string }
}) {
  const username = decodeURIComponent(params.userUsername);

  const { data: post, isLoading } = api.post.getById.useQuery({
    postId: parseInt(params.postId)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!post || post.authorUsername !== username) {
    return notFound();
  }

  return (
    <div>
      <PageHeader title="Post" />
      <Post post={post} showReplies />
    </div>
  );
} 