import { useSession } from "@/app/session-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { VerifiedBadge } from "@/components/verified-badge";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { Loader2, MoreHorizontal, Repeat2, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

import { EnrichedPost, ReplyEnrichedPost } from "@/server/utils/enrich-posts";
import { formatDistanceToNow } from "date-fns";
import { ComposeForm } from "./compose-form";
import { CryptoPriceTag } from "./crypto-price-tag";
import { ImageLightbox } from "./image-lightbox";
import { PostActions } from "./post-actions";

interface PostProps {
  post: EnrichedPost | ReplyEnrichedPost;
  hideReplyTo?: boolean;
  showReplies?: boolean;
  className?: string;
  hideBorder?: boolean;
}

function isFullPost(post: EnrichedPost | ReplyEnrichedPost): post is EnrichedPost {
  return 'replyTo' in post && 'repostedUsername' in post;
}

export function Post({
  post,
  hideReplyTo = false,
  showReplies = false,
  hideBorder = false,
}: PostProps) {
  const [replyContent, setReplyContent] = useState("");
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);

  const utils = api.useUtils();
  const { user } = useSession();
  const router = useRouter();
  const isFullPostView = isFullPost(post);

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

  const renderContent = (content: string) => {
    const parts = content.split(/([@＠][a-zA-Z0-9_]+)/g);

    return parts.map((part, index) => {
      if (part.match(/^[@＠][a-zA-Z0-9_]+$/)) {
        const username = part.slice(1);
        return (
          <Link
            key={index}
            href={`/${username}`}
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
            data-no-navigate
          >
            {part}
          </Link>
        );
      }
      return <Fragment key={index}>{part}</Fragment>;
    });
  };

  return (
    <div className={cn("group relative block", !hideBorder && "border-b border-border")}>
      {isFullPostView && post?.replyTo && !hideReplyTo && (
        <>
          <div className="relative">
            <div className="absolute left-[34px] top-[16px] h-full w-0.5 bg-border" />
            <Post
              post={post.replyTo}
              hideBorder
            />
          </div>
        </>
      )}

      <div
        onClick={(e) => {
          const selection = window.getSelection();
          const shouldNavigate = !(e.target as HTMLElement).closest('[data-no-navigate]') &&
            (!selection || selection.toString().length === 0);

          if (shouldNavigate) {
            router.push(`/${post.authorUsername}/status/${post.id}`);
          }
        }}
        className={cn(
          "relative px-4 py-3 hover:bg-muted/20 transition-colors duration-200 cursor-pointer",
          {
            "bg-gradient-to-r from-primary/5 to-primary/10": !!post.nftTokenId,
          }
        )}
      >
        {isFullPostView && post.repostedUsername && (
          <div className="ml-2 top-[-8px] relative flex items-center gap-1 px-4 pt-2 text-xs text-muted-foreground">
            <Repeat2 className="h-4 w-4" />
            <span>
              <Link
                href={`/${post.repostedUsername}`}
                className="relative z-10 hover:underline"
                data-no-navigate
              >
                @{post.repostedUsername}
              </Link>
              {" "}reposted
            </span>
          </div>
        )}

        <article className="flex gap-4">
          <Link href={`/${post.authorUsername}`} data-no-navigate>
            <UserAvatar
              src={post.authorImage}
              fallback={post.authorUsername?.[0]}
              className="h-10 w-10"
              data-no-navigate
            />
          </Link>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm">
                <Link
                  href={`/${post.authorUsername}`}
                  className="relative z-10 font-bold hover:underline"
                  data-no-navigate
                >
                  {`@${post.authorUsername}`}
                </Link>
                {post.authorIsCryptoBot ? (
                  <div className="inline-flex items-center ml-2">
                    <div className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/15 transition-colors rounded-full pl-2 pr-2.5 py-0.5">
                      <div className="size-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-primary text-xs font-semibold tracking-wide">
                        CRYPTO BOT
                      </span>
                      <VerifiedBadge className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ) : post.authorIsVerified && (
                  <VerifiedBadge className="ml-1 inline-block" />
                )}
                <span className="ml-2 text-muted-foreground">· {
                  formatDistanceToNow(post.postCreatedAt)
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
              <p className="whitespace-pre-wrap">{renderContent(post.content)}</p>
              {post.content.match(/\$[A-Za-z]{2,5}/g) && (
                <div className="border-t border-border pt-3">
                  <div className="flex flex-col gap-2" data-no-navigate>
                    {Array.from<string>(new Set(post.content.match(/\$[A-Za-z]{2,5}/g) || []))
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
              post={post}
              className="relative z-10 mt-2"
            />
          </div>
        </article>
      </div>

      {showReplies && (
        <div className="border-t border-b border-border p-4">
          {user && (
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
          )}
        </div>
      )}

      {showReplies && replies?.pages.map((page, i) => (
        <div key={i}>
          {page.items.map((reply) => (
            <Post key={reply.id} post={reply} hideReplyTo />
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