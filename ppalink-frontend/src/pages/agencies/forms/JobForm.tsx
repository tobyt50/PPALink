import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Globe, XCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../../../components/forms/Input";
import { Textarea } from "../../../components/forms/Textarea";
import { Button } from "../../../components/ui/Button";
import { DropdownTrigger } from "../../../components/ui/DropdownTrigger";
import { Label } from "../../../components/ui/Label";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../../components/ui/SimpleDropdown";
import { useDataStore } from "../../../context/DataStore";
import type { Position, JobLevel } from "../../../types/job";
import type { QuizLevel } from "../../../types/quiz";
import LocationSelector from "../../../components/forms/LocationSelector";
import { CurrencyInput } from "../../../components/forms/CurrencyInput";

const jobFormSchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    employmentType: z.enum([
      "INTERN",
      "NYSC",
      "FULLTIME",
      "PARTTIME",
      "CONTRACT",
    ]),
    isRemote: z.boolean(),
    countryId: z.number().int().positive().optional().nullable(),
    regionId: z.number().int().positive().optional().nullable(),
    cityId: z.number().int().positive().optional().nullable(),
    minSalary: z.coerce.number().int().positive().optional().nullable(),
    maxSalary: z.coerce.number().int().positive().optional().nullable(),
    currency: z
      .string()
      .min(3, "Currency is required if salary is set.")
      .optional()
      .nullable(),
    skills: z.array(
      z.object({
        name: z.string(),
        requiredLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      })
    ),
    level: z.enum(["ENTRY", "INTERMEDIATE", "SENIOR", "PRINCIPAL"]),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    status: z.enum(["DRAFT", "OPEN", "CLOSED"]),
    allowedCountryIds: z.array(z.number()).optional(),
  })
  .refine(
    (data) => {
      if (
        typeof data.maxSalary === "number" &&
        typeof data.minSalary === "number"
      ) {
        return data.maxSalary >= data.minSalary;
      }
      return true;
    },
    {
      message: "Max salary must be greater than or equal to min salary",
      path: ["maxSalary"],
    }
  )
  .refine(
    (data) => {
      if ((data.minSalary || data.maxSalary) && !data.currency) {
        return false;
      }
      return true;
    },
    { message: "Please select a currency for the salary.", path: ["currency"] }
  );

export type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: Position | null;
  onSubmit: (data: JobFormValues) => Promise<void>;
  submitButtonText?: string;
}

const JobForm = ({
  initialData,
  onSubmit,
  submitButtonText = "Create Job",
}: JobFormProps) => {
  const { countries, skills: allSkills } = useDataStore();

  const methods = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      employmentType: initialData?.employmentType || "FULLTIME",
      isRemote: initialData?.isRemote || false,
      countryId: initialData?.countryId || undefined,
      regionId: initialData?.regionId || undefined,
      cityId: initialData?.cityId || undefined,
      minSalary: initialData?.minSalary ?? undefined,
      maxSalary: initialData?.maxSalary ?? undefined,
      currency: initialData?.currency || undefined,
      skills:
        initialData?.skills?.map((s) => ({
          name: s.skill.name,
          requiredLevel: s.requiredLevel,
        })) || [],
      level: initialData?.level || "ENTRY",
      visibility: initialData?.visibility || "PUBLIC",
      status: initialData?.status || "OPEN",
      allowedCountryIds: initialData?.allowedCountryIds || [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const skills = watch("skills");
  const allowedCountryIds = watch("allowedCountryIds") || [];
  const [skillSearch, setSkillSearch] = useState("");
  const [tempSkill, setTempSkill] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState<QuizLevel>("BEGINNER");
  const watchedLevel = watch("level");

  const selectedCountryNames = useMemo(() => {
    return countries
      .filter((country) => allowedCountryIds.includes(country.id))
      .map((country) => country.name)
      .sort((a, b) => a.localeCompare(b))
      .join(", ");
  }, [countries, allowedCountryIds]);

  const filteredSkills = useMemo(() => {
    return allSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
        !skills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())
    );
  }, [allSkills, skillSearch, skills]);
  const addSkill = () => {
    if (
      !tempSkill ||
      skills.some((s) => s.name.toLowerCase() === tempSkill.toLowerCase())
    ) {
      setTempSkill(null);
      setSkillSearch("");
      return;
    }
    setValue(
      "skills",
      [...(skills || []), { name: tempSkill, requiredLevel: skillLevel }],
      { shouldDirty: true }
    );
    setTempSkill(null);
    setSkillSearch("");
    setSkillLevel("BEGINNER");
  };
  const removeSkill = (index: number) => {
    setValue(
      "skills",
      skills.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        minSalary: initialData.minSalary || undefined,
        maxSalary: initialData.maxSalary || undefined,
        countryId: initialData.countryId || undefined,
        regionId: initialData.regionId || undefined,
        cityId: initialData.cityId || undefined,
        currency: initialData.currency || undefined,
        skills:
          initialData.skills?.map((s) => ({
            name: s.skill.name,
            requiredLevel: s.requiredLevel,
          })) || [],
        allowedCountryIds: initialData.allowedCountryIds || [],
      });
    }
  }, [initialData, reset]);

  const jobLevelOptions: JobLevel[] = [
    "ENTRY",
    "INTERMEDIATE",
    "SENIOR",
    "PRINCIPAL",
  ];
  const employmentTypeOptions = {
    FULLTIME: "Full-time",
    PARTTIME: "Part-time",
    CONTRACT: "Contract",
    INTERN: "Intern",
    NYSC: "NYSC",
  };
  const visibilityOptions = { PUBLIC: "Public", PRIVATE: "Private" };
  const statusOptions = { OPEN: "Open", CLOSED: "Closed", DRAFT: "Draft" };
  const skillLevelOptions: QuizLevel[] = [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
  ];

  const handleCountryToggle = (countryId: number) => {
    const newSelection = new Set(allowedCountryIds);
    if (newSelection.has(countryId)) {
      newSelection.delete(countryId);
    } else {
      newSelection.add(countryId);
    }
    setValue("allowedCountryIds", Array.from(newSelection), {
      shouldDirty: true,
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">
            Job Information
          </h3>
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g., Software Engineer"
              {...methods.register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              rows={8}
              error={!!errors.description}
              {...methods.register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-6">
  <h3 className="text-lg font-semibold border-b pb-2">
    Details & Settings
  </h3>
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
    <div className="space-y-2">
      <Label>Employment Type</Label>
      <Controller
        name="employmentType"
        control={control}
        render={({ field: { onChange, value } }) => (
          <SimpleDropdown
            trigger={
              <DropdownTrigger>
                <span className="truncate">
                  {employmentTypeOptions[value]}
                </span>
                <ChevronDown className="h-4 w-4" />
              </DropdownTrigger>
            }
          >
            {Object.entries(employmentTypeOptions).map(([key, val]) => (
              <SimpleDropdownItem
                key={key}
                onSelect={() =>
                  onChange(key as JobFormValues["employmentType"])
                }
              >
                {val}
              </SimpleDropdownItem>
            ))}
          </SimpleDropdown>
        )}
      />
    </div>
    <div className="space-y-2">
      <Label>Job Level</Label>
      <Controller
        name="level"
        control={control}
        render={({ field: { onChange } }) => (
          <SimpleDropdown
            trigger={
              <DropdownTrigger>
                <span className="truncate">{watchedLevel}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownTrigger>
            }
          >
            {jobLevelOptions.map((level) => (
              <SimpleDropdownItem
                key={level}
                onSelect={() => onChange(level)}
              >
                {level}
              </SimpleDropdownItem>
            ))}
          </SimpleDropdown>
        )}
      />
    </div>
    <div className="space-y-2">
      <Label>Visibility</Label>
      <Controller
        name="visibility"
        control={control}
        render={({ field: { onChange, value } }) => (
          <SimpleDropdown
            trigger={
              <DropdownTrigger>
                <span className="truncate">
                  {visibilityOptions[value]}
                </span>
                <ChevronDown className="h-4 w-4" />
              </DropdownTrigger>
            }
          >
            {Object.entries(visibilityOptions).map(([key, val]) => (
              <SimpleDropdownItem
                key={key}
                onSelect={() =>
                  onChange(key as JobFormValues["visibility"])
                }
              >
                {val}
              </SimpleDropdownItem>
            ))}
          </SimpleDropdown>
        )}
      />
    </div>
    <div className="space-y-2">
      <Label>Position Status</Label>
      <Controller
        name="status"
        control={control}
        render={({ field: { onChange, value } }) => (
          <SimpleDropdown
            trigger={
              <DropdownTrigger>
                <span className="truncate">{statusOptions[value]}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownTrigger>
            }
          >
            {Object.entries(statusOptions).map(([key, val]) => (
              <SimpleDropdownItem
                key={key}
                onSelect={() =>
                  onChange(key as JobFormValues["status"])
                }
              >
                {val}
              </SimpleDropdownItem>
            ))}
          </SimpleDropdown>
        )}
      />
    </div>
    <CurrencyInput
      label="Minimum Salary"
      amountFieldName="minSalary"
      currencyFieldName="currency"
    />
    <CurrencyInput
      label="Maximum Salary"
      amountFieldName="maxSalary"
      currencyFieldName="currency"
    />
  </div>
  {errors.maxSalary && (
    <p className="text-xs text-red-600 dark:text-red-400">
      {errors.maxSalary.message}
    </p>
  )}
  {errors.currency && (
    <p className="text-xs text-red-600 dark:text-red-400">
      {errors.currency.message}
    </p>
  )}
</section>

        <section className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
          <LocationSelector />
          <div className="flex items-center space-x-2 pt-2">
            <input
              id="isRemote"
              type="checkbox"
              className="h-4 w-4 rounded"
              {...methods.register("isRemote")}
            />
            <Label htmlFor="isRemote">This is a fully remote position</Label>
          </div>
        </section>
        <section className="space-y-2">
          <h3 className="text-lg font-semibold border-b pb-2">
            Skills Required
          </h3>
          <div className="flex flex-wrap gap-2 pt-4">
            <SimpleDropdown
              trigger={
                <DropdownTrigger>
                  <span className="truncate">
                    {tempSkill || "Select a skill..."}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownTrigger>
              }
              isIndustryDropdown
            >
              <div className="p-2 border-b border-gray-100 dark:border-zinc-800">
                <Input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Search skills..."
                  className="w-full text-sm"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredSkills.map((skill) => (
                  <SimpleDropdownItem
                    key={skill.id}
                    onSelect={() => setTempSkill(skill.name)}
                  >
                    {skill.name}
                  </SimpleDropdownItem>
                ))}
                {filteredSkills.length === 0 && (
                  <p className="p-2 text-xs text-gray-500">
                    No matching skills found.
                  </p>
                )}
              </div>
            </SimpleDropdown>
            <SimpleDropdown
              trigger={
                <DropdownTrigger>
                  <span className="truncate">{skillLevel}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownTrigger>
              }
            >
              {skillLevelOptions.map((level) => (
                <SimpleDropdownItem
                  key={level}
                  onSelect={() => setSkillLevel(level)}
                >
                  {level}
                </SimpleDropdownItem>
              ))}
            </SimpleDropdown>
            <Button
              type="button"
              onClick={addSkill}
              variant="outline"
              className="justify-center"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
            {skills?.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-900/50 px-3 py-1 text-sm font-medium text-primary-800 dark:text-primary-300"
              >
                <span>
                  {skill.name}{" "}
                  <span className="text-xs opacity-70">
                    ({skill.requiredLevel})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ))}
          </div>
          {errors.skills && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.skills.message || (errors.skills as any)?.root?.message}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            Application Restrictions
          </h3>
          <div>
            <Label className="flex items-center">
              <Globe className="h-4 w-4 mr-2" /> Limit applications to specific
              countries
            </Label>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Leave blank to allow applications from any country. Select one or
              more countries to accept applications only from those locations.
            </p>
            <div className="mt-4">
              <Controller
                name="allowedCountryIds"
                control={control}
                render={({ field }) => (
                  <SimpleDropdown
                    trigger={
                      <DropdownTrigger>
                        <span className="truncate">
                          {allowedCountryIds.length > 0
                            ? `Allow only from ${selectedCountryNames}`
                            : "Allow all countries"}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </DropdownTrigger>
                    }
                    isIndustryDropdown
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {countries.map((country) => (
                        <SimpleDropdownItem
                          key={country.id}
                          onSelect={() => handleCountryToggle(country.id)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value?.includes(country.id)}
                              className="h-4 w-4 rounded mr-2"
                              readOnly
                            />
                            <span>{country.name}</span>
                          </div>
                        </SimpleDropdownItem>
                      ))}
                    </div>
                  </SimpleDropdown>
                )}
              />
            </div>
          </div>
        </section>

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

export default JobForm;