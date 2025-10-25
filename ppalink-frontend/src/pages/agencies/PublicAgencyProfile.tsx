import {
  Briefcase,
  CheckCircle,
  ChevronLeft,
  Globe,
  Loader2,
  MapPin,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { JobCard } from "../../components/ui/JobCard";
import useFetch from "../../hooks/useFetch";
import type { Agency } from "../../types/agency";
import { useAuthStore } from "../../context/AuthContext";
import { Avatar } from "../../components/ui/Avatar";
// 1. REMOVE the unnecessary useLocationNames hook
// import { useLocationNames } from "../../hooks/useLocationNames";

const PublicAgencyProfilePage = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const { isAuthenticated } = useAuthStore();
  const {
    data: agency,
    isLoading,
    error,
  } = useFetch<Agency>(
    agencyId ? `/public/agencies/${agencyId}/profile` : null
  );

  const fullLocationString = [
    (agency as any)?.region?.name,
    (agency as any)?.country?.name,
  ]
    .filter(Boolean)
    .join(", ");

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }
  if (error || !agency) {
    return (
      <div className="text-center p-10 text-red-600 dark:text-red-400">
        Agency profile not found.
      </div>
    );
  }

  return (
    <div>
      <div
        className={`mx-auto max-w-5xl space-y-5 ${
          !isAuthenticated ? "py-6 px-4 sm:px-6 lg:px-8" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            to={isAuthenticated ? "/dashboard/candidate/jobs/browse" : "/"}
            className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            {isAuthenticated ? "Back to All Jobs" : "Back to Home"}
          </Link>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar
              user={{ role: "AGENCY", ownedAgencies: [agency] }}
              size="xl"
            />
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50">
                  {agency.name}
                </h1>
                <div className="flex items-center space-x-2">
                  {agency.cacVerified && (
                    <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      CAC Verified
                    </span>
                  )}
                  {agency.domainVerified && (
                    <span className="flex items-center text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified Domain
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 dark:text-zinc-300">
                <span className="text-sm">
                  {agency.industry?.name || "Industry not specified"}
                </span>
                <span className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {fullLocationString || "Location not specified"}
                </span>
              </div>
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {agency.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 flex items-center">
            <Briefcase className="h-6 w-6 mr-3 text-primary-600 dark:text-primary-400" />
            Open Positions
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {agency.positions && agency.positions.length > 0 ? (
              agency.positions.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="text-center p-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
                <p className="text-gray-500 dark:text-zinc-400">
                  This agency has no open positions at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAgencyProfilePage;
