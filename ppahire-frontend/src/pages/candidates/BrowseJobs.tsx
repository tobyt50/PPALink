import { Briefcase, Building, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import type { Position } from '../../types/job';

// A reusable card to display a single job posting
const JobCard = ({ job }: { job: Position }) => (
  <Link to={`/jobs/${job.id}/details`} className="block p-4 border border-gray-200 bg-white rounded-lg transition-shadow hover:shadow-md">
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-grow">
            <p className="font-semibold text-primary-700">{job.title}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center"><Building className="h-4 w-4 mr-1.5" />{job.agency?.name}</span>
                <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1.5" />{job.employmentType}</span>
            </div>
        </div>
        <div className="flex-shrink-0">
             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${job.isRemote ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {job.isRemote ? 'Remote' : 'On-site'}
             </span>
        </div>
    </div>
  </Link>
);


const BrowseJobsPage = () => {
  const { data: jobs, isLoading, error } = useFetch<Position[]>('/public/jobs');

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Browse Open Jobs</h1>
        <p className="mt-1 text-gray-500">Find your next opportunity.</p>
      </div>

      {/* Search Bar - Future Enhancement */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search by title, company, or skill (coming soon)..."
            className="block w-full rounded-md border-gray-300 pl-10 shadow-sm sm:text-sm"
            disabled
          />
        </div>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {error && <div className="text-center text-red-500 p-8">Could not load job listings.</div>}

      {!isLoading && !error && jobs && (
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map(job => <JobCard key={job.id} job={job} />)
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No Open Jobs at the Moment"
              description="There are currently no public job postings available. Please check back later!"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseJobsPage;