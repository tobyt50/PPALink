import { BarChart2, Briefcase, Package, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatCard } from "../../components/ui/StatCard";
import useFetch from "../../hooks/useFetch";
import type {
  AgencyAnalyticsData,
  AgencyEnterpriseAnalytics,
  AgencyProAnalytics,
} from "../../types/analytics";
import { DistributionBarChart } from "./charts/DistributionBarChart";
import { GeographicSourcingChart } from "./charts/GeographicSourcingChart";
import { SkillsHeatmapChart } from "./charts/SkillsHeatmapChart";
import { TrendLineChart } from "./charts/TrendLineChart";

const AnalyticsPage = () => {
  const {
    data: analytics,
    isLoading,
    error,
  } = useFetch<AgencyAnalyticsData>("/agencies/analytics");

  const isProOrEnterprise = (
    data: AgencyAnalyticsData | null
  ): data is AgencyProAnalytics => {
    return !!data && (data.planName === "Pro" || data.planName === "Enterprise");
  };
  const isEnterprise = (
    data: AgencyAnalyticsData | null
  ): data is AgencyEnterpriseAnalytics => {
    return !!data && data.planName === "Enterprise";
  };

  if (error && error.includes("Analytics are not available on the Free plan")) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Unlock Powerful Insights"
        description="Our Analytics Dashboard is a Pro feature. Upgrade your plan to track job performance, view applicant trends, and make data-driven hiring decisions."
        action={{
          text: "Upgrade to Pro",
          to: "/dashboard/agency/billing",
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Insights into your recruitment performance.
          </p>
        </div>
        <Link to="/dashboard/agency/billing">
          <Button
            size="sm"
            className="rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
          >
            Upgrade Plan
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Open Jobs"
          value={analytics?.openJobsCount ?? 0}
          isLoading={isLoading}
          linkTo="/dashboard/agency/jobs"
          color="green"
        />
        <StatCard
          icon={Package}
          label="Total Applications"
          value={isProOrEnterprise(analytics) ? analytics.totalApplications : "N/A"}
          isLoading={isLoading}
          linkTo="/dashboard/agency/jobs"
          color="green"
        />
        <StatCard
          icon={Users}
          label="Total Shortlisted"
          value={isProOrEnterprise(analytics) ? analytics.totalShortlisted : "N/A"}
          isLoading={isLoading}
          linkTo="/dashboard/agency/candidates/shortlisted"
          color="green"
        />
        <StatCard
          icon={Briefcase}
          label="Total Jobs Posted"
          value={isProOrEnterprise(analytics) ? analytics.totalJobsPosted : "N/A"}
          isLoading={isLoading}
          linkTo="/dashboard/agency/jobs"
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            Application Status Distribution
          </h2>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-[300px] w-full bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            ) : (
              isProOrEnterprise(analytics) && (
                <DistributionBarChart
                  data={analytics.applicationStatusDistribution}
                />
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            Application Trends (Last 3 Months)
          </h2>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-[300px] w-full bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            ) : (
              isProOrEnterprise(analytics) && (
                <TrendLineChart data={analytics.applicationTrends} />
              )
            )}
          </div>
        </div>
      </div>

      {/* Advanced Analytics (Enterprise) */}
      <div className="relative rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
        {!isEnterprise(analytics) && !isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-zinc-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl">
            <Star className="h-10 w-10 text-yellow-500" />
            <h3 className="mt-2 text-lg font-semibold text-gray-800 dark:text-zinc-100">
              Unlock Enterprise Insights
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center max-w-sm">
              Upgrade to view skills heatmaps and geographic sourcing data.
            </p>
            <Link to="/dashboard/agency/billing" className="mt-4">
              <Button size="sm">Upgrade Plan</Button>
            </Link>
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
          Advanced Analytics (Enterprise)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-zinc-200">Top 5 Skills in Pipeline</h3>
            <div className="mt-2">
              {isLoading ? (
                <div className="h-[250px] w-full bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
              ) : (
                isEnterprise(analytics) && (
                  <SkillsHeatmapChart data={analytics.skillsHeatmap} />
                )
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 dark:text-zinc-200">
              Top 5 Candidate Locations
            </h3>
            <div className="mt-2">
              {isLoading ? (
                <div className="h-[250px] w-full bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
              ) : (
                isEnterprise(analytics) && (
                  <GeographicSourcingChart data={analytics.geographicSourcing} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;


