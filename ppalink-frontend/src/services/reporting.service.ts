import apiClient from '../config/axios';
import type { ReportFilters, UserGrowthDataPoint, FunnelDataPoint, CandidateInsightsData, AgencyInsightsData, JobMarketInsightsData } from '../types/analytics';

class ReportingService {
  /**
   * Fetches the User Growth report data from the backend based on filters.
   * @param filters - The filter criteria for the report.
   */
  async getUserGrowthReport(filters: ReportFilters): Promise<UserGrowthDataPoint[]> {
    const response = await apiClient.post('/admin/reports/user-growth', filters);
    return response.data.data;
  }

  /**
   * Fetches the Application Funnel report data from the backend.
   * @param filters - The filter criteria for the report.
   */
  async getApplicationFunnelReport(filters: ReportFilters): Promise<FunnelDataPoint[]> {
    const response = await apiClient.post('/admin/reports/application-funnel', filters);
    return response.data.data;
  }

  /**
   * Fetches the Candidate Insights report data from the backend.
   * @param filters - The filter criteria for the report.
   */
  async getCandidateInsightsReport(filters: ReportFilters): Promise<CandidateInsightsData> {
    const response = await apiClient.post('/admin/reports/candidate-insights', filters);
    return response.data.data;
  }

  /**
   * Fetches the Agency Insights report data from the backend.
   * @param filters - The filter criteria for the report.
   */
  async getAgencyInsightsReport(filters: ReportFilters): Promise<AgencyInsightsData> {
    const response = await apiClient.post('/admin/reports/agency-insights', filters);
    return response.data.data;
  }

  /**
   * Fetches the Job Market Insights report data from the backend.
   * @param filters - The filter criteria for the report.
   */
  async getJobMarketInsightsReport(filters: ReportFilters): Promise<JobMarketInsightsData> {
    const response = await apiClient.post('/admin/reports/job-market-insights', filters);
    return response.data.data;
  }
}

export default new ReportingService();