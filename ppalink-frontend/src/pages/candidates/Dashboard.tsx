import {
  ArrowRight,
  CheckCircle,
  Search,
  Building,
  Star,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  PlusCircle,
  List,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import useFetch from "../../hooks/useFetch";
import type { CandidateDashboardData } from "../../types/analytics";
import type { ApplicationStatus } from "../../types/application";
import type { CandidateProfile } from "../../types/candidate";
import type { Agency } from "../../types/agency";
import type { FeedItem } from "../../types/feed";
import { FeedCard } from "../../components/ui/FeedCard";
import { useState, useMemo } from "react";

const ProfileCompleteness = ({ score }: { score: number }) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
          Profile Strength
        </h2>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          A complete profile attracts more recruiters.
        </p>
        <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2.5 mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 h-2.5 rounded-full transform origin-left transition-transform duration-500"
            style={{ transform: `scaleX(${clampedScore / 100})` }}
          />
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            {clampedScore}% Complete
          </span>
          {clampedScore < 100 && (
            <Link to="/dashboard/candidate/profile/edit">
              <Button
                variant="link"
                size="sm"
                className="text-primary-600 dark:text-primary-400 px-0"
              >
                Complete Profile <ArrowRight className="inline h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationStatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const labelMap: Record<ApplicationStatus, { text: string; color: string }> = {
    APPLIED: {
      text: "Applied",
      color: "text-gray-700 dark:text-zinc-200 bg-gray-100 dark:bg-zinc-800",
    },
    REVIEWING: {
      text: "In Review",
      color:
        "text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60",
    },
    INTERVIEW: {
      text: "Interview",
      color:
        "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60",
    },
    OFFER: {
      text: "Offer",
      color:
        "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/60",
    },
    HIRED: {
      text: "Hired",
      color: "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60",
    },
    REJECTED: {
      text: "Rejected",
      color: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60",
    },
    WITHDRAWN: {
      text: "Withdrawn",
      color: "text-pink-700 dark:text-pink-400 bg-pink-100 dark:bg-pink-950/60",
    },
  };
  const { text, color } = labelMap[status] ?? {
    text: "Unknown",
    color: "text-gray-700 dark:text-zinc-200 bg-gray-100 dark:bg-zinc-800",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {text}
    </span>
  );
};

const FollowingFeed = () => {
  const { data: followedAgencies, isLoading } = useFetch<Agency[]>(
    "/candidates/me/following-feed"
  );
  if (isLoading) {
    return (
      <div className="h-48 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
    );
  }
  if (!followedAgencies || followedAgencies.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 text-center p-8">
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          New jobs from agencies you follow will appear here.
        </p>
        <Link
          to="/dashboard/candidate/jobs/browse"
          className="mt-4 inline-block"
        >
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Find Agencies to Follow
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
          Updates from Followed Agencies
        </h2>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
        {followedAgencies.map((agency) => (
          <li
            key={agency.id}
            className="p-4 hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
          >
            <Link
              to={`/agencies/${agency.id}/profile`}
              className="font-semibold flex items-center text-gray-800 dark:text-zinc-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Building className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
              {agency.name}
            </Link>
            <ul className="mt-2 pl-6 space-y-2">
              {agency.positions?.map((job) => (
                <li key={job.id}>
                  <Link
                    to={`/jobs/${job.id}/details`}
                    className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                  >
                    {job.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

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
            Career Discovery
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
            Your personalized feed is being prepared. Complete your profile to
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

const CandidateDashboard = () => {
  const { data: dashboardData, isLoading: isLoadingDashboard } =
    useFetch<CandidateDashboardData>("/candidates/me/dashboard");
  const { data: _profile, isLoading: isLoadingProfile } =
    useFetch<CandidateProfile>("/candidates/me");
  const isLoading = isLoadingDashboard || isLoadingProfile;

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          <div className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            <div className="h-48 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const { recentApplications, profileCompleteness, isVerified } = dashboardData;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            My Dashboard
          </h1>
        </div>
        <Link to="/dashboard/candidate/jobs/browse">
          <Button
            size="sm"
            className="rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
          >
            <Search className="mr-2 h-5 w-5" />
            Find a Job
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <DiscoveryFeed />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Recent Activity
              </h2>
              <Link
                to="/dashboard/candidate/applications"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                View All
              </Link>
            </div>
            {recentApplications.length === 0 ? (
              <p className="p-6 text-sm text-center text-gray-500 dark:text-zinc-400">
                Your recent applications will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                {recentApplications.slice(0, 4).map((app) => (
                  <li key={app.id}>
                    <Link
                      to={`/dashboard/candidate/applications/${app.id}/status`}
                      className="group block px-5 py-4 transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {app.position.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">
                            {app.position.agency.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <ApplicationStatusBadge status={app.status} />
                          <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ProfileCompleteness score={profileCompleteness} />
          <FollowingFeed />
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Verification Status
              </h2>
            </div>
            <div className="p-6">
              {isVerified ? (
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <p className="font-semibold">Your NYSC status is verified!</p>
                </div>
              ) : (
                <>
                  {" "}
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    Get your profile verified to stand out and build trust with
                    recruiters.
                  </p>
                  <div className="mt-4">
                    <Link to="/dashboard/candidate/verifications/submit">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50"
                      >
                        Submit Documents
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;