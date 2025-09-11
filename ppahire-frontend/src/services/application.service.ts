import apiClient from '../config/axios';
import type { Application, ApplicationStatus } from '../types/application';

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
}

export default new ApplicationService();