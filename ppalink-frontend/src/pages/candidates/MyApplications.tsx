import { ArrowRight, Briefcase, Building, Calendar, PackageSearch, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import type { Application } from '../../types/application';
import { ApplicationCardSkeleton } from './skeletons/ApplicationCardSkeleton';
import { Button } from '../../components/ui/Button';

// Polished Application Status Badge (replicated from CandidateDashboard)
const ApplicationStatusBadge = ({ status }: { status: Application['status'] }) => {
  const statusStyles: Record<Application['status'], { text: string; className: string }> = {
    APPLIED: { text: 'Applied', className: 'bg-gray-100 text-gray-700' },
    REVIEWING: { text: 'In Review', className: 'bg-indigo-100 text-indigo-700' },
    INTERVIEW: { text: 'Interview', className: 'bg-amber-100 text-amber-700' },
    OFFER: { text: 'Offer', className: 'bg-green-100 text-green-700' },
    REJECTED: { text: 'Rejected', className: 'bg-red-100 text-red-700' },
    WITHDRAWN: { text: 'Withdrawn', className: 'bg-pink-100 text-pink-700' },
  };

  const { text, className } = statusStyles[status] ?? { text: status, className: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${className}`}>
      {text}
    </span>
  );
};

const MyApplicationsPage = () => {
  const { data: applications, isLoading, error } = useFetch<Application[]>('/candidates/me/applications');

  return (
    <div className="space-y-5">
      {/* Header - Replicated from AgencyDashboard */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            My Applications
          </h1>
          <p className="mt-2 text-gray-600">Track the status of all your job applications.</p>
        </div>
         <Link to="/dashboard/candidate/jobs/browse">
          <Button
            size="lg"
            className="rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition"
          >
            <Search className="mr-2 h-5 w-5" />
            Find a Job
          </Button>
        </Link>
      </div>

      {/* Replicated Card Styling */}
      <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
        {isLoading ? (
          <ul className="divide-y divide-gray-100">
            <ApplicationCardSkeleton />
            <ApplicationCardSkeleton />
            <ApplicationCardSkeleton />
          </ul>
        ) : error ? (
            <div className="p-8 text-center text-red-600">Could not load your applications. Please try again later.</div>
        ) : applications && applications.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {applications.map((app) => (
              <li key={app.id}>
                {/* Polished and Interactive List Item */}
                <div className="group block px-5 py-4 transition-all hover:bg-gradient-to-r hover:from-primary-50 hover:to-green-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="font-semibold text-primary-600 group-hover:text-primary-600">{app.position?.title}</p>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <span className="flex items-center"><Building className="h-4 w-4 mr-1.5" />{app.position?.agency?.name}</span>
                        <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1.5" />{app.position?.employmentType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 self-start sm:self-center">
                      <div className="flex flex-col items-start sm:items-end">
                        <ApplicationStatusBadge status={app.status} />
                        <p className="text-xs text-gray-400 mt-2 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                       <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 transition-colors hidden sm:block" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={PackageSearch}
              title="No Applications Found"
              description="Your applications will appear here once you apply for a job."
              action={{ text: 'Browse Open Jobs', to: '/dashboard/candidate/jobs/browse' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;