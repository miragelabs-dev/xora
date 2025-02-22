import { Db } from "@/lib/db";
import { notifications } from "@/lib/db/schema/notification";
import { and, eq } from "drizzle-orm";

export async function createNotification(db: Db, {
  userId,
  actorId,
  type,
  targetId,
  targetType,
}: {
  userId: number;
  actorId: number;
  type: 'follow' | 'like' | 'repost' | 'comment' | 'save';
  targetId?: number;
  targetType?: 'post' | 'profile';
}) {
  await db.insert(notifications).values({
    userId,
    actorId,
    type,
    targetId,
    targetType,
  });
}

export async function deleteNotification(db: Db, {
  actorId,
  type,
  targetId,
  targetType,
}: {
  actorId: number;
  type: 'follow' | 'like' | 'repost' | 'comment' | 'save';
  targetId: number;
  targetType: 'post' | 'profile';
}) {
  await db
    .delete(notifications)
    .where(and(
      eq(notifications.actorId, actorId),
      eq(notifications.type, type),
      eq(notifications.targetId, targetId),
      eq(notifications.targetType, targetType)
    ));
} 