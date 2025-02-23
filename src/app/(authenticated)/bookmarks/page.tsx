'use client';

import { PageHeader } from "@/components/page-header";
import { Post } from "@/components/post";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center p-4"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </motion.div>
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
          {bookmarks.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Post post={post} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}