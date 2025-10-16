import { Briefcase, Edit, PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { ConfirmationModal } from "../../../components/ui/Modal";
import experienceService from "../../../services/experience.service";
import agencyService from "../../../services/agency.service";
import type { WorkExperience } from "../../../types/candidate";
import {
  WorkExperienceFormModal,
  type WorkExperienceFormValues,
} from "../forms/WorkExperienceForm";

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  isOwner: boolean;
  refetchProfile?: () => void;
  verifyingAgencyId?: string;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

const WorkExperienceSection = ({
  experiences,
  isOwner,
  refetchProfile,
  verifyingAgencyId,
}: WorkExperienceSectionProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<WorkExperience | null>(null);

  const [verifyTarget, setVerifyTarget] = useState<WorkExperience | null>(null);

  const handleVerifyConfirm = async () => {
    if (!verifyTarget) return;
    const verifyPromise = agencyService.issueWorkVerification(verifyTarget.id);
    await toast.promise(verifyPromise, {
      loading: "Issuing verification...",
      success: () => {
        refetchProfile?.();
        return "Work experience verified!";
      },
      error: (err) => err.response?.data?.message || "Verification failed.",
    });
    setVerifyTarget(null);
  };

  const openFormModal = (exp: WorkExperience | null = null) => {
    setSelectedExperience(exp);
    setIsFormOpen(true);
  };
  const openDeleteModal = (exp: WorkExperience) => {
    setSelectedExperience(exp);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: WorkExperienceFormValues) => {
    const action = selectedExperience
      ? experienceService.updateWorkExperience(selectedExperience.id, data)
      : experienceService.addWorkExperience(data);
    await toast.promise(action, {
      loading: selectedExperience
        ? "Updating experience..."
        : "Adding experience...",
      success: () => {
        refetchProfile?.();
        setIsFormOpen(false);
        return `Experience ${
          selectedExperience ? "updated" : "added"
        } successfully!`;
      },
      error: (err) => err.response?.data?.message || "An error occurred.",
    });
  };

  const handleDelete = async () => {
    if (!selectedExperience) return;
    await toast.promise(
      experienceService.deleteWorkExperience(selectedExperience.id),
      {
        loading: "Deleting experience...",
        success: () => {
          refetchProfile?.();
          setIsDeleteModalOpen(false);
          return "Experience deleted successfully.";
        },
        error: (err) => err.response?.data?.message || "An error occurred.",
      }
    );
  };

  return (
    <>
      <WorkExperienceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedExperience}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Work Experience"
        description="Are you sure you want to delete this work experience? This action cannot be undone."
        confirmButtonText="Delete"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={!!verifyTarget}
        onClose={() => setVerifyTarget(null)}
        onConfirm={handleVerifyConfirm}
        title="Verify Work Experience"
        description={`Are you sure you want to digitally sign and verify this work experience for the role of "${verifyTarget?.title}"? This action is permanent.`}
        confirmButtonText="Yes, Verify"
      />

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            Work Experience
          </h2>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50"
              onClick={() => openFormModal()}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          )}
        </div>

        <div className="p-6">
          {experiences && experiences.length > 0 ? (
            <ul className="space-y-6">
              {experiences.map((exp) => (
                <li key={exp.id} className="relative flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/60 flex items-center justify-center ring-4 ring-white dark:ring-zinc-900">
                      <Briefcase className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-zinc-100">
                          {exp.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-zinc-300">
                          {exp.company}
                        </p>
                      </div>
                      {isOwner && (
                        <div className="absolute top-0 right-0 flex items-center -space-x-1 sm:relative sm:top-auto sm:right-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400"
                            onClick={() => openFormModal(exp)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => openDeleteModal(exp)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 dark:text-zinc-500 mt-0.5">
                      {formatDate(exp.startDate)} -{" "}
                      {exp.isCurrent
                        ? "Present"
                        : exp.endDate
                        ? formatDate(exp.endDate)
                        : ""}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                    <div className="mt-3">
                      {exp.verification ? (
                        <div className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 px-2.5 py-1 text-xs font-semibold">
                          <ShieldCheck className="h-4 w-4 mr-1.5" />
                          Verified Experience
                        </div>
                      ) : (
                        verifyingAgencyId && (
                          <Button
                            size="sm"
                            onClick={() => setVerifyTarget(exp)}
                          >
                            Verify this Experience
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center text-gray-500 dark:text-zinc-400 py-4">
              No work experience has been added yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkExperienceSection;
