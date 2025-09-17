import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import jobService from '../../services/job.service';
import type { Agency } from '../../types/agency';
import JobForm, { type JobFormValues } from './forms/JobForm';

const CreateJobPage = () => {
  const navigate = useNavigate();
  // Fetch the user's agency profile to get their agencyId
  const { data: agency, isLoading, error } = useFetch<Agency>('/agencies/me');

  const handleCreateJob = async (data: JobFormValues) => {
    if (!agency?.id) {
      toast.error("Could not find your agency ID. Please ensure your profile is complete.");
      return;
    }

    try {
      await jobService.createJob(agency.id, data);
      toast.success('Job posting created successfully!');
      navigate('/dashboard/agency/jobs');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create job posting.');
    }
  };

  // Show a loading state while we fetch the agency ID
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Handle case where agency data fails to load
  if (error || !agency) {
     return <div className="text-center text-red-500 p-8">Could not load your agency information to create a job.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Create a New Job Posting</h1>
        <p className="mt-1 text-gray-500">Describe the role and the ideal candidate you're looking for.</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <JobForm onSubmit={handleCreateJob} />
      </div>
    </div>
  );
};

export default CreateJobPage;