import { Briefcase, CheckSquare, Package, Users } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuthStore } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import type { AdminDashboardAnalytics } from '../../types/analytics';

const AdminDashboard = () => {
  const adminUser = useAuthStore((state) => state.user);
  const { data: analytics, isLoading } = useFetch<AdminDashboardAnalytics>('/admin/analytics');

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary-600">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-gray-600">
        Welcome, {adminUser?.email || 'Admin'}. Here is a snapshot of the platform.
      </p>
      
      {/* Analytics Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={analytics?.totalUsers ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          icon={Briefcase}
          label="Total Jobs Posted"
          value={analytics?.totalJobs ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          icon={Package}
          label="Total Applications"
          value={analytics?.totalApplications ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          icon={CheckSquare}
          label="Pending Verifications"
          value={analytics?.pendingVerifications ?? 0}
          isLoading={isLoading}
        />
      </div>

      {/* Placeholder for future charts */}
      <div className="mt-8">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm min-h-[300px]">
          <h2 className="text-xl font-semibold text-gray-800">User Growth</h2>
          <p className="mt-2 text-gray-500">
            Charts and more detailed reports will be displayed here in the future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;