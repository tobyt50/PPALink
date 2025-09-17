import { PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const SubscriptionSuccessPage = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <PartyPopper className="h-16 w-16 text-primary-500" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                Subscription Successful!
            </h1>
            <p className="mt-2 text-base text-gray-600">
                Welcome aboard! Your new plan is now active.
            </p>
            <div className="mt-6">
                <Link to="/dashboard/agency">
                    <Button>Go to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
};

export default SubscriptionSuccessPage;