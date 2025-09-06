import { Briefcase, Loader2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import useFetch from '../../hooks/useFetch';
import type { Agency } from '../../types/agency';
import type { Position } from '../../types/job';

const JobPostsPage = () => {
  const { data: agency, isLoading: isLoadingAgency } = useFetch<Agency>('/agencies/me');
  const agencyId = agency?.id;
  const { data: jobs, isLoading: isLoadingJobs, error } = useFetch<Position[]>(agencyId ? `/agencies/${agencyId}/jobs` : null);
  const isLoading = isLoadingAgency || isLoadingJobs;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-600">Job Postings</h1>
          <p className="mt-1 text-gray-500">Create and manage your open positions.</p>
        </div>
        <Link to="/dashboard/agency/jobs/create">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Job
          </Button>
        </Link>
      </div>

      {/* Job List section */}
      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-6 text-center text-red-800">
            <h3 className="text-lg font-semibold">Could Not Load Job Postings</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}
        {!isLoading && !error && jobs && (
          <div className="rounded-lg border bg-white shadow-sm">
            <ul>
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <li key={job.id}>
                    {/* --- THIS IS THE FIX --- */}
                    {/* The `agencyId` is now correctly included in the link's path, */}
                    {/* which allows the router and child pages to get it from the URL. */}
                    <Link
                      to={`/dashboard/agency/${agencyId}/jobs/${job.id}`}
                      className={`block p-4 transition-colors hover:bg-gray-50 ${index < jobs.length - 1 ? 'border-b' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-primary-700">{job.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>{job.employmentType.replace('_', ' ')}</span>
                            <span>&bull;</span>
                            <span>{job.isRemote ? 'Remote' : 'On-site'}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                             job.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                           }`}>
                             {job.status}
                           </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                   <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                   <h3 className="mt-2 text-sm font-semibold">No Job Posts</h3>
                   <p className="mt-1 text-sm">Get started by creating a new job posting.</p>
                </div>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPostsPage;