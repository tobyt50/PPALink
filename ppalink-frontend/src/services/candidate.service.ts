import apiClient from '../config/axios';
import type { CandidateFilterValues } from '../pages/agencies/FilterSidebar';
import type { ProfileFormValues } from '../pages/candidates/forms/ProfileForm';
import type { CandidateProfile, Education, WorkExperience } from '../types/candidate';
import type { VerificationRequest, VerificationType } from '../types/user';

// Define the payload shape for the new function
interface VerificationSubmissionPayload {
  type: VerificationType;
  evidence?: {
    fileKey: string;
    fileName: string;
  };
}

// Extend filters to also allow keyword search
export type CandidateSearchParams = CandidateFilterValues & { 
  q?: string;
  countryId?: number | null;
  regionId?: number | null;
  cityId?: number | null;
};

type WorkExperiencePayload = Omit<WorkExperience, 'id' | 'candidateId'>;
type EducationPayload = Omit<Education, 'id' | 'candidateId'>;
class CandidateService {
  async getMyProfile(): Promise<CandidateProfile> {
    const response = await apiClient.get('/candidates/me');
    return response.data.data;
  }

  async updateMyProfile(payload: ProfileFormValues): Promise<CandidateProfile> {
    const payloadToSend: Record<string, any> = { ...payload };

    // Since `ProfileFormValues` now sends `skills` as a simple string array (`string[]`),
    // no special transformation is needed here. The payload can be sent directly,
    // as the backend service has also been updated to handle an array of skill names.

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
    if (!filters) { return []; }
    const params = new URLSearchParams();

    if (filters.countryId) params.append('countryId', String(filters.countryId));
    if (filters.regionId) params.append('regionId', String(filters.regionId));
    if (filters.cityId) params.append('cityId', String(filters.cityId));
    if (filters.nyscBatch) params.append('nyscBatch', filters.nyscBatch);
    if (filters.skills && filters.skills.length > 0) params.append('skills', filters.skills.join(','));
    if (filters.verifiedSkillIds && filters.verifiedSkillIds.length > 0) params.append('verifiedSkillIds', filters.verifiedSkillIds.join(','));
    if (filters.isRemote) params.append('isRemote', 'true');
    if (filters.isOpenToReloc) params.append('isOpenToReloc', 'true');
    if (filters.university) params.append('university', filters.university);
    if (filters.courseOfStudy) params.append('courseOfStudy', filters.courseOfStudy);
    if (filters.degree) params.append('degree', filters.degree);
    if (filters.graduationYear) params.append('graduationYear', String(filters.graduationYear));
    if (filters.gpaBand) params.append('gpaBand', filters.gpaBand);
    if (filters.q) params.append('q', filters.q);
    if (filters.q) params.append('q', filters.q);

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

  /**
   * Updates only the professional summary for the logged-in candidate.
   * @param summary The new professional summary text.
   */
  async updateSummary(summary: string): Promise<CandidateProfile> {
    const response = await apiClient.patch('/candidates/me/summary', { summary });
    return response.data.data;
  }

  /**
   * Marks the candidate's onboarding process as complete.
   */
  async markOnboardingComplete(): Promise<void> {
    await apiClient.post('/candidates/me/complete-onboarding');
  }

  async addWorkExperience(data: WorkExperiencePayload): Promise<WorkExperience> {
    const response = await apiClient.post('/candidates/me/experience', data);
    return response.data.data;
  }
  async updateWorkExperience(experienceId: string, data: WorkExperiencePayload): Promise<WorkExperience> {
    const response = await apiClient.patch(`/candidates/me/experience/${experienceId}`, data);
    return response.data.data;
  }
  async deleteWorkExperience(experienceId: string): Promise<void> {
    await apiClient.delete(`/candidates/me/experience/${experienceId}`);
  }

  async addEducation(data: EducationPayload): Promise<Education> {
    const response = await apiClient.post('/candidates/me/education', data);
    return response.data.data;
  }

  async updateEducation(educationId: string, data: EducationPayload): Promise<Education> {
    const response = await apiClient.patch(`/candidates/me/education/${educationId}`, data);
    return response.data.data;
  }

  async deleteEducation(educationId: string): Promise<void> {
    await apiClient.delete(`/candidates/me/education/${educationId}`);
  }

  /**
   * Sets (overwrites) the entire list of skills for the logged-in candidate.
   * @param skills An array of skill names.
   */
  async setSkills(skills: string[]): Promise<CandidateProfile> {
    const response = await apiClient.put('/candidates/me/skills', { skills });
    return response.data.data;
  }

  /**
   * Updates the CV file key for the logged-in candidate.
   * @param cvFileKey The S3 file key of the uploaded CV.
   */
  async updateCv(cvFileKey: string): Promise<CandidateProfile> {
    const response = await apiClient.put('/candidates/me/cv', { cvFileKey });
    return response.data.data;
  }

  async followAgency(agencyId: string): Promise<void> {
    await apiClient.post(`/candidates/me/${agencyId}/follow`);
  }

  async unfollowAgency(agencyId: string): Promise<void> {
    await apiClient.delete(`/candidates/me/${agencyId}/follow`);
  }
}

export default new CandidateService();