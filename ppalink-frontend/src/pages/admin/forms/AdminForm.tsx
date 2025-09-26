import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/forms/Input';
import { Label } from '../../../components/ui/Label';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckCircle, Mail, UserPlus } from 'lucide-react';

const adminSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
});

export type AdminFormValues = z.infer<typeof adminSchema>;

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdminFormValues) => Promise<void>;
}

const roles = [
    { name: 'ADMIN', description: 'Can manage users, content, and verifications.' },
    { name: 'SUPER_ADMIN', description: 'Full access, can manage other admins and platform settings.' },
]

export const AdminFormModal = ({ isOpen, onClose, onSubmit }: AdminFormModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { role: 'ADMIN' },
  });

  const handleClose = () => { reset(); onClose(); };
  const processSubmit = async (data: AdminFormValues) => { await onSubmit(data); handleClose(); };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900 dark:bg-zinc-100/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-800 pb-4">
                  Create New Administrator
                </Dialog.Title>
                <form onSubmit={handleSubmit(processSubmit)} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Admin's Email Address</Label>
                    <Input id="email" type="email" icon={Mail} {...register('email')} error={!!errors.email} />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>

                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup value={field.value} onChange={field.onChange} className="space-y-2">
                        <Label>Role</Label>
                        {roles.map((role) => (
                           <RadioGroup.Option key={role.name} value={role.name} className={({ checked }) => `${checked ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 dark:border-primary-500 ring-2 ring-primary-500' : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'} relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all`}>
                             {({ checked }) => (
                               <div className="flex w-full items-center justify-between">
                                 <div className="flex items-center">
                                     <div className="text-sm">
                                         <RadioGroup.Label as="p" className={`font-semibold ${checked ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-zinc-50'}`}>{role.name}</RadioGroup.Label>
                                         <RadioGroup.Description as="span" className={`inline text-xs ${checked ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-zinc-400'}`}>{role.description}</RadioGroup.Description>
                                     </div>
                                 </div>
                                 {checked && <div className="shrink-0 text-primary-600 dark:text-primary-400"><CheckCircle className="h-5 w-5" /></div>}
                               </div>
                             )}
                           </RadioGroup.Option>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  
                  <div className="mt-6 flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}><UserPlus className="mr-2 h-4 w-4" />Create Admin</Button>
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
