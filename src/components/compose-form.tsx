import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, ImageIcon, Loader2, SmileIcon, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmojiPicker } from "./emoji-picker";
import { ImagePicker } from "./image-picker";
import { MentionSuggestions } from "./mention-suggestions";

interface ComposeFormProps {
  user: {
    image?: string | null;
    username: string;
  };
  onSubmit: (data: { content: string; image: string | null; communityId: number | null }) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
  initialContent?: string;
  initialCommunityId?: number | null;
  showAudienceSelector?: boolean;
}

export function ComposeForm({
  user,
  onSubmit,
  isSubmitting = false,
  placeholder = "What's happening?",
  submitLabel = "Post",
  className = "",
  initialContent = "",
  initialCommunityId = null,
  showAudienceSelector = true,
}: ComposeFormProps) {
  const [content, setContent] = useState(initialContent);
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const mentionTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(initialCommunityId);

  useEffect(() => {
    setSelectedCommunityId(initialCommunityId);
  }, [initialCommunityId]);

  const { data: communities, isLoading: isCommunitiesLoading } = api.community.joined.useQuery(undefined, {
    enabled: showAudienceSelector,
  });

  const joinedCommunities = communities ?? [];

  const selectedCommunity = selectedCommunityId
    ? joinedCommunities.find((community) => community.id === selectedCommunityId) ?? null
    : null;

  useEffect(() => {
    if (
      selectedCommunityId &&
      showAudienceSelector &&
      !isCommunitiesLoading &&
      selectedCommunityId !== null &&
      !selectedCommunity
    ) {
      setSelectedCommunityId(null);
    }
  }, [selectedCommunityId, selectedCommunity, showAudienceSelector, isCommunitiesLoading]);

  const audienceLabel = selectedCommunity ? selectedCommunity.title : "Everyone";

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    adjustTextareaHeight();

    const lastWord = newContent.split(/\s/).pop() || "";
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      if (mentionTimeoutRef.current) {
        clearTimeout(mentionTimeoutRef.current);
      }

      mentionTimeoutRef.current = setTimeout(() => {
        setMentionQuery(lastWord);
        setShowMentions(true);
      }, 300);
    } else {
      setShowMentions(false);
    }
  };

  useEffect(() => {
    return () => {
      if (mentionTimeoutRef.current) {
        clearTimeout(mentionTimeoutRef.current);
      }
    };
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const handleMentionSelect = (username: string) => {
    const words = content.split(/\s/);
    words[words.length - 1] = `@${username}`;
    setContent(words.join(" ") + " ");
    setShowMentions(false);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    const formattedContent = content.trim();

    onSubmit({ content: formattedContent, image, communityId: selectedCommunityId });
    setContent('');
    setImage(null);
  };

  const isDisabled = (!content.trim() && !image) || isSubmitting || isUploading;

  return (
    <div className={`flex gap-3 sm:gap-4 ${className}`}>
      <UserAvatar
        src={user.image}
        fallback={user.username[0]}
        className="h-8 w-8 sm:h-10 sm:w-10"
      />

      <div className="flex-1 space-y-3 sm:space-y-4">
        {showAudienceSelector && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-full border px-3 text-xs sm:text-sm font-medium transition hover:bg-muted/80 flex items-center gap-2"
                disabled={isSubmitting || isUploading}
              >
                <span className="truncate max-w-[140px] sm:max-w-[160px]">{audienceLabel}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Select audience
              </DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={() => setSelectedCommunityId(null)}
                className="flex items-center justify-between"
              >
                <span>Everyone</span>
                <Check className={cn("h-4 w-4", selectedCommunityId === null ? "opacity-100" : "opacity-0")} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                My communities
              </div>
              {isCommunitiesLoading ? (
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading communities...
                </div>
              ) : joinedCommunities.length ? (
                joinedCommunities.map((community) => {
                  const isSelected = selectedCommunityId === community.id;
                  return (
                    <DropdownMenuItem
                      key={community.id}
                      onSelect={() => setSelectedCommunityId(community.id)}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{community.title}</span>
                      <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  You are not a member of any community yet
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            className="min-h-[80px] sm:min-h-[100px] resize-none border-none bg-transparent p-0 focus-visible:ring-0 pt-1.5 !text-lg overflow-hidden"
            value={content}
            onChange={handleContentChange}
            disabled={isSubmitting || isUploading}
            onInput={adjustTextareaHeight}
          />
          <MentionSuggestions
            query={mentionQuery}
            isOpen={showMentions}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentions(false)}
          />
        </div>

        <ImagePicker
          value={image}
          onChange={setImage}
          disabled={isSubmitting}
          onUploadingChange={setIsUploading}
        >
          <ImagePicker.Preview />

          <div className="flex items-center justify-between">
            <div className="flex gap-1 sm:gap-2 text-primary">
              <ImagePicker.Trigger
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 sm:h-9 sm:w-9"
                spinnerClassName="h-4 w-4 sm:h-5 sm:w-5 animate-spin"
                iconClassName="h-4 w-4 sm:h-5 sm:w-5"
              >
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </ImagePicker.Trigger>
              <EmojiPicker onEmojiSelect={handleEmojiSelect}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  disabled={isSubmitting || isUploading}
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
                disabled={isDisabled}
                className="h-8 sm:h-9 rounded-full px-4 sm:px-6 text-sm"
              >
                {(isSubmitting || isUploading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </div>
        </ImagePicker>
      </div>
    </div>
  );
}
