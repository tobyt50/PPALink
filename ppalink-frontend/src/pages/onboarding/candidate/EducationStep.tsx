import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { ConfirmationModal } from "../../../components/ui/Modal";
import useFetch from "../../../hooks/useFetch";
import candidateService from "../../../services/candidate.service";
import type { CandidateProfile, Education } from "../../../types/candidate";
import {
  EducationFormModal,
  type EducationFormValues,
} from "../../candidates/forms/EducationForm";
import { OnboardingProgressBar } from "./SummaryStep";
import { motion } from "framer-motion";

type OnboardingContext = { profileType?: "NYSC" | "PROFESSIONAL" };

const EducationItem = ({
  edu,
  onEdit,
  onDelete,
}: {
  edu: Education;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
    className="flex justify-between items-start p-4 border dark:border-zinc-800 rounded-xl bg-gray-50/70 dark:bg-zinc-800/30"
  >
    <div>
      <p className="font-semibold text-gray-800 dark:text-zinc-100">
        {edu.degree} in {edu.field}
      </p>
      <p className="text-sm text-gray-600 dark:text-zinc-300">
        {edu.institution}
      </p>
      <p className="text-xs text-gray-400 dark:text-zinc-500">
        {new Date(edu.startDate).getFullYear()} -{" "}
        {new Date(edu.endDate).getFullYear()}
      </p>
    </div>
    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-950/40"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-500 dark:hover:bg-red-950/40"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </motion.div>
);

const EducationStep = () => {
  const navigate = useNavigate();
  const { profileType } = useOutletContext<OnboardingContext>();
  const {
    data: profile,
    isLoading,
    refetch,
  } = useFetch<CandidateProfile>("/candidates/me");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    eduId: string | null;
  }>({ isOpen: false, eduId: null });

  const openModal = (edu?: Education) => {
    setEditingEdu(edu || null);
    setIsModalOpen(true);
  };
  const openDeleteModal = (eduId: string) =>
    setDeleteModalState({ isOpen: true, eduId });
  const closeDeleteModal = () =>
    setDeleteModalState({ isOpen: false, eduId: null });

  const handleDelete = async () => {
    if (!deleteModalState.eduId) return;
    await toast.promise(
      candidateService.deleteEducation(deleteModalState.eduId),
      {
        loading: "Deleting...",
        success: "Record deleted successfully.",
        error: "Failed to delete record.",
      }
    );
    refetch();
    closeDeleteModal();
  };

  const handleFormSubmit = async (data: EducationFormValues) => {
    const payload = {
      ...data,
      field: data.field || null,
      grade: data.grade || null,
    };
    const actionPromise = editingEdu
      ? candidateService.updateEducation(editingEdu.id, payload)
      : candidateService.addEducation(payload);

    await toast.promise(actionPromise, {
      loading: editingEdu ? "Saving changes..." : "Adding record...",
      success: `Education ${editingEdu ? "updated" : "added"} successfully!`,
      error: (err) => err.response?.data?.message || "Failed to save record.",
    });
    refetch();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (profileType === "PROFESSIONAL") {
      navigate("/onboarding/candidate/skills", { replace: true });
    }
  }, [profileType, navigate]);

  if (profileType === "PROFESSIONAL") {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin h-6 w-6 text-primary-500" />
      </div>
    );
  }

  const handleNextStep = () => navigate("/onboarding/candidate/skills");

  return (
    <>
      <EducationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingEdu}
      />
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Education Record"
        description="Are you sure you want to permanently remove this education record?"
        confirmButtonText="Delete"
        isDestructive
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full"
      >
        <OnboardingProgressBar step={3} totalSteps={5} />
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Education History
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Add your degrees, certificates, and other qualifications.
          </p>
        </div>

        <div className="space-y-4 mb-6 min-h-[6rem]">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin h-6 w-6 text-primary-500" />
            </div>
          ) : profile?.education?.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400 py-4">
              No education records added yet.
            </p>
          ) : (
            profile?.education?.map((edu) => (
              <EducationItem
                key={edu.id}
                edu={edu}
                onEdit={() => openModal(edu)}
                onDelete={() => openDeleteModal(edu.id)}
              />
            ))
          )}
        </div>

        <div className="text-center mb-8">
          <Button variant="outline" onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" /> Add Education
          </Button>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/onboarding/candidate/work-experience")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNextStep}>
            Save & Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default EducationStep;
