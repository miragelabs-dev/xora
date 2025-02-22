import { useSession } from "@/app/session-provider";
import { PostActions } from "@/components/post-actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import { Loader2, MoreHorizontal, Repeat2, Trash } from "lucide-react";
import Link from "next/link";

interface PostProps {
  post: {
    id: number;
    content: string;
    createdAt: string;
    authorId: number;
    authorUsername: string;
    commentsCount: number;
    repostsCount: number;
    likesCount: number;
    savesCount: number;
    isLiked: boolean;
    isReposted: boolean;
    isSaved: boolean;
    reposterUsername: string | null;
  }
}

export function Post({
  post: {
    id: postId,
    content,
    createdAt: timestamp,
    authorId,
    authorUsername,
    commentsCount,
    repostsCount,
    likesCount,
    savesCount,
    isLiked,
    isReposted,
    isSaved,
    reposterUsername,
  }
}: PostProps) {
  const utils = api.useUtils();
  const session = useSession();

  const isPostOwner = authorId === session?.id;

  const { mutate: deletePost, isPending } = api.post.delete.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
    },
  });

  return (
    <div className="group relative p-4 block border-b border-border">
      <Link
        href={`/post/${postId}`}
        className="absolute inset-0 z-0"
      />

      {reposterUsername && (
        <div className="ml-2 top-[-8px] relative flex items-center gap-1 px-4 pt-2 text-xs text-muted-foreground">
          <Repeat2 className="h-4 w-4" />
          <span>@{reposterUsername} reposted</span>
        </div>
      )}

      <article className="flex gap-4">
        <UserAvatar />

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm">
              <span className="font-bold">@{authorUsername}</span>
              <span className="ml-2 text-muted-foreground">· {timestamp}</span>
            </div>

            {isPostOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative z-10 h-8 w-8"
                  >
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

          <PostActions
            stats={{ commentsCount, repostsCount, likesCount, savesCount }}
            interactions={{ isLiked, isReposted, isSaved }}
            postId={postId}
            className="relative z-10"
          />
        </div>
      </article>
    </div>
  );
} 