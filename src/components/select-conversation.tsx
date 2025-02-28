import { MessageCircle } from "lucide-react";

export function SelectConversation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <MessageCircle className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Select a conversation</h3>
        <p className="text-sm text-muted-foreground">
          Choose a conversation from the list or start a new one from a user&apos;s profile.
        </p>
      </div>
    </div>
  );
} 