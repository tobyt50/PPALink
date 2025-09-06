import apiClient from '../config/axios';
import type { CandidateFilterValues } from '../pages/agencies/FilterSidebar';
import type { ProfileFormValues } from '../pages/candidates/ProfileForm';
import type { CandidateProfile } from '../types/candidate';

class CandidateService {
  async getMyProfile(): Promise<CandidateProfile> {
    const response = await apiClient.get('/candidates/me');
    return response.data.data;
  }

  async updateMyProfile(payload: ProfileFormValues): Promise<CandidateProfile> {
    // Create a mutable copy to work with.
    const payloadToSend = { ...payload };

    // --- GRACEFUL HANDLING LOGIC ---
    const keysToNullifyIfFalsy: Array<keyof ProfileFormValues> = [
      'phone', 'dob', 'gender', 'summary', 'linkedin', 'portfolio',
      'salaryMin', 'nyscBatch', 'nyscStream', 'graduationYear'
    ];

    keysToNullifyIfFalsy.forEach(key => {
      if (!payloadToSend[key]) {
        // @ts-ignore
        payloadToSend[key] = null;
      }
    });

    // Ensure date is a Date object if it exists
    if (payloadToSend.dob) {
      // @ts-ignore
      payloadToSend.dob = new Date(payloadToSend.dob);
    }

    const response = await apiClient.put('/candidates/me', payloadToSend);
    return response.data.data;
  }

   /**
   * Searches for candidates based on filter criteria.
   * @param filters - The filter object from our FilterSidebar.
   */
   async searchCandidates(filters: CandidateFilterValues | null): Promise<CandidateProfile[]> {
    if (!filters) {
      return []; // Return an empty array if no filters are applied
    }

    // Use URLSearchParams to easily build the query string
    const params = new URLSearchParams();

    // Append parameters only if they have a value
    if (filters.stateId) params.append('stateId', String(filters.stateId));
    if (filters.nyscBatch) params.append('nyscBatch', filters.nyscBatch);
    if (filters.skills) params.append('skills', filters.skills);
    if (filters.isRemote) params.append('isRemote', 'true');
    if (filters.isOpenToReloc) params.append('isOpenToReloc', 'true');

    const response = await apiClient.get(`/agencies/search/candidates?${params.toString()}`);
    return response.data.data;
  }
}

export default new CandidateService();