import React, { forwardRef, useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Virtuoso } from "react-virtuoso";
import { CheckSquare, Clock, Square } from "lucide-react";
import type { Application, ApplicationStatus } from "../../types/application";
import { StaticApplicantCard } from "./ApplicantCard";

const SortableGhostItem = ({
  id,
  register,
}: {
  id: string;
  register: (el: HTMLElement | null) => void;
}) => {
  const { setNodeRef, listeners, attributes } = useSortable({ id });
  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        register(el);
      }}
      {...listeners}
      {...attributes}
    />
  );
};

const ApplicantCard = ({
  application,
  isSelected,
  onSelectToggle,
  forwardEventToGhost,
  onCardClick,
  isFocused,
  onDelete,
}: {
  application: Application;
  isSelected: boolean;
  onSelectToggle: (e: React.MouseEvent) => void;
  forwardEventToGhost: (id: string, e: React.PointerEvent) => void;
  onCardClick: (e: React.MouseEvent) => void;
  isFocused: boolean;
  onDelete: (applicationId: string) => void;
}) => {
  return (
    <div
      className="relative group cursor-pointer"
      onPointerDown={(e) => forwardEventToGhost(application.id, e)}
      onClick={onCardClick}
      data-application-id={application.id}
    >
      <StaticApplicantCard
        application={application}
        isSelected={isSelected}
        onSelectToggle={onSelectToggle}
        isFocused={isFocused}
        onDelete={onDelete}
      />
    </div>
  );
};

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
}) => {
  const applicationIds = useMemo(
    () => applications.map((app) => app.id),
    [applications]
  );
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const ghostRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const forwardEventToGhost = (id: string, e: React.PointerEvent) => {
    const ghost = ghostRefs.current[id];
    if (ghost) {
      const init: PointerEventInit = {
        bubbles: e.bubbles,
        cancelable: e.cancelable,
        composed: e.nativeEvent.composed,
        detail: e.nativeEvent.detail,
        screenX: e.screenX,
        screenY: e.screenY,
        clientX: e.clientX,
        clientY: e.clientY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        button: e.button,
        buttons: e.buttons,
        relatedTarget: e.relatedTarget,
        pointerId: e.nativeEvent.pointerId,
        width: e.nativeEvent.width,
        height: e.nativeEvent.height,
        pressure: e.nativeEvent.pressure,
        tangentialPressure: e.nativeEvent.tangentialPressure,
        tiltX: e.nativeEvent.tiltX,
        tiltY: e.nativeEvent.tiltY,
        twist: e.nativeEvent.twist,
        pointerType: e.nativeEvent.pointerType,
        isPrimary: e.nativeEvent.isPrimary,
      };
      const cloned = new PointerEvent(e.type, init);
      ghost.dispatchEvent(cloned);
    }
  };
  const renderItem = (_index: number, app: Application) => (
    <ApplicantCard
      application={app}
      isSelected={selectedIds.has(app.id)}
      onSelectToggle={(e) => onCardClick(app.id, e)}
      forwardEventToGhost={forwardEventToGhost}
      onCardClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onCardClick(app.id, e);
        } else {
          onPreview(app);
        }
      }}
      isFocused={app.id === focusedCardId}
      onDelete={onDelete}
    />
  );
  const List = forwardRef<HTMLDivElement>((props, listRef) => (
    <div
      {...props}
      ref={listRef}
      className="px-4 pt-6 space-y-3 [&>*:first-child]:mt-1"
    ></div>
  ));
  const [showHeaderCheckbox, setShowHeaderCheckbox] = useState(false);
  const handleHeaderTouch = (e: React.TouchEvent) => {
    const pressTimer = setTimeout(() => setShowHeaderCheckbox(true), 500);
    const clear = () => clearTimeout(pressTimer);
    e.currentTarget.addEventListener("touchend", clear, { once: true });
    e.currentTarget.addEventListener("touchmove", clear, { once: true });
  };
  const toggleAll = (e: React.MouseEvent) => {
  e.stopPropagation();
  // Always select all cards in this column
  if (applicationIds.length > 0) {
    setSelectedIds(new Set(applicationIds));
  }
};

  return (
    <div
      data-status={status}
      className={`rounded-2xl bg-gray-100 dark:bg-zinc-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 w-full flex flex-col h-[650px] overflow-hidden transition-all duration-200 ${
        isOver ? "scale-[1.05] ring-2 ring-primary-500 z-10" : ""
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
        className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600 relative"
      >
        <SortableContext
          items={applicationIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none">
            {applicationIds.map((id) => (
              <SortableGhostItem
                key={id}
                id={id}
                register={(el) => (ghostRefs.current[id] = el)}
              />
            ))}
          </div>
        </SortableContext>
        {applications.length > 0 ? (
          <Virtuoso
            data={applications}
            itemContent={renderItem}
            components={{ List }}
          />
        ) : (
          <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-800 m-4">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Drop applicants here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};