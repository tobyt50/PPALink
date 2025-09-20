import { ArrowRight, Package, MessageSquare, Gift, CheckCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import useFetch from '../../hooks/useFetch';
import type { CandidateDashboardData } from '../../types/analytics';
import type { ApplicationStatus } from '../../types/application';

// Polished Profile Completeness Card
const ProfileCompleteness = ({ score }: { score: number }) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Profile Strength</h2>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-500">A complete profile attracts more recruiters.</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-600 to-green-500 h-2.5 rounded-full transform origin-left transition-transform duration-500"
            style={{ transform: `scaleX(${clampedScore / 100})` }}
          />
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="font-semibold text-primary-600">{clampedScore}% Complete</span>
          {clampedScore < 100 && (
            <Link to="/dashboard/candidate/profile/edit">
              <Button variant="link" size="sm" className="text-primary-600 px-0">
                Complete Profile <ArrowRight className="inline h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Polished Application Status Badge
const ApplicationStatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const labelMap: Record<ApplicationStatus, { text: string; color: string }> = {
    APPLIED: { text: 'Applied', color: 'text-gray-700 bg-gray-100' },
    REVIEWING: { text: 'In Review', color: 'text-indigo-700 bg-indigo-100' },
    INTERVIEW: { text: 'Interview', color: 'text-amber-700 bg-amber-100' },
    OFFER: { text: 'Offer', color: 'text-green-700 bg-green-100' },
    REJECTED: { text: 'Rejected', color: 'text-red-700 bg-red-100' },
    WITHDRAWN: { text: 'Withdrawn', color: 'text-pink-700 bg-pink-100' },
  };

  const { text, color } = labelMap[status] ?? { text: 'Unknown', color: 'text-gray-700 bg-gray-100' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
};

const CandidateDashboard = () => {
  const { data: dashboardData, isLoading } = useFetch<CandidateDashboardData>('/candidates/me/dashboard');

  if (isLoading || !dashboardData) {
    // Skeleton Loader (matching AgencyDashboard style)
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          <div className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
          {/* Right column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const { stats, recentApplications, profileCompleteness, isVerified } = dashboardData;

  return (
    <div className="space-y-5">
      {/* Header - Replicated from AgencyDashboard */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            My Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Welcome! Here's an overview of your job search journey.</p>
        </div>
        <Link to="/dashboard/candidate/jobs/browse">
          <Button
            size="lg"
            className="rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition"
          >
            <Search className="mr-2 h-5 w-5" />
            Find a Job
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        <StatCard
          icon={Package}
          label="Applications Sent"
          value={stats.totalApplications}
          linkTo="/dashboard/candidate/applications"
          color="green"
        />
        <StatCard
          icon={MessageSquare}
          label="Interviews"
          value={stats.interviews}
          linkTo="/dashboard/candidate/applications"
          color="green"
        />
        <StatCard
          icon={Gift}
          label="Offers Received"
          value={stats.offers}
          linkTo="/dashboard/candidate/applications"
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link to="/dashboard/candidate/applications" className="text-sm font-medium text-primary-600 hover:underline">
                View All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <p className="p-6 text-sm text-center text-gray-500">Your recent applications will appear here.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentApplications.map((app) => (
                  <li key={app.id}>
                    <Link
                      to={`/dashboard/candidate/applications`}
                      className="group block px-5 py-4 transition-all hover:bg-gradient-to-r hover:from-primary-50 hover:to-green-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-primary-600 group-hover:text-primary-600">
                            {app.position.title}
                          </p>
                          <p className="text-sm text-gray-500">{app.position.agency.name}</p>
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
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          <ProfileCompleteness score={profileCompleteness} />
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
            </div>
            <div className="p-6">
              {isVerified ? (
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <p className="font-semibold">Your NYSC status is verified!</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Get your profile verified to stand out and build trust with recruiters.
                  </p>
                  <div className="mt-4">
                    <Link to="/dashboard/candidate/verifications/submit">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-lg border-primary-600 text-primary-600 hover:bg-primary-50"
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
