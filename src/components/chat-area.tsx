"use client";

import { useSession } from "@/app/session-provider";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { UserAvatar } from "./user-avatar";
import { VerifiedBadge } from "./verified-badge";

interface ChatAreaProps {
  userId: number;
}

export function ChatArea({ userId }: ChatAreaProps) {
  const { user } = useSession();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utils = api.useUtils();
  const router = useRouter();

  const { data: recipient, isLoading: isLoadingRecipient } = api.user.getById.useQuery({ userId });
  const { data: conversation } = api.message.getConversation.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const { data: messages, isLoading: isLoadingMessages } = api.message.getMessages.useQuery(
    {
      conversationId: conversation?.id ?? -1,
      limit: 50,
    },
    {
      enabled: !!conversation?.id,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  const { mutate: sendMessage, isPending: isSending } = api.message.sendMessage.useMutation({
    onSuccess: () => {
      setContent("");
      textareaRef.current?.focus();
      utils.message.getMessages.invalidate({ conversationId: conversation?.id });
      utils.message.getConversations.invalidate();
    },
  });

  const handleSendMessage = () => {
    if (!content.trim() || isSending) return;
    sendMessage({ recipientId: userId, content: content.trim() });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoadingRecipient) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <UserAvatar
          src={recipient.image}
          fallback={recipient.username[0]}
          className="h-9 w-9"
        />
        <div className="flex items-center gap-1.5">
          <p className="font-medium">@{recipient.username}</p>
          {recipient.isVerified && <VerifiedBadge className="h-4 w-4" />}
        </div>
      </header>

      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="space-y-3 p-4">
          {isLoadingMessages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !messages?.items.length ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <UserAvatar
                src={recipient.image}
                fallback={recipient.username[0]}
                className="h-14 w-14"
              />
              <div className="text-center">
                <p className="font-medium">@{recipient.username}</p>
                <p className="text-sm text-muted-foreground">
                  Send your first message to start the conversation
                </p>
              </div>
            </div>
          ) : (
            messages.items.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender.id === user.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] space-y-1 rounded-2xl px-4 py-2.5 ${message.sender.id === user.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                    }`}
                >
                  <p className="break-words text-sm">{message.content}</p>
                  <p className="text-[10px] opacity-70">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <footer className="border-t p-4">
        <div className="flex gap-3 items-center">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Message @${recipient.username}...`}
            className="min-h-[52px] max-h-[150px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!content.trim() || isSending}
            size="icon"
            className="h-[52px] w-[52px] shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
} 