import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import type { CandidateProfile } from '../../types/candidate';
import { NYSC_BATCHES, NYSC_STREAMS } from '../../utils/constants'; // 1. Import from constants

// The Zod schema remains the same
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  linkedin: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  portfolio: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  isRemote: z.boolean().optional(),
  isOpenToReloc: z.boolean().optional(),
  salaryMin: z.coerce.number().optional().nullable(),
  nyscBatch: z.string().optional().nullable(),
  nyscStream: z.string().optional().nullable(),
  graduationYear: z.coerce.number().optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: CandidateProfile | null;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  submitButtonText?: string;
}

const ProfileForm = ({ initialData, onSubmit, submitButtonText = 'Save Changes' }: ProfileFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phone: initialData?.phone || '',
      dob: initialData?.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
      gender: initialData?.gender || '',
      summary: initialData?.summary || '',
      linkedin: initialData?.linkedin || '',
      portfolio: initialData?.portfolio || '',
      isRemote: initialData?.isRemote || false,
      isOpenToReloc: initialData?.isOpenToReloc || false,
      salaryMin: initialData?.salaryMin || undefined,
      nyscBatch: initialData?.nyscBatch || '',
      nyscStream: initialData?.nyscStream || '',
      graduationYear: initialData?.graduationYear || undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information Section (unchanged) */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" error={!!errors.firstName} {...register('firstName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" error={!!errors.lastName} {...register('lastName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" error={!!errors.phone} {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" error={!!errors.dob} {...register('dob')} />
            </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
            {errors.linkedin && <p className="text-xs text-red-600">{errors.linkedin.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input id="portfolio" type="url" placeholder="https://..." {...register('portfolio')} />
            {errors.portfolio && <p className="text-xs text-red-600">{errors.portfolio.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <textarea id="summary" rows={5} className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm" {...register('summary')} />
        </div>
      </section>

      {/* NYSC & Education Section */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">NYSC & Education</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="space-y-2">
                <Label htmlFor="nyscBatch">NYSC Batch</Label>
                <select id="nyscBatch" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm" {...register('nyscBatch')}>
                    <option value="">Select...</option>
                    {/* 2. Use the imported constant for batches */}
                    {NYSC_BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="nyscStream">NYSC Stream</Label>
                 <select id="nyscStream" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm" {...register('nyscStream')}>
                    <option value="">Select...</option>
                    {/* 3. Use the imported constant for streams */}
                    {NYSC_STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input id="graduationYear" type="number" {...register('graduationYear')} />
            </div>
        </div>
      </section>

      {/* Job Preferences Section (unchanged) */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Job Preferences</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Minimum Monthly Salary (₦)</Label>
            <Input id="salaryMin" type="number" placeholder="e.g., 150000" {...register('salaryMin')} />
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <input id="isRemote" type="checkbox" className="h-4 w-4 rounded" {...register('isRemote')} />
            <Label htmlFor="isRemote">Open to Remote work</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="isOpenToReloc" type="checkbox" className="h-4 w-4 rounded" {...register('isOpenToReloc')} />
            <Label htmlFor="isOpenToReloc">Open to Relocation</Label>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;