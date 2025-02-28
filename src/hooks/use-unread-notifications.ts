import { api } from "@/utils/api";

export function useUnreadNotifications() {
  const { data: unreadCount = 0 } = api.notification.getUnreadCount.useQuery();

  return unreadCount;
} 