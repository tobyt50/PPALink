import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import jobService from "../../services/job.service";
import type { Position } from "../../types/job";
import JobForm, { type JobFormValues } from "./forms/JobForm";

const EditJobPage = () => {
  const navigate = useNavigate();
  const { agencyId, jobId } = useParams<{ agencyId: string; jobId: string }>();

  const { data: job, isLoading, error } = useFetch<Position>(
    agencyId && jobId ? `/agencies/${agencyId}/jobs/${jobId}` : null
  );

  const handleUpdateJob = async (data: JobFormValues) => {
    if (!agencyId || !jobId) {
      toast.error("Could not verify agency and job ID from the URL.");
      return;
    }

    try {
      await jobService.updateJob(agencyId, jobId, data);
      toast.success("Job posting updated successfully!");
      navigate("/dashboard/agency/jobs");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update job posting."
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 text-center">
          <p className="text-sm text-red-500 font-medium">
            Failed to load job data for editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Edit Job Posting
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Make changes to your open position details.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
        <JobForm
          initialData={job}
          onSubmit={handleUpdateJob}
          submitButtonText="Save Changes"
        />
      </div>
    </div>
  );
};

export default EditJobPage;


