import { Controller, FormProvider, useForm } from "react-hook-form";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../components/ui/SimpleDropdown";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { useDataStore } from "../../context/DataStore";
import LocationSelector from "../../components/forms/LocationSelector";
import type { ReportFilters } from "../../types/analytics";

interface ReportFilterBarProps {
  onApply: (filters: ReportFilters) => void;
  isLoading: boolean;
  activeReport: string;
}

const ReportFilterBar = ({
  onApply,
  isLoading,
  activeReport,
}: ReportFilterBarProps) => {
  const { industries, courses } = useDataStore();
  const methods = useForm<ReportFilters>({
    defaultValues: {
      startDate: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
      endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
      groupBy: "day",
      countryId: undefined,
      regionId: undefined,
      cityId: undefined,
      industryId: undefined,
      fieldOfStudy: undefined,
    },
  });
  const { handleSubmit, control, watch, reset } = methods;

  const watchedGroupBy = watch("groupBy");
  const watchedIndustryId = watch("industryId");
  const watchedFieldOfStudy = watch("fieldOfStudy");

  const selectedGroupByText = { day: "Day", week: "Week", month: "Month" }[
    watchedGroupBy || "day"
  ];
  const selectedIndustryName =
    industries.find((i) => i.id === watchedIndustryId)?.name ||
    "All Industries";
  const selectedFieldName = watchedFieldOfStudy || "All Fields of Study";

  const handleClear = () => {
    const defaultFilters: ReportFilters = {
      startDate: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
      endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
      groupBy: "day",
      countryId: undefined,
      regionId: undefined,
      cityId: undefined,
      industryId: undefined,
      fieldOfStudy: undefined,
    };
    reset(defaultFilters);
    onApply(defaultFilters);
  };

  const processSubmit = (data: ReportFilters) => {
    const payload: ReportFilters = {
      startDate: data.startDate,
      endDate: data.endDate,
      groupBy: data.groupBy,
      countryId: data.countryId ? Number(data.countryId) : undefined,
      regionId: data.regionId ? Number(data.regionId) : undefined,
      cityId: data.cityId ? Number(data.cityId) : undefined,
      industryId: data.industryId ? Number(data.industryId) : undefined,
      fieldOfStudy: data.fieldOfStudy || undefined,
    };
    onApply(payload);
  };

  const inputStyle = `flex h-10 w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-colors duration-150 placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50`;

  return (
    <div className="space-y-5">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(processSubmit)} className="space-y-3">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block">
              Start Date
            </label>
            <input
              type="date"
              className={inputStyle}
              {...methods.register("startDate")}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block">
              End Date
            </label>
            <input
              type="date"
              className={inputStyle}
              {...methods.register("endDate")}
            />
          </div>

          {/* Group By */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block">
              Group By
            </label>
            <Controller
              name="groupBy"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger className="w-full">
                      <span className="truncate">{selectedGroupByText}</span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange("day")}>
                    Day
                  </SimpleDropdownItem>
                  <SimpleDropdownItem onSelect={() => onChange("week")}>
                    Week
                  </SimpleDropdownItem>
                  <SimpleDropdownItem onSelect={() => onChange("month")}>
                    Month
                  </SimpleDropdownItem>
                </SimpleDropdown>
              )}
            />
          </div>

          {/* Industry or Field of Study */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block">
              {activeReport === "candidateInsights" ? "Field of Study" : "Industry"}
            </label>
            <Controller
              name={activeReport === "candidateInsights" ? "fieldOfStudy" : "industryId"}
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger className="w-full">
                      <span className="truncate">
                        {activeReport === "candidateInsights"
                          ? selectedFieldName
                          : selectedIndustryName}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem
                    onSelect={() =>
                      onChange(activeReport === "candidateInsights" ? undefined : undefined)
                    }
                  >
                    {activeReport === "candidateInsights"
                      ? "All Fields of Study"
                      : "All Industries"}
                  </SimpleDropdownItem>
                  {activeReport === "candidateInsights"
                    ? courses.map((course) => (
                        <SimpleDropdownItem
                          key={course}
                          onSelect={() => onChange(course)}
                        >
                          {course}
                        </SimpleDropdownItem>
                      ))
                    : industries
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

          {/* Location Selector */}
          <div className="space-y-1.5">
            <LocationSelector stacked />
          </div>

          {/* Buttons */}
          <div className="flex flex-col space-y-3 pt-4">
            <Button
              size="sm"
              type="submit"
              isLoading={isLoading}
              className="w-full rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
            >
              Generate Report
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

export default ReportFilterBar;