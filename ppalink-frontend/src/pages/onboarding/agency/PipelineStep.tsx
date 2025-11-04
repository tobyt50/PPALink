import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { OnboardingProgressBar } from "../candidate/SummaryStep";
import { motion } from "framer-motion";

const DemoApplicantCard = ({
  name,
  level,
  skills,
}: {
  name: string;
  level: string;
  skills: string[];
}) => (
  <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
    <div className="flex items-start">
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0" />
      <div className="ml-3 flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 dark:text-zinc-100 truncate">
          {name}
        </p>
        <div className="flex items-center text-xs text-gray-500 dark:text-zinc-400 mt-1">
          <BadgeCheck className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
          {level}
        </div>
      </div>
    </div>
    <div className="mt-3 flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-full bg-green-50 dark:bg-green-950/60 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
);

// A simplified, non-interactive column for the demo
const DemoPipelineColumn = ({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children?: React.ReactNode;
}) => (
  <div className="rounded-2xl bg-gray-100 dark:bg-zinc-800 w-full flex flex-col min-h-[300px] overflow-hidden">
    <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
      <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50">
        {title} ({count})
      </h2>
    </div>
    <div className="p-3 space-y-3 h-full overflow-y-auto">{children}</div>
  </div>
);

const PipelineStep = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 w-full"
    >
      <OnboardingProgressBar step={3} totalSteps={5} />

      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950/60">
          <SlidersHorizontal className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent mt-4">
          Manage Your Hiring Pipeline
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300 max-w-lg mx-auto">
          Our drag-and-drop pipeline makes it easy to track candidates. As
          applicants come in, you can move them through stages like "Reviewing",
          "Interview", and "Offer".
        </p>
      </div>

      <div className="my-8 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border dark:border-zinc-800 select-none pointer-events-none">
        <div className="grid grid-cols-3 gap-3">
          <DemoPipelineColumn title="Applied" count={1}>
            <DemoApplicantCard
              name="Bello Akim"
              level="NYSC Verified"
              skills={["Java", "SQL"]}
            />
          </DemoPipelineColumn>
          <DemoPipelineColumn title="Interview" count={2}>
            <DemoApplicantCard
              name="Chioma Nwosu"
              level="NYSC Verified"
              skills={["React", "Figma"]}
            />
            <DemoApplicantCard
              name="David Okeowo"
              level="NYSC Verified"
              skills={["Python", "Design"]}
            />
          </DemoPipelineColumn>
          <DemoPipelineColumn title="Offer" count={1}>
            <DemoApplicantCard
              name="Fatima Yusuf"
              level="NYSC Verified"
              skills={["Excel", "Finance"]}
            />
          </DemoPipelineColumn>
        </div>
        <p className="text-xs text-center text-gray-500 dark:text-zinc-400 mt-4">
          This is a non-interactive demo. You can drag and drop candidates on
          your actual job pipeline page.
        </p>
      </div>

      <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/onboarding/agency/post-job")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => navigate("/onboarding/agency/team")}>
          Next: Build Your Team <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PipelineStep;
