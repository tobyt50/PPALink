import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const messageSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

export type MessageFormValues = z.infer<typeof messageSchema>;

interface SendMessageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MessageFormValues) => Promise<void>;
  recipientEmail: string;
}

export const SendMessageFormModal = ({ isOpen, onClose, onSubmit, recipientEmail }: SendMessageFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };
  
  const processSubmit = async (data: MessageFormValues) => {
    await onSubmit(data);
    handleClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} {...{/* backdrop transition */}}>
          <div className="fixed inset-0 bg-gray-900/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} {...{/* panel transition */}}>
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2">
                  Send Message to <span className="text-primary-600">{recipientEmail}</span>
                </Dialog.Title>
                <form onSubmit={handleSubmit(processSubmit)} className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                        id="message"
                        rows={6}
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
                        {...register('message')}
                    />
                    {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                  </div>
                  <p className="text-xs text-gray-500">
                    This message will be sent from the official System account and will appear in the user's PPAHire inbox.
                  </p>
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Send Message</Button>
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