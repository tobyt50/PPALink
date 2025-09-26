import { Briefcase, Eye, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import type { Agency } from "../../types/agency";
import type { Position } from "../../types/job";
import { JobCardSkeleton } from "./skeletons/JobCardSkeleton";

const JobPostsPage = () => {
  const { data: agency, isLoading: isLoadingAgency } = useFetch<Agency>("/agencies/me");
  const agencyId = agency?.id;

  const {
    data: jobs,
    isLoading: isLoadingJobs,
    error,
  } = useFetch<Position[]>(agencyId ? `/agencies/${agencyId}/jobs` : null);

  const isLoading = isLoadingAgency || isLoadingJobs;

  // Determine the current plan and job limits
  const currentPlan = agency?.subscriptions?.[0]?.plan;
  const openJobsCount = jobs?.filter(job => job.status === 'OPEN').length ?? 0;

  let jobPostLimit: number;
  if (currentPlan) {
    // Paid user: use the limit from their plan.
    jobPostLimit = currentPlan.jobPostLimit;
  } else {
    // Free user: use the dynamic limit from the new settings object.
    jobPostLimit = agency?.freePlanSettings?.jobPostLimit ?? 1;
  }

  const canPostNewJob = jobPostLimit === -1 || openJobsCount < jobPostLimit;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Job Postings
          </h1>
          <p className="mt-0.5 text-gray-600 dark:text-zinc-300">Create and manage your open positions.</p>
        </div>

        {/* Conditionally render the "Create Job" button or an "Upgrade" message */}
        {isLoadingAgency ? (
          <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
        ) : canPostNewJob ? (
          <Link to="/dashboard/agency/jobs/create">
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Job
            </Button>
          </Link>
        ) : (
          <div className="text-right">
            <p className="text-sm font-semibold text-yellow-700">Job Limit Reached</p>
            <Link
              to="/dashboard/agency/billing"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Upgrade to post more jobs
            </Link>
          </div>
        )}
      </div>

      {/* Job List */}
      <div>
        {error ? (
          <div className="text-center text-red-500 p-8">
            Could not load job postings.
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            {isLoading ? (
              <ul>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </ul>
            ) : jobs && jobs.length > 0 ? (
              <ul>
                {jobs.map((job, index) => (
                  <li
                    key={job.id}
                    className={`${
                      index < jobs.length - 1 ? "border-b border-gray-100 dark:border-zinc-800" : ""
                    }`}
                  >
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60 transition-all">
  <Link
    to={`/dashboard/agency/${agencyId}/jobs/${job.id}`}
    className="flex-grow min-w-0"
  >
    <p className="font-semibold text-gray-800 dark:text-zinc-100 hover:underline truncate">
      {job.title}
    </p>
    <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 dark:text-zinc-400 mt-1">
      <span>{job.employmentType.replace("_", " ")}</span>
      <span>&bull;</span>
      <span>{job.isRemote ? "Remote" : "On-site"}</span>
    </div>
  </Link>
  <div className="flex flex-shrink-0 mt-2 sm:mt-0 items-center space-x-2 sm:space-x-4">
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        job.status === "OPEN"
          ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200"
          : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100"
      }`}
    >
      {job.status}
    </span>
    <Link to={`/dashboard/agency/${agencyId}/jobs/${job.id}/pipeline`}>
      <Button variant="outline" size="sm">
        <Eye className="h-4 w-4 mr-2" />
        View Pipeline
      </Button>
    </Link>
  </div>
</div>

                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No Job Posts Yet"
                description="Get started by creating your first job posting to attract talent."
                action={{
                  text: "Create New Job",
                  to: "/dashboard/agency/jobs/create",
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPostsPage;


