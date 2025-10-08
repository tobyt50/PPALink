import apiClient from '../config/axios';
import type { Application, ApplicationStatus, Interview, InterviewMode, Offer } from '../types/application';

interface PipelineQueryFilters {
  q?: string;
  skills?: string[];
  appliedAfter?: string;
  appliedBefore?: string;
}

interface ScheduleInterviewPayload {
    scheduledAt: string; // ISO String
    mode: InterviewMode;
    location?: string;
    details?: string;
}

interface CreateOfferPayload {
    salary?: number;
    startDate?: string; // ISO String
}

class ApplicationService {
  /**
   * Creates an application, linking a candidate to a position.
   * This is initiated by an agency.
   * @param positionId The ID of the job position.
   * @param candidateId The ID of the candidate's profile.
   */
  async createApplication(positionId: string, candidateId: string): Promise<Application> {
    const response = await apiClient.post('/applications', {
      positionId,
      candidateId,
    });
    return response.data.data;
  }

    /**
   * Updates the status of a specific application.
   * @param applicationId The ID of the application to update.
   * @param status The new status for the application.
   */
  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<Application> {
    const response = await apiClient.patch(`/applications/${applicationId}`, { status });
    return response.data.data;
  }

  /**
   * Updates the notes for a specific application.
   * @param applicationId The ID of the application to update.
   * @param notes The new notes content.
   */
  async updateApplicationNotes(applicationId: string, notes: string): Promise<Application> {
    const response = await apiClient.patch(`/applications/${applicationId}`, { notes });
    return response.data.data;
  }

  // Candidate-initiated application
  async applyForJob(positionId: string): Promise<Application> {
    const response = await apiClient.post('/candidates/applications/apply', { positionId });
    return response.data.data;
  }

  /**
   * Performs a comprehensive search and filter query within a job's pipeline.
   * @param jobId The ID of the job to query.
   * @param filters The search and filter criteria.
   */
  async queryPipeline(agencyId: string, jobId: string, filters: PipelineQueryFilters): Promise<Application[]> {
    const response = await apiClient.post(`/agencies/${agencyId}/jobs/${jobId}/pipeline/query`, filters);
    return response.data.data;
  }

  /**
   * Deletes a specific application from a pipeline.
   * @param applicationId The ID of the application to delete.
   */
  async deleteApplication(applicationId: string): Promise<void> {
    await apiClient.delete(`/applications/${applicationId}`);
  }

  /**
   * Schedules an interview for a specific application.
   * @param applicationId The ID of the application.
   * @param data The interview details.
   */
  async scheduleInterview(applicationId: string, data: ScheduleInterviewPayload): Promise<Interview> {
    const response = await apiClient.post(`/applications/${applicationId}/interviews`, data);
    return response.data.data;
  }

  /**
   * Creates and extends a job offer for an application.
   * @param applicationId The ID of the application.
   * @param data The offer details.
   */
  async createOffer(applicationId: string, data: CreateOfferPayload): Promise<Offer> {
    const response = await apiClient.post(`/applications/${applicationId}/offers`, data);
    return response.data.data;
  }

  /**
   * Allows a candidate to respond to a job offer.
   * @param offerId The ID of the offer.
   * @param response 'ACCEPTED' or 'DECLINED'.
   */
  async respondToOffer(offerId: string, response: 'ACCEPTED' | 'DECLINED'): Promise<Offer> {
      const res = await apiClient.post(`/applications/offers/${offerId}/respond`, { response });
      return res.data;
  }
}

export default new ApplicationService();