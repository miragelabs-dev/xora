'use client';

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { NotificationView } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function NotificationsSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 hover:bg-muted/50 border-b">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[250px]" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const { mutate: markAllAsRead } = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationClick = (notification: NotificationView) => {
    if (!notification.read) {
      markAsRead({ notificationId: notification.id });
    }

    if (!notification.targetId) return;

    switch (notification.targetType) {
      case 'profile':
        router.push(`/${notification.actorUsername}`);
        break;
      case 'post':
        router.push(`/${notification.userUsername}/status/${notification.targetId}`);
        break;
    }
  };

  function getNotificationText(type: string) {
    switch (type) {
      case 'follow':
        return 'followed you';
      case 'like':
        return 'liked your post';
      case 'repost':
        return 'reposted your post';
      case 'reply':
        return 'replied to your post';
      default:
        return 'interacted with you';
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Notifications" />
        <NotificationsSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader title="Notifications" />

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center p-4"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </motion.div>
      ) : !data?.items.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center p-4 text-muted-foreground"
        >
          No notifications yet
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="divide-y divide-border"
        >
          {data.items.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "flex gap-4 p-4 hover:bg-accent/50 cursor-pointer transition-colors",
                !notification.read && "bg-primary/5",
                notification.read && "opacity-60"
              )}
            >
              <UserAvatar
                src={notification.actorImage}
                fallback={notification.actorUsername[0]}
                className="h-10 w-10"
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm">
                  <span className="font-bold">@{notification.actorUsername}</span>{' '}
                  {getNotificationText(notification.type)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
