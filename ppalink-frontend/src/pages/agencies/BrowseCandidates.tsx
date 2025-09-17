import { Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import useFetch from '../../hooks/useFetch';
import candidateService, { type CandidateSearchParams } from '../../services/candidate.service';
import type { Agency } from '../../types/agency';
import type { CandidateProfile } from '../../types/candidate';
import CandidateCard from './CandidateCard';
import FilterSidebar, { type CandidateFilterValues } from './FilterSidebar';
import { CandidateCardSkeleton } from './skeletons/CandidateCardSkeleton';

const BrowseCandidatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CandidateFilterValues | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // debounce user typing
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // fetch current agency (to know plan type)
  const { data: agency, isLoading: isLoadingAgency } = useFetch<Agency>('/agencies/me');

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
        const isPaid = agency?.subscriptions?.[0]?.plan?.name?.toUpperCase() !== 'BASIC';

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

        // eslint-disable-next-line no-console
        console.log('BrowseCandidates -> combinedFilters', combinedFilters);

        const results = await candidateService.searchCandidates(combinedFilters);
        setCandidates(results);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'An error occurred while searching.');
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
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Browse Candidates</h1>
        <p className="mt-1 text-gray-500">Find the best talent for your open positions.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <div className="sticky top-20 rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Filters</h2>
            {isLoadingAgency ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded-md" />
                <div className="h-20 bg-gray-200 rounded-md" />
              </div>
            ) : (
              <FilterSidebar onFilterChange={handleFilterChange} agency={agency} />
            )}
          </div>
        </aside>
        <main className="md:col-span-3">
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search by name, skill, university, or keyword..."
                  className="block w-full rounded-md pl-10 sm:text-sm focus:ring-0 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
              </div>
            ) : !hasSearched ? (
              <EmptyState
                icon={Users}
                title="Search for Candidates"
                description="Use the keyword search or apply filters (state, batch, GPA, university, etc.) to find talent."
              />
            ) : candidates.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Candidates Found"
                description="Try a different search term or adjusting your filters."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {candidates.map((candidate) => (
                  <Link key={candidate.id} to={`/dashboard/agency/candidates/${candidate.id}/profile`}>
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
