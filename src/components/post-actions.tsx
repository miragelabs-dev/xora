'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";

interface PostActionsProps {
  stats: {
    commentsCount: number;
    repostsCount: number;
    likesCount: number;
    savesCount: number;
  };
  interactions: {
    isLiked: boolean;
    isReposted: boolean;
    isSaved: boolean;
  };
  postId: number;
}

export function PostActions({ stats, interactions, postId }: PostActionsProps) {
  const utils = api.useUtils();

  const { mutate: like } = api.post.like.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
    },
  });

  const { mutate: unlike } = api.post.unlike.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
    },
  });

  return (
    <div className="mt-2 flex justify-between text-muted-foreground">
      <Button variant="ghost" size="icon" className="gap-2">
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm">{stats.commentsCount}</span>
      </Button>

      <Button variant="ghost" size="icon" className="gap-2">
        <Repeat2 className={cn("h-5 w-5", interactions.isReposted && "text-green-500")} />
        <span className="text-sm">{stats.repostsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="gap-2"
        onClick={() => interactions.isLiked ? unlike({ postId }) : like({ postId })}
      >
        <Heart className={cn("h-5 w-5", interactions.isLiked && "text-red-500")} />
        <span className="text-sm">{stats.likesCount}</span>
      </Button>

      <Button variant="ghost" size="icon" className="gap-2">
        <Bookmark className={cn("h-5 w-5", interactions.isSaved && "text-blue-500")} />
        <span className="text-sm">{stats.savesCount}</span>
      </Button>
    </div>
  );
} 