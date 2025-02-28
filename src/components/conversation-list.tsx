"use client";

import { useSession } from "@/app/session-provider";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { UserAvatar } from "./user-avatar";

export function ConversationList() {
  const params = useParams();
  const utils = api.useUtils();
  const { data: conversations, isLoading } = api.message.getConversations.useQuery({
    limit: 50,
  });

  const { mutate: markAsRead } = api.message.markConversationAsRead.useMutation({
    onSuccess: () => {
      utils.message.getConversations.invalidate();
      utils.message.getUnreadCount.invalidate();
    },
  });

  const handleConversationClick = (conversationId: number) => {
    markAsRead({ conversationId });
  };

  const { user } = useSession();

  if (isLoading) {
    return (
      <div className="h-full border-r">
        <div className="w-full animate-pulse space-y-2 p-2">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-0 p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-3 w-48 rounded bg-muted" />
                </div>
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!conversations?.items.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 border-r p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No conversations yet</h3>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Start a conversation by visiting someone&apos;s profile and clicking the message button
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full border-r">
      <ScrollArea className="h-full">
        <div className="space-y-2 p-2">
          {conversations.items.map((conversation) => {
            const isActive = params?.userId === conversation.recipient.id.toString();
            const anotherUser = conversation.recipient.id !== user.id ? conversation.recipient : conversation.initiator;

            return (
              <Link
                className="block"
                href={`/messages/${conversation.recipient.id}`}
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
              >
                <Card
                  className={`border-0 relative transition-colors hover:bg-muted/50 ${isActive ? "bg-muted" : ""
                    }`}
                >
                  <div className="flex items-start gap-4 p-4">
                    <UserAvatar
                      src={anotherUser.image}
                      fallback={anotherUser.username?.[0] ?? "U"}
                      className="h-12 w-12"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">
                          @{conversation.recipient.username}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                            includeSeconds: true
                          })}
                        </p>
                      </div>
                      {conversation.lastMessage && (
                        <p className={cn(
                          "text-sm truncate mt-1",
                          conversation.unreadCount > 0
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}>
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute top-2 right-4 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
} 