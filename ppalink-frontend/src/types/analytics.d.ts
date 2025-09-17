// Defines the shape of the data for the Admin Dashboard Analytics
export interface AdminDashboardAnalytics {
  totalUsers: number;
  userDistribution: {
    candidates: number;
    agencies: number;
    admins: number;
  };
  totalJobs: number;
  totalApplications: number;
  pendingVerifications: number;
}