'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import { ImageIcon, Loader2, SmileIcon } from "lucide-react";
import { useState } from "react";
import { EmojiPicker } from "./emoji-picker";

export function Compose({ onSuccess }: { onSuccess?: () => void }) {
  const [content, setContent] = useState('');
  const utils = api.useUtils();

  const { mutate: createPost, isPending } = api.post.create.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      setContent('');
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost({ content: content.trim() });
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 border-b">
      <UserAvatar className="h-8 w-8 sm:h-10 sm:w-10" />

      <div className="flex-1 space-y-3 sm:space-y-4">
        <Textarea
          placeholder="What's happening?"
          className="min-h-[80px] sm:min-h-[100px] resize-none border-none bg-transparent p-0 focus-visible:ring-0 pt-1.5 !text-lg"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-1 sm:gap-2 text-primary">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" disabled={isPending}>
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <EmojiPicker onEmojiSelect={handleEmojiSelect}>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" disabled={isPending}>
                <SmileIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </EmojiPicker>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {content.length}/280
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              className="h-8 sm:h-9 px-4 sm:px-6 rounded-full text-sm"
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
    </div>
  );
} 