export type NotificationType = 'GENERIC' | 'MESSAGE' | 'NEW_QUIZ';
export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  type: NotificationType;
  
  meta?: {
    lastMessage?: string;
  } | null;
}