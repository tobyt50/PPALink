import apiClient from '../config/axios';
import type { FeedItem } from '../types/feed';
import type { PaginatedResponse } from '../types/user';

// This will be the universal payload for creating/updating posts
type UniversalPostPayload = Partial<Omit<FeedItem, 'id' | 'createdAt'>>;

class FeedService {
  // --- Universal Methods for Candidates/Agencies ---
  /**
   * Fetches a paginated and filterable career discovery feed for the candidate.
   * @param params Optional URLSearchParams for category, search, cursor, etc.
   */
  async getMyFeed(params?: URLSearchParams): Promise<PaginatedResponse<FeedItem>> {
    const query = params ? `?${params.toString()}` : '';
    const response = await apiClient.get(`/feed${query}`);
    return response.data.data;
  }
  
  async getMyPostById(id: string): Promise<FeedItem> {
    const response = await apiClient.get(`/feed/${id}`);
    return response.data.data;
  }

  async createUniversalPost(data: UniversalPostPayload): Promise<FeedItem> {
    const response = await apiClient.post('/feed', data);
    return response.data.data;
  }
  
  async updateMyPost(id: string, data: UniversalPostPayload): Promise<FeedItem> {
    const response = await apiClient.patch(`/feed/${id}`, data);
    return response.data.data;
  }

  async deleteMyPost(id: string): Promise<void> {
    await apiClient.delete(`/feed/${id}`);
  }

  // --- Admin Methods ---
  async adminGetAllFeedItems(params?: URLSearchParams): Promise<PaginatedResponse<FeedItem>> {
    const query = params ? `?${params.toString()}` : '';
    const response = await apiClient.get(`/admin/feed${query}`);
    return response.data;
  }
  async adminGetFeedItemById(id: string): Promise<FeedItem> {
    const response = await apiClient.get(`/admin/feed/${id}`);
    return response.data.data;
  }
  async adminCreateFeedItem(data: any): Promise<FeedItem> {
    const response = await apiClient.post('/admin/feed', data);
    return response.data.data;
  }
  async adminUpdateFeedItem(id: string, data: any): Promise<FeedItem> {
    const response = await apiClient.patch(`/admin/feed/${id}`, data);
    return response.data.data;
  }
  async adminDeleteFeedItem(id: string): Promise<void> {
    await apiClient.delete(`/admin/feed/${id}`);
  }
}

export default new FeedService();