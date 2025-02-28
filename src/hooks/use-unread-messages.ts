import { api } from "@/utils/api";

export function useUnreadMessages() {
  const { data: unreadCount = 0 } = api.message.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });

  return unreadCount;
} 