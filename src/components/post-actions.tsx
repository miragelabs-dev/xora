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
  className?: string;
}

export function PostActions({ stats, interactions, postId, className }: PostActionsProps) {
  const utils = api.useUtils();

  const { mutate: like } = api.post.like.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      utils.post.getById.invalidate({ postId });
    },
  });

  const { mutate: unlike } = api.post.unlike.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      utils.post.getById.invalidate({ postId });
    },
  });

  const { mutate: repost } = api.post.repost.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      utils.post.getById.invalidate({ postId });
    },
  });

  const { mutate: unrepost } = api.post.unrepost.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      utils.post.getById.invalidate({ postId });
    },
  });

  const { mutate: save } = api.post.save.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      utils.post.getById.invalidate({ postId });
      utils.post.bookmarks.invalidate();
    },
  });

  const { mutate: unsave } = api.post.unsave.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      utils.post.getById.invalidate({ postId });
      utils.post.bookmarks.invalidate();
    },
  });

  return (
    <div className={cn("mt-2 flex justify-between text-muted-foreground", className)}>
      <Button variant="ghost" size="icon" className="gap-2" onClick={(e) => {
        e.preventDefault();

        // TODO: Implement comment post
      }}>
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm">{stats.commentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="gap-2"
        onClick={(e) => {
          e.preventDefault();

          if (interactions.isReposted) {
            unrepost({ postId });
          } else {
            repost({ postId });
          }
        }}
      >
        <Repeat2 className={cn("h-5 w-5", interactions.isReposted && "text-green-500")} />
        <span className="text-sm">{stats.repostsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="gap-2"
        onClick={(e) => {
          e.preventDefault();

          if (interactions.isLiked) {
            unlike({ postId });
          } else {
            like({ postId });
          }
        }}
      >
        <Heart className={cn("h-5 w-5", interactions.isLiked && "text-red-500")} />
        <span className="text-sm">{stats.likesCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="gap-2"
        onClick={(e) => {
          e.preventDefault();

          if (interactions.isSaved) {
            unsave({ postId });
          } else {
            save({ postId });
          }
        }}
      >
        <Bookmark className={cn("h-5 w-5", interactions.isSaved && "text-blue-500")} />
        <span className="text-sm">{stats.savesCount}</span>
      </Button>
    </div >
  );
} 