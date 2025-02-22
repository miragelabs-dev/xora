import { eq, relations } from "drizzle-orm";
import { boolean, integer, pgTable, pgView, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: integer("actor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  targetId: integer("target_id"),
  targetType: text("target_type"),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
}));

export const notificationView = pgView("notification_view").as((qb) =>
  qb
    .select({
      id: notifications.id,
      userId: notifications.userId,
      actorId: notifications.actorId,
      actorUsername: users.username,
      type: notifications.type,
      read: notifications.read,
      createdAt: notifications.createdAt,
      targetId: notifications.targetId,
      targetType: notifications.targetType,
    })
    .from(notifications)
    .innerJoin(users, eq(users.id, notifications.actorId))
);

export type Notification = typeof notifications.$inferSelect;
export type NotificationView = typeof notificationView.$inferSelect;