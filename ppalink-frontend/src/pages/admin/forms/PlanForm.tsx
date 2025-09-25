import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/forms/Input';
import { Label } from '../../../components/ui/Label';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import type { SubscriptionPlan } from '../../../types/subscription';

// Zod schema for validating the form data
const planSchema = z.object({
  name: z.string().min(3, 'Plan name is required.'),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0, 'Price must be 0 or greater.'),
  features: z.string().min(1, 'Please list at least one feature.'),
  jobPostLimit: z.coerce.number().int(),
  memberLimit: z.coerce.number().int(),
});

export type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>; // Use `any` for flexibility with create/update
  initialData?: SubscriptionPlan | null; // Pass initialData when editing
}

export const PlanFormModal = ({ isOpen, onClose, onSubmit, initialData }: PlanFormModalProps) => {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price ?? 0,
      // Convert the features array back to a comma-separated string for the textarea
      features: initialData?.features.join(', ') || '',
      jobPostLimit: initialData?.jobPostLimit ?? 1,
      memberLimit: initialData?.memberLimit ?? 1,
    },
  });
  
  const processSubmit = async (data: PlanFormValues) => {
    // Convert the comma-separated features string back into an array
    const payload = {
      ...data,
      features: data.features.split(',').map(f => f.trim()).filter(f => f),
    };
    await onSubmit(payload);
    onClose(); // Close modal on success
  };
  
  // Reset the form when the modal is closed or initialData changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price ?? 0,
        features: initialData?.features?.join(', ') || '',
        jobPostLimit: initialData?.jobPostLimit ?? 1,
        memberLimit: initialData?.memberLimit ?? 1,
      });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b border-gray-100 pb-4">
                  {isEditMode ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                </Dialog.Title>
                <form onSubmit={handleSubmit(processSubmit)} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Plan Name</Label>
                            <Input id="name" {...register('name')} error={!!errors.name} />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="price">Price (₦)</Label>
                            <Input id="price" type="number" {...register('price')} error={!!errors.price} />
                            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" {...register('description')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="features">Features (comma separated)</Label>
                        <textarea id="features" rows={3} className={`flex w-full rounded-xl border bg-white px-3 py-2 text-sm transition-colors duration-150 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${errors.features ? 'border-red-300 text-red-600 placeholder:text-red-400 focus-visible:ring-red-400' : 'border-gray-200 focus-visible:ring-primary-600'}`} {...register('features')}/>
                        {errors.features && <p className="text-xs text-red-500">{errors.features.message}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="jobPostLimit">Job Post Limit</Label>
                            <Input id="jobPostLimit" type="number" {...register('jobPostLimit')} />
                            <p className="text-xs text-gray-500 mt-1">-1 for unlimited</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="memberLimit">Team Member Limit</Label>
                            <Input id="memberLimit" type="number" {...register('memberLimit')} />
                            <p className="text-xs text-gray-500 mt-1">-1 for unlimited</p>
                        </div>
                    </div>
                  <div className="mt-6 flex justify-end space-x-2 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>{isEditMode ? 'Save Changes' : 'Create Plan'}</Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};