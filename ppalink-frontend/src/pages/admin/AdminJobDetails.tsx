import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  Edit,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  MapPin,
  Tag,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ConfirmationModal } from "../../components/ui/Modal";
import useFetch from "../../hooks/useFetch";
import adminService from "../../services/admin.service";
import type { Position } from "../../types/job";
import { useLocationNames } from "../../hooks/useLocationNames";

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
      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
        {label}
      </p>
      <div className="mt-1 text-base text-gray-800 dark:text-zinc-100">
        {children || value || "N/A"}
      </div>
    </div>
  </div>
);

const AdminJobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();

  const {
    data: job,
    isLoading,
    error,
    refetch,
  } = useFetch<Position>(jobId ? `/admin/jobs/${jobId}` : null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: "unpublish" | "republish" | null;
  }>({ isOpen: false, action: null });

  const { fullLocationString, isLoading: isLoadingLocation } = useLocationNames(
    job?.countryId,
    job?.regionId,
    job?.cityId
  );

  const openModal = (action: "unpublish" | "republish") => {
    setModalState({ isOpen: true, action });
  };
  const closeModal = () => setModalState({ isOpen: false, action: null });

  const handleModalConfirm = async () => {
    if (!jobId || !modalState.action) return;

    const isUnpublishing = modalState.action === "unpublish";
    const actionPromise = isUnpublishing
      ? adminService.adminUnpublishJob(jobId)
      : adminService.adminRepublishJob(jobId);
    const successMessage = `Job has been ${
      isUnpublishing ? "unpublished" : "republished"
    }.`;

    await toast.promise(actionPromise, {
      loading: `${isUnpublishing ? "Unpublishing" : "Republishing"} job...`,
      success: () => {
        refetch();
        closeModal();
        return successMessage;
      },
      error: (err) => {
        closeModal();
        return (
          err.response?.data?.message || `Failed to ${modalState.action} job.`
        );
      },
    });
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

  const agency = job.agency;
  const isPrivate = job.visibility === "PRIVATE";

  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
        title={isPrivate ? "Republish Job Posting" : "Unpublish Job Posting"}
        description={
          isPrivate
            ? "Are you sure? This will make the job visible to all candidates on the public job board."
            : "Are you sure? This will make the job invisible to candidates."
        }
        confirmButtonText={isPrivate ? "Republish" : "Unpublish"}
        isDestructive={!isPrivate}
      />

      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link
            to="/admin/jobs"
            className="flex items-center text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to All Jobs
          </Link>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 dark:text-zinc-400 mt-2">
                <span className="text-sm">by {agency?.name}</span>
                {agency?.cacVerified && (
                  <span className="flex items-center text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/60 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    CAC Verified
                  </span>
                )}
                {agency?.domainVerified && !agency.cacVerified && (
                  <span className="flex items-center text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Domain
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Link to={`/admin/jobs/${job.id}/edit`}>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              {isPrivate ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openModal("republish")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Republish
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openModal("unpublish")}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <DetailField
                icon={Globe}
                label="Visibility"
                value={job.visibility}
              />
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
              <DetailField icon={MapPin} label="Location">
                {job.isRemote
                  ? "Remote"
                  : isLoadingLocation
                  ? "Loading..."
                  : fullLocationString || "Not specified"}
              </DetailField>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  Job Description
                </h2>
                <div className="prose prose-sm max-w-none mt-2 text-gray-600 dark:text-zinc-300 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.skills && job.skills.length > 0 ? (
                    job.skills.map((positionSkill) => (
                      <span
                        key={positionSkill.skill.id}
                        className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-950/60 px-3 py-1 text-sm font-medium text-primary-700 dark:text-primary-300"
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

export default AdminJobDetailsPage;
