import { Edit, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import adminService from '../../services/admin.service';
import useFetch from '../../hooks/useFetch';
import type { SubscriptionPlan } from '../../types/subscription';
import { PlanFormModal } from './forms/PlanForm';

const ManagePlansPage = () => {
  const { data: plans, isLoading, error, refetch } = useFetch<SubscriptionPlan[]>('/admin/plans');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; plan: SubscriptionPlan | null }>({ isOpen: false, plan: null });

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
  
  const handleFormSubmit = async (processedData: Omit<SubscriptionPlan, "id" | "stripePriceId">) => {
    
    const actionPromise = editingPlan
      ? adminService.updatePlan(editingPlan.id, processedData)
      : adminService.createPlan(processedData);

    await toast.promise(actionPromise, {
        loading: editingPlan ? "Saving changes..." : "Creating new plan...",
        success: () => {
            refetch();
            setIsFormModalOpen(false);
            return `Plan ${editingPlan ? 'updated' : 'created'} successfully!`;
        },
        error: (err) => err.response?.data?.message || 'Action failed.'
    });
  };

  const handleDeleteConfirm = async () => {
      if (!deleteModalState.plan) return;
      await toast.promise(adminService.deletePlan(deleteModalState.plan.id), {
          loading: 'Deleting plan...',
          success: () => {
              refetch();
              setDeleteModalState({ isOpen: false, plan: null });
              return 'Plan deleted successfully.';
          },
          error: 'Failed to delete plan.'
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

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-600">Subscription Plan Management</h1>
            <p className="mt-1 text-gray-500">Create, edit, and manage subscription plans.</p>
          </div>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Plan
          </Button>
        </div>

        {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <div className="text-center text-red-500 p-8">Could not load plans.</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <div key={plan.id} className="rounded-lg border bg-white shadow-sm flex flex-col">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>
                <p className="text-gray-500 mt-2 text-sm h-10">{plan.description}</p>
                <div className="my-4">
                  <span className="text-3xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Features & Limits:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {plan.features.map((feature, i) => <li key={i}>- {feature}</li>)}
                  <li className="pt-2 font-medium">Job Post Limit: {plan.jobPostLimit === -1 ? 'Unlimited' : plan.jobPostLimit}</li>
                  <li>Member Limit: {plan.memberLimit === -1 ? 'Unlimited' : plan.memberLimit}</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(plan)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ManagePlansPage;