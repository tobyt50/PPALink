import { Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import useFetch from "../../hooks/useFetch";
import billingService from "../../services/billing.service";
import type { Agency } from "../../types/agency";
import type { SubscriptionPlan } from "../../types/subscription";
import SubscriptionCancelledPage from "./SubscriptionCancelled";
import SubscriptionSuccessPage from "./SubscriptionSuccess";

const BillingPage = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const { data: plans, isLoading: isLoadingPlans } = useFetch<SubscriptionPlan[]>("/public/plans");
  const { data: agency, isLoading: isLoadingAgency } = useFetch<Agency>("/agencies/me");

  const isLoading = isLoadingPlans || isLoadingAgency;

  const currentPlan = useMemo(() => {
    const activeSub = agency?.subscriptions?.find(sub => sub.status === "ACTIVE");
    if (activeSub) return activeSub.plan;
    return plans?.find(p => p.price === 0) || null;
  }, [agency, plans]);

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(planId);
    try {
      const { url } = await billingService.createCheckoutSession(planId);
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not initiate subscription.");
      setIsProcessing(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsProcessing("manage");
    try {
      const { url } = await billingService.createPortalSession();
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not open management portal.");
      setIsProcessing(null);
    }
  };

  if (status === "success") return <SubscriptionSuccessPage />;
  if (status === "cancelled") return <SubscriptionCancelledPage />;

  const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => {
    const isCurrent = currentPlan?.id === plan.id;
    const isUpgrade = currentPlan ? plan.price > currentPlan.price : plan.price > 0;

    const getButton = () => {
      if (isCurrent) {
        return (
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-green-500 text-white shadow-md hover:opacity-90 transition"
            onClick={handleManageSubscription}
            isLoading={isProcessing === "manage"}
            disabled={isProcessing !== null}
          >
            Manage Subscription
          </Button>
        );
      }
      if (isUpgrade) {
        return (
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-green-500 text-white shadow-md hover:opacity-90 transition"
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
          className="w-full border-primary-600"
          variant="outline"
          onClick={handleManageSubscription}
            isLoading={isProcessing === "manage"}
            disabled={isProcessing !== null}
        >
          {currentPlan?.price === 0 ? 'Choose Plan' : 'Downgrade'}
        </Button>
      );
    };

    return (
      <div
        className={`relative flex flex-col rounded-2xl p-6 transition-all duration-200 ${
          isCurrent
            ? "bg-primary-50 border-2 border-primary-500 shadow-md"
            : "bg-white border border-gray-200 hover:shadow-md hover:border-gray-300"
        }`}
      >
        {isCurrent && (
          <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
            Current Plan
          </span>
        )}
        <h2 className="text-xl font-semibold text-gray-800 text-center">{plan.name}</h2>
        <div className="my-6 text-center">
          <span className="text-4xl font-bold text-gray-900">
            {plan.price === 0 ? "Free" : `₦${plan.price.toLocaleString()}`}
          </span>
          {plan.price > 0 && <span className="text-sm text-gray-500">/month</span>}
        </div>
        <ul className="flex-grow space-y-3 text-sm text-gray-600">
          {(plan.features as string[]).map((feature, i) => (
            <li key={i} className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6">{getButton()}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:justify-center">
  <div className="text-center sm:text-left">
    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
      Billing & Subscription
    </h1>
    <p className="mt-2 text-gray-600">Manage your agency's subscription plan.</p>
  </div>
</div>

      {/* Plans */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans?.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BillingPage;
