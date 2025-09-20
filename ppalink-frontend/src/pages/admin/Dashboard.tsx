import { Briefcase, CheckSquare, Package, Users } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuthStore } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import type { AdminDashboardAnalytics } from '../../types/analytics';

const AdminDashboard = () => {
  const adminUser = useAuthStore((state) => state.user);
  const { data: analytics, isLoading } = useFetch<AdminDashboardAnalytics>('/admin/analytics');

  return (
    // Replicated overall page layout
    <div className="space-y-5">
      {/* Header - Replicated from AgencyDashboard */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome, {adminUser?.email || 'Admin'}. Here is a snapshot of the platform.
        </p>
      </div>
      
      {/* Analytics Grid - Replicated from AgencyDashboard */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={analytics?.totalUsers ?? 0}
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          icon={Briefcase}
          label="Total Jobs Posted"
          value={analytics?.totalJobs ?? 0}
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          icon={Package}
          label="Total Applications"
          value={analytics?.totalApplications ?? 0}
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          icon={CheckSquare}
          label="Pending Verifications"
          value={analytics?.pendingVerifications ?? 0}
          isLoading={isLoading}
          color="green"
        />
      </div>

      {/* Placeholder Card - Replicated Card Styling */}
      <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Platform Analytics</h2>
        </div>
        {/* Card Body */}
        <div className="p-6 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">User Growth</h3>
                <p className="mt-2 text-gray-500">
                    Charts and more detailed reports will be displayed here in the future.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;