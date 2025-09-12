import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { Label } from '../../components/ui/Label';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import { useDataStore } from '../../context/DataStore';
import type { Agency } from '../../types/agency';

const companyProfileSchema = z.object({
  name: z.string().min(2, 'Agency name is required.'),
  rcNumber: z.string().optional().nullable(),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  sizeRange: z.string().optional().nullable(),
  industryId: z.number().optional().nullable(),
  headquartersStateId: z.number().optional().nullable(),
  lgaId: z.number().optional().nullable(),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

interface CompanyProfileFormProps {
  initialData?: Agency | null;
  onSubmit: (data: CompanyProfileFormValues) => Promise<void>;
}

const CompanyProfileForm = ({ initialData, onSubmit }: CompanyProfileFormProps) => {
  const { industries, states } = useDataStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
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

  const watchedIndustryId = watch('industryId');
  const watchedStateId = watch('headquartersStateId');

  const selectedIndustryName = industries.find(i => i.id === watchedIndustryId)?.name || 'Select an industry...';
  const selectedStateName = states.find(s => s.id === watchedStateId)?.name || 'Select a state...';

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
          <Label>Industry</Label>
          <Controller
            name="industryId"
            control={control}
            render={({ field: { onChange } }) => (
              <SimpleDropdown
                trigger={
                  <DropdownTrigger>
                    <span className="truncate">{selectedIndustryName}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </DropdownTrigger>
                }
              >
                <SimpleDropdownItem onSelect={() => onChange(null)}>Select an industry...</SimpleDropdownItem>
                {industries.map((industry) => (
                  <SimpleDropdownItem key={industry.id} onSelect={() => onChange(industry.id)}>
                    {industry.name}
                  </SimpleDropdownItem>
                ))}
              </SimpleDropdown>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Headquarters State</Label>
           <Controller
            name="headquartersStateId"
            control={control}
            render={({ field: { onChange } }) => (
              <SimpleDropdown
                trigger={
                  <DropdownTrigger>
                    <span className="truncate">{selectedStateName}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </DropdownTrigger>
                }
              >
                <SimpleDropdownItem onSelect={() => onChange(null)}>Select a state...</SimpleDropdownItem>
                {states.map((state) => (
                  <SimpleDropdownItem key={state.id} onSelect={() => onChange(state.id)}>
                    {state.name}
                  </SimpleDropdownItem>
                ))}
              </SimpleDropdown>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={isSubmitting} className="justify-center">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default CompanyProfileForm;