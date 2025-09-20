import { GraduationCap, Edit, PlusCircle, Trash2 } from 'lucide-react';
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
      loading: selectedEducation ? 'Updating record...' : 'Adding record...',
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
      loading: 'Deleting record...',
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
        description="Are you sure you want to delete this record? This action cannot be undone."
      />

      {/* Replicated Card Styling */}
      <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Education</h2>
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
          {educationHistory && educationHistory.length > 0 ? (
            <ul className="space-y-6">
              {educationHistory.map((edu) => (
                <li key={edu.id} className="relative flex items-start pr-16">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center ring-4 ring-white">
                      <GraduationCap className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{edu.institution}</p>
                    <p className="text-sm text-gray-600">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                    {edu.grade && <p className="mt-1 text-sm text-gray-500">Grade: {edu.grade}</p>}
                  </div>
                  {isOwner && (
                    // Removed opacity and hover classes to make buttons always visible
                    <div className="absolute top-0 right-0 flex items-center -space-x-1">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600" onClick={() => openFormModal(edu)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600" onClick={() => openDeleteModal(edu)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center text-gray-500 py-4">No education history has been added yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default EducationSection;