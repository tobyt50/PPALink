import {
  Briefcase,
  CheckSquare,
  Clock,
  Eye,
  Package,
  Users,
  Zap,
} from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { useAuthStore } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import type {
  AdminDashboardAnalytics,
  AdminTimeSeriesData,
} from "../../types/analytics";
import { AdminTimeSeriesChart } from "./charts/TimeSeriesCharts";
import { useActivityStore } from "../../context/ActivityStore";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const adminUser = useAuthStore((state) => state.user);
  const { data: stats, isLoading: isLoadingStats } =
    useFetch<AdminDashboardAnalytics>("/admin/analytics");
  const { data: timeSeries, isLoading: isLoadingTimeSeries } =
    useFetch<AdminTimeSeriesData>("/admin/analytics/timeseries");

  const liveActivity = useActivityStore((state) => state.events);

  const isLoading = isLoadingStats || isLoadingTimeSeries;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Admin Panel
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Welcome, {adminUser?.email || "Admin"}. Here is a real-time snapshot
          of the platform.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Candidates"
          value={stats?.userDistribution.candidates ?? 0}
          isLoading={isLoading}
          color="green"
          linkTo="/admin/users?role=CANDIDATE"
        />
        <StatCard
          icon={Briefcase}
          label="Total Agencies"
          value={stats?.userDistribution.agencies ?? 0}
          isLoading={isLoading}
          color="green"
          linkTo="/admin/users?role=AGENCY"
        />
        <StatCard
          icon={Package}
          label="Total Jobs"
          value={stats?.totalJobs ?? 0}
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          icon={Eye}
          label="Total Job Views"
          value={stats?.totalJobViews ?? 0}
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          icon={CheckSquare}
          label="Pending Verifications"
          value={stats?.pendingVerifications ?? 0}
          isLoading={isLoading}
          color="green"
          linkTo="/admin/verifications"
        />
        <StatCard
          icon={Clock}
          label="Active Users"
          value={isLoading ? 0 : "12"}
          isLoading={isLoading}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
              Platform Activity (Last 30 Days)
            </h2>
          </div>
          <div className="p-6 min-h-[350px]">
            {isLoading || !timeSeries ? (
              <div className="h-[350px] w-full bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
            ) : (
              <AdminTimeSeriesChart data={timeSeries} />
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
              Live Activity Feed
            </h2>
          </div>
          <div className="p-6 min-h-[402px]">
            {/* This rendering logic is now more reliable because it's reading from a persistent store */}
            {liveActivity.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400 text-center pt-16">
                Waiting for new platform activity...
              </p>
            ) : (
              <ul className="space-y-4">
                {liveActivity.map((event) => (
                  <li key={event.id} className="flex items-start">
                    <div className="flex-shrink-0">
                      <event.icon className="h-5 w-5 text-gray-400 dark:text-zinc-500 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800 dark:text-zinc-100">
                        {event.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {formatDistanceToNow(event.timestamp, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
