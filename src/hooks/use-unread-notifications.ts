import { api } from "@/utils/api";

export function useUnreadNotifications() {
  const { data: unreadCount = 0 } = api.notification.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return unreadCount;
} 