import React from 'react';
import {
  BadgeCheck,
  CheckSquare,
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
import { useMemo, useState } from 'react';

export const StaticApplicantCard = ({
  application,
  isSelected,
  onSelectToggle,
  isFocused,
  onDelete,
}: {
  application: Application;
  isSelected: boolean;
  onSelectToggle: (e: React.MouseEvent) => void;
  isFocused: boolean;
  onDelete: (applicationId: string) => void;
}) => {
  const { candidate } = application;
  const navigate = useNavigate();
  const { shortlistedIds, addShortlistId, removeShortlistId } =
    useShortlistStore();
  const isShortlisted = useMemo(
    () => shortlistedIds.includes(candidate.id),
    [shortlistedIds, candidate.id]
  );
  const [showCheckbox, setShowCheckbox] = useState(false);
  const handleTouchStart = (e: React.TouchEvent) => {
    const pressTimer = setTimeout(() => setShowCheckbox(true), 500);
    const clear = () => clearTimeout(pressTimer);
    e.currentTarget.addEventListener("touchend", clear, { once: true });
    e.currentTarget.addEventListener("touchmove", clear, { once: true });
  };
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
  const initials = `${candidate.firstName?.[0] || ""}${
    candidate.lastName?.[0] || ""
  }`;
  return (
    <div
      onTouchStart={handleTouchStart}
      className={`group relative flex flex-col rounded-xl bg-white p-4 shadow-sm ring-1 transition-all duration-200 dark:bg-zinc-900 dark:shadow-none ${
        isSelected
          ? "ring-2 ring-primary-500"
          : isFocused
          ? "ring-2 ring-blue-500"
          : "ring-gray-100 dark:ring-white/10"
      }`}
    >
      <div
        onClick={onSelectToggle}
        className={`absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-md bg-white/60 backdrop-blur-sm cursor-pointer transition-opacity ${
          isSelected || showCheckbox
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        } dark:bg-zinc-800/50`}
      >
        {isSelected ? (
          <CheckSquare className="h-5 w-5 text-primary-600" />
        ) : (
          <Square className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-start">
          <div className="h-10 w-10 text-sm rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 font-bold">
            {initials}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-800 transition-all dark:text-zinc-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:whitespace-normal break-words">
              {candidate.firstName} {candidate.lastName}
            </p>
          </div>
        </div>
        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-zinc-400">
          <BadgeCheck className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
          <span>{candidate.verificationLevel.replace("_", " ")}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.skills && candidate.skills.length > 0 ? (
          candidate.skills.slice(0, 2).map((skillInfo) => (
            <span
              key={skillInfo.skill.id}
              className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/60 dark:text-green-300"
            >
              {skillInfo.skill.name}
            </span>
          ))
        ) : (
          <p className="italic text-xs text-gray-400 dark:text-zinc-500">
            No skills listed
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3 opacity-0 max-h-0 overflow-hidden transition-all duration-200 group-hover:mt-4 group-hover:opacity-100 group-hover:max-h-16">
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
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging,
    } = useSortable({ id: app.id });

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
        {...listeners}
        className="cursor-pointer touch-none"
        data-application-id={app.id}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onCardClick(e);
          } else {
            onPreview(app);
          }
        }}
      >
        <StaticApplicantCard
          application={app}
          isSelected={isSelected}
          onSelectToggle={(e) => onCardClick(e)}
          isFocused={isFocused}
          onDelete={onDelete}
        />
        {isFilteredView && (
          <div className="text-xs text-center text-gray-500 mt-1">
            In: {app.status}
          </div>
        )}
      </div>
    );
  };