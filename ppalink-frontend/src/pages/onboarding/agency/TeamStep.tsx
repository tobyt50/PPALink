import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { OnboardingProgressBar } from '../candidate/SummaryStep';
import useFetch from '../../../hooks/useFetch';
import type { Agency } from '../../../types/agency';
import { motion } from 'framer-motion';

const TeamStep = () => {
    const navigate = useNavigate();
    const { data: agency } = useFetch<Agency>('/agencies/me');

    const planName = agency?.subscriptions?.[0]?.plan?.name || 'Free';

    const handleNext = () => {
        navigate('/onboarding/agency/discover');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full text-center"
        >
            <OnboardingProgressBar step={4} totalSteps={5} />
            
            <div className="mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950/60">
                    <UserPlus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent mt-4">
                    Build Your Hiring Team
                </h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-300 max-w-lg mx-auto">
                    Recruiting is a team sport. Invite your colleagues to collaborate on finding and managing candidates.
                </p>
            </div>
            
            <div className="my-8 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border dark:border-zinc-800">
                {planName === 'Free' ? (
                    <p className="text-sm text-gray-700 dark:text-zinc-200">
                        Your <span className="font-semibold">Free</span> plan is limited to 1 member. <Link to="/dashboard/agency/billing" className="text-primary-600 dark:text-primary-400 font-semibold underline hover:opacity-80">Upgrade to Pro</Link> to invite team members.
                    </p>
                ) : (
                    <p className="text-sm text-gray-700 dark:text-zinc-200">
                        Your <span className="font-semibold text-primary-600 dark:text-primary-400">{planName}</span> plan allows you to invite more members. You can manage your team from the dashboard after completing onboarding.
                    </p>
                )}
            </div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => navigate('/onboarding/agency/pipeline')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button size="lg" onClick={handleNext}>
                    Next: Discover Candidates <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

export default TeamStep;