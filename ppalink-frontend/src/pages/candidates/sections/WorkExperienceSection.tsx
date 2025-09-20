import { Briefcase, Edit, PlusCircle, Trash2 } from 'lucide-react';
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
  refetchProfile?: () => void;
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
      loading: selectedExperience ? 'Updating experience...' : 'Adding experience...',
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
      loading: 'Deleting experience...',
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

      {/* Replicated Card Styling */}
      <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-primary-600 text-primary-600 hover:bg-primary-50"
              onClick={() => openFormModal()}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          )}
        </div>
        
        {/* Card Body */}
        <div className="p-6">
          {experiences && experiences.length > 0 ? (
            <ul className="space-y-6">
              {experiences.map((exp) => (
                <li key={exp.id} className="relative flex items-start pr-16">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center ring-4 ring-white">
                      <Briefcase className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{exp.title}</p>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : '')}</p>
                    {exp.description && <p className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                  {isOwner && (
                    <div className="absolute top-0 right-0 flex items-center -space-x-1">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600" onClick={() => openFormModal(exp)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600" onClick={() => openDeleteModal(exp)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center text-gray-500 py-4">No work experience has been added yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkExperienceSection;