import apiClient from '../config/axios';
import type { JobFormValues } from '../pages/agencies/forms/JobForm';
import type { Position } from '../types/job';

/**
 * A helper function to safely convert form values.
 * - Parses numeric fields.
 * - Converts empty strings or invalid numbers for numeric fields to null.
 * @param payload The form data.
 * @returns The cleaned payload ready for the API.
 */
const transformJobPayload = (payload: JobFormValues) => {
  const payloadToSend = { ...payload };

  const numericKeys: Array<keyof JobFormValues> = ['minSalary', 'maxSalary', 'stateId', 'lgaId'];

  numericKeys.forEach(key => {
    const value = payloadToSend[key];
    if (value === '' || value === null || value === undefined) {
      // @ts-ignore - Intentionally setting to null
      payloadToSend[key] = null;
    } else {
      const parsed = parseInt(String(value), 10);
      // @ts-ignore - Intentionally setting to number or null
      payloadToSend[key] = isNaN(parsed) ? null : parsed;
    }
  });
  
  return payloadToSend;
}


class JobService {
  async getJobs(agencyId: string): Promise<Position[]> {
    const response = await apiClient.get(`/agencies/${agencyId}/jobs`);
    return response.data.data;
  }
  
  async createJob(agencyId: string, payload: JobFormValues): Promise<Position> {
    const transformedPayload = transformJobPayload(payload);
    const response = await apiClient.post(`/agencies/${agencyId}/jobs`, transformedPayload);
    return response.data.data;
  }

  async updateJob(agencyId: string, jobId: string, payload: JobFormValues): Promise<Position> {
    const transformedPayload = transformJobPayload(payload);
    const response = await apiClient.put(`/agencies/${agencyId}/jobs/${jobId}`, transformedPayload);
    return response.data.data;
  }

  async deleteJob(agencyId: string, jobId: string): Promise<void> {
    // A DELETE request typically doesn't return a body, so we expect a 204 No Content response.
    await apiClient.delete(`/agencies/${agencyId}/jobs/${jobId}`);
  }
}

export default new JobService();