'use client';

import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { NotificationView } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const utils = api.useUtils();
  const router = useRouter();

  const { data, isLoading } = api.notification.list.useQuery({
    limit: 50,
  });

  const { mutate: markAsRead } = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
    },
  });

  const handleNotificationClick = (notification: NotificationView) => {
    markAsRead({ notificationId: notification.id });

    if (!notification.targetId) return;

    switch (notification.targetType) {
      case 'profile':
        router.push(`/profile/${notification.actorUsername}`);
        break;
      case 'post':
        router.push(`/post/${notification.targetId}`);
        break;
    }
  };

  return (
    <div>
      <PageHeader title="Notifications" />

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !data?.items.length ? (
        <div className="flex justify-center p-4 text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <div className="divide-y divide-border">
          {data.items.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex gap-4 p-4 hover:bg-accent/50 cursor-pointer transition-colors ${notification.read ? 'opacity-60' : ''
                }`}
            >
              <UserAvatar fallback={notification.actorUsername[0]} />
              <div className="flex flex-col gap-1">
                <p className="text-sm">
                  <span className="font-bold">@{notification.actorUsername}</span>
                  {' '}
                  {getNotificationText(notification.type)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getNotificationText(type: string) {
  switch (type) {
    case 'follow':
      return 'started following you';
    case 'like':
      return 'liked your post';
    case 'repost':
      return 'reposted your post';
    case 'comment':
      return 'commented on your post';
    case 'save':
      return 'saved your post';
    default:
      return 'interacted with you';
  }
}
