import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import { useDataStore } from '../../context/DataStore';
import type { Agency } from '../../types/agency';

const companyProfileSchema = z.object({
  name: z.string().min(2, 'Agency name is required.'),
  rcNumber: z.string().optional().nullable(),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  sizeRange: z.string().optional().nullable(),
  industryId: z.coerce.number().optional().nullable(),
  headquartersStateId: z.coerce.number().optional().nullable(),
  lgaId: z.coerce.number().optional().nullable(),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

interface CompanyProfileFormProps {
  initialData?: Agency | null;
  onSubmit: (data: CompanyProfileFormValues) => Promise<void>;
}

const CompanyProfileForm = ({ initialData, onSubmit }: CompanyProfileFormProps) => {
  // Get industries and states from the global store
  const { industries, states } = useDataStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      rcNumber: initialData?.rcNumber || '',
      website: initialData?.website || '',
      sizeRange: initialData?.sizeRange || '',
      industryId: initialData?.industryId || undefined,
      headquartersStateId: initialData?.headquartersStateId || undefined,
      lgaId: initialData?.lgaId || undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Agency Name</Label>
        <Input id="name" error={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rcNumber">RC Number</Label>
          <Input id="rcNumber" error={!!errors.rcNumber} {...register('rcNumber')} />
          {errors.rcNumber && <p className="text-xs text-red-600">{errors.rcNumber.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website URL</Label>
          <Input id="website" type="url" placeholder="https://..." error={!!errors.website} {...register('website')} />
          {errors.website && <p className="text-xs text-red-600">{errors.website.message}</p>}
        </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="sizeRange">Company Size (e.g., 1-10, 11-50)</Label>
          <Input id="sizeRange" error={!!errors.sizeRange} {...register('sizeRange')} />
          {errors.sizeRange && <p className="text-xs text-red-600">{errors.sizeRange.message}</p>}
        </div>

      <div className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industryId">Industry</Label>
          <select
            id="industryId"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
            {...register('industryId')}
          >
            <option value="">Select an industry...</option>
            {industries.map((industry) => (
              <option key={industry.id} value={industry.id}>{industry.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="headquartersStateId">Headquarters State</Label>
           <select
            id="headquartersStateId"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
            {...register('headquartersStateId')}
          >
            <option value="">Select a state...</option>
             {states.map((state) => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default CompanyProfileForm;