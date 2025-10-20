import apiClient from '../config/axios';
import type { Message } from '../types/message';
import type { Notification } from '../types/notification';

interface OtherUser {
    id: string;
    email: string | null;
    avatarKey?: string | null;
    ownedAgencies?: {
        id: string;
        name: string;
        logoKey?: string | null;
    }[];
    candidateProfile: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  }
  
  export interface Conversation {
    otherUser: OtherUser;
    lastMessage?: Message;
  }

class MessageService {
  /**
   * Fetches the full conversation thread with another user.
   * @param otherUserId The ID of the other user in the conversation.
   */
  async getConversation(otherUserId: string): Promise<Message[]> {
    const response = await apiClient.get(`/messages/conversation/${otherUserId}`);
    return response.data.data;
  }

  /**
   * Sends a new message to another user.
   * @param toId The ID of the user to send the message to.
   * @param body The content of the message.
   */
  async sendMessage(toId: string, body: string): Promise<Message> {
    const response = await apiClient.post('/messages', { toId, body });
    return response.data.data;
  }

  /**
   * Fetches the list of all conversations for the logged-in user.
   */
  async getMyConversations(): Promise<Conversation[]> {
    const response = await apiClient.get('/messages/conversations');
    return response.data.data;
  }

  /**
   * Notifies the backend that the current user has read messages in a conversation.
   * @param otherUserId The ID of the other user in the conversation.
   */
  async markConversationAsRead(otherUserId: string): Promise<void> {
    await apiClient.post(`/messages/conversation/${otherUserId}/read`);
  }

  /**
   * Fetches the list of unread message notifications for the logged-in user.
   */
  async getMyMessageNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications/messages');
    return response.data.data;
  }
}

export default new MessageService();