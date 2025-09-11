import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import jobService from '../../services/job.service';
import type { Position } from '../../types/job';
import JobForm, { type JobFormValues } from './JobForm';

const EditJobPage = () => {
  const navigate = useNavigate();
  // Get both agencyId and jobId directly from the URL.
  const { agencyId, jobId } = useParams<{ agencyId: string; jobId: string }>();

  // Fetch the existing job data using the IDs from the URL
  const { data: job, isLoading, error } = useFetch<Position>(
    agencyId && jobId ? `/agencies/${agencyId}/jobs/${jobId}` : null
  );

  const handleUpdateJob = async (data: JobFormValues) => {
    if (!agencyId || !jobId) {
      toast.error('Could not verify agency and job ID from the URL.');
      return;
    }
    
    try {
      await jobService.updateJob(agencyId, jobId, data);
      toast.success('Job posting updated successfully!');
      navigate(`/dashboard/agency/jobs`); // Go back to the list after update
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update job posting.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Edit Job Posting</h1>
        <p className="mt-1 text-gray-500">Make changes to your open position.</p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <div className="text-center text-red-500 p-8">Failed to load job data.</div>}
        {/* Render the form only when job data is available */}
        {job && (
          <JobForm
            initialData={job}
            onSubmit={handleUpdateJob}
            submitButtonText="Save Changes"
          />
        )}
      </div>
    </div>
  );
};

export default EditJobPage;