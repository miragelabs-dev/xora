import { ChatArea } from "@/components/chat-area";
import { ConversationList } from "@/components/conversation-list";

type Params = Promise<{ conversationId: string }>;

export default async function Page({
  params,
}: {
  params: Params;
}) {
  const { conversationId } = await params;

  return (
    <>
      <div className="hidden md:block overflow-y-auto">
        <ConversationList />
      </div>
      <ChatArea conversationId={parseInt(conversationId)} />
    </>
  );
} 