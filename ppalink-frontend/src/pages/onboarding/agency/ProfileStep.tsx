import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useFetch from '../../../hooks/useFetch';
import type { Agency } from '../../../types/agency';
import agencyService from '../../../services/agency.service';
import { OnboardingProgressBar } from '../candidate/SummaryStep';
import CompanyProfileForm, { type CompanyProfileFormValues } from '../../agencies/forms/CompanyProfileForm';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AgencyProfileStep = () => {
    const navigate = useNavigate();
    const { data: agency, isLoading } = useFetch<Agency>('/agencies/me');

    const handleSubmit = async (data: CompanyProfileFormValues) => {
        try {
            await agencyService.updateMyAgency(data);
            toast.success('Profile saved successfully!');
            navigate('/onboarding/agency/post-job'); 
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save profile.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full"
        >
            <OnboardingProgressBar step={1} totalSteps={5} />
            <div className="text-center mb-6">
                 <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                    Complete Your Company Profile
                </h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-300">This information will be visible to candidates on your public profile and job posts.</p>
            </div>
            
            {isLoading || !agency ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
                </div>
            ) : (
                <CompanyProfileForm 
                    initialData={agency} 
                    onSubmit={handleSubmit}
                    submitButtonText="Save & Continue"
                />
            )}
        </motion.div>
    );
};

export default AgencyProfileStep;