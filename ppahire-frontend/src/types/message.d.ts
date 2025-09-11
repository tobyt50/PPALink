import type { User } from './user';

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  subject: string | null;
  body: string;
  createdAt: string; // Dates are typically strings in JSON payloads

  // Optional nested relations for context
  from?: Pick<User, 'id' | 'role'>;
  to?: Pick<User, 'id' | 'role'>;
}