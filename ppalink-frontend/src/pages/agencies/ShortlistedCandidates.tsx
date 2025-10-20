import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import type { CandidateProfile } from "../../types/candidate";
import CandidateCard from "../../components/ui/CandidateCard";
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Shortlisted Candidates
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Your saved list of top candidates for future consideration.
          </p>
        </div>
        <Link to="/dashboard/agency/candidates/browse">
          <Button
            size="sm"
            className="rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
          >
            Find Candidates
          </Button>
        </Link>
      </div>

      {/* Results Section */}
      {error && (
        <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 p-6 text-center text-red-800">
          <h3 className="text-lg font-semibold">Could Not Load Shortlist</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {!error && (
        <>
          {isLoading ? (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
              </div>
              <div className="flex justify-center p-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary-500 dark:text-primary-400" />
              </div>
            </>
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