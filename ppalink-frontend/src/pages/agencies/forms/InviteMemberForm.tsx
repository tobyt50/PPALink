import { Dialog, Transition } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InviteFormValues) => Promise<void>;
}

export const InviteMemberFormModal = ({ isOpen, onClose, onSubmit }: InviteMemberFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const handleClose = () => {
    reset(); // Reset form fields when closing
    onClose();
  };
  
  const processSubmit = async (data: InviteFormValues) => {
    await onSubmit(data);
    handleClose(); // Close and reset form on successful submission
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} {...{/* backdrop transition */}}>
          <div className="fixed inset-0 bg-gray-900/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} {...{/* panel transition */}}>
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2">
                  Invite New Team Member
                </Dialog.Title>
                <form onSubmit={handleSubmit(processSubmit)} className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email">Member's Email Address</Label>
                    <Input id="email" type="email" placeholder="colleague@example.com" {...register('email')} />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  <p className="text-xs text-gray-500">
                    An invitation link will be sent to this email address. The link will be valid for 48 hours.
                  </p>
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Send Invitation</Button>
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