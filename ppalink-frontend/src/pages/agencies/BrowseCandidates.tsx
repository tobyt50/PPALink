import { SlidersHorizontal, Search, Users, X } from "lucide-react";
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
import CandidateCard from "../../components/ui/CandidateCard";
import FilterSidebar, { type CandidateFilterValues } from "./FilterSidebar";
import { CandidateCardSkeleton } from "./skeletons/CandidateCardSkeleton";
import { Input } from "../../components/forms/Input";

const BrowseCandidatesPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || ""
  );
  const [filters, setFilters] = useState<CandidateFilterValues | null>(() => {
    const stored = searchParams.get("filters");
    return stored ? JSON.parse(stored) : null;
  });
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { data: agency, isLoading: isLoadingAgency } =
    useFetch<Agency>("/agencies/me");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    const storedFilters = searchParams.get("filters");
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);
        setFilters(parsedFilters);
      } catch (e) {
        console.error("Failed to parse filters from URL:", e);
        setFilters(null);
      }
    } else {
      setFilters(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        const isPaid =
          agency?.subscriptions?.[0]?.plan?.name?.toUpperCase() !== "BASIC";

        const combinedFilters: CandidateSearchParams = {
          countryId: filters?.countryId ?? null,
          regionId: filters?.regionId ?? null,
          cityId: filters?.cityId ?? null,
          nyscBatch: filters?.nyscBatch ?? null,
          skills: filters?.skills ?? [],
          verifiedSkillIds: filters?.verifiedSkillIds ?? [],
          isRemote: filters?.isRemote ?? false,
          isOpenToReloc: filters?.isOpenToReloc ?? false,
          gpaBand: filters?.gpaBand ?? null,
          graduationYear: filters?.graduationYear ?? null,
          university: isPaid ? filters?.university ?? null : null,
          courseOfStudy: isPaid ? filters?.courseOfStudy ?? null : null,
          degree: isPaid ? filters?.degree ?? null : null,
          q: debouncedSearchQuery?.trim() || undefined,
        };

        const results = await candidateService.searchCandidates(
          combinedFilters
        );
        setCandidates(results);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "An error occurred while searching."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoadingAgency) {
      performSearch();
    }
  }, [filters, debouncedSearchQuery, agency, isLoadingAgency]);

  useEffect(() => {
    if (!filters) {
      setSearchQuery("");
    }
  }, [filters]);

  const handleFilterChange = (newFilters: CandidateFilterValues | null) => {
    setFilters(newFilters);
    if (showFiltersModal) {
      setShowFiltersModal(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Browse Candidates
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-2 max-h-[calc(100vh-5rem)] overflow-auto rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5">
            <h2 className="text-md font-semibold text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4 flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
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
                currentFilters={filters || undefined}
              />
            )}
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="pb-5">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by name or keyword..."
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

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CandidateCardSkeleton />
              <CandidateCardSkeleton />
              <CandidateCardSkeleton />
              <CandidateCardSkeleton />
            </div>
          ) : !hasSearched ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
              <EmptyState
                icon={Users}
                title="Search for Candidates"
                description="Use the keyword search or apply filters (location, batch, GPA, university, etc.) to find talent."
              />
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
              <EmptyState
                icon={Users}
                title="No Candidates Found"
                description="Try a different search term or adjusting your filters."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map((candidate) => (
                <Link
                  key={candidate.id}
                  to={`/dashboard/agency/candidates/${
                    candidate.id
                  }/profile?q=${encodeURIComponent(
                    debouncedSearchQuery
                  )}&filters=${encodeURIComponent(JSON.stringify(filters))}`}
                  className="block hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60 transition-all rounded-xl"
                >
                  <CandidateCard candidate={candidate} />
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {showFiltersModal && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed top-14 bottom-14 left-0 right-0 bg-black/50"
            onClick={() => setShowFiltersModal(false)}
          />
          <div className="fixed top-14 bottom-14 right-0 w-full max-w-md bg-white dark:bg-zinc-900 shadow-lg overflow-hidden flex flex-col">
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
              <FilterSidebar
                onFilterChange={handleFilterChange}
                agency={agency}
                currentFilters={filters || undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseCandidatesPage;