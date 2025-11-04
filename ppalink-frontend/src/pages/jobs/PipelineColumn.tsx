import React, { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CheckSquare, Clock, Square } from "lucide-react";
import type { Application, ApplicationStatus } from "../../types/application";
import { DraggableCard } from "./ApplicantCard";

export const PipelineColumn = ({
  title,
  status,
  applications,
  selectedIds,
  setSelectedIds,
  onCardClick,
  metrics,
  onHeaderClick,
  onPreview,
  focusedCardId,
  onDelete,
  overContainerId,
}: {
  title: string;
  status: ApplicationStatus;
  applications: Application[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onCardClick: (appId: string, e: React.MouseEvent) => void;
  metrics?: { avgDaysInStage: number };
  onHeaderClick: (status: ApplicationStatus) => void;
  onPreview: (application: Application) => void;
  focusedCardId: string | null;
  onDelete: (applicationId: string) => void;
  overContainerId: ApplicationStatus | null;
}) => {
  const applicationIds = useMemo(
    () => applications.map((app) => app.id),
    [applications]
  );
  const { setNodeRef } = useDroppable({ id: status });
  const [showHeaderCheckbox, setShowHeaderCheckbox] = useState(false);

  const handleHeaderTouch = (e: React.TouchEvent) => {
    const pressTimer = setTimeout(() => setShowHeaderCheckbox(true), 500);
    const clear = () => clearTimeout(pressTimer);
    e.currentTarget.addEventListener("touchend", clear, { once: true });
    e.currentTarget.addEventListener("touchmove", clear, { once: true });
  };

  const toggleAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (applicationIds.length > 0) {
      setSelectedIds(new Set(applicationIds));
    }
  };

  return (
    <div
      data-status={status}
      className={`select-none rounded-2xl bg-gray-100 dark:bg-zinc-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 w-full flex flex-col h-[650px] overflow-hidden transition-all duration-200 ${
        overContainerId === status ? "scale-[1.05] ring-2 ring-primary-500 z-10" : ""
      }`}
    >
      <div
        className="p-5 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0 relative group cursor-pointer"
        onTouchStart={handleHeaderTouch}
        onClick={() => onHeaderClick(status)}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
          {title} ({applications.length})
        </h2>
        {metrics && (
          <div className="flex items-center text-xs text-gray-500 dark:text-zinc-400 mt-1">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>Avg. {metrics.avgDaysInStage} days in stage</span>
          </div>
        )}
        <div
          onClick={toggleAll}
          className={`absolute top-5 right-5 z-20 flex h-6 w-6 items-center justify-center rounded-md bg-white/60 backdrop-blur-sm cursor-pointer transition-opacity ${
            showHeaderCheckbox
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          } dark:bg-zinc-800/50`}
        >
          {applicationIds.length > 0 &&
          applicationIds.every((id) => selectedIds.has(id)) ? (
            <CheckSquare className="h-5 w-5 text-primary-600" />
          ) : (
            <Square className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
          )}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600"
      >
        <SortableContext
          items={applicationIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="px-2 pt-1 space-y-2">
            {applications.length > 0 ? (
              applications.map((app) => (
                <DraggableCard
                  key={app.id}
                  app={app}
                  onCardClick={(e) => onCardClick(app.id, e)}
                  onPreview={onPreview}
                  isFocused={app.id === focusedCardId}
                  isSelected={selectedIds.has(app.id)}
                  isFilteredView={false}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px] rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-800">
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  Drop applicants here
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};