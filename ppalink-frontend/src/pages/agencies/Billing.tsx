import { Check, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import useFetch from '../../hooks/useFetch';
import billingService from '../../services/billing.service';
import type { Agency } from '../../types/agency';
import type { SubscriptionPlan } from '../../types/subscription';
import SubscriptionCancelledPage from './SubscriptionCancelled';
import SubscriptionSuccessPage from './SubscriptionSuccess';

const BillingPage = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  const { data: plans, isLoading: isLoadingPlans } = useFetch<SubscriptionPlan[]>('/public/plans');
  const { data: agency, isLoading: isLoadingAgency } = useFetch<Agency>('/agencies/me');

  const isLoading = isLoadingPlans || isLoadingAgency;

  const currentPlan = useMemo(() => {
    const activeSub = agency?.subscriptions?.find(sub => sub.status === 'ACTIVE');
    if (activeSub) return activeSub.plan;
    return plans?.find(p => p.price === 0) || null;
  }, [agency, plans]);

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(planId);
    try {
      const { url } = await billingService.createCheckoutSession(planId);
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not initiate subscription.');
      setIsProcessing(null);
    }
  };

  // --- THIS IS THE FIX ---
  // This handler will now correctly call the billing service.
  const handleManageSubscription = async () => {
    setIsProcessing('manage');
    try {
      const { url } = await billingService.createPortalSession();
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not open management portal.');
      setIsProcessing(null);
    }
  };
  // --- END OF FIX ---


  if (status === 'success') {
    return <SubscriptionSuccessPage />;
  }
  if (status === 'cancelled') {
    return <SubscriptionCancelledPage />;
  }

  const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => {
    const isCurrent = currentPlan?.id === plan.id;
    const isUpgrade = currentPlan ? plan.price > currentPlan.price : plan.price > 0;

    const getButton = () => {
      // The onClick for this button is now functional.
      if (isCurrent) {
        return (
          <Button
            className="w-full"
            onClick={handleManageSubscription}
            isLoading={isProcessing === 'manage'}
            disabled={isProcessing !== null}
          >
            Manage Subscription
          </Button>
        );
      }
      if (isUpgrade) {
        return (
          <Button
            className="w-full"
            onClick={() => handleSubscribe(plan.id)}
            isLoading={isProcessing === plan.id}
            disabled={isProcessing !== null}
          >
            Upgrade
          </Button>
        );
      }
      return (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => handleSubscribe(plan.id)}
          isLoading={isProcessing === plan.id}
          disabled={isProcessing !== null}
        >
          {currentPlan?.price === 0 ? 'Choose Plan' : 'Downgrade'}
        </Button>
      );
    };

    return (
      <div
        className={`
          relative rounded-lg border p-6 flex flex-col transition-all duration-200
          ${isCurrent
            ? 'border-2 border-primary-500 bg-primary-50 shadow-md'
            : 'border border-gray-300 bg-white hover:shadow-md hover:border-gray-400'}
        `}
      >
        {isCurrent && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
              Current Plan
            </span>
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-800 text-center">{plan.name}</h2>
        <div className="my-6 text-center">
          <span className="text-4xl font-bold text-gray-900">
            {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
          </span>
          {plan.price > 0 && <span className="text-sm text-gray-500">/month</span>}
        </div>
        <ul className="space-y-3 text-sm text-gray-600 flex-grow">
          {(plan.features as string[]).map((feature, i) => (
            <li key={i} className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">{getButton()}</div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">
          Billing & Subscription
        </h1>
        <p className="mt-2 text-gray-500">Manage your agency's subscription plan.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans?.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BillingPage;