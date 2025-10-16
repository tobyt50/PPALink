import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Eye,
  Package,
  PlusCircle,
  UserPlus,
  Users,
  Star,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  List,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { FeedCard } from "../../components/ui/FeedCard";
import useFetch from "../../hooks/useFetch";
import { useState, useMemo } from "react";
import type { Agency } from "../../types/agency";
import type { AgencyAnalyticsData, AgencyDashboardData } from "../../types/analytics";
import type { FeedItem } from "../../types/feed";

// Reusable TodoItem with hover transition
const TodoItem = ({ text, linkTo }: { text: string; linkTo: string }) => (
  <li>
    <Link
      to={linkTo}
      className="group block rounded-xl px-4 py-3 transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-zinc-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {text}
        </p>
        <ArrowRight className="h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-primary-500" />
      </div>
    </Link>
  </li>
);

const DiscoveryFeed = () => {
  const [activeTab, setActiveTab] = useState("RECOMMENDATION");

  const tabs = [
    { id: "ALL", label: "All", icon: List },
    { id: "RECOMMENDATION", label: "For You", icon: Star },
    { id: "LEARN_GROW", label: "Learning", icon: BookOpen },
    { id: "CAREER_INSIGHT", label: "Insights", icon: BrainCircuit },
    { id: "SUCCESS_STORY", label: "Success", icon: TrendingUp },
  ];

  const feedUrl = useMemo(() => {
    if (activeTab === "ALL") {
      return "/feed/";
    }
    return `/feed/?category=${activeTab}`;
  }, [activeTab]);

  const { data: feedResponse, isLoading } = useFetch<{
    data: FeedItem[];
    nextCursor: string | null;
  }>(feedUrl);

  const feedItems = feedResponse?.data;

  const itemsToShow = useMemo(() => {
    return feedItems?.slice(0, 4) || [];
  }, [feedItems]);

  const buttonBaseStyle =
    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap";
  const activeButtonStyle =
    "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-50 font-semibold";
  const inactiveButtonStyle =
    "text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50";

  if (isLoading) {
    return (
      <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            Talent Discovery
          </h2>
          <Link to="/feed/create">
            <Button size="sm" variant="outline">
              <PlusCircle className="h-4 w-4 mr-1" />
              Post
            </Button>
          </Link>
        </div>
        <div className="flex flex-row overflow-x-auto gap-2 px-3 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${buttonBaseStyle} ${
                activeTab === tab.id ? activeButtonStyle : inactiveButtonStyle
              }`}
            >
              <tab.icon className="h-5 w-5 mr-3 flex-shrink-0" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Items */}
      {!feedItems || feedItems.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
          <p>
            Your personalized feed is being prepared. Verify your profile to
            get better recommendations!
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Feed cards container */}
          <div className="p-6 space-y-6 overflow-hidden pb-20">
            {itemsToShow.map((item, index) => (
              <div
                key={item.id}
                className={`transition-transform duration-500 ease-out ${
                  index === itemsToShow.length - 1 ? "translate-y-6" : ""
                }`}
              >
                <FeedCard item={item} />
              </div>
            ))}
          </div>

          {/* Gradient fade overlay + See More */}
          <div className="absolute bottom-0 left-0 w-full h-36 flex flex-col items-center justify-end 
                          bg-gradient-to-t from-white dark:from-zinc-900 via-white/90 dark:via-zinc-900/90 to-transparent 
                          after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-white dark:after:from-zinc-900 after:via-transparent after:to-white dark:after:to-zinc-900 after:pointer-events-none">
            <Link
  to={`/feed${activeTab && activeTab !== "ALL" ? `?category=${activeTab}` : ""}`}
  className="relative z-10 pb-4"
>
  <Button
    variant="ghost"
    className="text-primary-600 hover:text-primary-700 font-medium backdrop-blur-sm"
  >
    See More →
  </Button>
</Link>

          </div>
        </div>
      )}
    </div>
  );
};

const AgencyDashboard = () => {
  const { data: dashboardData, isLoading: isLoadingDashboard } =
    useFetch<AgencyDashboardData>("/agencies/dashboard");
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useFetch<AgencyAnalyticsData>("/agencies/analytics");
  const { data: agency, isLoading: isLoadingAgency } =
    useFetch<Agency>("/agencies/me");

  const isLoading = isLoadingDashboard || isLoadingAnalytics || isLoadingAgency;
  const isPaidUser = analytics && analytics.planName !== "Free";
  const stats = dashboardData?.stats;
  const verification = dashboardData?.verificationStatus;
  const memberCount = agency?.members?.length ?? 0;
  
  const currentPlan = agency?.subscriptions?.[0]?.plan;
  let jobPostLimit: number;
  let memberLimit: number;

  if (currentPlan) {
    // Paid user: use limits from their plan.
    jobPostLimit = currentPlan.jobPostLimit;
    memberLimit = currentPlan.memberLimit;
  } else {
    // Free user: use dynamic limits from the settings object.
    jobPostLimit = agency?.freePlanSettings?.jobPostLimit ?? 1;
    memberLimit = agency?.freePlanSettings?.memberLimit ?? 1;
  }

  const openJobsCount = stats?.openJobs ?? 0;
  const canPostNewJob = jobPostLimit === -1 || openJobsCount < jobPostLimit;
 
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Agency Overview
          </h1>
        </div>
        {canPostNewJob ? (
            <Link to="/dashboard/agency/jobs/create">
              <Button size="sm" className="rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition">
                <PlusCircle className="mr-2 h-5 w-5" />
                New Job
              </Button>
            </Link>
        ) : (
             <div className="text-right">
                <p className="text-sm font-semibold text-yellow-700">Job Limit Reached</p>
                <Link to="/dashboard/agency/billing" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                    Upgrade to post more
                </Link>
            </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Open Jobs"
          value={stats?.openJobs ?? 0}
          isLoading={isLoading}
          linkTo="/dashboard/agency/jobs"
          color="green"
        />
        <StatCard
          icon={Package}
          label="Total Applications"
          value={isPaidUser ? stats?.totalApps ?? 0 : "N/A"}
          isLoading={isLoading}
          linkTo={isPaidUser ? "/dashboard/agency/jobs" : "/dashboard/agency/billing"}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Shortlisted Candidates"
          value={isPaidUser ? stats?.totalShortlisted ?? 0 : "N/A"}
          isLoading={isLoading}
          linkTo={
            isPaidUser
              ? "/dashboard/agency/candidates/shortlisted"
              : "/dashboard/agency/billing"
          }
          color="green"
        />
        <StatCard
          icon={Eye}
          label="Job Views"
          value={isPaidUser ? (analytics as any).totalJobViews ?? "N/A" : "N/A"}
          isLoading={isLoading}
          linkTo={isPaidUser ? "/dashboard/agency/analytics" : "/dashboard/agency/billing"}
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          <DiscoveryFeed />
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Recent Applications */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Recent Applications
              </h2>
            </div>
            {isLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
              </div>
            ) : dashboardData?.recentApplications.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 dark:text-zinc-400">No new applications yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {dashboardData?.recentApplications.map((app) => (
                  <li key={app.id}>
                    <Link
                      to={`/dashboard/agency/applications/${app.id}`}
                      className="block px-5 py-4 hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-primary-600 dark:text-primary-400">
                            {app.candidate.firstName} {app.candidate.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">
                            for {app.position.title}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Active Jobs */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Active Jobs</h2>
            </div>
            {isLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
              </div>
            ) : dashboardData?.activeJobs.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 dark:text-zinc-400">You have no open jobs.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {dashboardData?.activeJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      to={`/dashboard/agency/${job.agencyId}/jobs/${job.id}/pipeline`}
                      className="block px-5 py-4 hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-primary-600 dark:text-primary-400">{job.title}</p>
                        <span className="rounded-full bg-green-100 dark:bg-green-950/60 px-2 py-0.5 text-sm font-medium text-primary-600 dark:text-primary-400">
                          {job._count.applications}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Next Steps */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Recommended Next Steps
              </h2>
            </div>
            {isLoading ? (
              <div className="p-6 h-24 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-b-lg"></div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {!verification?.domainVerified && isPaidUser && (
                  <TodoItem
                    text="Verify your company domain"
                    linkTo="/dashboard/agency/profile"
                  />
                )}
                {!verification?.cacVerified && isPaidUser && (
                  <TodoItem
                    text="Submit CAC for verification"
                    linkTo="/dashboard/agency/profile"
                  />
                )}
                {dashboardData && dashboardData.activeJobs.length === 0 && (
                  <TodoItem
                    text="Post your first job"
                    linkTo="/dashboard/agency/jobs/create"
                  />
                )}
                {memberLimit > 1 && memberCount < memberLimit && (
                  <TodoItem
                    text="Invite a team member"
                    linkTo="/dashboard/agency/team"
                  />
                )}
                {!verification?.cacVerified &&
                  !verification?.domainVerified &&
                  !isPaidUser && (
                    <TodoItem
                      text="Upgrade to a Pro plan"
                      linkTo="/dashboard/agency/billing"
                    />
                  )}
                {verification?.domainVerified &&
                  verification?.cacVerified &&
                  dashboardData &&
                  dashboardData.activeJobs.length > 0 &&
                  (memberCount >= memberLimit || memberLimit === -1) && (
                    <li className="flex items-center p-5 text-sm text-gray-500 dark:text-zinc-400">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> You’re
                      all set up!
                    </li>
                  )}
              </ul>
            )}
          </div>

          {/* Team */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Your Team</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {Array.from({ length: Math.min(memberCount, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-white/10 bg-gray-300"
                    ></div>
                  ))}
                </div>
                {isLoading ? (
                  <div className="h-5 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800"></div>
                ) : (
                  <p className="text-sm font-medium">
                    <span className="text-gray-900 dark:text-zinc-50">{memberCount}</span>
                    <span className="text-gray-500 dark:text-zinc-400">
                      {" "}
                      / {memberLimit === -1 ? "Unlimited" : memberLimit} members
                    </span>
                  </p>
                )}
              </div>
              <div className="mt-4">
                <Link to="/dashboard/agency/team">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Manage & Invite
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Your Plan</h2>
            {isPaidUser ? (
              <p className="mt-2 text-gray-500 dark:text-zinc-400">
                You are on the{" "}
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {analytics?.planName}
                </span>{" "}
                plan.
              </p>
            ) : (
              <p className="mt-2 text-gray-500 dark:text-zinc-400">
                You are on the{" "}
                <span className="font-semibold text-primary-600 dark:text-primary-400">Free</span> plan.
                Upgrade to unlock powerful analytics.
              </p>
            )}
            <div className="mt-4">
              <Link to="/dashboard/agency/analytics">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50"
                >
                  View Full Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;