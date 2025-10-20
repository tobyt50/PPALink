import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, XCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useState, useMemo, type ReactNode } from "react";
import { FileUpload } from "../../../components/forms/FileUpload";
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
import type { CandidateProfile } from "../../../types/candidate";
import { NYSC_BATCHES, NYSC_STREAMS } from "../../../utils/constants";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  linkedin: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional()
    .nullable(),
  portfolio: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional()
    .nullable(),
  isRemote: z.boolean().default(false),
  isOpenToReloc: z.boolean().default(false),
  salaryMin: z.coerce.number().optional().nullable(),
  nyscBatch: z.string().optional().nullable(),
  nyscStream: z.string().optional().nullable(),
  graduationYear: z.coerce.number().optional().nullable(),
  cvFileKey: z.string().optional().nullable(),
  nyscFileKey: z.string().optional().nullable(),
  primaryStateId: z.coerce.number().optional().nullable(),
  skills: z.array(z.string()).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

const resolver = zodResolver(profileSchema);

interface ProfileFormProps {
  initialData?: CandidateProfile | null;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  submitButtonText?: string;
  children?: ReactNode;
}

const ProfileForm = ({
  initialData,
  onSubmit,
  submitButtonText = "Save Changes",
  children,
}: ProfileFormProps) => {
  const { states, skills: allSkills } = useDataStore(); // 1. Get all skills from the data store

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: resolver as any,
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      dob: initialData?.dob
        ? new Date(initialData.dob).toISOString().split("T")[0]
        : "",
      gender: initialData?.gender || "",
      summary: initialData?.summary || "",
      linkedin: initialData?.linkedin || "",
      portfolio: initialData?.portfolio || "",
      isRemote: initialData?.isRemote ?? false,
      isOpenToReloc: initialData?.isOpenToReloc ?? false,
      salaryMin: initialData?.salaryMin ?? undefined,
      nyscBatch: initialData?.nyscBatch || "",
      nyscStream: initialData?.nyscStream || "",
      graduationYear: initialData?.graduationYear ?? undefined,
      cvFileKey: initialData?.cvFileKey ?? null,
      nyscFileKey: initialData?.nyscFileKey ?? null,
      primaryStateId: initialData?.primaryStateId ?? undefined,
      skills: initialData?.skills?.map((s) => s.skill.name) || [],
    },
  });

  const watchedNyscBatch = watch("nyscBatch");
  const watchedNyscStream = watch("nyscStream");
  const watchedStateId = watch("primaryStateId");
  const watchedSkills = watch("skills") || [];

  const selectedStateName =
    states.find((s) => s.id === watchedStateId)?.name || "Select State...";

  // --- THIS IS THE NEW, SUPERIOR SKILL MANAGEMENT LOGIC ---
  const [skillSearch, setSkillSearch] = useState("");

  // Filter the master list of skills based on the search input
  const filteredSkills = useMemo(() => {
    return allSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
        !watchedSkills.includes(skill.name) // Don't show skills that are already selected
    );
  }, [allSkills, skillSearch, watchedSkills]);

  const addSkill = (skillName: string) => {
    if (!watchedSkills.includes(skillName)) {
      setValue("skills", [...watchedSkills, skillName], { shouldDirty: true });
    }
  };

  const removeSkill = (index: number) => {
    setValue(
      "skills",
      watchedSkills.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleCvUploadSuccess = (fileKey: string, _file: File) => {
    setValue("cvFileKey", fileKey, { shouldDirty: true });
    toast.success("CV uploaded. Remember to save your changes.");
  };

  const handleNyscUploadSuccess = (fileKey: string, _file: File) => {
    setValue("nyscFileKey", fileKey, { shouldDirty: true });
    toast.success("NYSC document uploaded. Remember to save your changes.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Info */}
      {children && (
        <section className="flex justify-center">{children}</section>
      )}
      <section className="space-y-6">
        <div className="overflow-hidden">
          <h3 className="text-lg font-semibold border-b pb-2">
            Personal Information
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              error={!!errors.firstName}
              {...register("firstName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              error={!!errors.lastName}
              {...register("lastName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              error={!!errors.phone}
              {...register("phone")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              error={!!errors.dob}
              {...register("dob")}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              {...register("linkedin")}
            />
            {errors.linkedin && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.linkedin.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input
              id="portfolio"
              type="url"
              placeholder="https://..."
              {...register("portfolio")}
            />
            {errors.portfolio && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.portfolio.message}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea id="summary" rows={5} {...register("summary")} />
        </div>
      </section>

      {/* NYSC & Education */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">
          NYSC & Education
        </h3>
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
                      <span className="truncate">
                        {watchedNyscBatch || "Select..."}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange("")}>
                    Select...
                  </SimpleDropdownItem>
                  {NYSC_BATCHES.map((b) => (
                    <SimpleDropdownItem key={b} onSelect={() => onChange(b)}>
                      {b}
                    </SimpleDropdownItem>
                  ))}
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
                      <span className="truncate">
                        {watchedNyscStream || "Select..."}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange("")}>
                    Select...
                  </SimpleDropdownItem>
                  {NYSC_STREAMS.map((s) => (
                    <SimpleDropdownItem key={s} onSelect={() => onChange(s)}>
                      {s}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Input
              id="graduationYear"
              type="number"
              {...register("graduationYear")}
            />
          </div>
        </div>
      </section>

      {/* Job Preferences and Location */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">
          Job Preferences & Location
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Minimum Monthly Salary (₦)</Label>
            <Input
              id="salaryMin"
              type="number"
              placeholder="e.g., 150000"
              {...register("salaryMin")}
            />
          </div>
          <div className="space-y-2">
            <Label>Primary State of Residence</Label>
            <Controller
              name="primaryStateId"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedStateName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange(null)}>
                    Select State...
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
        </div>
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <input
              id="isRemote"
              type="checkbox"
              className="h-4 w-4 rounded"
              {...register("isRemote")}
            />
            <Label htmlFor="isRemote">Open to Remote work</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="isOpenToReloc"
              type="checkbox"
              className="h-4 w-4 rounded"
              {...register("isOpenToReloc")}
            />
            <Label htmlFor="isOpenToReloc">Open to Relocation</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Skills</Label>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Select your key skills from the list. This helps recruiters find
            you.
          </p>
          <SimpleDropdown
            trigger={
              <DropdownTrigger>
                <span>Add Skills</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownTrigger>
            }
            isIndustryDropdown // Reuse the wider style
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
                  onSelect={() => addSkill(skill.name)}
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

          <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
            {watchedSkills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-900/50 px-3 py-1 text-sm font-medium text-primary-800 dark:text-primary-300"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Documents</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Upload your CV and NYSC Call-up Letter. These will be saved when you
          click "Save Changes".
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

export default ProfileForm;