import { Building, ChevronDown, Filter, Search } from "lucide-react";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/forms/Input";
import { Label } from "../../components/ui/Label";
import { SimpleDropdown, SimpleDropdownItem } from "../../components/ui/SimpleDropdown";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { useDataStore } from "../../context/DataStore";
import LocationSelector from "../../components/forms/LocationSelector";

interface JobsFilterSidebarProps {
  onFilterChange: (filters: JobFilterValues) => void;
  isLoading: boolean;
  currentFilters: JobFilterValues;
}

export interface JobFilterValues {
  q: string;
  isRemote: boolean;
  countryId?: number;
  regionId?: number;
  cityId?: number;
  industryId?: number;
}

const JobsFilterSidebar = ({
  onFilterChange,
  isLoading,
  currentFilters,
}: JobsFilterSidebarProps) => {
  const methods = useForm<JobFilterValues>({
    defaultValues: currentFilters,
  });
  const { register, handleSubmit, reset, control, watch } = methods;
  const { industries } = useDataStore();

  const watchedIndustry = watch("industryId");
  const selectedIndustryName =
    industries.find((i) => i.id === watchedIndustry)?.name || "All Industries";

  const handleClear = () => {
    reset({
      q: "",
      isRemote: false,
      countryId: undefined,
      regionId: undefined,
      cityId: undefined,
      industryId: undefined,
    });
    onFilterChange({
      q: "",
      isRemote: false,
      countryId: undefined,
      regionId: undefined,
      cityId: undefined,
      industryId: undefined,
    });
  };

  const handleApplyFilters = (values: JobFilterValues) => {
    onFilterChange(values);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-md font-semibold text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4 flex items-center">
        <Filter className="mr-2 h-4 w-4" />
        Filter Jobs
      </h2>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(handleApplyFilters)}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label>Search</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </div>
              <Input
                type="search"
                placeholder="Search by title, company, or skill..."
                className="pl-9"
                {...register("q")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Industry</Label>
            <Controller
              name="industryId"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger className="w-full">
                      <Building className="h-4 w-4 mr-2" />
                      <span>{selectedIndustryName}</span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange(undefined)}>
                    All Industries
                  </SimpleDropdownItem>
                  {industries
                    .filter((i) => !i.isHeading)
                    .map((i) => (
                      <SimpleDropdownItem
                        key={i.id}
                        onSelect={() => onChange(i.id)}
                      >
                        {i.name}
                      </SimpleDropdownItem>
                    ))}
                </SimpleDropdown>
              )}
            />
          </div>

          <LocationSelector stacked />

          <div className="space-y-1.5">
            <Controller
              name="isRemote"
              control={control}
              render={({ field: { onChange, value } }) => (
                <label className="flex items-center gap-2 text-sm font-medium select-none">
                  <ToggleSwitch
                    enabled={value}
                    onChange={onChange}
                    srLabel="Remote only"
                  />
                  Remote Only
                </label>
              )}
            />
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <Button
              size="sm"
              type="submit"
              className="w-full rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
              isLoading={isLoading}
            >
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-lg"
              onClick={handleClear}
            >
              Clear Filters
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default JobsFilterSidebar;