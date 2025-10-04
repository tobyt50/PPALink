import { Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { useDebounce } from "../../hooks/useDebounce";
import useFetch from "../../hooks/useFetch";
import candidateService, {
  type CandidateSearchParams,
} from "../../services/candidate.service";
import type { Agency } from "../../types/agency";
import type { CandidateProfile } from "../../types/candidate";
import CandidateCard from "./CandidateCard";
import FilterSidebar, {
  type CandidateFilterValues,
} from "./FilterSidebar";
import { CandidateCardSkeleton } from "./skeletons/CandidateCardSkeleton";

const BrowseCandidatesPage = () => {
  const [searchParams] = useSearchParams();

const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");

const [filters, setFilters] = useState<CandidateFilterValues | null>(() => {
  const stored = searchParams.get("filters");
  return stored ? JSON.parse(stored) : null;
});
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // debounce user typing
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // fetch current agency (to know plan type)
  const { data: agency, isLoading: isLoadingAgency } =
    useFetch<Agency>("/agencies/me");

  useEffect(() => {
    const performSearch = async () => {
      if (!filters && !debouncedSearchQuery) {
        setCandidates([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const isPaid =
          agency?.subscriptions?.[0]?.plan?.name?.toUpperCase() !== "BASIC";

        const combinedFilters: CandidateSearchParams = {
          stateId: filters?.stateId ?? null,
          nyscBatch: filters?.nyscBatch ?? null,
          skills: filters?.skills ?? null,
          isRemote: filters?.isRemote ?? false,
          isOpenToReloc: filters?.isOpenToReloc ?? false,
          gpaBand: filters?.gpaBand ?? null,
          graduationYear: filters?.graduationYear ?? null,
          // only include in search if agency has paid plan
          university: isPaid ? filters?.university ?? null : null,
          courseOfStudy: isPaid ? filters?.courseOfStudy ?? null : null,
          degree: isPaid ? filters?.degree ?? null : null,
          q: debouncedSearchQuery?.trim() || undefined,
        };

        const results =
          await candidateService.searchCandidates(combinedFilters);
        setCandidates(results);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while searching."
        );
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [filters, debouncedSearchQuery, agency]);

  const handleFilterChange = (newFilters: CandidateFilterValues) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Browse Candidates
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Find the best talent for your open positions.
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="
    sticky top-2
    max-h-[calc(100vh-5rem)]   /* don’t exceed the viewport */
    overflow-auto              /* scroll internally if filters get tall */
    rounded-2xl bg-white dark:bg-zinc-900
    shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100
    p-5
  ">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
              Filters
            </h2>
            {isLoadingAgency ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
                <div className="h-20 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
              </div>
            ) : (
              <FilterSidebar
                onFilterChange={handleFilterChange}
                agency={agency}
              />
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            {/* Search bar */}
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-gray-920">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                  type="search"
                  placeholder="Search by name, skill, university, or keyword..."
                  className="block w-full rounded-lg bg-transparent pl-10 pr-3 text-sm placeholder-gray-400 focus:ring-0 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
              </div>
            ) : !hasSearched ? (
              <div className="p-6">
                <EmptyState
                  icon={Users}
                  title="Search for Candidates"
                  description="Use the keyword search or apply filters (state, batch, GPA, university, etc.) to find talent."
                />
              </div>
            ) : candidates.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Users}
                  title="No Candidates Found"
                  description="Try a different search term or adjusting your filters."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {candidates.map((candidate) => (
                  <Link
  key={candidate.id}
  to={`/dashboard/agency/candidates/${candidate.id}/profile?q=${encodeURIComponent(debouncedSearchQuery)}&filters=${encodeURIComponent(JSON.stringify(filters))}`}
  className="block hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60 transition-all rounded-xl"
>
  <CandidateCard candidate={candidate} />
</Link>

                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BrowseCandidatesPage;


