'use client';

import { PageHeader } from "@/components/page-header";
import { Post } from "@/components/post";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/utils/api";
import { notFound } from "next/navigation";

function PostSkeleton() {
  return (
    <div className="border-b px-4 py-3">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-6 pt-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4 border-t pt-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-24 w-full rounded-md" />
            <div className="mt-4 flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostPage({
  params
}: {
  params: { userUsername: string; postId: string }
}) {
  const { data: post, isLoading } = api.post.getById.useQuery({
    postId: parseInt(params.postId)
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Post" />
        <PostSkeleton />
      </div>
    );
  }

  if (!post || post.authorUsername !== params.userUsername) {
    return notFound();
  }

  return (
    <div>
      <PageHeader title="Post" />
      <Post post={post} showReplies />
    </div>
  );
} 