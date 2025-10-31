import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import jobService from "../../services/job.service";
import type { Agency } from "../../types/agency";
import JobForm, { type JobFormValues } from "./forms/JobForm";

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { data: agency, isLoading, error } = useFetch<Agency>("/agencies/me");

  const handleCreateJob = async (data: JobFormValues) => {
    if (!agency?.id) {
      toast.error(
        "Could not find your agency ID. Please ensure your profile is complete."
      );
      return;
    }

    try {
      await jobService.createJob(agency.id, data);
      toast.success("Job posting created successfully!");
      navigate("/dashboard/agency/jobs");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create job posting."
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
  if (error || !agency) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 text-center">
          <p className="text-sm text-red-500 font-medium">
            Could not load your agency information to create a job.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Create Job Posting
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Describe the role and the ideal candidate you're looking for.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
        <JobForm onSubmit={handleCreateJob} />
      </div>
    </div>
  );
};

export default CreateJobPage;


