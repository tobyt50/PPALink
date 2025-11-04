import React, { useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  CheckSquare,
  Flame,
  Heart,
  Mail,
  Square,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useShortlistStore } from "../../context/ShortlistStore";
import agencyService from "../../services/agency.service";
import type { Application } from "../../types/application";
import { Avatar } from '../../components/ui/Avatar';
import { useIsTouchDevice } from "../../hooks/useIsTouchDevice";

export const StaticApplicantCard = ({
  application,
  isSelected,
  onSelectToggle,
  isFocused,
  onDelete,
  onPreview,
}: {
  application: Application;
  isSelected: boolean;
  onSelectToggle: (e: React.MouseEvent) => void;
  isFocused: boolean;
  onDelete: (applicationId: string) => void;
  onPreview: (application: Application) => void;
}) => {
  const { candidate } = application;
  const navigate = useNavigate();
  const isTouchDevice = useIsTouchDevice();
  const { shortlistedIds, addShortlistId, removeShortlistId } =
    useShortlistStore();
  
  const [isActivated, setIsActivated] = useState(false);

  const isShortlisted = useMemo(
    () => shortlistedIds.includes(candidate.id),
    [shortlistedIds, candidate.id]
  );

  const topSkills = useMemo(() => {
    const selfReportedSkills = candidate.skills || [];
    const passedAttempts = (candidate.quizAttempts || []).filter(
      (a) => a.passed && a.skillId
    );

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

    return combinedSkills.slice(0, 2);
  }, [candidate.skills, candidate.quizAttempts]);

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!candidate.user) {
      toast.error("Candidate user information is not available.");
      return;
    }
    const { user, firstName, lastName } = candidate;
    const conversationState = {
      otherUser: {
        id: user.id,
        email: user.email,
        candidateProfile: { firstName, lastName },
      },
    };
    navigate("/inbox", { state: { activeConversation: conversationState } });
  };
  const handleToggleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const actionPromise = isShortlisted
      ? agencyService.removeShortlist(candidate.id)
      : agencyService.shortlistCandidate(candidate.id);
    await toast.promise(actionPromise, {
      loading: "Processing...",
      success: () => {
        if (isShortlisted) {
          removeShortlistId(candidate.id);
          return "Removed from shortlist.";
        } else {
          addShortlistId(candidate.id);
          return "Candidate shortlisted!";
        }
      },
      error: (err: any) => err.response?.data?.message || "An error occurred.",
    });
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(application.id);
  };
  return (
    <div
      onClick={() => {
        if (isTouchDevice) {
          setIsActivated(prev => !prev);
        }
      }}
      className={`group relative flex flex-col rounded-xl bg-white p-4 shadow-sm ring-1 transition-all duration-200 dark:bg-zinc-900 dark:shadow-none ${
        isSelected
          ? "ring-2 ring-primary-500"
          : isFocused
          ? "ring-2 ring-blue-500"
          : "ring-gray-100 dark:ring-white/10"
      }`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelectToggle(e);
        }}
        className={`absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-md bg-white/60 backdrop-blur-sm cursor-pointer transition-opacity dark:bg-zinc-800/50 ${
          isSelected || (isTouchDevice && isActivated)
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {isSelected ? (
          <CheckSquare className="h-5 w-5 text-primary-600" />
        ) : (
          <Square className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
        )}
      </div>
      <div className="flex flex-col">
        <div 
          className="flex items-start"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(application);
          }}
        >
          <Avatar candidate={candidate} size="md" />
          <div className="ml-3 min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-800 transition-all dark:text-zinc-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:whitespace-normal break-words">
              {candidate.firstName} {candidate.lastName}
            </p>
            {application.matchScore != null && (
              <div className="mt-1 flex items-center">
                <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-300">
                  <Flame className="h-3 w-3 mr-1" />
                  {application.matchScore}% Match
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-zinc-400">
          <BadgeCheck className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
          <span>{candidate.verificationLevel.replace("_", " ")}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 min-h-[26px]">
        {topSkills.length > 0 ? (
          topSkills.map((skill) => (
            <div key={skill.id} className="relative inline-block">
              <span
                className={`flex items-center rounded-full px-2.5 py-1 text-xs font-medium cursor-default peer ${
                  skill.isVerified
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                    : "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                }`}
              >
                {skill.isVerified && <Award className="h-3 w-3 mr-1" />}
                {skill.name}
              </span>

              <div className="absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 
                whitespace-nowrap rounded-md bg-gray-100 dark:bg-zinc-900 px-2 py-1.5 
                text-xs font-medium text-zinc-900 dark:text-white opacity-0 
                shadow-lg transition-opacity duration-300 peer-hover:opacity-100 
                pointer-events-none max-w-[calc(100vw-2rem)]">
                {skill.isVerified
                  ? `Verified Skill - Score: ${skill.score}%`
                  : "Unverified skill"}
              </div>
            </div>
          ))
        ) : (
          <p className="italic text-xs text-gray-400 dark:text-zinc-500">
            No skills listed
          </p>
        )}
      </div>

      <div className={`mt-4 flex items-center justify-center gap-3 transition-all duration-200 ${
        (isTouchDevice && isActivated)
          ? "opacity-100 max-h-16"
          : "opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-16"
      }`}>
        <button
          onClick={handleMessage}
          className="rounded-full bg-white/50 p-1.5 backdrop-blur-sm hover:bg-gray-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-700"
        >
          <Mail className="h-4 w-4 text-gray-600 dark:text-zinc-300" />
        </button>
        <button
          onClick={handleToggleShortlist}
          className="rounded-full bg-white/50 p-1.5 backdrop-blur-sm hover:bg-gray-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-700"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isShortlisted
                ? "fill-current text-red-500"
                : "text-gray-600 dark:text-zinc-300"
            }`}
          />
        </button>
        <button
          onClick={handleDelete}
          className="rounded-full bg-white/50 p-1.5 backdrop-blur-sm hover:bg-red-100 dark:bg-zinc-800/50 dark:hover:bg-red-900/50"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export const DraggableCard = ({
  app,
  onCardClick,
  onPreview,
  isFocused,
  isSelected,
  isFilteredView,
  onDelete,
}: {
  app: Application;
  onCardClick: (e: React.MouseEvent) => void;
  onPreview: (application: Application) => void;
  isFocused: boolean;
  isSelected: boolean;
  isFilteredView: boolean;
  onDelete: (applicationId: string) => void;
}) => {
  const isTouchDevice = useIsTouchDevice();
  const isDraggable = !isTouchDevice || isSelected;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isItemDragging,
  } = useSortable({ id: app.id, disabled: !isDraggable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isItemDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDraggable ? listeners : {})}
      className={isDraggable ? 'cursor-grab touch-none' : 'cursor-pointer'}
      data-application-id={app.id}
    >
      <StaticApplicantCard
        application={app}
        isSelected={isSelected}
        onSelectToggle={onCardClick}
        isFocused={isFocused}
        onDelete={onDelete}
        onPreview={onPreview}
      />
      {isFilteredView && (
        <div className="text-xs text-center text-gray-500 mt-1">
          In: {app.status}
        </div>
      )}
    </div>
  );
};