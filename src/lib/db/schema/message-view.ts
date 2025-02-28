import { sql } from "drizzle-orm";
import { alias, pgView } from "drizzle-orm/pg-core";
import { conversations } from "./conversation";
import { messages } from "./message";
import { users } from "./user";

export const messageView = pgView("message_view").as((qb) => {
  const initiatorAlias = alias(users, 'initiator');
  const recipientAlias = alias(users, 'recipient');

  return qb
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      content: messages.content,
      read: messages.read,
      createdAt: messages.createdAt,
      sender: {
        id: sql<number>`${users.id} as sender_id`,
        username: sql<string>`${users.username} as sender_username`,
        image: sql<string>`${users.image} as sender_image`,
      },
      recipient: {
        id: sql<number>`CASE 
          WHEN ${conversations.initiatorId} = ${users.id} THEN ${conversations.recipientId}
          ELSE ${conversations.initiatorId}
        END as recipient_id`,
        username: sql<string>`CASE 
          WHEN ${conversations.initiatorId} = ${users.id} THEN ${recipientAlias.username}
          ELSE ${initiatorAlias.username}
        END as recipient_username`,
        image: sql<string>`CASE 
          WHEN ${conversations.initiatorId} = ${users.id} THEN ${recipientAlias.image}
          ELSE ${initiatorAlias.image}
        END as recipient_image`,
      },
    })
    .from(messages)
    .innerJoin(conversations, sql`${messages.conversationId} = ${conversations.id}`)
    .innerJoin(users, sql`${messages.senderId} = ${users.id}`)
    .innerJoin(initiatorAlias, sql`${conversations.initiatorId} = ${initiatorAlias.id}`)
    .innerJoin(recipientAlias, sql`${conversations.recipientId} = ${recipientAlias.id}`);
}); 