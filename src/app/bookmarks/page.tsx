'use client';

import { Post } from "@/components/post";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookmarksPage() {
  const router = useRouter();
  const { data: bookmarks, isLoading } = api.post.bookmarks.useQuery();

  return (
    <div>
      <div className="sticky top-0 z-[25] flex h-[53px] items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-bold">Bookmarks</h1>
      </div>

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