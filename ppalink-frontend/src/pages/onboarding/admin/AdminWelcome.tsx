import { ArrowRight, Check, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import adminService from '../../../services/admin.service';
import { useAuthStore } from '../../../context/AuthContext';
import { motion } from 'framer-motion';

const FeatureHighlight = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950/60">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="ml-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{title}</h4>
            <p className="mt-1 text-gray-500 dark:text-zinc-400">{description}</p>
        </div>
    </div>
);


const AdminWelcomePage = () => {
    const navigate = useNavigate();
    const { login, user } = useAuthStore();

    const handleComplete = async () => {
        try {
            await adminService.markOnboardingComplete();
            if (user) {
                const updatedUser = { ...user, hasCompletedAdminOnboarding: true };
                login(updatedUser, useAuthStore.getState().token!);
            }
            toast.success("Welcome! Let's get to work.");
            navigate('/admin/dashboard');
        } catch {
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full max-w-4xl"
        >
            <div className="text-center">
                 <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                    Welcome to the Admin Panel
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-zinc-300">
                    You have been granted administrative privileges. Here are your key responsibilities:
                </p>
            </div>

            <div className="mt-8 space-y-8 py-8 border-t border-b border-gray-100 dark:border-zinc-800">
                <FeatureHighlight
                    icon={Users}
                    title="User Management"
                    description="Oversee all candidate and agency accounts. You have the power to suspend users and manage their details."
                />
                <FeatureHighlight
                    icon={ShieldCheck}
                    title="Verification Queue"
                    description="Maintain platform integrity by reviewing and approving/rejecting submitted documents like NYSC and CAC."
                />
                 <FeatureHighlight
                    icon={Check}
                    title="Content Moderation"
                    description="Ensure the quality of the job board by reviewing and managing all job postings on the platform."
                />
            </div>

            <div className="mt-8 text-center">
                <Button size="sm" onClick={handleComplete}>
                    Go to Admin Panel <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

export default AdminWelcomePage;