'use client';

import { useSession } from "@/app/session-provider";
import { Post } from "@/components/post";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface FeedProps {
  type?: 'for-you' | 'following';
}

export function Feed({ type = 'for-you' }: FeedProps) {
  const session = useSession();

  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = api.post.feed.useInfiniteQuery(
    {
      type,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.pages[0].items.length) {
    return (
      <div className="flex justify-center p-4 text-muted-foreground">
        No posts yet
      </div>
    );
  }

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.items.map((item) => (
            <Post
              key={item.post.id}
              username={item.author.username}
              timestamp={new Date(item.post.createdAt).toLocaleString()}
              content={item.post.content}
              commentsCount={item.commentsCount}
              repostsCount={item.repostsCount}
              likesCount={item.likesCount}
              savesCount={item.savesCount}
              isLiked={item.isLiked}
              isReposted={item.isReposted}
              isSaved={item.isSaved}
              postId={item.post.id}
              isOwner={item.author.id === session?.id}
              repostedBy={item.repostedBy?.username ? {
                username: item.repostedBy.username
              } : undefined}
            />
          ))}
        </div>
      ))}

      <div
        className="flex justify-center p-4"
        ref={ref}
      >
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>
    </div>
  );
} 