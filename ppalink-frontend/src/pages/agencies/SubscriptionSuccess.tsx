import { PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

const SubscriptionSuccessPage = () => {
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
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <PartyPopper className="h-9 w-9 text-green-600" />
                    </div>

                    {/* Replicated Gradient Header */}
                    <h1 className="mt-6 text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
                        Subscription Successful!
                    </h1>

                    <p className="mt-2 text-base text-gray-600">
                        Welcome aboard! Your new plan is now active.
                    </p>

                    {/* Replicated Primary Button */}
                    <div className="mt-8">
                        <Link to="/dashboard/agency">
                            <Button 
                                size="lg" 
                                className="w-full rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition"
                            >
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionSuccessPage;