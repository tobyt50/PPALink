import { Briefcase, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/Modal';
import experienceService from '../../../services/experience.service';
import type { WorkExperience } from '../../../types/candidate';
import { WorkExperienceFormModal, type WorkExperienceFormValues } from '../forms/WorkExperienceForm';

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  isOwner: boolean;
  refetchProfile?: () => void; // Callback to refetch the main profile data
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

const WorkExperienceSection = ({ experiences, isOwner, refetchProfile }: WorkExperienceSectionProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<WorkExperience | null>(null);

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
      loading: selectedExperience ? 'Updating...' : 'Adding...',
      success: () => {
        refetchProfile?.();
        setIsFormOpen(false);
        return `Experience ${selectedExperience ? 'updated' : 'added'} successfully!`;
      },
      error: (err) => err.response?.data?.message || 'An error occurred.',
    });
  };

  const handleDelete = async () => {
    if (!selectedExperience) return;

    await toast.promise(experienceService.deleteWorkExperience(selectedExperience.id), {
      loading: 'Deleting...',
      success: () => {
        refetchProfile?.();
        setIsDeleteModalOpen(false);
        return 'Experience deleted successfully.';
      },
      error: (err) => err.response?.data?.message || 'An error occurred.',
    });
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
      />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Work Experience</h2>
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={() => openFormModal()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
            </Button>
          )}
        </div>
        <div className="mt-4 space-y-6">
          {experiences && experiences.length > 0 ? (
            experiences.map((exp) => (
              <div key={exp.id} className="flex">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"><Briefcase className="h-5 w-5 text-gray-500" /></div>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-semibold text-gray-900">{exp.title}</p>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-400">{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : '')}</p>
                  {exp.description && <p className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">{exp.description}</p>}
                </div>
                {isOwner && (
                  <div className="flex-shrink-0 space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openFormModal(exp)}>Edit</Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteModal(exp)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No work experience has been added yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkExperienceSection;