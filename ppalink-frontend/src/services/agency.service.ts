import apiClient from '../config/axios';
import type { CompanyProfileFormValues } from '../pages/agencies/forms/CompanyProfileForm';
import type { Agency, Invitation } from '../types/agency';
import type { CandidateProfile, WorkVerification } from '../types/candidate';
import type { VerificationRequest, VerificationType } from '../types/user';

interface VerificationSubmissionPayload {
  type: VerificationType;
  evidence: {
    fileKey: string;
    fileName: string;
  };
}

class AgencyService {
  async getMyAgency(): Promise<Agency> {
    const response = await apiClient.get('/agencies/me');
    return response.data.data;
  }

  async updateMyAgency(data: CompanyProfileFormValues): Promise<Agency> {
    const response = await apiClient.patch('/agencies/me', data);
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

  /**
   * Removes a candidate from the agency's shortlist.
   * @param candidateId The ID of the candidate's profile to remove.
   */
  async removeShortlist(candidateId: string): Promise<void> {
    // The endpoint now uses a URL parameter, so we append it to the URL.
    await apiClient.delete(`/agencies/shortlist/${candidateId}`);
  }

  /**
   * Sends an invitation to a new team member.
   * @param email The email address of the invitee.
   */
  async sendInvitation(email: string): Promise<Invitation> {
    const response = await apiClient.post('/agencies/invitations', { email });
    return response.data.data;
  }

  /**
   * Deletes/revokes a pending team member invitation.
   * @param invitationId The ID of the invitation to delete.
   */
  async deleteInvitation(invitationId: string): Promise<void> {
    await apiClient.delete(`/agencies/invitations/${invitationId}`);
  }

   /**
   * Initiates the domain verification process for the logged-in agency.
   * @param domain The domain name to verify.
   */
  async initiateDomainVerification(domain: string): Promise<{ message: string }> {
    const response = await apiClient.post('/agencies/verify-domain', { domain });
    return response.data;
  }

  async finalizeDomainVerification(token: string): Promise<void> {
    await apiClient.post('/public/verify-domain-token', { token });
  }

  /**
   * Submits a new verification request for the logged-in agency.
   * @param payload The verification data to submit (e.g., for CAC).
   */
  async submitVerification(payload: VerificationSubmissionPayload): Promise<VerificationRequest> {
    const response = await apiClient.post('/agencies/verifications', payload);
    return response.data.data;
  }

  /**
   * Marks the agency's onboarding process as complete.
   */
  async markOnboardingComplete(): Promise<void> {
    await apiClient.post('/agencies/complete-onboarding');
  }

  /**
   * Fetches the job pipeline data as a raw CSV string.
   * @param agencyId The ID of the agency.
   * @param jobId The ID of the job to export.
   */
  async exportPipeline(agencyId: string, jobId: string): Promise<string> {
    const response = await apiClient.get(`/agencies/${agencyId}/jobs/${jobId}/pipeline/export`, {
      // Tell axios to expect a plain text response
      responseType: 'text',
    });
    return response.data;
  }

   /**
   * Issues a work verification for a specific work experience record.
   * The backend now handles the verifier's details automatically.
   * @param workExperienceId The ID of the work experience to verify.
   */
  async issueWorkVerification(workExperienceId: string): Promise<WorkVerification> {
    const response = await apiClient.post(`/agencies/work-experience/${workExperienceId}/verify`);
    return response.data.data;
  }

  /**
   * Updates the logo key for the current agency.
   * @param logoKey The new S3 key for the agency's logo.
   */
  async updateLogo(logoKey: string): Promise<Agency> {
    const response = await apiClient.patch('/agencies/logo', { logoKey });
    return response.data.data;
  }
}

export default new AgencyService();