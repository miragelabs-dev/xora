import { ConversationList } from "@/components/conversation-list";
import { SelectConversation } from "@/components/select-conversation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your private messages",
};

export default function MessagesPage() {
  return (
    <>
      <ConversationList />
      <SelectConversation />
    </>
  );
} 