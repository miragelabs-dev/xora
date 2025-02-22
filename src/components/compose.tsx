'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import { ImageIcon, Loader2, SmileIcon } from "lucide-react";
import { useState } from "react";

export function Compose() {
  const [content, setContent] = useState('');
  const utils = api.useUtils();

  const { mutate: createPost, isPending } = api.post.create.useMutation({
    onSuccess: () => {
      setContent('');
      utils.post.feed.invalidate();
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost({ content: content.trim() });
  };

  return (
    <div className="flex gap-4 p-4">
      <UserAvatar />

      <div className="flex-1 space-y-4">
        <Textarea
          placeholder="What's happening?"
          className="min-h-[100px] resize-none border-none bg-transparent p-0 focus-visible:ring-0 pt-1.5 !text-lg"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-primary">
            <Button variant="ghost" size="icon" disabled={isPending}>
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <SmileIcon className="h-5 w-5" />
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isPending}
            className="rounded-full px-6"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 