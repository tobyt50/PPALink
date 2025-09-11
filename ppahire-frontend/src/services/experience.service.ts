import apiClient from '../config/axios';
import type { EducationFormValues } from '../pages/candidates/forms/EducationForm';
import type { WorkExperienceFormValues } from '../pages/candidates/forms/WorkExperienceForm';
import type { Education, WorkExperience } from '../types/candidate';

class ExperienceService {
  /**
   * Adds a new work experience entry for the logged-in candidate.
   */
  async addWorkExperience(payload: WorkExperienceFormValues): Promise<WorkExperience> {
    const response = await apiClient.post('/candidates/me/experience', payload);
    return response.data.data;
  }

  /**
   * Updates an existing work experience entry.
   */
  async updateWorkExperience(experienceId: string, payload: WorkExperienceFormValues): Promise<WorkExperience> {
    const response = await apiClient.patch(`/candidates/me/experience/${experienceId}`, payload);
    return response.data.data;
  }

  /**
   * Deletes a work experience entry.
   */
  async deleteWorkExperience(experienceId: string): Promise<void> {
    await apiClient.delete(`/candidates/me/experience/${experienceId}`);
  }
    
    /**
   * Adds a new education entry for the logged-in candidate.
   */
  async addEducation(payload: EducationFormValues): Promise<Education> {
    const response = await apiClient.post('/candidates/me/education', payload);
    return response.data.data;
  }

  /**
   * Updates an existing education entry.
   */
  async updateEducation(educationId: string, payload: EducationFormValues): Promise<Education> {
    const response = await apiClient.patch(`/candidates/me/education/${educationId}`, payload);
    return response.data.data;
  }

  /**
   * Deletes an education entry.
   */
  async deleteEducation(educationId: string): Promise<void> {
    await apiClient.delete(`/candidates/me/education/${educationId}`);
  }
}

export default new ExperienceService();