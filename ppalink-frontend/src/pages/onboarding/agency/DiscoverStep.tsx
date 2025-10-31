import { ArrowLeft, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { OnboardingProgressBar } from '../candidate/SummaryStep';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../../context/AuthContext';
import agencyService from '../../../services/agency.service';

const DiscoverStep = () => {
    const navigate = useNavigate();
    const { login, user } = useAuthStore();

    const handleFinishAndNavigate = async (path: string) => {
        try {
            await agencyService.markOnboardingComplete();
            if (user) {
                const agencyProfile = user.ownedAgencies ? { ...user.ownedAgencies[0], hasCompletedOnboarding: true } : undefined;
                const updatedUser = { ...user, ownedAgencies: agencyProfile ? [agencyProfile] : [] };
                login(updatedUser, useAuthStore.getState().token!);
            }
            toast.success("Setup complete! Let's find some candidates.");
            navigate(path);
        } catch {
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full text-center"
        >
            <OnboardingProgressBar step={5} totalSteps={5} />
            
            <div className="mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950/60">
                    <Search className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent mt-4">
                    You're All Set!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-300 max-w-lg mx-auto">
                    Your agency is ready to go. Start exploring our database of qualified NYSC candidates now, or finish here and go to your main dashboard.
                </p>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="primary" size="sm" onClick={() => handleFinishAndNavigate('/dashboard/agency/candidates/browse')}>
                    Find Your First Candidate
                </Button>
                <Button variant="outlineTransparent" size="sm" onClick={() => handleFinishAndNavigate('/dashboard/agency')}>
                     <CheckCircle className="mr-2 h-4 w-4" /> Go to Dashboard
                </Button>
            </div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => navigate('/onboarding/agency/team')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div></div>
            </div>
        </motion.div>
    );
};

export default DiscoverStep;