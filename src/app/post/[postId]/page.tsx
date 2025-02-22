'use client';

import { useSession } from "@/app/session-provider";
import { Post } from "@/components/post";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { ArrowLeftIcon, Loader2 } from "lucide-react";
import { notFound, useRouter } from "next/navigation";

export default function PostPage({
  params
}: {
  params: { postId: string }
}) {
  const router = useRouter();
  const session = useSession();
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

  if (!post) {
    return notFound();
  }

  return (
    <div>
      <div className="sticky top-0 z-[25] flex h-[53px] items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      <Post post={post} showReplies />
    </div>
  );
} 