import { eq, relations, sql } from "drizzle-orm";
import { alias, boolean, integer, pgTable, pgView, serial, text, timestamp } from "drizzle-orm/pg-core";
import { posts } from "./post";
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

export const notificationView = pgView("notification_view").as((qb) => {
  const actorAlias = alias(users, "actor");
  const userAlias = alias(users, "user");
  const postAlias = alias(posts, "post");

  return qb
    .select({
      id: notifications.id,
      userId: notifications.userId,
      userUsername: sql<string>`${userAlias.username}`.as('user_username'),
      actorId: notifications.actorId,
      actorUsername: sql<string>`${actorAlias.username}`.as('actor_username'),
      actorImage: sql<string>`${actorAlias.image}`.as('actor_image'),
      type: notifications.type,
      read: notifications.read,
      createdAt: notifications.createdAt,
      targetId: notifications.targetId,
      targetType: notifications.targetType,
      postContent: sql<string>`
        CASE
          WHEN ${notifications.targetType} = 'post' THEN ${postAlias.content}
          WHEN ${notifications.targetType} = 'user' THEN 'user'
          ELSE ''
        END
      `.as('post_content'),
    })
    .from(notifications)
    .innerJoin(actorAlias, eq(notifications.actorId, actorAlias.id))
    .innerJoin(userAlias, eq(notifications.userId, userAlias.id))
    .leftJoin(postAlias, eq(notifications.targetId, postAlias.id))
    .where(
      sql`(
        (${notifications.targetType} = 'post' AND ${postAlias.id} IS NOT NULL) OR
        (${notifications.targetType} != 'post')
      )`
    );
});

export type Notification = typeof notifications.$inferSelect;
export type NotificationView = typeof notificationView.$inferSelect;