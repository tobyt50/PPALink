import {
  Award,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { Input } from "../../components/forms/Input";
import { Label } from "../../components/ui/Label";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../components/ui/SimpleDropdown";
import { useDataStore } from "../../context/DataStore";
import type { Agency } from "../../types/agency";
import { NYSC_BATCHES } from "../../utils/constants";
import {
  MultiSelect,
  type MultiSelectOption,
} from "../../components/ui/MultiSelect";
import LocationSelector from "../../components/forms/LocationSelector";

export type CandidateFilterValues = {
  countryId: number | null;
  regionId: number | null;
  cityId: number | null;
  nyscBatch: string | null;
  skills: number[];
  isRemote: boolean;
  isOpenToReloc: boolean;
  gpaBand: string | null;
  graduationYear: number | null;
  university: string | null;
  courseOfStudy: string | null;
  degree: string | null;
  verifiedSkillIds: number[];
};

interface FilterSidebarProps {
  onFilterChange: (filters: CandidateFilterValues) => void;
  agency: Agency | null;
  currentFilters?: Partial<CandidateFilterValues>;
}

const gpaBands = [
  "First Class",
  "Second Class Upper",
  "Second Class Lower",
  "Third Class",
];
const gpaBandMap: Record<string, string> = {
  "1st": "First Class",
  first: "First Class",
  "2:1": "Second Class Upper",
  "2i": "Second Class Upper",
  second: "Second Class Upper",
  "2nd": "Second Class Upper",
  "2:2": "Second Class Lower",
  "2ii": "Second Class Lower",
  third: "Third Class",
  "3rd": "Third Class",
};

const FilterSidebar = ({
  onFilterChange,
  agency,
  currentFilters,
}: FilterSidebarProps) => {
  const {
    universities,
    courses,
    degrees,
    skills: allSkills,
    verifiableSkills,
  } = useDataStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [universitySearch, setUniversitySearch] = useState("");

  const methods = useForm<CandidateFilterValues>({
    defaultValues: currentFilters || {
      countryId: null,
      regionId: null,
      cityId: null,
      nyscBatch: null,
      skills: [],
      isRemote: false,
      isOpenToReloc: false,
      gpaBand: null,
      graduationYear: null,
      university: null,
      courseOfStudy: null,
      degree: null,
      verifiedSkillIds: [],
    },
  });
  const { register, handleSubmit, reset, control, watch } = methods;

  useEffect(() => {
    if (currentFilters) {
      reset({
        ...currentFilters,
        countryId: currentFilters.countryId ?? null,
        regionId: currentFilters.regionId ?? null,
        cityId: currentFilters.cityId ?? null,
        nyscBatch: currentFilters.nyscBatch ?? null,
        skills: currentFilters.skills ?? [],
        isRemote: currentFilters.isRemote ?? false,
        isOpenToReloc: currentFilters.isOpenToReloc ?? false,
        gpaBand: currentFilters.gpaBand ?? null,
        graduationYear: currentFilters.graduationYear ?? null,
        university: currentFilters.university ?? null,
        courseOfStudy: currentFilters.courseOfStudy ?? null,
        degree: currentFilters.degree ?? null,
        verifiedSkillIds: currentFilters.verifiedSkillIds ?? [],
      });
    }
  }, [currentFilters, reset]);

  const currentPlanName = agency?.subscriptions?.[0]?.plan?.name || "Free";
  const isPaid = currentPlanName !== "Free";
  const hasAdvancedAccess =
    currentPlanName === "Pro" || currentPlanName === "Enterprise";
  const skillOptions: MultiSelectOption[] = allSkills.map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const verifiableSkillOptions: MultiSelectOption[] = verifiableSkills.map(
    (s) => ({ value: s.id, label: s.name })
  );

  const watchedNyscBatch = watch("nyscBatch");
  const watchedGpaBand = watch("gpaBand");
  const watchedUniversity = watch("university");
  const watchedCourse = watch("courseOfStudy");
  const watchedDegree = watch("degree");

  const selectedBatchName = watchedNyscBatch || "All Batches";
  const selectedGpaBand = watchedGpaBand || "Any GPA";
  const selectedUniversity = watchedUniversity || "All Universities";
  const selectedCourse = watchedCourse || "All Courses";
  const selectedDegree = watchedDegree || "All Degrees";

  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const handleApplyFilters = (values: CandidateFilterValues) => {
    onFilterChange(values);
  };
  const handleReset = () => {
    reset();
    handleSubmit(onFilterChange)();
  };

  return (
    <div className="space-y-5">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(handleApplyFilters)}
          className="space-y-6"
        >
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills</Label>
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={skillOptions}
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Filter by skills..."
                />
              )}
            />
          </div>
          {isPaid ? (
            <>
              <div className="flex flex-col space-y-1.5">
                <Label>Course of Study</Label>
                <Controller
                  name="courseOfStudy"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedCourse}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>
                        All Courses
                      </SimpleDropdownItem>
                      {courses.map((course) => (
                        <SimpleDropdownItem
                          key={course}
                          onSelect={() => onChange(course)}
                        >
                          {course}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Degree</Label>
                <Controller
                  name="degree"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedDegree}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>
                        All Degrees
                      </SimpleDropdownItem>
                      {degrees.map((deg) => (
                        <SimpleDropdownItem
                          key={deg.id}
                          onSelect={() => onChange(deg.name)}
                        >
                          {deg.name}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>
            </>
          ) : null}
          <div className="flex flex-col space-y-1.5">
            <LocationSelector variant="country-only" />
          </div>
          <div className="border-t border-gray-100 dark:border-zinc-800 pt-5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {showAdvanced ? "Hide Advanced Filters" : "Show Advanced Filters"}
              {showAdvanced ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
          {showAdvanced && (
            <div className="space-y-5 animate-in fade-in">
              {!hasAdvancedAccess && (
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-950/60 text-yellow-900 dark:text-yellow-400 text-xs text-center">
                  <Lock className="inline h-3.5 w-3.5 mr-1.5" />
                  <Link
                    to="/dashboard/agency/billing"
                    className="font-semibold underline hover:text-yellow-950"
                  >
                    Upgrade to Pro
                  </Link>{" "}
                  to unlock advanced filters.
                </div>
              )}
              <div
                className={`flex flex-col space-y-1.5 ${
                  !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <LocationSelector variant="region-city" stacked />
              </div>
              <div
                className={`space-y-1.5 ${
                  !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <Label className="flex items-center">
                  <Award className="mr-2 h-4 w-4 text-blue-500" /> Filter by
                  Verified Skills
                </Label>
                <Controller
                  name="verifiedSkillIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={verifiableSkillOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select skills..."
                    />
                  )}
                />
              </div>
              {isPaid && (
                <div className="flex flex-col space-y-1.5">
                  <Label>University</Label>
                  <Controller
                    name="university"
                    control={control}
                    render={({ field: { onChange } }) => (
                      <SimpleDropdown
                        trigger={
                          <DropdownTrigger>
                            <span className="truncate">{selectedUniversity}</span>
                            <ChevronDown className="h-4 w-4" />
                          </DropdownTrigger>
                        }
                      >
                        <div className="p-2">
                          <Input
                            type="text"
                            value={universitySearch}
                            onChange={(e) => setUniversitySearch(e.target.value)}
                            placeholder="Search universities..."
                            className="w-full px-2 py-1.5 text-sm border rounded"
                          />
                        </div>
                        <SimpleDropdownItem
                          onSelect={() => {
                            onChange(null);
                            setUniversitySearch("");
                          }}
                        >
                          All Universities
                        </SimpleDropdownItem>
                        {filteredUniversities.map((uni) => (
                          <SimpleDropdownItem
                            key={uni.id}
                            onSelect={() => {
                              onChange(uni.name);
                              setUniversitySearch("");
                            }}
                          >
                            {uni.name}
                          </SimpleDropdownItem>
                        ))}
                      </SimpleDropdown>
                    )}
                  />
                </div>
              )}
              {!isPaid && (
                <>
                  <div
                    className={`flex flex-col space-y-1.5 ${
                      !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <Label>University</Label>
                    <Controller
                      name="university"
                      control={control}
                      render={({ field: { onChange } }) => (
                        <SimpleDropdown
                          trigger={
                            <DropdownTrigger>
                              <span className="truncate">
                                {selectedUniversity}
                              </span>
                              <ChevronDown className="h-4 w-4" />
                            </DropdownTrigger>
                          }
                        >
                          <SimpleDropdownItem onSelect={() => onChange(null)}>
                            All Universities
                          </SimpleDropdownItem>
                          {universities.map((uni) => (
                            <SimpleDropdownItem
                              key={uni.id}
                              onSelect={() => onChange(uni.name)}
                            >
                              {uni.name}
                            </SimpleDropdownItem>
                          ))}
                        </SimpleDropdown>
                      )}
                    />
                  </div>
                  <div
                    className={`flex flex-col space-y-1.5 ${
                      !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <Label>Course of Study</Label>
                    <Controller
                      name="courseOfStudy"
                      control={control}
                      render={({ field: { onChange } }) => (
                        <SimpleDropdown
                          trigger={
                            <DropdownTrigger>
                              <span className="truncate">{selectedCourse}</span>
                              <ChevronDown className="h-4 w-4" />
                            </DropdownTrigger>
                          }
                        >
                          <SimpleDropdownItem onSelect={() => onChange(null)}>
                            All Courses
                          </SimpleDropdownItem>
                          {courses.map((course) => (
                            <SimpleDropdownItem
                              key={course}
                              onSelect={() => onChange(course)}
                            >
                              {course}
                            </SimpleDropdownItem>
                          ))}
                        </SimpleDropdown>
                      )}
                    />
                  </div>
                  <div
                    className={`flex flex-col space-y-1.5 ${
                      !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <Label>Degree</Label>
                    <Controller
                      name="degree"
                      control={control}
                      render={({ field: { onChange } }) => (
                        <SimpleDropdown
                          trigger={
                            <DropdownTrigger>
                              <span className="truncate">{selectedDegree}</span>
                              <ChevronDown className="h-4 w-4" />
                            </DropdownTrigger>
                          }
                        >
                          <SimpleDropdownItem onSelect={() => onChange(null)}>
                            All Degrees
                          </SimpleDropdownItem>
                          {degrees.map((deg) => (
                            <SimpleDropdownItem
                              key={deg.id}
                              onSelect={() => onChange(deg.name)}
                            >
                              {deg.name}
                            </SimpleDropdownItem>
                          ))}
                        </SimpleDropdown>
                      )}
                    />
                  </div>
                </>
              )}
              <div
                className={`flex flex-col space-y-1.5 ${
                  !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <Label>NYSC Batch</Label>
                <Controller
                  name="nyscBatch"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedBatchName}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>
                        All Batches
                      </SimpleDropdownItem>
                      {NYSC_BATCHES.map((batch) => (
                        <SimpleDropdownItem
                          key={batch}
                          onSelect={() => onChange(batch)}
                        >
                          {batch}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>
              <div
                className={`flex flex-col space-y-1.5 ${
                  !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <Label>GPA Band</Label>
                <Controller
                  name="gpaBand"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <SimpleDropdown
                      trigger={
                        <DropdownTrigger>
                          <span className="truncate">{selectedGpaBand}</span>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownTrigger>
                      }
                    >
                      <SimpleDropdownItem onSelect={() => onChange(null)}>
                        Any GPA
                      </SimpleDropdownItem>
                      {gpaBands.map((band) => (
                        <SimpleDropdownItem
                          key={band}
                          onSelect={() => {
                            const normalized =
                              gpaBandMap[band.toLowerCase()] || band;
                            onChange(normalized);
                          }}
                        >
                          {band}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  )}
                />
              </div>
              <div
                className={`space-y-1.5 ${
                  !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  placeholder="e.g., 2024"
                  {...register("graduationYear", {
                    setValueAs: (v) => (v ? parseInt(v, 10) : null),
                  })}
                />
              </div>
              <fieldset
                className={`space-y-3 pt-2 ${
                  !hasAdvancedAccess ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="isRemote"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 dark:border-zinc-800 text-primary-600 dark:text-primary-400 focus:ring-primary-600"
                      {...register("isRemote")}
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <Label
                      htmlFor="isRemote"
                      className="font-normal text-gray-700 dark:text-zinc-200"
                    >
                      Open to Remote
                    </Label>
                  </div>
                </div>
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="isOpenToReloc"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 dark:border-zinc-800 text-primary-600 dark:text-primary-400 focus:ring-primary-600"
                      {...register("isOpenToReloc")}
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <Label
                      htmlFor="isOpenToReloc"
                      className="font-normal text-gray-700 dark:text-zinc-200"
                    >
                      Open to Relocation
                    </Label>
                  </div>
                </div>
              </fieldset>
            </div>
          )}
          <div className="flex flex-col space-y-3 pt-4">
            <Button
              size="sm"
              type="submit"
              className="w-full rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
            >
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-lg"
              onClick={handleReset}
            >
              Clear Filters
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default FilterSidebar;