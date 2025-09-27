import { ArrowLeft, ArrowRight, Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import useFetch from '../../../hooks/useFetch';
import type { CandidateProfile, WorkExperience } from '../../../types/candidate';
import { WorkExperienceFormModal, type WorkExperienceFormValues } from '../../candidates/forms/WorkExperienceForm';
import { OnboardingProgressBar } from './SummaryStep';
import candidateService from '../../../services/candidate.service';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { motion } from 'framer-motion';

const WorkExperienceItem = ({ exp, onEdit, onDelete }: { exp: WorkExperience, onEdit: () => void, onDelete: () => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex justify-between items-start p-4 border dark:border-zinc-800 rounded-xl bg-gray-50/70 dark:bg-zinc-800/30"
    >
        <div>
            <p className="font-semibold text-gray-800 dark:text-zinc-100">{exp.title}</p>
            <p className="text-sm text-gray-600 dark:text-zinc-300">{exp.company}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">{new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A')}</p>
        </div>
        <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-950/40" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-500 dark:hover:bg-red-950/40" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
    </motion.div>
);

const WorkExperienceStep = () => {
    const navigate = useNavigate();
    const { data: profile, isLoading, refetch } = useFetch<CandidateProfile>('/candidates/me');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);
    const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; expId: string | null }>({ isOpen: false, expId: null });

    const openModal = (exp?: WorkExperience) => { setEditingExp(exp || null); setIsModalOpen(true); };
    const openDeleteModal = (expId: string) => setDeleteModalState({ isOpen: true, expId });
    const closeDeleteModal = () => setDeleteModalState({ isOpen: false, expId: null });
    
    const handleDelete = async () => {
        if (!deleteModalState.expId) return;
        await toast.promise(candidateService.deleteWorkExperience(deleteModalState.expId), {
            loading: 'Deleting experience...', success: 'Experience deleted successfully.', error: 'Failed to delete experience.'
        });
        refetch();
        closeDeleteModal();
    };

    const handleFormSubmit = async (data: WorkExperienceFormValues) => {
        const payload = { ...data, endDate: data.endDate || null, description: data.description || null };
        const actionPromise = editingExp
            ? candidateService.updateWorkExperience(editingExp.id, payload)
            : candidateService.addWorkExperience(payload);
        
        await toast.promise(actionPromise, {
            loading: editingExp ? 'Saving changes...' : 'Adding experience...',
            success: `Experience ${editingExp ? 'updated' : 'added'} successfully!`,
            error: `Failed to ${editingExp ? 'update' : 'add'} experience.`
        });
        refetch();
        setIsModalOpen(false);
    };
    
    const handleNextStep = () => navigate('/onboarding/candidate/education');

    return (
        <>
            <WorkExperienceFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingExp} />
            <ConfirmationModal isOpen={deleteModalState.isOpen} onClose={closeDeleteModal} onConfirm={handleDelete} title="Delete Work Experience" description="Are you sure you want to permanently remove this work experience record?" confirmButtonText="Delete" isDestructive />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full"
            >
                <OnboardingProgressBar step={2} totalSteps={5} />
                <div className="text-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">Work Experience</h1>
                    <p className="mt-2 text-gray-600 dark:text-zinc-300">Detail your professional history, starting with the most recent.</p>
                </div>
                
                <div className="space-y-4 mb-6 min-h-[6rem]">
                    {isLoading ? <div className="flex justify-center py-4"><Loader2 className="animate-spin h-6 w-6 text-primary-500" /></div> :
                        profile?.workExperiences?.length === 0 ? <p className="text-center text-sm text-gray-500 dark:text-zinc-400 py-4">No work experience added yet.</p> :
                        profile?.workExperiences?.map(exp => (
                            <WorkExperienceItem key={exp.id} exp={exp} onEdit={() => openModal(exp)} onDelete={() => openDeleteModal(exp.id)} />
                        ))
                    }
                </div>

                <div className="text-center mb-8">
                    <Button variant="outline" onClick={() => openModal()}>
                        <Plus className="h-4 w-4 mr-2"/> Add Work Experience
                    </Button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <Button type="button" variant="outline" onClick={() => navigate('/onboarding/candidate/summary')}>
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

export default WorkExperienceStep;