import { Briefcase, Eye, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import type { Agency } from '../../types/agency';
import type { Position } from '../../types/job';
import { JobCardSkeleton } from './skeletons/JobCardSkeleton';

const JobPostsPage = () => {
  const { data: agency, isLoading: isLoadingAgency } = useFetch<Agency>('/agencies/me');
  const agencyId = agency?.id;
  
  const { data: jobs, isLoading: isLoadingJobs, error } = useFetch<Position[]>(
    agencyId ? `/agencies/${agencyId}/jobs` : null
  );

  const isLoading = isLoadingAgency || isLoadingJobs;
  
  // Determine the current plan and job limits
  const currentPlan = agency?.subscriptions?.[0]?.plan;
  const jobPostLimit = currentPlan?.jobPostLimit ?? 2; // Default to Free plan limit
  const openJobsCount = jobs?.filter(job => job.status === 'OPEN').length ?? 0;
  const canPostNewJob = jobPostLimit === -1 || openJobsCount < jobPostLimit;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-600">Job Postings</h1>
          <p className="mt-1 text-gray-500">Create and manage your open positions.</p>
        </div>
        
        {/* Conditionally render the "Create Job" button or an "Upgrade" message */}
        {isLoadingAgency ? (
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        ) : canPostNewJob ? (
          <Link to="/dashboard/agency/jobs/create">
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Job
            </Button>
          </Link>
        ) : (
          <div className="text-right">
            <p className="text-sm font-semibold text-yellow-700">Job Limit Reached</p>
            <Link to="/dashboard/agency/billing" className="text-xs text-primary-600 hover:underline">
              Upgrade to post more jobs
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8">
        {error ? (
           <div className="text-center text-red-500 p-8">Could not load job postings.</div>
        ) : (
          <div className="rounded-lg border bg-white shadow-sm">
            {isLoading ? (
              <ul><JobCardSkeleton /><JobCardSkeleton /><JobCardSkeleton /></ul>
            ) : jobs && jobs.length > 0 ? (
              <ul>
                {jobs.map((job, index) => (
                  <li key={job.id} className={`${index < jobs.length - 1 ? 'border-b' : ''}`}>
                    <div className="p-4 flex items-center justify-between">
                      <Link to={`/dashboard/agency/${agencyId}/jobs/${job.id}`} className="flex-grow">
                          <p className="font-semibold text-primary-700 hover:underline">{job.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>{job.employmentType.replace('_', ' ')}</span>
                            <span>&bull;</span>
                            <span>{job.isRemote ? 'Remote' : 'On-site'}</span>
                          </div>
                      </Link>
                      <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ job.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }`}>
                           {job.status}
                        </span>
                        <Link to={`/dashboard/agency/${agencyId}/jobs/${job.id}/pipeline`}>
                           <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />View Pipeline</Button>
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No Job Posts Yet"
                description="Get started by creating your first job posting to attract talent."
                action={{ text: 'Create New Job', to: '/dashboard/agency/jobs/create' }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPostsPage;