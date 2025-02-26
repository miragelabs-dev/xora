'use client';

import { FeedSkeleton } from "@/components/feed";
import { PageHeader } from "@/components/page-header";
import { Post } from "@/components/post";
import { api } from "@/utils/api";
import { motion } from "framer-motion";

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = api.post.bookmarks.useQuery();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader title="Bookmarks" />

      {isLoading ? (
        <FeedSkeleton />
      ) : !bookmarks?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center p-4 text-muted-foreground"
        >
          No bookmarks yet
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {bookmarks.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}