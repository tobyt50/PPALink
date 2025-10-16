import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../../components/ui/Button";
import { Textarea } from "../../../components/forms/Textarea";
import { Label } from "../../../components/ui/Label";
import useFetch from "../../../hooks/useFetch";
import candidateService from "../../../services/candidate.service";
import type { CandidateProfile } from "../../../types/candidate";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const summarySchema = z.object({
  summary: z
    .string()
    .min(30, "Please write at least 30 characters.")
    .max(1000, "Summary cannot exceed 1000 characters."),
});

type SummaryFormValues = z.infer<typeof summarySchema>;

export const OnboardingProgressBar = ({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) => (
  <div className="mb-8">
    <p className="text-sm text-center text-gray-500 dark:text-zinc-400 mb-2">
      Step {step} of {totalSteps}
    </p>
    <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-primary-600 to-green-500 dark:from-primary-500 dark:to-green-400 h-2 rounded-full transition-all duration-500"
        style={{ width: `${(step / totalSteps) * 100}%` }}
      ></div>
    </div>
  </div>
);

const SummaryStep = () => {
  const navigate = useNavigate();
  const { data: profile } = useFetch<CandidateProfile>("/candidates/me");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SummaryFormValues>({
    resolver: zodResolver(summarySchema),
    values: {
      summary: profile?.summary || "",
    },
  });

  const onSubmit = async (data: SummaryFormValues) => {
    try {
      await candidateService.updateSummary(data.summary);
      toast.success("Summary saved!");
      navigate("/onboarding/candidate/work-experience");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save summary.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full"
    >
      <OnboardingProgressBar step={1} totalSteps={5} />
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Your Professional Summary
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          This is your elevator pitch to recruiters. Make it count!
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="summary">
            Tell us about your skills, experience, and career goals.
          </Label>
          <Textarea
            id="summary"
            rows={6}
            error={!!errors.summary}
            placeholder="e.g., A highly motivated recent graduate with a First Class degree in Computer Science, proficient in JavaScript and Python, seeking a challenging role in a fast-paced tech environment..."
            {...register("summary")}
          />
          {errors.summary && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              {errors.summary.message}
            </p>
          )}
        </div>
        <div className="flex justify-end items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
          <Button type="submit" isLoading={isSubmitting} size="lg">
            Save & Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SummaryStep;
