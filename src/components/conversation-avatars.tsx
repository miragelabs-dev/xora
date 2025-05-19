import { User } from "@/lib/db/schema";
import { GetConversationsItem } from "@/server/api/routers/message";
import { UserAvatar } from "./user-avatar";

export function ConversationAvatars({ conversation }: { conversation: GetConversationsItem }) {
    return (
        <div className={`flex items-center ${conversation.members.length > 1 ? "-space-x-5" : "gap-2"}`}>
            {conversation.members.map((member) => (
                <ConversationMemberAvatar key={member.id} member={member} />
            ))}
        </div>
    )
}

export function ConversationMemberAvatar({ member }: { member: User }) {
    return (
        <UserAvatar src={member.image ?? ""} fallback={member.username?.[0] ?? "U"} className="h-9 w-9" />
    )
}