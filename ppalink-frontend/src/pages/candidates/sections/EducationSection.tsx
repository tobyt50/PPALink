import { GraduationCap, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/Modal';
import experienceService from '../../../services/experience.service';
import type { Education } from '../../../types/candidate';
import { EducationFormModal, type EducationFormValues } from '../forms/EducationForm';

interface EducationSectionProps {
  educationHistory: Education[];
  isOwner: boolean;
  refetchProfile?: () => void;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

const EducationSection = ({ educationHistory, isOwner, refetchProfile }: EducationSectionProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);

  const openFormModal = (edu: Education | null = null) => {
    setSelectedEducation(edu);
    setIsFormOpen(true);
  };

  const openDeleteModal = (edu: Education) => {
    setSelectedEducation(edu);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: EducationFormValues) => {
    const action = selectedEducation
      ? experienceService.updateEducation(selectedEducation.id, data)
      : experienceService.addEducation(data);

    await toast.promise(action, {
      loading: selectedEducation ? 'Updating...' : 'Adding...',
      success: () => {
        refetchProfile?.();
        setIsFormOpen(false);
        return `Education ${selectedEducation ? 'updated' : 'added'} successfully!`;
      },
      error: (err) => err.response?.data?.message || 'An error occurred.',
    });
  };

  const handleDelete = async () => {
    if (!selectedEducation) return;

    await toast.promise(experienceService.deleteEducation(selectedEducation.id), {
      loading: 'Deleting...',
      success: () => {
        refetchProfile?.();
        setIsDeleteModalOpen(false);
        return 'Education record deleted successfully.';
      },
      error: (err) => err.response?.data?.message || 'An error occurred.',
    });
  };

  return (
    <>
      <EducationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedEducation}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Education Record"
        description="Are you sure you want to delete this education record? This action cannot be undone."
      />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Education</h2>
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={() => openFormModal()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Education
            </Button>
          )}
        </div>
        <div className="mt-4 space-y-6">
          {educationHistory && educationHistory.length > 0 ? (
            educationHistory.map((edu) => (
              <div key={edu.id} className="flex">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-semibold text-gray-900">{edu.institution}</p>
                  <p className="text-sm text-gray-600">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                  <p className="text-sm text-gray-400">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                  {edu.grade && <p className="mt-1 text-sm text-gray-500">Grade: {edu.grade}</p>}
                </div>
                {isOwner && (
                  <div className="flex-shrink-0 space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openFormModal(edu)}>Edit</Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteModal(edu)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No education history has been added yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default EducationSection;