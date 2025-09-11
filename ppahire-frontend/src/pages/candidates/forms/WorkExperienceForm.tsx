import { Dialog, Transition } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect } from 'react'; // 1. Import useEffect
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import type { WorkExperience } from '../../../types/candidate';

const experienceSchema = z.object({
  title: z.string().min(2, 'Job title is required.'),
  company: z.string().min(2, 'Company name is required.'),
  startDate: z.string().refine((val) => val, { message: 'Start date is required.' }),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().nullable(),
}).refine(data => !data.isCurrent ? !!data.endDate : true, {
  message: "End date is required unless it's your current job.",
  path: ["endDate"],
});

export type WorkExperienceFormValues = z.infer<typeof experienceSchema>;

interface WorkExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkExperienceFormValues) => Promise<void>;
  initialData?: WorkExperience | null;
}

export const WorkExperienceFormModal = ({ isOpen, onClose, onSubmit, initialData }: WorkExperienceFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset, // 2. Get the `reset` function from useForm
    formState: { errors, isSubmitting },
  } = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    // We can still set default values for the "add" mode
    defaultValues: {
      title: '', company: '', startDate: '', endDate: '',
      isCurrent: false, description: ''
    }
  });

  // 3. THIS IS THE FIX: Use a useEffect to reset the form when initialData changes.
  useEffect(() => {
    if (isOpen) { // Only reset when the modal is opened
      if (initialData) {
        // We have data, so we are in "edit" mode. Reset the form with this data.
        reset({
          title: initialData.title,
          company: initialData.company,
          startDate: new Date(initialData.startDate).toISOString().split('T')[0],
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
          isCurrent: initialData.isCurrent,
          description: initialData.description || '',
        });
      } else {
        // No data, so we are in "add" mode. Reset to blank fields.
        reset({
          title: '', company: '', startDate: '', endDate: '',
          isCurrent: false, description: ''
        });
      }
    }
  }, [initialData, isOpen, reset]);

  const isCurrentJob = watch('isCurrent');

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2">
                  {initialData ? 'Edit' : 'Add'} Work Experience
                </Dialog.Title>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="title">Job Title</Label><Input id="title" {...register('title')} />{errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}</div>
                    <div className="space-y-1"><Label htmlFor="company">Company</Label><Input id="company" {...register('company')} />{errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" {...register('startDate')} />{errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}</div>
                    <div className="space-y-1"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" {...register('endDate')} disabled={isCurrentJob} />{errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}</div>
                  </div>
                  <div className="flex items-center space-x-2"><input id="isCurrent" type="checkbox" className="h-4 w-4 rounded" {...register('isCurrent')} /><Label htmlFor="isCurrent">I currently work here</Label></div>
                  <div className="space-y-1"><Label htmlFor="description">Description</Label><textarea id="description" rows={4} className="w-full rounded-md border-gray-300 text-sm shadow-sm" {...register('description')} /></div>
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Save</Button>
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