import { useSession } from "@/app/session-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { PostView } from "@/lib/db/schema/post";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MoreHorizontal, Repeat2, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ComposeForm } from "./compose-form";
import { CryptoPriceTag } from "./crypto-price-tag";
import { ImageLightbox } from "./image-lightbox";
import { PostActions } from "./post-actions";

interface PostProps {
  post: PostView;
  showReplies?: boolean;
  className?: string;
}

export function Post({
  post,
  showReplies = false,
}: PostProps) {
  const [replyContent, setReplyContent] = useState("");
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);

  const utils = api.useUtils();
  const { user } = useSession();
  const router = useRouter();

  const isPostOwner = post.authorId === user?.id;

  const { mutate: deletePost, isPending } = api.post.delete.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
    },
  });

  const { mutate: reply } = api.post.reply.useMutation({
    onSuccess: () => {
      setReplyContent("");
      utils.post.getReplies.invalidate({ postId: post.id });
      utils.post.getById.invalidate({ postId: post.id });
    },
  });

  const { data: replies, hasNextPage, fetchNextPage, isFetchingNextPage } =
    api.post.getReplies.useInfiniteQuery(
      {
        postId: post.id,
        limit: 10,
      },
      {
        enabled: showReplies,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <div
      className="group relative block border-b border-border"
    >
      <div
        onClick={(e) => {
          const selection = window.getSelection();
          const shouldNavigate = !(e.target as HTMLElement).closest('[data-no-navigate]') &&
            (!selection || selection.toString().length === 0);

          if (shouldNavigate) {
            router.push(`/${post.author.username}/status/${post.id}`);
          }
        }}
        className="relative px-4 py-3 hover:bg-muted/20 transition-colors duration-200 cursor-pointer">
        {post.repost && (
          <div className="ml-2 top-[-8px] relative flex items-center gap-1 px-4 pt-2 text-xs text-muted-foreground">
            <Repeat2 className="h-4 w-4" />
            <span>
              <Link
                href={`/${post.repost.user.username}`}
                className="relative z-10 hover:underline"
                data-no-navigate
              >
                @{post.repost.user.username}
              </Link>
              {" "}reposted
            </span>
          </div>
        )}

        <article className="flex gap-4">
          <Link href={`/${post.author.username}`} data-no-navigate>
            <UserAvatar
              src={post.author.image}
              fallback={post.author.username[0]}
              className="h-10 w-10"
              data-no-navigate
            />
          </Link>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm">
                <Link
                  href={`/${post.author.username}`}
                  className="relative z-10 font-bold hover:underline"
                  data-no-navigate
                >
                  {`@${post.author.username}`}
                </Link>
                <span className="ml-2 text-muted-foreground">· {
                  formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                }</span>
              </div>

              {isPostOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 m-2 z-10 h-8 w-8"
                      data-no-navigate
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={isPending}
                      onClick={() => deletePost({ postId: post.id })}
                      data-no-navigate
                      className="text-destructive focus:text-destructive"
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

            <div className="text-sm mt-2 select-text space-y-4">
              <p>{post.content}</p>
              {post.content.match(/\$[A-Za-z]{2,5}/g) && (
                <div className="border-t border-border pt-3">
                  <div className="flex flex-col gap-2" data-no-navigate>
                    {Array.from(new Set(post.content.match(/\$[A-Za-z]{2,5}/g) || []))
                      .map((symbol) => (
                        <CryptoPriceTag
                          key={symbol}
                          symbol={symbol.substring(1)}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>

            {post.image && (
              <>
                <div
                  className="relative mt-5 aspect-[16/9] overflow-hidden rounded-xl cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageLightboxOpen(true);
                  }}
                  data-no-navigate
                >
                  <Image
                    src={post.image}
                    alt="Post image"
                    fill
                    className="object-cover"
                    data-no-navigate
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <ImageLightbox
                  src={post.image}
                  isOpen={isImageLightboxOpen}
                  onClose={() => setIsImageLightboxOpen(false)}
                />
              </>
            )}

            <PostActions
              stats={post.stats}
              interactions={post.viewer}
              postId={post.id}
              authorUsername={post.author.username}
              className="relative z-10 mt-2"
            />
          </div>
        </article>
      </div>

      {showReplies && (
        <div className="border-t border-b border-border p-4">
          <ComposeForm
            user={user}
            onSubmit={({ content, image }) => {
              reply({
                content,
                image,
                replyToId: post.id,
              });
            }}
            placeholder="Tweet your reply"
            submitLabel="Reply"
          />
        </div>
      )}

      {showReplies && replies?.pages.map((page, i) => (
        <div key={i}>
          {page.items.map((reply) => (
            <Post key={reply.id} post={reply} />
          ))}
        </div>
      ))}

      {hasNextPage && (
        <Button
          variant="ghost"
          className="mt-4 w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Load more replies"
          )}
        </Button>
      )}
    </div>
  );
} 