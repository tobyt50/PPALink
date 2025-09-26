import { ArrowRight, FilePlus, LogIn, PenSquare, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import useFetch from '../../../hooks/useFetch';
import type { ActivityLog } from '../../../types/user';

const actionDetails = {
  'user.login': { icon: LogIn, color: 'bg-gray-400' },
  'job.create': { icon: FilePlus, color: 'bg-green-500' },
  'job.update': { icon: PenSquare, color: 'bg-blue-500' },
  'job.delete': { icon: PenSquare, color: 'bg-red-500 dark:bg-red-500' },
  'application.submit': { icon: ArrowRight, color: 'bg-primary-600' },
  'application.add_candidate': { icon: ArrowRight, color: 'bg-indigo-500' },
  'application.pipeline_move': { icon: ArrowRight, color: 'bg-yellow-500' },
  'application.update_notes': { icon: PenSquare, color: 'bg-gray-400' },
  default: { icon: LogIn, color: 'bg-gray-400' }
};

const formatActionDetails = (log: ActivityLog) => {
    switch (log.action) {
        case 'user.login': return 'User logged in.';
        case 'job.create': return `Created job: ${log.details?.jobTitle}`;
        case 'job.update': return `Updated job: ${log.details?.jobTitle}`;
        case 'job.delete': return `Deleted job: ${log.details?.jobTitle}`;
        case 'application.submit': return 'Submitted an application.';
        case 'application.pipeline_move': return `Moved application from ${log.details?.fromStatus} to ${log.details?.toStatus}.`;
        case 'application.update_notes': return 'Updated internal notes on an application.';
        default: return 'Performed an action.';
    }
}

const UserActivityTab = () => {
  const { userId } = useParams<{ userId: string }>();
  const { data: logs, isLoading, error } = useFetch<ActivityLog[]>(
    userId ? `/admin/users/${userId}/activity` : null
  );

  if (isLoading) {
    return (
        <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 dark:text-red-400 p-8">Could not load activity log.</p>;
  }
  
  if (!logs || logs.length === 0) {
    return <p className="text-center text-gray-500 dark:text-zinc-400 p-8">No activity recorded for this user yet.</p>;
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {logs?.map((log, logIdx) => {
          const { icon: Icon, color } = actionDetails[log.action as keyof typeof actionDetails] || actionDetails.default;
          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== logs.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-zinc-800" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3 items-center">
                  <div>
                    <span className={`h-8 w-8 rounded-full ${color} flex items-center justify-center ring-8 ring-white dark:ring-white/10`}>
                      <Icon className="h-5 w-5 text-white dark:text-zinc-100" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-800 dark:text-zinc-100">{formatActionDetails(log)}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-zinc-400">
                      <time dateTime={log.createdAt}>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserActivityTab;
