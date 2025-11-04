import {
  SlidersHorizontal,
  Briefcase,
  Loader2,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import useFetch from "../../hooks/useFetch";
import { JobCard } from "../../components/ui/JobCard";
import type { Position } from "../../types/job";
import { EmptyState } from "../../components/ui/EmptyState";
import JobsFilterSidebar, { type JobFilterValues } from "./JobsFilterSidebar";
import { Input } from "../../components/forms/Input";

const BrowseJobsPage = () => {
  type Tab = "recommended" | "browse";
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("recommended");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || ""
  );
  const [filters, setFilters] = useState<JobFilterValues>({
    isRemote: false,
    countryId: undefined,
    regionId: undefined,
    cityId: undefined,
    industryId: undefined,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery?.trim()) {
      params.set("q", debouncedSearchQuery.trim());
    }
    for (const [key, value] of Object.entries(debouncedFilters)) {
      if (value !== undefined && value !== null && value !== "") {
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
    if (showFiltersModal) {
      setShowFiltersModal(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Browse Jobs
          </h1>
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
                  : "border-transparent text-gray-500 hover:text-gray-900"
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
                  : "border-transparent text-gray-500 hover:text-gray-900"
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
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-2 max-h-[calc(100vh-5rem)] overflow-auto rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5">
            <h2 className="text-md font-semibold text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4 flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </h2>
            <JobsFilterSidebar
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
              currentFilters={filters}
            />
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3">
          <div className="pb-5">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by title, company, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
                className="lg:pr-3 pr-10"
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-none p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 lg:hidden"
                onClick={() => setShowFiltersModal(true)}
              >
                <SlidersHorizontal className="h-4 w-6 text-gray-500" />
              </button>
            </div>
          </div>

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

      {showFiltersModal && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed top-0 md:top-14 bottom-14 left-0 right-0 bg-black/50"
            onClick={() => setShowFiltersModal(false)}
          />
          <div className="fixed top-0 md:top-14 bottom-14 right-0 w-full max-w-md bg-white dark:bg-zinc-900 shadow-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
              <h2 className="flex items-center text-md font-semibold text-gray-900 dark:text-zinc-50">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </h2>
              <button
                type="button"
                className="bg-transparent border-none p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                onClick={() => setShowFiltersModal(false)}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <JobsFilterSidebar
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
                currentFilters={filters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseJobsPage;
