import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { FileUpload } from '../../components/forms/FileUpload';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { Label } from '../../components/ui/Label';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import type { CandidateProfile } from '../../types/candidate';
import { NYSC_BATCHES, NYSC_STREAMS } from '../../utils/constants';

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
  cvFileKey: z.string().optional().nullable(),
  nyscFileKey: z.string().optional().nullable(),
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
    setValue,
    control,
    watch,
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
      cvFileKey: initialData?.cvFileKey || null,
      nyscFileKey: initialData?.nyscFileKey || null,
    },
  });
  
  const watchedNyscBatch = watch('nyscBatch');
  const watchedNyscStream = watch('nyscStream');

  const handleCvUploadSuccess = (fileKey: string, file: File) => {
    setValue('cvFileKey', fileKey, { shouldDirty: true });
    toast.success("CV uploaded. Remember to save your changes.");
  };
  
  const handleNyscUploadSuccess = (fileKey: string, file: File) => {
    setValue('nyscFileKey', fileKey, { shouldDirty: true });
    toast.success("NYSC document uploaded. Remember to save your changes.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
          <textarea id="summary" rows={5} className="flex w-full rounded-md border border-gray-300" {...register('summary')} />
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">NYSC & Education</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="space-y-2">
                <Label>NYSC Batch</Label>
                <Controller
                  name="nyscBatch"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{watchedNyscBatch || 'Select...'}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange('')}>Select...</SimpleDropdownItem>
                      {NYSC_BATCHES.map(b => <SimpleDropdownItem key={b} onSelect={() => onChange(b)}>{b}</SimpleDropdownItem>)}
                    </SimpleDropdown>
                  )}
                />
            </div>
            <div className="space-y-2">
                <Label>NYSC Stream</Label>
                 <Controller
                  name="nyscStream"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{watchedNyscStream || 'Select...'}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange('')}>Select...</SimpleDropdownItem>
                      {NYSC_STREAMS.map(s => <SimpleDropdownItem key={s} onSelect={() => onChange(s)}>{s}</SimpleDropdownItem>)}
                    </SimpleDropdown>
                  )}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input id="graduationYear" type="number" {...register('graduationYear')} />
            </div>
        </div>
      </section>

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

      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Documents</h3>
        <p className="text-sm text-gray-500">
          Upload your CV and NYSC Call-up Letter. These will be saved when you click "Save Changes".
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FileUpload
            label="Curriculum Vitae (CV)"
            uploadType="cv"
            onUploadSuccess={handleCvUploadSuccess}
          />
          <FileUpload
            label="NYSC Call-up Letter"
            uploadType="nysc_document"
            onUploadSuccess={handleNyscUploadSuccess}
          />
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={isSubmitting} className="justify-center">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;