import {
  Briefcase,
  Building,
  CheckCircle,
  ChevronDown,
  Globe,
  Loader2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/forms/Input";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../components/ui/SimpleDropdown";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { useDataStore } from "../../context/DataStore";
import { useDebounce } from "../../hooks/useDebounce";
import useFetch from "../../hooks/useFetch";
import type { Position } from "../../types/job";
import { motion } from "framer-motion";

const JobCard = ({ job }: { job: Position }) => {
  const agency = job.agency;
  const { states } = useDataStore();
  const locationState = job.stateId
    ? states.find((s) => s.id === job.stateId)?.name
    : null;

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
  type Tab = "recommended" | "browse";
  const [activeTab, setActiveTab] = useState<Tab>("recommended");
  const [filters, setFilters] = useState({ stateId: "", isRemote: false });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { states } = useDataStore();

  const selectedStateName =
    states.find((s) => s.id === Number(filters.stateId))?.name || "All States";

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (filters.stateId) params.set("stateId", filters.stateId);
    if (filters.isRemote) params.set("isRemote", "true");
    if (activeTab === "browse" && debouncedSearchQuery)
      params.set("q", debouncedSearchQuery);

    const baseUrl =
      activeTab === "recommended"
        ? "/candidates/me/recommended-jobs"
        : "/public/jobs";
    return `${baseUrl}?${params.toString()}`;
  };

  const { data: jobs, isLoading, error } = useFetch<Position[]>(buildUrl());
  const handleFilterChange = (key: keyof typeof filters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Browse Open Jobs
          </h1>
          <p className="mt-1 text-gray-600 dark:text-zinc-300">
            Explore roles from our verified network of companies.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`${
              activeTab === "recommended"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Recommended
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`${
              activeTab === "browse"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
          >
            <Search className="mr-2 h-5 w-5" />
            Browse
          </button>
        </nav>

        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 mt-1 items-start"
>

          {activeTab === "browse" && (
            <div className="w-full sm:w-64">
              <Input
                type="search"
                placeholder="Search by title, company, or skill..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <SimpleDropdown
              trigger={
                <DropdownTrigger className="w-44 px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <span className="truncate">{selectedStateName}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownTrigger>
              }
            >
              <SimpleDropdownItem onSelect={() => handleFilterChange("stateId", "")}>
                All States
              </SimpleDropdownItem>
              {states.map((s) => (
                <SimpleDropdownItem
                  key={s.id}
                  onSelect={() => handleFilterChange("stateId", s.id.toString())}
                >
                  {s.name}
                </SimpleDropdownItem>
              ))}
            </SimpleDropdown>

            <label className="flex items-center gap-2 text-sm font-medium select-none">
              <ToggleSwitch
                enabled={filters.isRemote}
                onChange={(val) => handleFilterChange("isRemote", val)}
                srLabel="Remote only"
              />
              Remote
            </label>
          </div>
        </motion.div>
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
                title="No Jobs Found"
                description={
                  activeTab === "browse"
                    ? "Your search did not match any job postings. Try a different keyword or filter."
                    : "No recommended jobs for you right now. Try adjusting your filters or adding more skills to your profile!"
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
