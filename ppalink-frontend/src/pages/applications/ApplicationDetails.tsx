import {
  Award,
  Briefcase,
  Calendar,
  ChevronLeft,
  FileText,
  Loader2,
  MessageCircle,
  Tag,
  Gift,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DebouncedTextarea } from "../../components/forms/DebouncedTextArea";
import { Button } from "../../components/ui/Button";
import DocumentLink from "../../components/ui/DocumentLink";
import useFetch from "../../hooks/useFetch";
import applicationService from "../../services/application.service";
import type { Application } from "../../types/application";
import EducationSection from "../candidates/sections/EducationSection";
import WorkExperienceSection from "../candidates/sections/WorkExperienceSection";
import ProfileField from "../candidates/ProfileField";
import {
  ScheduleInterviewFormModal,
  type InterviewFormValues,
} from "./forms/ScheduleInterviewForm";
import {
  CreateOfferFormModal,
  type OfferFormValues,
} from "./forms/CreateOfferForm";
import { Avatar } from "../../components/ui/Avatar";
import { ConfirmationModal } from "../../components/ui/Modal";

const CandidateProfileSnapshot = ({
  candidate,
  onMessage,
}: {
  candidate: Application["candidate"];
  onMessage: () => void;
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <Avatar candidate={candidate} size="lg" />
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">
              {candidate.firstName} {candidate.lastName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {candidate.user?.email}
            </p>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 space-y-6">
        {candidate.summary && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Summary
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg">
              {candidate.summary}
            </p>
          </div>
        )}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Documents
          </h3>
          <div className="mt-2 space-y-2">
            {candidate.cvFileKey ? (
              <DocumentLink
                fileKey={candidate.cvFileKey}
                fileName="View Curriculum Vitae (CV)"
              />
            ) : (
              <p className="text-sm text-gray-400 dark:text-zinc-500 flex items-center">
                <FileText className="h-4 w-4 mr-2" /> No CV uploaded.
              </p>
            )}
            {candidate.nyscFileKey ? (
              <DocumentLink
                fileKey={candidate.nyscFileKey}
                fileName="View NYSC Document"
              />
            ) : (
              <p className="text-sm text-gray-400 dark:text-zinc-500 flex items-center">
                <FileText className="h-4 w-4 mr-2" /> No NYSC document.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800">
        <Button
          onClick={onMessage}
          className="w-full"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Message Candidate
        </Button>
      </div>
    </div>
  );
};

const ApplicationDetailsPage = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();

  const {
    data: application,
    isLoading,
    error,
    refetch,
  } = useFetch<Application>(
    applicationId ? `/applications/${applicationId}` : null
  );

  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleCreateOffer = async (data: OfferFormValues) => {
    if (!applicationId) return;

    const payload = {
      ...data,
      startDate: data.startDate
        ? new Date(data.startDate).toISOString()
        : undefined,
    };

    const offerPromise = applicationService.createOffer(applicationId, payload);
    await toast.promise(offerPromise, {
      loading: "Sending offer...",
      success: () => {
        refetch();
        return "Offer sent to candidate!";
      },
      error: (err) => err.response?.data?.message || "Failed to send offer.",
    });
    setIsOfferModalOpen(false);
  };

  const displaySkills = useMemo(() => {
    if (!application) return [];
    const { candidate } = application;
    const selfReportedSkills = candidate.skills || [];
    const passedAttempts =
      candidate.quizAttempts?.filter((a) => a.passed && a.skillId) || [];
    const verifiedSkillMap = new Map<number, { score: number }>();
    passedAttempts.forEach((attempt) => {
      if (attempt.skillId) {
        const currentScore = verifiedSkillMap.get(attempt.skillId)?.score || 0;
        if (attempt.score > currentScore) {
          verifiedSkillMap.set(attempt.skillId, { score: attempt.score });
        }
      }
    });
    const allSkillsMap = new Map<
      number,
      { id: number; name: string; isVerified: boolean; score?: number }
    >();
    selfReportedSkills.forEach((s) => {
      allSkillsMap.set(s.skill.id, { ...s.skill, isVerified: false });
    });
    passedAttempts.forEach((attempt) => {
      if (attempt.skillId && attempt.skill) {
        allSkillsMap.set(attempt.skillId, {
          ...attempt.skill,
          isVerified: true,
          score: verifiedSkillMap.get(attempt.skillId)?.score,
        });
      }
    });
    const combinedSkills = Array.from(allSkillsMap.values());
    combinedSkills.sort(
      (a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0)
    );
    return combinedSkills;
  }, [application]);

  const handleSaveNotes = async (notes: string) => {
    if (!applicationId) return;
    try {
      await applicationService.updateApplicationNotes(applicationId, notes);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save notes.");
      throw err;
    }
  };

  const handleMessageCandidate = () => {
    if (!application?.candidate?.user) {
      toast.error("Candidate user information is not available.");
      return;
    }
    const { user, firstName, lastName } = application.candidate;
    const conversationState = {
      otherUser: {
        id: user.id,
        email: user.email,
        candidateProfile: { firstName, lastName },
      },
    };
    navigate("/inbox", { state: { activeConversation: conversationState } });
  };

  const handleScheduleInterview = async (data: InterviewFormValues) => {
    if (!applicationId) return;
    const schedulePromise = applicationService.scheduleInterview(
      applicationId,
      { ...data, scheduledAt: new Date(data.scheduledAt).toISOString() }
    );
    await toast.promise(schedulePromise, {
      loading: "Scheduling interview...",
      success: () => {
        refetch();
        return "Interview scheduled and candidate notified!";
      },
      error: (err) =>
        err.response?.data?.message || "Failed to schedule interview.",
    });
    setIsInterviewModalOpen(false);
  };

  const handleRejectApplication = async () => {
    if (!applicationId) return;

    const rejectPromise = applicationService.updateApplicationStatus(
      applicationId,
      "REJECTED"
    );

    await toast.promise(rejectPromise, {
      loading: "Rejecting application...",
      success: () => {
        refetch();
        return "Application rejected.";
      },
      error: (err) =>
        err.response?.data?.message || "Failed to reject application.",
    });

    setIsRejectModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }
  if (error || !application) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
        Error loading application details.
      </div>
    );
  }

  const { candidate, position } = application;

  return (
    <>
      <ScheduleInterviewFormModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSubmit={handleScheduleInterview}
      />
      <CreateOfferFormModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleCreateOffer}
      />
      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectApplication}
        title="Reject Application"
        description="Are you sure you want to reject this candidate? The candidate will be notified of this decision."
        confirmButtonText="Yes, Reject Candidate"
        isDestructive={true}
      />
      <div className="space-y-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
              Application for{" "}
              <Link
            to={`/dashboard/agency/${position.agencyId}/jobs/${position.id}`}
            className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
              <span className="font-semibold text-gray-800 dark:text-zinc-100">
                {position.title}
              </span>
              </Link>
            </p>
          </div>
          <Link
            to={`/dashboard/agency/${position.agencyId}/jobs/${position.id}/pipeline`}
            className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            Back to Pipeline
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 lg:sticky top-24 space-y-8">
            <CandidateProfileSnapshot
              candidate={candidate}
              onMessage={handleMessageCandidate}
            />
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  Application Details
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <ProfileField
                  icon={Briefcase}
                  label="Position"
                  value={position.title}
                />
                <ProfileField
                  icon={Calendar}
                  label="Applied On"
                  value={new Date(application.createdAt).toLocaleDateString()}
                />
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                  <Button
                    onClick={() => setIsInterviewModalOpen(true)}
                    className="w-full"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                  <Button
                    onClick={() => setIsOfferModalOpen(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Extend Offer
                  </Button>
                  <Button
  onClick={() => setIsRejectModalOpen(true)}
  className="w-full !text-red-600 dark:!text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/20 hover:!text-red-700 dark:hover:!text-red-300"
  variant="outline"
>
  <XCircle className="mr-2 h-4 w-4" />
  Reject Candidate
</Button>

                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  Skills
                </h2>
              </div>
              <div className="p-6 flex flex-wrap gap-2">
                {displaySkills.length > 0 ? (
                  displaySkills.map((skill) => (
                    <div key={skill.id} className="relative inline-block">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium cursor-default peer ${
                          skill.isVerified
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            : "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200"
                        }`}
                      >
                        {skill.isVerified ? (
                          <Award className="h-4 w-4 mr-1.5" />
                        ) : (
                          <Tag className="h-4 w-4 mr-1.5" />
                        )}
                        {skill.name}
                      </span>
                      <div className="absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-100 dark:bg-zinc-900 px-2 py-1.5 text-xs font-medium text-zinc-900 dark:text-white opacity-0 shadow-lg transition-opacity duration-200 peer-hover:opacity-100 pointer-events-none">
                        {skill.isVerified
                          ? `Verified Skill - Score: ${skill.score}%`
                          : "Unverified skill"}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    No skills listed by the candidate.
                  </p>
                )}
              </div>
            </div>
            <WorkExperienceSection
              experiences={candidate.workExperiences || []}
              isOwner={false}
            />
            <EducationSection
              educationHistory={candidate.education || []}
              isOwner={false}
            />
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  Internal Notes
                </h2>
              </div>
              <div className="p-6">
                <DebouncedTextarea
                  initialValue={application.notes || ""}
                  onSave={handleSaveNotes}
                  placeholder="Add private notes for your team (auto-saves)..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetailsPage;