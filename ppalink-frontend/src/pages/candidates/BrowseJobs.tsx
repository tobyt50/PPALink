import { Briefcase, Loader2, Sparkles, Filter } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import useFetch from "../../hooks/useFetch";
import { JobCard } from "../../components/ui/JobCard";
import { Button } from "../../components/ui/Button";
import type { Position } from "../../types/job";
import { EmptyState } from "../../components/ui/EmptyState";
import JobsFilterSidebar, { type JobFilterValues } from "./JobsFilterSidebar";

const BrowseJobsPage = () => {
  type Tab = "recommended" | "browse";
  const [activeTab, setActiveTab] = useState<Tab>("recommended");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<JobFilterValues>({
    q: "",
    isRemote: false,
    countryId: undefined,
    regionId: undefined,
    cityId: undefined,
    industryId: undefined,
  });

  const debouncedFilters = useDebounce(filters, 500);

  const buildUrl = () => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(debouncedFilters)) {
      if (value) {
        params.set(key, String(value));
      }
    }

    const baseUrl =
      activeTab === "recommended"
        ? "/candidates/me/recommended-jobs"
        : "/candidates/me/jobs";
    return `${baseUrl}?${params.toString()}`;
  };

  const { data: jobs, isLoading, error } = useFetch<Position[]>(buildUrl());

  const handleFilterChange = (newFilters: JobFilterValues) => {
    setFilters(newFilters);
    if (showMobileFilters) {
      setShowMobileFilters(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Browse Open Jobs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Explore roles from our verified network of companies.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4 pb-3 border-b border-gray-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`
              ${
                activeTab === "recommended"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
            `}
          >
            <Sparkles className="mr-2 h-5 w-5" /> Recommended
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`
              ${
                activeTab === "browse"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
            `}
          >
            <Briefcase className="mr-2 h-5 w-5" /> Browse All
          </button>
        </nav>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        {activeTab === "browse" && (
          <aside className={`${showMobileFilters ? "block" : "hidden lg:block"} lg:col-span-1`}>
            <div
              className={`
                ${
                  showMobileFilters
                    ? ""
                    : "sticky top-2 max-h-[calc(100vh-5rem)] overflow-auto"
                }
                rounded-2xl bg-white dark:bg-zinc-900
                shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100
                p-5
              `}
            >
              <JobsFilterSidebar
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
                currentFilters={filters}
              />
            </div>
          </aside>
        )}

        {/* Main */}
        <main className={activeTab === "browse" ? "lg:col-span-3" : "lg:col-span-4"}>
          {activeTab === "browse" && !showMobileFilters && (
            <div className="lg:hidden pb-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowMobileFilters(true)}
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Show Filters
              </Button>
            </div>
          )}
            {isLoading && (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
              </div>
            )}
            {error && (
              <div className="text-center text-red-600 dark:text-red-400 py-10 bg-red-50 dark:bg-red-950/60 rounded-lg">
                Could not load job listings. Please try again.
              </div>
            )}
            {!isLoading && !error && jobs && (
              <div className="space-y-6">
                {jobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="No Jobs Found"
                    description={
                      activeTab === "browse"
                        ? "Your search did not match any job postings. Try a different keyword or filter."
                        : "No recommended jobs for you right now. Try adjusting your filters or adding more skills to your profile!"
                    }
                  />
                )}
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default BrowseJobsPage;
