import { zodResolver } from '@hookform/resolvers/zod';
import { XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import type { Position } from '../../types/job';

// --- MOCK DATA FOR DROPDOWNS ---
const mockStates = [
  { id: 25, name: 'Lagos' },
  { id: 1, name: 'Abuja (FCT)' },
  { id: 33, name: 'Rivers' },
];
// ---

// ====================
// Validation Schema
// ====================
const jobFormSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    employmentType: z.enum(['INTERN', 'NYSC', 'FULLTIME', 'PARTTIME', 'CONTRACT']),
    isRemote: z.boolean().default(false),
    stateId: z.coerce.number().optional().nullable(),
    lgaId: z.coerce.number().optional().nullable(),
    minSalary: z.coerce.number().optional().nullable(),
    maxSalary: z.coerce.number().optional().nullable(),
    // Updated schema for skills to be an array of strings
    skillsReq: z.array(z.string()).min(1, 'Please add at least one skill'),
    visibility: z.enum(['PUBLIC', 'PRIVATE']),
    status: z.enum(['DRAFT', 'OPEN', 'CLOSED']).default('OPEN'),
  })
  .refine(
    (data) => {
      if (data.maxSalary && data.minSalary) {
        return data.maxSalary >= data.minSalary;
      }
      return true;
    },
    {
      message: 'Max salary must be greater than or equal to min salary',
      path: ['maxSalary'],
    }
  );

export type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: Position | null;
  onSubmit: (data: JobFormValues) => Promise<void>;
  submitButtonText?: string;
}

const JobForm = ({ initialData, onSubmit, submitButtonText = 'Create Job' }: JobFormProps) => {
  const {
    register,
    control, // Get control for useFieldArray
    handleSubmit,
    reset,
    watch, // Watch the value of skillsReq to display it
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      employmentType: initialData?.employmentType || 'FULLTIME',
      isRemote: initialData?.isRemote || false,
      stateId: initialData?.stateId || undefined,
      lgaId: initialData?.lgaId || undefined,
      minSalary: initialData?.minSalary || undefined,
      maxSalary: initialData?.maxSalary || undefined,
      skillsReq: Array.isArray(initialData?.skillsReq) ? initialData.skillsReq : [],
      visibility: initialData?.visibility || 'PUBLIC',
      status: initialData?.status || 'OPEN',
    },
  });

  // Setup for the dynamic skills array
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skillsReq",
  });

  const [skillInput, setSkillInput] = useState('');
  const skills = watch('skillsReq'); // Watch the skills array to correctly display chips

  const addSkill = () => {
    if (skillInput.trim() === '' || (skills && skills.includes(skillInput.trim()))) {
      setSkillInput('');
      return;
    }
    append(skillInput.trim());
    setSkillInput('');
  };

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        minSalary: initialData.minSalary || undefined,
        maxSalary: initialData.maxSalary || undefined,
        stateId: initialData.stateId || undefined,
        lgaId: initialData.lgaId || undefined,
        skillsReq: Array.isArray(initialData.skillsReq) ? initialData.skillsReq as string[] : [],
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* --- Job Info --- */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input id="title" placeholder="e.g., Software Engineer" {...register('title')} />
          {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Job Description</Label>
          <textarea
            id="description"
            rows={8}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>
      </section>

      {/* --- Details --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Details & Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment Type</Label>
            <select
              id="employmentType"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
              {...register('employmentType')}
            >
              <option value="FULLTIME">Full-time</option>
              <option value="PARTTIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
              <option value="NYSC">NYSC</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
              {...register('visibility')}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="minSalary">Minimum Salary (₦)</Label>
            <Input id="minSalary" type="number" {...register('minSalary')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxSalary">Maximum Salary (₦)</Label>
            <Input id="maxSalary" type="number" {...register('maxSalary')} />
            {errors.maxSalary && (
              <p className="text-xs text-red-600">{errors.maxSalary.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stateId">Location State</Label>
            <select
              id="stateId"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
              {...register('stateId')}
            >
              <option value="">Select a state...</option>
              {mockStates.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Position Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
              {...register('status')}
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* --- Skills Section --- */}
        <div className="space-y-2">
          <Label>Skills Required</Label>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Type a skill and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800"
              >
                <span>{skills[index]}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ))}
          </div>
          {errors.skillsReq && (
            <p className="text-xs text-red-600">{errors.skillsReq.message || (errors.skillsReq as any)?.root?.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            id="isRemote"
            type="checkbox"
            className="h-4 w-4 rounded"
            {...register('isRemote')}
          />
          <Label htmlFor="isRemote">This is a fully remote position</Label>
        </div>
      </section>

      {/* --- Submit --- */}
      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;