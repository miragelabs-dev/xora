'use client';

import { useSession } from "@/app/session-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import { ImageIcon, Loader2, SmileIcon, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmojiPicker } from "./emoji-picker";

export function Compose({ onSuccess }: { onSuccess?: () => void }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = api.useUtils();

  const { mutate: createPost, isPending } = api.post.create.useMutation({
    onSuccess: () => {
      utils.post.feed.invalidate();
      setContent('');
      setImage(null);
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost({
      content: content.trim(),
      image: image
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setImage(data.secure_url);
    } catch (error) {
      toast.error('Image upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const { user } = useSession();

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 border-b">
      <UserAvatar
        src={user.image}
        fallback={user.username[0]}
        className="h-8 w-8 sm:h-10 sm:w-10"
      />

      <div className="flex-1 space-y-3 sm:space-y-4">
        <Textarea
          placeholder="What's happening?"
          className="min-h-[80px] sm:min-h-[100px] resize-none border-none bg-transparent p-0 focus-visible:ring-0 pt-1.5 !text-lg"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending || isUploading}
        />

        {image && (
          <div className="relative rounded-xl overflow-hidden">
            <div className="aspect-[16/9] relative">
              <Image
                src={image}
                alt="Upload preview"
                fill
                className="object-cover"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => setImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1 sm:gap-2 text-primary">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 relative"
              disabled={isPending || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
            <EmojiPicker onEmojiSelect={handleEmojiSelect}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                disabled={isPending || isUploading}
              >
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
              disabled={(!content.trim() && !image) || isPending || isUploading}
              className="h-8 sm:h-9 px-4 sm:px-6 rounded-full text-sm"
            >
              {(isPending || isUploading) ? (
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