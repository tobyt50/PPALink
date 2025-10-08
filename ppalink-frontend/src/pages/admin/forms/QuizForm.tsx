import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/forms/Input";
import { Textarea } from "../../../components/forms/Textarea";
import { Label } from "../../../components/ui/Label";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ChevronDown,
  FileQuestion,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";
import type { AdminQuiz, QuizLevel } from "../../../types/quiz";
import useFetch from "../../../hooks/useFetch";
import adminService from "../../../services/admin.service";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../../components/ui/SimpleDropdown";
import { useDataStore } from "../../../context/DataStore";
import { DropdownTrigger } from "../../../components/ui/DropdownTrigger";

const questionSchema = z
  .object({
    id: z.string().optional(),
    text: z.string().min(5, "Question text is required."),
    options: z
      .array(z.string().min(1, "Option text cannot be empty."))
      .min(2, "At least two options are required."),
    correctAnswer: z.string().min(1, "Please select a correct answer."),
  })
  .refine((data) => data.options.includes(data.correctAnswer), {
    message: "The correct answer must be one of the options.",
    path: ["correctAnswer"],
  });

const quizSchema = z.object({
  title: z.string().min(5, "Quiz title is required."),
  description: z.string().optional(),
  skillId: z.number().positive("Please link a skill.").optional().nullable(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required."),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  initialQuizId?: string | null;
}

export const QuizFormModal = ({
  isOpen,
  onClose,
  refetch,
  initialQuizId,
}: QuizFormModalProps) => {
  const { data: initialData, isLoading } = useFetch<AdminQuiz>(
    initialQuizId ? `/admin/quizzes/${initialQuizId}` : null
  );
  const { skills: allSkills, fetchSkills } = useDataStore();

  const [newSkillName, setNewSkillName] = useState("");
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "BEGINNER",
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  useEffect(() => {
    if (initialQuizId && initialData) {
      const resetData: QuizFormValues = {
        title: initialData.title,
        description: initialData.description || "",
        skillId: initialData.skillId || undefined,
        level: initialData.level,
        questions: initialData.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options as string[],
          correctAnswer: q.correctAnswer,
        })),
      };
      reset(resetData);
    } else {
      reset({
        title: "",
        description: "",
        skillId: undefined,
        level: "BEGINNER",
        questions: [],
      });
    }
  }, [initialData, initialQuizId, isOpen, reset]);

  const onSubmit = async (data: QuizFormValues) => {
    const actionPromise = initialQuizId
      ? adminService.updateQuiz(initialQuizId, data)
      : adminService.createQuiz(data);

    await toast.promise(actionPromise, {
      loading: initialQuizId ? "Saving quiz..." : "Creating quiz...",
      success: `Quiz ${initialQuizId ? "updated" : "created"} successfully!`,
      error: (err) => err.response?.data?.message || "An error occurred.",
    });
    refetch();
    onClose();
  };

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) return;
    setIsCreatingSkill(true);
    try {
      const newSkill = await adminService.createSkill(newSkillName);
      toast.success(`Skill "${newSkill.name}" created successfully!`);
      await fetchSkills(); // Refresh the global list of skills from your Zustand store
      setValue("skillId", newSkill.id, { shouldValidate: true }); // Automatically select the new skill
      setNewSkillName("");
    } catch (error) {
      toast.error("Failed to create new skill.");
    } finally {
      setIsCreatingSkill(false);
    }
  };

  const watchedSkillId = watch("skillId");
  const selectedSkillName =
    allSkills.find((s) => s.id === watchedSkillId)?.name || "Link a Skill";

  const filteredSkills = allSkills.filter((s) =>
  s.name.toLowerCase().includes(newSkillName.toLowerCase())
);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/25 dark:bg-black/70 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-3xl transform rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-black ring-opacity-5 transition-all flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center flex-shrink-0">
                <FileQuestion className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  {initialQuizId ? "Edit Quiz" : "Create New Quiz"}
                </Dialog.Title>
              </div>

              {isLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex-grow flex flex-col min-h-0">
                  <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input {...register("title")} error={!!errors.title} />
                        {errors.title && (
                          <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Input {...register("description")} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Linked Skill</Label>
                        <Controller
                          name="skillId"
                          control={control}
                          render={({ field }) => (
                            <SimpleDropdown
                              isIndustryDropdown
                              trigger={
                                <DropdownTrigger>
                                  {selectedSkillName}
                                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </DropdownTrigger>
                              }
                            >
                              <div className="p-2 border-b border-gray-100 dark:border-zinc-800">
                                <p className="text-xs text-gray-500">
                                  Select an existing skill or create a new one.
                                </p>
                              </div>
                              <div className="p-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
  <Input
    value={newSkillName}
    onChange={(e) => setNewSkillName(e.target.value)}
    placeholder="Search or create new skill..."
    className="text-sm flex-grow"
  />
  <Button
    type="button"
    size="sm"
    onClick={handleCreateSkill}
    isLoading={isCreatingSkill}
    disabled={!newSkillName.trim()}
  >
    Create
  </Button>
</div>

                              <div className="max-h-48 overflow-y-auto">
  {filteredSkills.length > 0 ? (
    filteredSkills.map((s) => (
      <SimpleDropdownItem
        key={s.id}
        onSelect={() => field.onChange(s.id)}
      >
        {s.name}
      </SimpleDropdownItem>
    ))
  ) : (
    <p className="text-sm text-gray-500 px-3 py-2">
      No matches found.
    </p>
  )}
</div>
                              
                            </SimpleDropdown>
                          )}
                        />
                        {errors.skillId && (
                          <p className="text-xs text-red-500 mt-1">{errors.skillId.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Level</Label>
                        <Controller
                          name="level"
                          control={control}
                          render={({ field }) => (
                            <SimpleDropdown
                              trigger={
                                <DropdownTrigger>
                                  {field.value || "BEGINNER"}
                                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </DropdownTrigger>
                              }
                            >
                              {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((l) => (
                                <SimpleDropdownItem
                                  key={l}
                                  onSelect={() => field.onChange(l as QuizLevel)}
                                >
                                  {l}
                                </SimpleDropdownItem>
                              ))}
                            </SimpleDropdown>
                          )}
                        />
                      </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-zinc-800 pt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900 dark:text-zinc-50">Questions</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            append({ text: "", options: ["", ""], correctAnswer: "" })
                          }
                        >
                          <PlusCircle size={16} className="mr-2" />
                          Add Question
                        </Button>
                      </div>
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="p-4 border dark:border-zinc-800 rounded-xl space-y-3 relative bg-gray-50/70 dark:bg-zinc-800/30"
                        >
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-600 dark:hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="space-y-1.5">
                            <Label>Question #{index + 1}</Label>
                            <Textarea
                              {...register(`questions.${index}.text`)}
                              placeholder="Question text"
                              rows={3}
                              error={!!errors.questions?.[index]?.text}
                            />
                            {errors.questions?.[index]?.text && (
                              <p className="text-xs text-red-500">
                                {errors.questions[index]?.text?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label>Options & Correct Answer</Label>
                            <Controller
                              name={`questions.${index}.options`}
                              control={control}
                              render={({ field: optionsField }) => (
                                <Controller
                                  name={`questions.${index}.correctAnswer`}
                                  control={control}
                                  render={({ field: answerField }) => (
                                    <div className="mt-2 space-y-2">
                                      {(optionsField.value || []).map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-2">
                                          <input
                                            type="radio"
                                            name={`correct-answer-${index}`}
                                            checked={answerField.value === option}
                                            onChange={() => answerField.onChange(option)}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                          />
                                          <Input
                                            value={option}
                                            onChange={(e) => {
                                              const newOptions = [...optionsField.value];
                                              const oldOptionValue = newOptions[optIndex];
                                              newOptions[optIndex] = e.target.value;
                                              optionsField.onChange(newOptions);
                                              if (answerField.value === oldOptionValue) {
                                                answerField.onChange(e.target.value);
                                              }
                                            }}
                                            placeholder={`Option ${optIndex + 1}`}
                                            error={!!errors.questions?.[index]?.options?.[optIndex]}
                                          />
                                        </div>
                                      ))}
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const newOptions = [...(optionsField.value || []), ""];
                                            optionsField.onChange(newOptions);
                                          }}
                                        >
                                          <PlusCircle size={12} className="mr-1" />
                                          Add Option
                                        </Button>
                                        {optionsField.value && optionsField.value.length > 2 && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const newOptions = (optionsField.value || []).slice(0, -1);
                                              optionsField.onChange(newOptions);
                                            }}
                                          >
                                            <Trash2 size={12} className="mr-1" />
                                            Remove Option
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                />
                              )}
                            />
                            {errors.questions?.[index]?.correctAnswer && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.questions[index]?.correctAnswer?.message}
                              </p>
                            )}
                            {errors.questions?.[index]?.options && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.questions[index]?.options?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {errors.questions && (
                        <p className="text-red-500 text-sm mt-2">
                          {errors.questions.message || errors.questions.root?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex justify-end space-x-3 p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      {initialQuizId ? "Save Changes" : "Create Quiz"}
                    </Button>
                  </div>
                </form>
              )}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};