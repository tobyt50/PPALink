import { Briefcase, Building, CheckCircle, Globe, Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { useDataStore } from "../../context/DataStore";
import { useDebounce } from "../../hooks/useDebounce";
import useFetch from "../../hooks/useFetch";
import type { Position } from "../../types/job";
import { Input } from "../../components/forms/Input"; // ✅ using your styled Input

const JobCard = ({ job }: { job: Position }) => {
  const agency = job.agency;
  const { states } = useDataStore();
  const locationState = job.stateId ? states.find((s) => s.id === job.stateId)?.name : null;

  return (
    <Link
      to={`/jobs/${job.id}/details`}
      className="group block rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 transition-all hover:shadow-lg hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-grow">
          <p className="font-semibold text-lg text-gray-900 dark:text-zinc-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {job.title}
          </p>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-sm text-gray-600 dark:text-zinc-300 mt-2">
            <span className="flex items-center">
              <Building className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
              {agency?.name}
            </span>
            {agency?.cacVerified && (
              <span className="flex items-center text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-950/60 px-2.5 py-1 rounded-full">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                CAC Verified
              </span>
            )}
            {agency?.domainVerified && (
              <span className="flex items-center text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Verified Domain
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-zinc-200 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <span className="flex items-center">
          <Briefcase className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
          {job.employmentType}
        </span>
        <span className="flex items-center">
          {job.isRemote ? (
            <>
              <Globe className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
              Remote
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-1.5 text-gray-400 dark:text-zinc-500" />
              {locationState || "On-site"}
            </>
          )}
        </span>

        {job.skills && job.skills.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 pt-1">
            {job.skills.slice(0, 2).map((positionSkill) => (
              <span
                key={positionSkill.skill.id}
                className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950/60 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300"
              >
                {positionSkill.skill.name}
              </span>
            ))}
            {job.skills.length > 2 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-zinc-300">
                + {job.skills.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

const BrowseJobsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const searchUrl = debouncedSearchQuery
    ? `/public/jobs?q=${encodeURIComponent(debouncedSearchQuery)}`
    : "/public/jobs";

  const { data: jobs, isLoading, error } = useFetch<Position[]>(searchUrl);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-400 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Browse Open Jobs
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Find your next opportunity from our verified network of companies.
        </p>
      </div>

      {/* ✅ Polished search input using Input component */}
      <div>
        <Input
          type="search"
          placeholder="Search by title, company, or skill..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 dark:text-red-400 p-10 bg-red-50 dark:bg-red-950/60 rounded-lg">
          Could not load job listings. Please try again.
        </div>
      )}

      {!isLoading && !error && jobs && (
        <div className="space-y-6">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8">
              <EmptyState
                icon={Briefcase}
                title={
                  debouncedSearchQuery ? "No Jobs Found" : "No Open Jobs at the Moment"
                }
                description={
                  debouncedSearchQuery
                    ? "Your search did not match any job postings. Try a different keyword."
                    : "There are currently no public job postings available. Please check back later!"
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseJobsPage;


