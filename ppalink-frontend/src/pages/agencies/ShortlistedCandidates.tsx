import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import type { CandidateProfile } from "../../types/candidate";
import CandidateCard from "./CandidateCard";
import { CandidateCardSkeleton } from "./skeletons/CandidateCardSkeleton";

const ShortlistedCandidatesPage = () => {
  const {
    data: candidates,
    isLoading,
    error,
  } = useFetch<CandidateProfile[]>("/agencies/shortlist");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            Shortlisted Candidates
          </h1>
          <p className="mt-2 text-gray-600">
            Your saved list of top candidates for future consideration.
          </p>
        </div>
        <Link to="/dashboard/agency/candidates/browse">
          <Button
            size="lg"
            className="rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition"
          >
            Find More Candidates
          </Button>
        </Link>
      </div>

      {/* Results Section */}
      {isLoading && (
        <div className="flex justify-center p-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-6 text-center text-red-800">
          <h3 className="text-lg font-semibold">Could Not Load Shortlist</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {!error && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CandidateCardSkeleton />
              <CandidateCardSkeleton />
            </div>
          ) : candidates && candidates.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {candidates.map((candidate) => (
                <Link
                  key={candidate.id}
                  to={`/dashboard/agency/candidates/${candidate.id}/profile`}
                >
                  <CandidateCard candidate={candidate} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="No Shortlisted Candidates"
              description="You haven't shortlisted any candidates yet. Start searching to build your talent pool."
              action={{
                text: "Find Candidates",
                to: "/dashboard/agency/candidates/browse",
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ShortlistedCandidatesPage;
