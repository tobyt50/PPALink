import { Briefcase, Loader2, Package } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import type { Application } from '../../../types/application';
import type { Position } from '../../../types/job';
import type { User } from '../../../types/user';

const JobsList = ({ userId }: { userId: string }) => {
    const { data: jobs, isLoading, error } = useFetch<Position[]>(`/admin/users/${userId}/jobs`);

    if (isLoading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>;
    if (error) return <p className="text-center text-red-600 dark:text-red-400 p-8">Could not load jobs.</p>;
    if (!jobs || jobs.length === 0) return <p className="text-center text-gray-500 dark:text-zinc-400 p-8">This agency has not posted any jobs.</p>;

    return (
        <ul className="divide-y divide-gray-100">
            {jobs.map(job => (
                <li key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <Link to={`/admin/jobs/${job.id}`} className="block">
                        <p className="font-semibold text-primary-600 dark:text-primary-400">{job.title}</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">Status: {job.status} | Visibility: {job.visibility}</p>
                    </Link>
                </li>
            ))}
        </ul>
    );
};

const ApplicationsList = ({ userId }: { userId: string }) => {
    const { data: applications, isLoading, error } = useFetch<Application[]>(`/admin/users/${userId}/applications`);
    
    if (isLoading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>;
    if (error) return <p className="text-center text-red-600 dark:text-red-400 p-8">Could not load applications.</p>;
    if (!applications || applications.length === 0) return <p className="text-center text-gray-500 dark:text-zinc-400 p-8">This candidate has not submitted any applications.</p>;
    
    return (
        <ul className="divide-y divide-gray-100">
            {applications.map(app => (
                <li key={app.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <Link to={`/admin/jobs/${app.position.id}`} className="block">
                        <p className="font-semibold text-primary-600 dark:text-primary-400">Applied for: {app.position.title}</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                            at {app.position.agency ? app.position.agency.name : 'Unknown Agency'} | Status: {app.status}
                        </p>
                    </Link>
                </li>
            ))}
        </ul>
    );
};


const UserContentTab = ({ user }: { user: User }) => {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) return null;

  const Card = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType, children: React.ReactNode }) => (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-50 flex items-center">
            <Icon className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" /> {title}
        </h3>
      </div>
      <div>{children}</div>
    </div>
  );

  if (user.role === 'AGENCY') {
    return <Card title="Jobs Posted" icon={Briefcase}><JobsList userId={userId} /></Card>;
  }

  if (user.role === 'CANDIDATE') {
    return <Card title="Applications Submitted" icon={Package}><ApplicationsList userId={userId} /></Card>;
  }

  return <p className="text-gray-500 dark:text-zinc-400 text-center p-8">This user has no applicable content to display.</p>;
};

export default UserContentTab;

