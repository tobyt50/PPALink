import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { OnboardingProgressBar } from './SummaryStep';
import candidateService from '../../../services/candidate.service';
import { FileUpload } from '../../../components/forms/FileUpload';
import { useAuthStore } from '../../../context/AuthContext';
import { motion } from 'framer-motion';

const CvUploadStep = () => {
    const navigate = useNavigate();
    const { login, user } = useAuthStore();
    
    const handleUploadSuccess = async (fileKey: string) => {
        try {
            await candidateService.updateCv(fileKey);
            toast.success('CV uploaded successfully!');
            await handleFinishOnboarding(true); // Finish onboarding after successful upload
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save CV.');
        }
    };
    
    const handleFinishOnboarding = async (fromUpload = false) => {
        try {
            await candidateService.markOnboardingComplete();
            if (user) {
                const updatedUser = { ...user, candidateProfile: { ...user.candidateProfile!, hasCompletedOnboarding: true } };
                login(updatedUser, useAuthStore.getState().token!);
            }
            if (!fromUpload) {
                toast.success('Profile setup complete!');
            }
            navigate('/dashboard/candidate');
        } catch {
            toast.error("Failed to complete onboarding.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full"
        >
            <OnboardingProgressBar step={5} totalSteps={5} />
            <div className="text-center mb-6">
                 <CheckCircle className="mx-auto h-12 w-12 text-green-500"/>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent mt-4">
                    Final Step: Upload Your CV
                </h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-300">A CV is crucial for agencies to review your full profile.</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <FileUpload
                label=""
                uploadType="cv"
                onUploadSuccess={(fileKey) => handleUploadSuccess(fileKey)}
              />
            </div>

            <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-100 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => navigate('/onboarding/candidate/skills')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => handleFinishOnboarding()}>
                    Finish & Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

export default CvUploadStep;