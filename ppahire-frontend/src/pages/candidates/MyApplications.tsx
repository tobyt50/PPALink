import { Briefcase, Building, Calendar, Loader2, PackageSearch } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import type { Application } from '../../types/application';
import { ApplicationCardSkeleton } from './skeletons/ApplicationCardSkeleton';

const ApplicationStatusBadge = ({ status }: { status: Application['status'] }) => {
  const statusStyles: Record<Application['status'], string> = {
    APPLIED: 'bg-gray-100 text-gray-800',
    REVIEWING: 'bg-blue-100 text-blue-800',
    INTERVIEW: 'bg-yellow-100 text-yellow-800',
    OFFER: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

const MyApplicationsPage = () => {
  const { data: applications, isLoading, error } = useFetch<Application[]>('/candidates/me/applications');

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">My Applications</h1>
        <p className="mt-1 text-gray-500">Track the status of your job applications.</p>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {error && <div className="text-center text-red-500 p-8">Could not load your applications.</div>}
      
      {!error && (
        <div className="rounded-lg border bg-white shadow-sm">
          {isLoading ? (
            // 👇 2. SHOW A LIST OF SKELETONS WHILE LOADING 👇
            <ul>
              <ApplicationCardSkeleton />
              <ApplicationCardSkeleton />
              <ApplicationCardSkeleton />
            </ul>
          ) : applications && applications.length > 0 ? (
            <ul>
              {applications.map((app, index) => (
                <li key={app.id} className={`${index < applications.length - 1 ? 'border-b' : ''}`}>
                  {/* The actual list item rendering is now inside the li */}
                  <div className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="font-semibold text-primary-700">{app.position?.title}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center"><Building className="h-4 w-4 mr-1.5" />{app.position?.agency?.name}</span>
                        <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1.5" />{app.position?.employmentType}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end flex-shrink-0">
                       <ApplicationStatusBadge status={app.status} />
                       <p className="text-xs text-gray-400 mt-2 flex items-center">
                         <Calendar className="h-3 w-3 mr-1" />
                         Applied on {new Date(app.createdAt).toLocaleDateString()}
                       </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No Applications Found"
              description="Your applications will appear here once an agency adds you to a job or you apply for one."
              action={{ text: 'Browse Open Jobs', to: '/dashboard/candidate/jobs/browse' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;