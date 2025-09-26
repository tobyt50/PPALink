import {
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Edit,
  Globe,
  Loader2,
  MapPin,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { ConfirmationModal } from "../../components/ui/Modal";
import { useDataStore } from "../../context/DataStore";
import useFetch from "../../hooks/useFetch";
import jobService from "../../services/job.service";
import type { Position } from "../../types/job";

const DetailField = ({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}) => (
  <div className="flex items-start">
    <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-zinc-500 mt-1" />
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</p>
      <div className="mt-1 text-base text-gray-800 dark:text-zinc-100">
        {children || value || "N/A"}
      </div>
    </div>
  </div>
);

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { agencyId, jobId } = useParams<{ agencyId: string; jobId: string }>();

  const { data: job, isLoading, error } = useFetch<Position>(
    agencyId && jobId ? `/agencies/${agencyId}/jobs/${jobId}` : null
  );

  const { states } = useDataStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteJob = async () => {
    if (!agencyId || !jobId) {
      toast.error("Could not verify agency and job ID.");
      return;
    }

    try {
      await jobService.deleteJob(agencyId, jobId);
      toast.success("Job posting deleted successfully.");
      navigate("/dashboard/agency/jobs");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete job posting."
      );
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }
  if (error || !job) {
    return (
      <div className="text-center text-red-500 p-8">
        Error loading job details.
      </div>
    );
  }

  const locationState = job.stateId
    ? states.find((s) => s.id === job.stateId)?.name
    : undefined;

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteJob}
        title="Delete Job Posting"
        description="Are you sure you want to permanently delete this job posting? This action cannot be undone."
        confirmButtonText="Delete"
        isDestructive={true}
      />

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back link */}
        <div>
          <Link
            to="/dashboard/agency/jobs"
            className="flex items-center text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to All Jobs
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 dark:text-zinc-400 mt-2">
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  {job.employmentType}
                </span>
                {!job.isRemote && locationState && (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {locationState}
                  </span>
                )}
                {job.isRemote && (
                  <span className="flex items-center">
                    <Globe className="h-4 w-4 mr-1.5" />
                    Remote
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Link to={`/dashboard/agency/${agencyId}/jobs/${job.id}/edit`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
              </Link>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-lg"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="md:col-span-1 space-y-6">
              <DetailField
                icon={Wallet}
                label="Salary Range"
                value={
                  job.minSalary && job.maxSalary
                    ? `₦${job.minSalary.toLocaleString()} - ₦${job.maxSalary.toLocaleString()}`
                    : "Not specified"
                }
              />
              <DetailField icon={Globe} label="Visibility" value={job.visibility} />
              <DetailField icon={CheckCircle} label="Status">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    job.status === "OPEN"
                      ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100"
                  }`}
                >
                  {job.status}
                </span>
              </DetailField>
              <DetailField
                icon={Calendar}
                label="Date Posted"
                value={new Date(job.createdAt).toLocaleDateString()}
              />
            </div>

            {/* Right column */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  Job Description
                </h2>
                <div className="prose prose-sm max-w-none mt-2 text-gray-600 dark:text-zinc-300 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(job.skills) && job.skills.length > 0 ? (
                    job.skills.map((positionSkill) => (
                      <span
                        key={positionSkill.skill.id}
                        className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-950/60 px-3 py-1 text-sm font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-100 transition"
                      >
                        <Tag className="h-4 w-4 mr-1.5" />
                        {positionSkill.skill.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      No specific skills listed.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetailsPage;


