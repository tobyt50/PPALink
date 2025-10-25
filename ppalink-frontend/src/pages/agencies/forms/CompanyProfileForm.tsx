import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Input } from "../../../components/forms/Input";
import { Button } from "../../../components/ui/Button";
import { DropdownTrigger } from "../../../components/ui/DropdownTrigger";
import { Label } from "../../../components/ui/Label";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../../components/ui/SimpleDropdown";
import { useDataStore } from "../../../context/DataStore";
import type { Agency } from "../../../types/agency";
import LocationSelector from "../../../components/forms/LocationSelector";

const companyProfileSchema = z.object({
  name: z.string().min(2, "Agency name is required."),
  rcNumber: z.string().optional().nullable(),
  website: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional()
    .nullable(),
  sizeRange: z.string().optional().nullable(),
  industryId: z.number().optional().nullable(),
  countryId: z.number().optional().nullable(),
  regionId: z.number().optional().nullable(),
  cityId: z.number().optional().nullable(),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

interface CompanyProfileFormProps {
  initialData?: Agency | null;
  onSubmit: (data: CompanyProfileFormValues) => Promise<void>;
  submitButtonText?: string;
  sidebarOffset?: boolean;
}

const CompanyProfileForm = ({
  initialData,
  onSubmit,
  submitButtonText = "Save Changes",
  sidebarOffset = false,
}: CompanyProfileFormProps) => {
  const { industries } = useDataStore();
  const [industrySearch, setIndustrySearch] = useState("");

  const methods = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: initialData?.name || "",
      rcNumber: initialData?.rcNumber || "",
      website: initialData?.website || "",
      sizeRange: initialData?.sizeRange || "",
      industryId: initialData?.industryId || undefined,
      countryId: initialData?.countryId || undefined,
      regionId: initialData?.regionId || undefined,
      cityId: initialData?.cityId || undefined,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    register,
  } = methods;

  const watchedIndustryId = watch("industryId");
  const selectedIndustryName =
    industries.find((i) => i.id === watchedIndustryId)?.name ||
    "Select an industry...";

  const groupedIndustries = React.useMemo(() => {
    const groups: {
      heading: (typeof industries)[number];
      children: (typeof industries)[number][];
    }[] = [];
    let currentHeading: (typeof industries)[number] | null = null;
    const sortedByOrder = [...industries].sort((a, b) => a.order - b.order);
    for (const item of sortedByOrder) {
      if (item.isHeading) {
        currentHeading = item;
        groups.push({ heading: item, children: [] });
      } else if (currentHeading) {
        groups[groups.length - 1].children.push(item);
      }
    }
    groups.sort((a, b) => a.heading.name.localeCompare(b.heading.name));
    for (const g of groups)
      g.children.sort((a, b) => a.name.localeCompare(b.name));
    if (industrySearch.trim()) {
      const searchLower = industrySearch.toLowerCase();
      return groups
        .map((g) => {
          const headingMatches = g.heading.name
            .toLowerCase()
            .includes(searchLower);
          if (headingMatches) {
            return g;
          }
          const matchedChildren = g.children.filter((c) =>
            c.name.toLowerCase().includes(searchLower)
          );
          if (matchedChildren.length > 0) {
            return { heading: g.heading, children: matchedChildren };
          }
          return null;
        })
        .filter(Boolean) as typeof groups;
    }
    return groups;
  }, [industries, industrySearch]);

  const formClassName = sidebarOffset ? "md:ml-72" : "";

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-6 ${formClassName}`}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Agency Name</Label>
          <Input id="name" error={!!errors.name} {...register("name")} />
          {errors.name && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rcNumber">RC Number</Label>
            <Input
              id="rcNumber"
              error={!!errors.rcNumber}
              {...register("rcNumber")}
            />
            {errors.rcNumber && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.rcNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://..."
              error={!!errors.website}
              {...register("website")}
            />
            {errors.website && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.website.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sizeRange">Company Size (e.g., 1-10, 11-50)</Label>
          <Input
            id="sizeRange"
            error={!!errors.sizeRange}
            {...register("sizeRange")}
          />
          {errors.sizeRange && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.sizeRange.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 pt-2">
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
                    <Input
                      type="text"
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      placeholder="Search industries..."
                    />
                  </div>
                  <SimpleDropdownItem onSelect={() => onChange(null)}>
                    Select an industry...
                  </SimpleDropdownItem>
                  {groupedIndustries.map(({ heading, children }) => (
                    <div key={heading.id}>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">
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
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <Label>Headquarters Location</Label>
          <LocationSelector />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="justify-center"
          >
            {submitButtonText}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CompanyProfileForm;
