import { Loader2, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import candidateService from '../../services/candidate.service';
import type { CandidateProfile } from '../../types/candidate';
import CandidateCard from './CandidateCard';
import FilterSidebar, { type CandidateFilterValues } from './FilterSidebar';

const BrowseCandidatesPage = () => {
  const [filters, setFilters] = useState<CandidateFilterValues | null>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // To track if a search has been performed

  useEffect(() => {
    // This effect triggers the search whenever the filters change
    const performSearch = async () => {
      if (!filters) return; // Don't search if there are no filters

      setIsLoading(true);
      setHasSearched(true);
      try {
        const results = await candidateService.searchCandidates(filters);
        setCandidates(results);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "An error occurred while searching.");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [filters]);

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
            <FilterSidebar onFilterChange={handleFilterChange} />
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
                  placeholder="Keyword search coming soon..."
                  className="block w-full rounded-md border-gray-300 pl-10 shadow-sm sm:text-sm"
                  disabled // Disabled for now
                />
              </div>
            </div>

            {/* Candidate List - Renders different states */}
            {isLoading ? (
              <div className="flex justify-center p-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
              </div>
            ) : !hasSearched ? (
              <div className="p-12 text-center text-gray-500">
                 <Users className="mx-auto h-12 w-12 text-gray-400" />
                 <h3 className="mt-2 text-sm font-semibold">Search for Candidates</h3>
                 <p className="mt-1 text-sm">Apply filters to see a list of matching candidates.</p>
              </div>
            ) : candidates.length === 0 ? (
               <div className="p-12 text-center text-gray-500">
                 <h3 className="mt-2 text-sm font-semibold">No Candidates Found</h3>
                 <p className="mt-1 text-sm">Try adjusting your filters to find more results.</p>
               </div>
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