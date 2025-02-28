'use client';

import { Post } from "@/components/post";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { PostSkeleton } from "./post-skeleton";

interface FeedProps {
  type?: 'for-you' | 'following' | 'user' | 'replies' | 'crypto-bots' | 'search';
  userId?: number;
  searchQuery?: string;
}

export function FeedSkeleton() {
  return (
    <div>
      {[...Array(3)].map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function Feed({ type = 'for-you', userId, searchQuery }: FeedProps) {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = type === 'search'
      ? api.post.search.useInfiniteQuery(
        {
          query: searchQuery || '',
          limit: 20,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          enabled: !!searchQuery
        }
      )
      : api.post.feed.useInfiniteQuery(
        {
          type,
          userId,
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
    return <FeedSkeleton />;
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
              key={item.id}
              post={item}
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