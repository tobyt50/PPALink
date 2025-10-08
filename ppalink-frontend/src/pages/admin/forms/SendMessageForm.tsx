import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/forms/Textarea';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Send } from 'lucide-react';

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
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900 dark:bg-zinc-100/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-800 pb-4">
                  Send Message to <span className="text-primary-600 dark:text-primary-400">{recipientEmail}</span>
                </Dialog.Title>
                <form onSubmit={handleSubmit(processSubmit)} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={6} error={!!errors.message} {...register('message')} />
                    {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    This message will be sent from the official System account and will appear in the user's PPALink inbox.
                  </p>
                  <div className="mt-6 flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                    </Button>
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