import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const SubscriptionCancelledPage = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <XCircle className="h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                Subscription Cancelled
            </h1>
            <p className="mt-2 text-base text-gray-600">
                Your subscription process was cancelled. You can choose a plan anytime.
            </p>
            <div className="mt-6">
                <Link to="/dashboard/agency/billing">
                    <Button variant="outline">View Plans</Button>
                </Link>
            </div>
        </div>
    );
};

export default SubscriptionCancelledPage;