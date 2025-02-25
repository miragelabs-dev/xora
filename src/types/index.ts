export type Session = {
  address: string | null | undefined;
};

export type NotificationType =
  | 'FOLLOW'
  | 'LIKE'
  | 'COMMENT'
  | 'RETWEET'
  | 'TICKET_BOUGHT'
  | 'TICKET_SOLD';

export interface Notification {
  id: number;
  userId: string;
  actorId: string;
  type: NotificationType;
  content?: string;
  isRead: boolean;
  createdAt: Date;
  actor: {
    name: string;
    username: string;
    image?: string;
  };
}