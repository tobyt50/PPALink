import { ArrowRight, Briefcase, Calendar, PackageSearch, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import type { Application, ApplicationStatus } from '../../types/application';
import { ApplicationCardSkeleton } from './skeletons/ApplicationCardSkeleton';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import type { Agency } from '../../types/agency';

const ApplicationStatusBadge = ({ status }: { status: Application['status'] }) => {
  const labelMap: Record<ApplicationStatus, { text: string; color: string }> = {
    APPLIED: { text: 'Applied', color: 'text-gray-700 dark:text-zinc-200 bg-gray-100 dark:bg-zinc-800' },
    REVIEWING: { text: 'In Review', color: 'text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60' },
    INTERVIEW: { text: 'Interview', color: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60' },
    OFFER: { text: 'Offer', color: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/60' },
    REJECTED: { text: 'Rejected', color: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60' },
    WITHDRAWN: { text: 'Withdrawn', color: 'text-pink-700 dark:text-pink-400 bg-pink-100 dark:bg-pink-950/60' },
    HIRED: { text: 'Hired', color: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60' },
  };

  const { text, color } = labelMap[status] ?? { text: status, className: 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
};

const MyApplicationsPage = () => {
  const { data: applications, isLoading, error } = useFetch<Application[]>('/candidates/me/applications');

  return (
    <div className="space-y-5">
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          My Applications
        </h1>
         <Link to="/dashboard/candidate/jobs/browse">
          <Button
            size="sm"
            className="rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
          >
            <Search className="mr-2 h-5 w-5" />
            Find a Job
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        {isLoading ? (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            <ApplicationCardSkeleton />
            <ApplicationCardSkeleton />
            <ApplicationCardSkeleton />
          </ul>
        ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">Could not load your applications. Please try again later.</div>
        ) : applications && applications.length > 0 ? (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {applications.map((app) => (
              <li key={app.id}>
                {/* --- THIS IS THE DEFINITIVE FIX --- */}
                {/* The Link now points to the dynamic status dispatcher route */}
                <Link
                  to={`/dashboard/candidate/applications/${app.id}/status`}
                  className="group block px-5 py-4 transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60"
                >
                {/* --- END OF FIX --- */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center flex-grow">
                      <Avatar user={{ role: 'AGENCY', ownedAgencies: [app.position?.agency as Agency] }} size="md" />
                      <div className="ml-3 flex-grow">
                        <p className="font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">{app.position?.title}</p>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-zinc-400 mt-1">
                          <span className="text-sm">{app.position?.agency?.name}</span>
                          <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1.5" />{app.position?.employmentType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 self-start sm:self-center">
                      <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end">
                        <ApplicationStatusBadge status={app.status} />
                        <p className="text-xs text-gray-400 dark:text-zinc-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                       <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 transition-colors hidden sm:block" />
                    </div>
                  </div>
                </Link>
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