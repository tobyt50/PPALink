import { Dialog, Transition } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import type { Education } from '../../../types/candidate';

// Zod schema for validation
const educationSchema = z.object({
  institution: z.string().min(3, 'Institution name is required.'),
  degree: z.string().min(2, 'Degree is required.'),
  field: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  startDate: z.string().refine((val) => val, { message: 'Start date is required.' }),
  endDate: z.string().refine((val) => val, { message: 'End date is required.' }),
});

export type EducationFormValues = z.infer<typeof educationSchema>;

interface EducationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EducationFormValues) => Promise<void>;
  initialData?: Education | null;
}

export const EducationFormModal = ({ isOpen, onClose, onSubmit, initialData }: EducationFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: '', degree: '', field: '', grade: '', startDate: '', endDate: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          institution: initialData.institution,
          degree: initialData.degree,
          field: initialData.field || '',
          grade: initialData.grade || '',
          startDate: new Date(initialData.startDate).toISOString().split('T')[0],
          endDate: new Date(initialData.endDate).toISOString().split('T')[0],
        });
      } else {
        reset({
          institution: '', degree: '', field: '', grade: '', startDate: '', endDate: ''
        });
      }
    }
  }, [initialData, isOpen, reset]);

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
          <div className="fixed inset-0 bg-gray-900/25 dark:bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600">
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-zinc-50 border-b pb-2">
                  {initialData ? 'Edit' : 'Add'} Education
                </Dialog.Title>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div className="space-y-1"><Label htmlFor="institution">Institution</Label><Input id="institution" {...register('institution')} />{errors.institution && <p className="text-xs text-red-500">{errors.institution.message}</p>}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="degree">Degree</Label><Input id="degree" {...register('degree')} />{errors.degree && <p className="text-xs text-red-500">{errors.degree.message}</p>}</div>
                    <div className="space-y-1"><Label htmlFor="field">Field of Study</Label><Input id="field" {...register('field')} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="date" {...register('startDate')} />{errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}</div>
                    <div className="space-y-1"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" {...register('endDate')} />{errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}</div>
                  </div>
                   <div className="space-y-1"><Label htmlFor="grade">Grade</Label><Input id="grade" {...register('grade')} /></div>
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
