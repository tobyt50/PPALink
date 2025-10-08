import {
  CalendarPlus,
  ChevronDown,
  Clock,
  Gift,
  Loader2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import useFetch from "../../hooks/useFetch";
import type {
  Application,
  InterviewPipelineData,
} from "../../types/application";
import {
  ScheduleInterviewFormModal,
  type InterviewFormValues,
} from "../applications/forms/ScheduleInterviewForm";
import {
  CreateOfferFormModal,
  type OfferFormValues,
} from "../applications/forms/CreateOfferForm";
import applicationService from "../../services/application.service";
import { format } from "date-fns";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../components/ui/SimpleDropdown";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import type { Position } from "../../types/job";

const InterviewCard = ({
  application,
  onSchedule,
  onOffer,
}: {
  application: Application;
  onSchedule: () => void;
  onOffer: () => void;
}) => {
  const interview = application.interviews?.[0];
  return (
    <div className="p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 border-gray-100 rounded-2xl shadow-md dark:shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <Link
          to={`/dashboard/agency/applications/${application.id}`}
          className="font-semibold text-gray-800 dark:text-zinc-100 hover:underline"
        >
          {application.candidate.firstName} {application.candidate.lastName}
        </Link>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {application.position.title}
        </p>
      </div>
      {interview ? (
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600 dark:text-zinc-300 text-left sm:text-right">
            <p className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {format(new Date(interview.scheduledAt), "MMM d @ h:mm a")}
            </p>
            <p className="flex items-center mt-1">
              <Video className="h-4 w-4 mr-2" />
              {interview.mode}
            </p>
          </div>
          <Button onClick={onOffer} size="sm" variant="outline">
            <Gift className="mr-2 h-4 w-4" />
            Offer
          </Button>
        </div>
      ) : (
        <Button onClick={onSchedule} size="sm">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Schedule
        </Button>
      )}
    </div>
  );
};

const ManageInterviewsPage = () => {
  const [activeTab, setActiveTab] = useState<"unscheduled" | "scheduled">(
    "unscheduled"
  );

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // 1. Fetch all of the agency's jobs to populate the filter dropdown.
  const { data: allJobs } = useFetch<Position[]>("/agencies/me/jobs");

  // 2. Make the main data fetch dynamic based on the selected job filter.
  const interviewPipelineUrl = selectedJobId
    ? `/agencies/me/interviews?positionId=${selectedJobId}`
    : "/agencies/me/interviews";

  const {
    data: pipelineData,
    isLoading,
    error,
    refetch,
  } = useFetch<InterviewPipelineData>(interviewPipelineUrl);

  const selectedJobTitle =
    allJobs?.find((job) => job.id === selectedJobId)?.title || "All Jobs";

  const [scheduleModalState, setScheduleModalState] = useState<{
    isOpen: boolean;
    application: Application | null;
  }>({ isOpen: false, application: null });
  const [offerModalState, setOfferModalState] = useState<{
    isOpen: boolean;
    application: Application | null;
  }>({ isOpen: false, application: null });

  const handleScheduleInterview = async (data: InterviewFormValues) => {
    if (!scheduleModalState.application) return;
    const schedulePromise = applicationService.scheduleInterview(
      scheduleModalState.application.id,
      {
        ...data,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      }
    );
    await toast.promise(schedulePromise, {
      loading: "Scheduling interview...",
      success: "Interview scheduled successfully!",
      error: (err) =>
        err.response?.data?.message || "Failed to schedule interview.",
    });
    refetch();
    setScheduleModalState({ isOpen: false, application: null });
  };

  const handleCreateOffer = async (data: OfferFormValues) => {
    if (!offerModalState.application) return;
    const payload = {
      ...data,
      startDate: data.startDate
        ? new Date(data.startDate).toISOString()
        : undefined,
    };
    const offerPromise = applicationService.createOffer(
      offerModalState.application.id,
      payload
    );
    await toast.promise(offerPromise, {
      loading: "Sending offer...",
      success: () => {
        refetch();
        return "Offer sent to candidate!";
      },
      error: (err) => err.response?.data?.message || "Failed to send offer.",
    });
    setOfferModalState({ isOpen: false, application: null });
  };

  const TABS = [
    { id: "unscheduled", label: "Pending Schedule" },
    { id: "scheduled", label: "Upcoming" },
  ];

  return (
    <>
      <ScheduleInterviewFormModal
        isOpen={scheduleModalState.isOpen}
        onClose={() =>
          setScheduleModalState({ isOpen: false, application: null })
        }
        onSubmit={handleScheduleInterview}
      />
      <CreateOfferFormModal
        isOpen={offerModalState.isOpen}
        onClose={() => setOfferModalState({ isOpen: false, application: null })}
        onSubmit={handleCreateOffer}
      />

      <div className="mx-auto w-full">
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Interview Hub
          </h1>
          <p className="mt-1 text-gray-500">
            Manage all your scheduled and unscheduled interviews in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-zinc-800 mb-6 pb-3">
  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id as any)}
        className={`${
          activeTab === tab.id
            ? "border-primary-500 text-primary-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
      >
        {tab.label} (
        {(pipelineData?.[tab.id as keyof InterviewPipelineData] || []).length}
        )
      </button>
    ))}
  </nav>

  <div className="mt-3 sm:mt-0 flex justify-end">
  <SimpleDropdown
    trigger={
      <div className="w-64">
        <DropdownTrigger className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800">
          <span className="truncate">{selectedJobTitle}</span>
          <ChevronDown className="h-4 w-4" />
        </DropdownTrigger>
      </div>
    }
  >
      <SimpleDropdownItem onSelect={() => setSelectedJobId(null)}>
        All Jobs
      </SimpleDropdownItem>
      {allJobs?.map((job) => (
        <SimpleDropdownItem key={job.id} onSelect={() => setSelectedJobId(job.id)}>
          {job.title}
        </SimpleDropdownItem>
      ))}
    </SimpleDropdown>
  </div>
</div>


        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 p-8">
            Could not load interview data.
          </div>
        )}

        <div className="space-y-4">
          {/* --- THIS IS THE FIX --- */}
          {activeTab === "unscheduled" &&
            pipelineData?.unscheduled.map((app) => (
              <InterviewCard
                key={app.id}
                application={app}
                onSchedule={() =>
                  setScheduleModalState({ isOpen: true, application: app })
                }
                onOffer={() => {}}
              />
            ))}
          {activeTab === "scheduled" &&
            pipelineData?.scheduled.map((app) => (
              <InterviewCard
                key={app.id}
                application={app}
                onSchedule={() =>
                  setScheduleModalState({ isOpen: true, application: app })
                }
                onOffer={() =>
                  setOfferModalState({ isOpen: true, application: app })
                }
              />
            ))}
          {/* --- END OF FIX --- */}
        </div>
      </div>
    </>
  );
};

export default ManageInterviewsPage;
