export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  
  meta?: {
    lastMessage?: string;
  } | null;
}