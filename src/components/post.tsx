import { PostActions } from "@/components/post-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import { Loader2, MoreHorizontal, Trash } from "lucide-react";

interface PostProps {
  username: string;
  timestamp: string;
  content: string;
  commentsCount: number;
  repostsCount: number;
  likesCount: number;
  savesCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isSaved: boolean;
  postId: number;
  isOwner?: boolean;
}

export function Post({
  username,
  timestamp,
  content,
  commentsCount,
  repostsCount,
  likesCount,
  savesCount,
  isLiked,
  isReposted,
  isSaved,
  postId,
  isOwner
}: PostProps) {
  const utils = api.useUtils();
  const { mutate: deletePost, isPending } = api.post.delete.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
    },
  });

  return (
    <article className="flex gap-4 border-b border-border p-4">
      <UserAvatar />

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm">
            <span className="font-bold">@{username}</span>
            <span className="ml-2 text-muted-foreground">· {timestamp}</span>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={isPending}
                  onClick={() => deletePost({ postId })}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="mr-2 h-4 w-4" />
                  )}
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="text-sm">{content}</p>

        <PostActions stats={{ commentsCount, repostsCount, likesCount, savesCount }} interactions={{ isLiked, isReposted, isSaved }} postId={postId} />
      </div>
    </article>
  );
} 