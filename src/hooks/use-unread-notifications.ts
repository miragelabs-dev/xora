import { useSession } from "@/app/session-provider";
import { api } from "@/utils/api";

export function useUnreadNotifications() {
  const { user } = useSession();

  const { data: unreadCount = 0 } = api.notification.getUnreadCount.useQuery(undefined, {
    enabled: !!user,
  });

  return unreadCount;
} 