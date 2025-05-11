'use client';

import { FeedSkeleton } from "@/components/feed";
import { Post } from "@/components/post";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export function BookmarksView() {
  const { ref, inView } = useInView();

  const { data: bookmarks, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = api.post.bookmarks.useInfiniteQuery({
    limit: 10,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);


  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (!bookmarks?.pages?.length) {
    return <div className="flex justify-center p-4 text-muted-foreground">No bookmarks yet</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {bookmarks.pages.map((page, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {page.items.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </motion.div>
      ))}
      <div
        className="flex justify-center p-4"
        ref={ref}
      >
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>
    </motion.div>
  );
}

