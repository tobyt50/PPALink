import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { OnboardingProgressBar } from '../candidate/SummaryStep';
import JobForm, { type JobFormValues } from '../../agencies/forms/JobForm';
import jobService from '../../../services/job.service';
import useFetch from '../../../hooks/useFetch';
import type { Agency } from '../../../types/agency';
import { Button } from '../../../components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const PostJobStep = () => {
    const navigate = useNavigate();
    const { data: agency } = useFetch<Agency>('/agencies/me');

    const handleSubmit = async (data: JobFormValues) => {
        if (!agency) {
            toast.error("Could not identify your agency. Please try again.");
            return;
        }

        try {
            await jobService.createJob(agency.id, data);
            toast.success('Your first job has been posted!');
            
            navigate('/onboarding/agency/pipeline');

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to post job.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full"
        >
            <OnboardingProgressBar step={2} totalSteps={5} />
            <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                    Post Your First Job
                </h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-300">Describe the role you're hiring for to attract the best talent.</p>
            </div>

            <JobForm
                onSubmit={handleSubmit}
                submitButtonText="Save & Continue"
            />
             <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => navigate('/onboarding/agency/profile')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>
        </motion.div>
    );
};

export default PostJobStep;