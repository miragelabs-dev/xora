import { useSession } from "@/app/session-provider";
import { api } from "@/utils/api";

export function useUnreadMessages() {
  const { user } = useSession();

  const { data: unreadCount = 0 } = api.message.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000,
    enabled: !!user,
  });

  return unreadCount;
} 