'use client';

import { PageHeader } from "@/components/page-header";
import { Post } from "@/components/post";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = api.post.bookmarks.useQuery();

  return (
    <div>
      <PageHeader title="Bookmarks" />

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !bookmarks?.length ? (
        <div className="flex justify-center p-4 text-muted-foreground">
          No bookmarks yet
        </div>
      ) : (
        bookmarks.map((post) => (
          <Post key={post.id} post={post} />
        ))
      )}
    </div>
  );
}