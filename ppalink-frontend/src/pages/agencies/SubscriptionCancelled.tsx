import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

const SubscriptionCancelledPage = () => {
    return (
        // Polished Page Wrapper
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-4 py-12">
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-md"
            >
                {/* Replicated Card Style */}
                <div className="rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
                    
                    {/* Polished Icon */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-9 w-9 text-red-600" />
                    </div>

                    {/* Polished Header */}
                    <h1 className="mt-6 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                        Subscription Cancelled
                    </h1>

                    <p className="mt-2 text-base text-gray-600">
                        Your subscription process was cancelled. You can choose a plan anytime from the billing page.
                    </p>

                    {/* Polished Outline Button */}
                    <div className="mt-8">
                        <Link to="/dashboard/agency/billing">
                            <Button 
                                variant="outline" 
                                size="lg" 
                                className="w-full rounded-lg border-primary-600 text-primary-600 hover:bg-primary-50"
                            >
                                View Plans
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionCancelledPage;