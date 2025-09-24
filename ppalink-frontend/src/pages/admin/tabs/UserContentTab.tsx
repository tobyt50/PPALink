import { Briefcase, Package } from 'lucide-react';
import { useParams } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import type { Application } from '../../../types/application';
import type { Position } from '../../../types/job';
import type { User } from '../../../types/user';

// Component to display a list of jobs for an Agency
const JobsList = ({ userId }: { userId: string }) => {
    const { data: jobs, isLoading } = useFetch<Position[]>(`/admin/users/${userId}/jobs`);
    if (isLoading) return <p>Loading jobs...</p>;
    if (!jobs || jobs.length === 0) return <p className="text-gray-500">This agency has not posted any jobs.</p>;

    return (
        <ul className="divide-y rounded-md border">
            {jobs.map(job => (
                <li key={job.id} className="p-3">
                    <p className="font-semibold text-gray-800">{job.title}</p>
                    <p className="text-sm text-gray-500">Status: {job.status} | Visibility: {job.visibility}</p>
                </li>
            ))}
        </ul>
    );
};

// Component to display a list of applications for a Candidate
const ApplicationsList = ({ userId }: { userId: string }) => {
    const { data: applications, isLoading } = useFetch<Application[]>(`/admin/users/${userId}/applications`);
    if (isLoading) return <p>Loading applications...</p>;
    if (!applications || applications.length === 0) return <p className="text-gray-500">This candidate has not submitted any applications.</p>;
    
    return (
        <ul className="divide-y rounded-md border">
            {applications.map(app => (
                <li key={app.id} className="p-3">
                    <p className="font-semibold text-gray-800">Applied for: {app.position.title}</p>
                    <p className="text-sm text-gray-500">
                        at {app.position.agency ? app.position.agency.name : 'Unknown Agency'} | Status: {app.status}
                    </p>
                </li>
            ))}
        </ul>
    );
};


const UserContentTab = ({ user }: { user: User }) => {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) return null;

  if (user.role === 'AGENCY') {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Briefcase className="mr-2 h-5 w-5" /> Jobs Posted
        </h3>
        <JobsList userId={userId} />
      </div>
    );
  }

  if (user.role === 'CANDIDATE') {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Package className="mr-2 h-5 w-5" /> Applications Submitted
        </h3>
        <ApplicationsList userId={userId} />
      </div>
    );
  }

  return <p className="text-gray-500">This user has no applicable content to display.</p>;
};

export default UserContentTab;