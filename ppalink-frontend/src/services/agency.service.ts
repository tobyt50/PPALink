import apiClient from '../config/axios';
import type { CompanyProfileFormValues } from '../pages/agencies/forms/CompanyProfileForm';
import type { Agency, Invitation } from '../types/agency';
import type { CandidateProfile } from '../types/candidate';
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

  async updateMyAgency(payload: CompanyProfileFormValues): Promise<Agency> {
    const payloadToSend = { ...payload };

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
}

export default new AgencyService();