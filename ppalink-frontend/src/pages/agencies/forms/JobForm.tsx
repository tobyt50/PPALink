import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import apiClient from "../../../config/axios";
import { useDataStore } from "../../../context/DataStore";
import type { Position } from "../../../types/job";
import type { QuizLevel } from "../../../types/quiz";

interface Lga {
  id: number;
  name: string;
}

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
    stateId: z.number().int().positive().optional().nullable(),
    lgaId: z.number().int().positive().optional().nullable(),
    minSalary: z.coerce.number().int().positive().optional().nullable(),
    maxSalary: z.coerce.number().int().positive().optional().nullable(),
    skills: z.array(
      z.object({
        name: z.string(),
        requiredLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      })
    ),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    status: z.enum(["DRAFT", "OPEN", "CLOSED"]),
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
  const states = useDataStore((state) => state.states);
  const isLoadingDataStore = useDataStore((state) => state.isLoading);

  const [lgas, setLgas] = useState<Lga[]>([]);
  const [isLoadingLgas, setIsLoadingLgas] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      employmentType: initialData?.employmentType || "FULLTIME",
      isRemote: initialData?.isRemote || false,
      stateId: initialData?.stateId || undefined,
      lgaId: initialData?.lgaId || undefined,
      minSalary: initialData?.minSalary ?? undefined,
      maxSalary: initialData?.maxSalary ?? undefined,
      skills:
        initialData?.skills?.map((s) => ({
          name: s.skill.name,
          requiredLevel: s.requiredLevel,
        })) || [],
      visibility: initialData?.visibility || "PUBLIC",
      status: initialData?.status || "OPEN",
    },
  });

  const skills = watch("skills");
  const [skillInput, setSkillInput] = useState("");
  const [skillLevel, setSkillLevel] = useState<QuizLevel>("BEGINNER");

  const watchedStateId = watch("stateId");
  const watchedLgaId = watch("lgaId");

  const selectedStateName =
    states.find((s) => s.id === watchedStateId)?.name || "Select a state...";
  const selectedLgaName =
    lgas.find((l) => l.id === watchedLgaId)?.name || "Select an LGA...";

  const addSkill = () => {
    const normalized = skillInput.trim();
    if (
      !normalized ||
      (skills || []).some(
        (s) => s.name.toLowerCase() === normalized.toLowerCase()
      )
    ) {
      setSkillInput("");
      return;
    }
    setValue(
      "skills",
      [...(skills || []), { name: normalized, requiredLevel: skillLevel }],
      { shouldDirty: true }
    );
    setSkillInput("");
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
        stateId: initialData.stateId || undefined,
        lgaId: initialData.lgaId || undefined,
        skills:
          initialData.skills?.map((s) => ({
            name: s.skill.name,
            requiredLevel: s.requiredLevel,
          })) || [],
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    const fetchLgas = async (stateId: number) => {
      setIsLoadingLgas(true);
      try {
        const response = await apiClient.get(
          `/utils/location-states/${stateId}/lgas`
        );
        setLgas(response.data.data);
      } catch (error) {
        console.error("Failed to fetch LGAs", error);
        setLgas([]);
      } finally {
        setIsLoadingLgas(false);
      }
    };
    if (watchedStateId) {
      setValue("lgaId", undefined);
      fetchLgas(watchedStateId);
    } else {
      setLgas([]);
    }
  }, [watchedStateId, setValue]);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Job Information</h3>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            placeholder="e.g., Software Engineer"
            {...register("title")}
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
            {...register("description")}
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
            <Label htmlFor="minSalary">Minimum Salary (₦)</Label>
            <Input
              id="minSalary"
              type="number"
              {...register("minSalary", {
                setValueAs: (v) => (v ? parseInt(v, 10) : undefined),
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxSalary">Maximum Salary (₦)</Label>
            <Input
              id="maxSalary"
              type="number"
              {...register("maxSalary", {
                setValueAs: (v) => (v ? parseInt(v, 10) : undefined),
              })}
            />
            {errors.maxSalary && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.maxSalary.message}
              </p>
            )}
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
                      onSelect={() => onChange(key as JobFormValues["status"])}
                    >
                      {val}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Location State</Label>
            <Controller
              name="stateId"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">
                        {isLoadingDataStore ? "Loading..." : selectedStateName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange(undefined)}>
                    Select a state...
                  </SimpleDropdownItem>
                  {states.map((state) => (
                    <SimpleDropdownItem
                      key={state.id}
                      onSelect={() => onChange(state.id)}
                    >
                      {state.name}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Location LGA</Label>
            <Controller
              name="lgaId"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">
                        {isLoadingLgas ? "Loading..." : selectedLgaName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange(undefined)}>
                    Select an LGA...
                  </SimpleDropdownItem>
                  {lgas.map((lga) => (
                    <SimpleDropdownItem
                      key={lga.id}
                      onSelect={() => onChange(lga.id)}
                    >
                      {lga.name}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <input
            id="isRemote"
            type="checkbox"
            className="h-4 w-4 rounded"
            {...register("isRemote")}
          />
          <Label htmlFor="isRemote">This is a fully remote position</Label>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold border-b pb-2">Skills Required</h3>
        <div className="flex gap-2 pt-4">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Type a skill"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
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
  );
};

export default JobForm;