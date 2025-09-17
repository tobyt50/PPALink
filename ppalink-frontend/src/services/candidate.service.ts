import apiClient from '../config/axios';
import type { CandidateFilterValues } from '../pages/agencies/FilterSidebar';
import type { ProfileFormValues } from '../pages/candidates/forms/ProfileForm';
import type { CandidateProfile } from '../types/candidate';
import type { VerificationRequest, VerificationType } from '../types/user';

// Define the payload shape for the new function
interface VerificationSubmissionPayload {
  type: VerificationType;
  evidence: {
    fileKey: string;
    fileName: string;
  };
}

// Extend filters to also allow keyword search
export type CandidateSearchParams = CandidateFilterValues & { q?: string };

class CandidateService {
  async getMyProfile(): Promise<CandidateProfile> {
    const response = await apiClient.get('/candidates/me');
    return response.data.data;
  }

  async updateMyProfile(payload: ProfileFormValues): Promise<CandidateProfile> {
    const payloadToSend: Record<string, any> = { ...payload };

    // This list now includes all optional fields from the comprehensive form.
    const keysToNullifyIfFalsy: Array<keyof ProfileFormValues> = [
      'phone', 'dob', 'gender', 'summary', 'linkedin', 'portfolio',
      'salaryMin', 'nyscBatch', 'nyscStream', 'graduationYear',
      'cvFileKey', 'nyscFileKey'
    ];

    keysToNullifyIfFalsy.forEach(key => {
      if (!payloadToSend[key]) {
        payloadToSend[key] = null;
      }
    });

    if (payload.dob) {
      payloadToSend.dob = new Date(payload.dob);
    }

    const response = await apiClient.put('/candidates/me', payloadToSend);
    return response.data.data;
  }

  /**
   * Searches for candidates based on filter criteria + optional keyword (q).
   */
  async searchCandidates(filters: CandidateSearchParams | null): Promise<CandidateProfile[]> {
    if (!filters) {
      return [];
    }

    const params = new URLSearchParams();

    if (filters.stateId) params.append('stateId', String(filters.stateId));
    if (filters.nyscBatch) params.append('nyscBatch', filters.nyscBatch);
    if (filters.skills) params.append('skills', filters.skills);
    if (filters.isRemote) params.append('isRemote', 'true');
    if (filters.isOpenToReloc) params.append('isOpenToReloc', 'true');
    if (filters.university) params.append('university', filters.university);
    if (filters.courseOfStudy) params.append('courseOfStudy', filters.courseOfStudy);
    if (filters.degree) params.append('degree', filters.degree);
    if (filters.graduationYear) params.append('graduationYear', String(filters.graduationYear));
    if (filters.gpaBand) params.append('gpaBand', filters.gpaBand);


    // Include search query if present
    if (filters.q) params.append('q', filters.q);

    // Debug log (can remove later)
    console.log('searchCandidates -> GET', `/agencies/search/candidates?${params.toString()}`);

    const response = await apiClient.get(`/agencies/search/candidates?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Submits a new verification request for the logged-in candidate.
   */
  async submitVerification(payload: VerificationSubmissionPayload): Promise<VerificationRequest> {
    const response = await apiClient.post('/candidates/verifications', payload);
    return response.data.data;
  }
}

export default new CandidateService();
