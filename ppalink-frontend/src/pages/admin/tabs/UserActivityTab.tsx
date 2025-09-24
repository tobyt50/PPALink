import { ArrowRight, FilePlus, LogIn, PenSquare } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import useFetch from '../../../hooks/useFetch';
import type { ActivityLog } from '../../../types/user';

// A map to associate action names with icons and colors for a richer UI
const actionDetails = {
  'user.login': { icon: LogIn, color: 'text-gray-500' },
  'job.create': { icon: FilePlus, color: 'text-green-500' },
  'job.update': { icon: PenSquare, color: 'text-blue-500' },
  'job.delete': { icon: PenSquare, color: 'text-red-500' },
  'application.submit': { icon: ArrowRight, color: 'text-purple-500' },
  'application.add_candidate': { icon: ArrowRight, color: 'text-indigo-500' },
  'application.pipeline_move': { icon: ArrowRight, color: 'text-yellow-500' },
  'application.update_notes': { icon: PenSquare, color: 'text-gray-500' },
  default: { icon: LogIn, color: 'text-gray-500' }
};

// Helper to generate a human-readable description from the log data
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
  const { data: logs, isLoading } = useFetch<ActivityLog[]>(
    userId ? `/admin/users/${userId}/activity` : null
  );

  return (
    <div className="flow-root">
      {isLoading && <p>Loading activity...</p>}
      <ul role="list" className="-mb-8">
        {logs?.map((log, logIdx) => {
          const { icon: Icon, color } = actionDetails[log.action as keyof typeof actionDetails] || actionDetails.default;
          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== logs.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${color}`}>
                      <Icon className="h-5 w-5 text-white bg-current rounded-full p-0.5" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-700">{formatActionDetails(log)}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
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