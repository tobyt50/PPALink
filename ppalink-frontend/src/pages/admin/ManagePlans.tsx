import { Edit, Loader2, PlusCircle, Trash2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { ConfirmationModal } from "../../components/ui/Modal";
import adminService from "../../services/admin.service";
import useFetch from "../../hooks/useFetch";
import type { SubscriptionPlan } from "../../types/subscription";
import { PlanFormModal } from "./forms/PlanForm";
import { useSmartCurrency } from "../../hooks/useSmartCurrency";

const PlanCard = ({
  plan,
  onEdit,
  onDelete,
}: {
  plan: SubscriptionPlan;
  onEdit: (p: SubscriptionPlan) => void;
  onDelete: (p: SubscriptionPlan) => void;
}) => {
  const formattedPrice = useSmartCurrency(plan.price, plan.currency);

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 flex flex-col overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          {plan.name}
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-2 text-sm h-10">
          {plan.description}
        </p>
        <div className="mt-4 text-left space-y-1">
  {plan.price === 0 ? (
    <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">
      Free
    </span>
  ) : (
    <>
      {/* Base currency */}
      <div className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50 leading-tight">
        {formattedPrice.split("(≈")[0].trim()}
        <span className="text-sm font-medium text-gray-500 dark:text-zinc-400 ml-1 align-top">
          /month
        </span>
      </div>

      {/* Converted currency */}
      {formattedPrice.includes("(≈") && (
        <div className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
          ≈ {formattedPrice.split("(≈")[1].replace(")", "").trim()}
        </div>
      )}
    </>
  )}
</div>

      </div>
      <div className="p-6 flex-grow border-t border-gray-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-100 mb-4">
          Features & Limits
        </h3>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-zinc-300">
          <li className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>
              <strong>
                {plan.jobPostLimit === -1 ? "Unlimited" : plan.jobPostLimit}
              </strong>{" "}
              Job Posts
            </span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>
              <strong>
                {plan.memberLimit === -1 ? "Unlimited" : plan.memberLimit}
              </strong>{" "}
              Team Members
            </span>
          </li>
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-white/5 border-t flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-600 dark:hover:text-red-400"
          onClick={() => onDelete(plan)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
};

const ManagePlansPage = () => {
  const {
    data: plans,
    isLoading,
    error,
    refetch,
  } = useFetch<SubscriptionPlan[]>("/admin/plans");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    plan: SubscriptionPlan | null;
  }>({ isOpen: false, plan: null });

  const handleCreate = () => {
    setEditingPlan(null);
    setIsFormModalOpen(true);
  };
  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsFormModalOpen(true);
  };
  const handleDelete = (plan: SubscriptionPlan) => {
    setDeleteModalState({ isOpen: true, plan });
  };

  const handleFormSubmit = async (
    processedData: Omit<SubscriptionPlan, "id" | "stripePriceId">
  ) => {
    const actionPromise = editingPlan
      ? adminService.updatePlan(editingPlan.id, processedData)
      : adminService.createPlan(processedData);
    await toast.promise(actionPromise, {
      loading: editingPlan ? "Saving changes..." : "Creating new plan...",
      success: () => {
        refetch();
        setIsFormModalOpen(false);
        return `Plan ${editingPlan ? "updated" : "created"} successfully!`;
      },
      error: (err) => err.response?.data?.message || "Action failed.",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.plan) return;
    await toast.promise(adminService.deletePlan(deleteModalState.plan.id), {
      loading: "Deleting plan...",
      success: () => {
        refetch();
        setDeleteModalState({ isOpen: false, plan: null });
        return "Plan deleted successfully.";
      },
      error: (err) => err.response?.data?.message || "Failed to delete plan.",
    });
  };

  return (
    <>
      <PlanFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPlan}
      />
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, plan: null })}
        onConfirm={handleDeleteConfirm}
        title={`Delete Plan: "${deleteModalState.plan?.name}"`}
        description="Are you sure? Existing subscriptions will remain active until their period ends, but no new subscriptions can be created. This action is permanent."
        isDestructive
        confirmButtonText="Delete"
      />
      <div className="space-y-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
              Subscription Plans
            </h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-300">
              Create, edit, and manage subscription plans for agencies.
            </p>
          </div>
          <Button size="sm" onClick={handleCreate}>
            <PlusCircle className="mr-2 h-5 w-5" />
            New Plan
          </Button>
        </div>

        {isLoading && (
          <div className="flex h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
            Could not load subscription plans.
          </div>
        )}

        {!isLoading && !error && plans && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ManagePlansPage;
