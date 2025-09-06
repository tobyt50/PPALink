import { Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import type { CandidateProfile } from '../../types/candidate';
import CandidateCard from './CandidateCard';

const ShortlistedCandidatesPage = () => {
  // We will build the service function for this endpoint next
  const { data: candidates, isLoading, error } = useFetch<CandidateProfile[]>('/agencies/shortlist');

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Shortlisted Candidates</h1>
        <p className="mt-1 text-gray-500">Your saved list of top candidates for future consideration.</p>
      </div>

      {/* Results Section */}
      {isLoading && (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-6 text-center text-red-800">
          <h3 className="text-lg font-semibold">Could Not Load Shortlist</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}
      {!isLoading && !error && candidates && (
        <>
          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {candidates.map((candidate) => (
                <Link key={candidate.id} to={`/dashboard/agency/candidates/${candidate.id}/profile`}>
                  <CandidateCard candidate={candidate} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No Shortlisted Candidates</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't shortlisted any candidates yet.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShortlistedCandidatesPage;