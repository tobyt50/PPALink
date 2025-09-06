import apiClient from '../config/axios';
import type { CompanyProfileFormValues } from '../pages/agencies/CompanyProfileForm';
import type { Agency } from '../types/agency';
import type { CandidateProfile } from '../types/candidate';

class AgencyService {
  async getMyAgency(): Promise<Agency> {
    const response = await apiClient.get('/agencies/me');
    return response.data.data;
  }

  async updateMyAgency(payload: CompanyProfileFormValues): Promise<Agency> {
    const payloadToSend = { ...payload };

    // --- ROBUST DATA TRANSFORMATION LOGIC ---
    // This is the definitive fix. It handles all cases for the dropdowns.
    const keysToProcess: Array<keyof CompanyProfileFormValues> = [
      'industryId',
      'headquartersStateId',
      'lgaId',
    ];

    keysToProcess.forEach(key => {
      const value = payloadToSend[key];

      // If the value is a non-empty string (like "25"), parse it to a number.
      // If it's a falsy value (empty string "", null, undefined), set it to null.
      if (value) {
        // @ts-ignore - We are intentionally changing the type
        payloadToSend[key] = parseInt(String(value), 10);
      } else {
        // @ts-ignore - We are intentionally changing the type
        payloadToSend[key] = null;
      }
    });
    // --- END OF FIX ---

    const response = await apiClient.put('/agencies/me', payloadToSend);
    return response.data.data;
  }

  /**
   * Shortlists a candidate for the currently logged-in agency.
   * @param candidateId The ID of the candidate's profile to shortlist.
   */
  async shortlistCandidate(candidateId: string): Promise<any> {
    // The backend gets the agencyId from the user's token,
    // so we only need to send the candidateId.
    const response = await apiClient.post('/agencies/shortlist', { candidateId });
    return response.data;
  }

  /**
   * Fetches the list of candidates shortlisted by the current agency.
   */
  async getShortlistedCandidates(): Promise<CandidateProfile[]> {
    const response = await apiClient.get('/agencies/shortlist');
    return response.data.data;
  }
}

export default new AgencyService();