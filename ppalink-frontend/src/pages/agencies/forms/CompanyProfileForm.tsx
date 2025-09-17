import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/ui/Button';
import { DropdownTrigger } from '../../../components/ui/DropdownTrigger';
import { Label } from '../../../components/ui/Label';
import { SimpleDropdown, SimpleDropdownItem } from '../../../components/ui/SimpleDropdown';
import { useDataStore } from '../../../context/DataStore';
import type { Agency } from '../../../types/agency';

const companyProfileSchema = z.object({
  name: z.string().min(2, 'Agency name is required.'),
  rcNumber: z.string().optional().nullable(),
  website: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .optional()
    .nullable(),
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
  const [industrySearch, setIndustrySearch] = useState('');

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

  const selectedIndustryName =
    industries.find((i) => i.id === watchedIndustryId)?.name || 'Select an industry...';
  const selectedStateName =
    states.find((s) => s.id === watchedStateId)?.name || 'Select a state...';

  // Group industries by heading & filter via search
  const groupedIndustries = React.useMemo(() => {
    const groups: { heading: typeof industries[number]; children: typeof industries[number][] }[] = [];
    let currentHeading: typeof industries[number] | null = null;
    const sortedByOrder = [...industries].sort((a, b) => a.order - b.order);
  
    for (const item of sortedByOrder) {
      if (item.isHeading) {
        currentHeading = item;
        groups.push({ heading: item, children: [] });
      } else if (currentHeading) {
        groups[groups.length - 1].children.push(item);
      }
    }
  
    // Alphabetical sort of headings and children
    groups.sort((a, b) => a.heading.name.localeCompare(b.heading.name));
    for (const g of groups) g.children.sort((a, b) => a.name.localeCompare(b.name));
  
    if (industrySearch.trim()) {
      const searchLower = industrySearch.toLowerCase();
      return groups
        .map((g) => {
          const headingMatches = g.heading.name.toLowerCase().includes(searchLower);
  
          // If heading matches → include all children
          if (headingMatches) {
            return g;
          }
  
          // Otherwise → include only children that match
          const matchedChildren = g.children.filter((c) =>
            c.name.toLowerCase().includes(searchLower)
          );
  
          if (matchedChildren.length > 0) {
            return {
              heading: g.heading,
              children: matchedChildren,
            };
          }
  
          return null; // exclude group if no matches
        })
        .filter(Boolean) as typeof groups;
    }
  
    return groups;
  }, [industries, industrySearch]);
  

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
          <Input
            id="website"
            type="url"
            placeholder="https://..."
            error={!!errors.website}
            {...register('website')}
          />
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
                isIndustryDropdown
              >
                <div className="px-2 py-1">
                  <input
                    type="text"
                    value={industrySearch}
                    onChange={(e) => setIndustrySearch(e.target.value)}
                    placeholder="Search industries..."
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <SimpleDropdownItem onSelect={() => onChange(null)}>
                  Select an industry...
                </SimpleDropdownItem>

                {groupedIndustries.map(({ heading, children }) => (
                  <div key={heading.id}>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                      {heading.name}
                    </div>
                    {children.map((child) => (
                      <SimpleDropdownItem
                        key={child.id}
                        onSelect={() => onChange(child.id)}
                      >
                        {child.name}
                      </SimpleDropdownItem>
                    ))}
                  </div>
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
                <SimpleDropdownItem onSelect={() => onChange(null)}>
                  Select a state...
                </SimpleDropdownItem>
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
