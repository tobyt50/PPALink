import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import type { User, Role } from '../../../types/user';
import { CheckCircle, ShieldCheck } from 'lucide-react';

const roleUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
});

export type RoleUpdateFormValues = z.infer<typeof roleUpdateSchema>;

interface RoleUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: Role) => Promise<void>;
  admin: User | null;
}

const roles = [
    { name: 'ADMIN', description: 'Can manage users, content, and verifications.' },
    { name: 'SUPER_ADMIN', description: 'Full access, can manage other admins and platform settings.' },
]

export const RoleUpdateModal = ({ isOpen, onClose, onSubmit, admin }: RoleUpdateModalProps) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<RoleUpdateFormValues>({
    resolver: zodResolver(roleUpdateSchema),
  });

  useEffect(() => {
    if (admin) {
      reset({ role: admin.role as 'ADMIN' | 'SUPER_ADMIN' });
    }
  }, [admin, isOpen, reset]);

  const handleClose = () => { reset(); onClose(); };
  const processSubmit = async (data: RoleUpdateFormValues) => {
    await onSubmit(data.role as Role);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b border-gray-100 pb-4">
                  Update Role for <span className="text-primary-600">{admin?.email}</span>
                </Dialog.Title>
                <form onSubmit={handleSubmit(processSubmit)} className="mt-4 space-y-4">
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup value={field.value} onChange={field.onChange} className="space-y-2">
                        <Label>Assign a new role</Label>
                        {roles.map((role) => (
                           <RadioGroup.Option key={role.name} value={role.name} className={({ checked }) => `${checked ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'} relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all`}>
                             {({ checked }) => (
                               <div className="flex w-full items-center justify-between">
                                 <div className="flex items-center">
                                     <div className="text-sm">
                                         <RadioGroup.Label as="p" className={`font-semibold ${checked ? 'text-primary-700' : 'text-gray-900'}`}>{role.name}</RadioGroup.Label>
                                         <RadioGroup.Description as="span" className={`inline text-xs ${checked ? 'text-primary-600' : 'text-gray-500'}`}>{role.description}</RadioGroup.Description>
                                     </div>
                                 </div>
                                 {checked && <div className="shrink-0 text-primary-600"><CheckCircle className="h-5 w-5" /></div>}
                               </div>
                             )}
                           </RadioGroup.Option>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  
                  <div className="mt-6 flex justify-end space-x-2 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}><ShieldCheck className="mr-2 h-4 w-4" />Update Role</Button>
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