import apiClient from '../config/axios';
import type { Message } from '../types/message';

interface OtherUser {
    id: string;
    email: string | null;
    candidateProfile?: {
      firstName: string;
      lastName: string;
    } | null;
    ownedAgencies?: {
      name: string;
    }[];
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
}

export default new MessageService();