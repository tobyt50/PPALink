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
        {/* ... Backdrop transition ... */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} {...{/* panel transition */}}>
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2">
                  {isEditMode ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                </Dialog.Title>
                <form onSubmit={handleSubmit(processSubmit)} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="name">Plan Name</Label><Input id="name" {...register('name')} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div>
                        <div className="space-y-1"><Label htmlFor="price">Price (₦)</Label><Input id="price" type="number" {...register('price')} />{errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}</div>
                    </div>
                    <div className="space-y-1"><Label htmlFor="description">Description</Label><Input id="description" {...register('description')} /></div>
                    <div className="space-y-1"><Label htmlFor="features">Features (comma separated)</Label><textarea id="features" rows={3} className="w-full rounded-md border-gray-300" {...register('features')}/>{errors.features && <p className="text-xs text-red-500">{errors.features.message}</p>}</div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="jobPostLimit">Job Post Limit</Label><Input id="jobPostLimit" type="number" {...register('jobPostLimit')} /><p className="text-xs text-gray-500">-1 for unlimited</p></div>
                        <div className="space-y-1"><Label htmlFor="memberLimit">Team Member Limit</Label><Input id="memberLimit" type="number" {...register('memberLimit')} /><p className="text-xs text-gray-500">-1 for unlimited</p></div>
                    </div>
                  <div className="mt-6 flex justify-end space-x-2">
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