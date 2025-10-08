import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Input } from "../../../components/forms/Input";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import type { InterviewMode } from "../../../types/application";
import { Calendar, CheckCircle, Send } from "lucide-react";
import { Textarea } from "../../../components/forms/Textarea";

const interviewSchema = z.object({
  scheduledDate: z
    .string()
    .refine((val) => val, { message: "Date is required." }),
  scheduledTime: z
    .string()
    .refine((val) => val, { message: "Time is required." }),
  mode: z.enum(["INPERSON", "REMOTE", "PHONE"]),
  location: z.string().optional(),
  details: z.string().optional(),
});
export type InterviewFormValues = {
  scheduledAt: string;
  mode: "INPERSON" | "REMOTE" | "PHONE";
  location?: string;
  details?: string;
};

interface ScheduleInterviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InterviewFormValues) => Promise<void>;
}

const modes: { name: InterviewMode; description: string }[] = [
  { name: "REMOTE", description: "Video call (e.g., Google Meet, Zoom)" },
  { name: "INPERSON", description: "Face-to-face at a specific address" },
  { name: "PHONE", description: "A standard phone call" },
];

export const ScheduleInterviewFormModal = ({
  isOpen,
  onClose,
  onSubmit,
}: ScheduleInterviewFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof interviewSchema>>({
    resolver: zodResolver(interviewSchema),
    defaultValues: { mode: "REMOTE" },
  });

  const watchedMode = watch("mode");

  const processSubmit = (data: z.infer<typeof interviewSchema>) => {
    const combinedDateTime = `${data.scheduledDate}T${data.scheduledTime}`;
    const payload: InterviewFormValues = {
      scheduledAt: combinedDateTime,
      mode: data.mode,
      location: data.location,
      details: data.details,
    };
    onSubmit(payload);
  };

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
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 text-left align-middle shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-black ring-opacity-5 transition-all">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-zinc-50"
                  >
                    Schedule Interview
                  </Dialog.Title>
                </div>
                <form
                  onSubmit={handleSubmit(processSubmit)}
                  className="p-6 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="scheduledDate">Date</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        {...register("scheduledDate")}
                        error={!!errors.scheduledDate}
                      />
                      {errors.scheduledDate && (
                        <p className="text-xs text-red-500 dark:text-red-400">
                          {errors.scheduledDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="scheduledTime">Time</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        {...register("scheduledTime")}
                        error={!!errors.scheduledTime}
                      />
                      {errors.scheduledTime && (
                        <p className="text-xs text-red-500 dark:text-red-400">
                          {errors.scheduledTime.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Controller
                    name="mode"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onChange={field.onChange}
                        className="space-y-2"
                      >
                        {" "}
                        <Label>Interview Mode</Label>{" "}
                        {modes.map((mode) => (
                          <RadioGroup.Option
                            key={mode.name}
                            value={mode.name}
                            className={({ checked }) =>
                              `${
                                checked
                                  ? "bg-primary-50 dark:bg-primary-950/60 border-primary-500 ring-0.5 ring-primary-500"
                                  : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                              } relative flex cursor-pointer rounded-xl border p-3 focus:outline-none transition-all`
                            }
                          >
                            {({ checked }) => (
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center">
                                  <div className="text-sm">
                                    <RadioGroup.Label
                                      as="p"
                                      className={`font-semibold ${
                                        checked
                                          ? "text-primary-700 dark:text-primary-300"
                                          : "text-gray-900 dark:text-zinc-50"
                                      }`}
                                    >
                                      {mode.name}
                                    </RadioGroup.Label>
                                    <RadioGroup.Description
                                      as="span"
                                      className={`inline text-xs ${
                                        checked
                                          ? "text-primary-600 dark:text-primary-400"
                                          : "text-gray-500 dark:text-zinc-400"
                                      }`}
                                    >
                                      {mode.description}
                                    </RadioGroup.Description>
                                  </div>
                                </div>
                                {checked && (
                                  <div className="shrink-0 text-primary-600 dark:text-primary-400">
                                    <CheckCircle className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                            )}
                          </RadioGroup.Option>
                        ))}{" "}
                      </RadioGroup>
                    )}
                  />
                  {watchedMode === "REMOTE" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="location">Video Call Link</Label>
                      <Input
                        id="location"
                        placeholder="https://meet.google.com/..."
                        {...register("location")}
                      />
                    </div>
                  )}
                  {watchedMode === "INPERSON" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="location">Location / Address</Label>
                      <Input
                        id="location"
                        placeholder="123 Main St, Lagos"
                        {...register("location")}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="details">
                      Additional Details (Optional)
                    </Label>
                    <Textarea
                      id="details"
                      rows={3}
                      placeholder="e.g., 'Please prepare a 5-minute presentation on a recent project.'"
                      {...register("details")}
                    />
                  </div>
                  <div className="mt-6 flex justify-end space-x-3 pt-5 border-t border-gray-100 dark:border-zinc-800">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      <Send className="mr-2 h-4 w-4" /> Send Invitation
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
