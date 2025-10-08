import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { SortableContext, rectSwappingStrategy } from "@dnd-kit/sortable";
import { CheckSquare, Clock, Loader2, Square, X } from "lucide-react";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ConfirmationModal } from "../../components/ui/Modal";
import { useSocket } from "../../context/SocketContext";
import useFetch from "../../hooks/useFetch";
import type { Application } from "../../types/application";
import type { Position } from "../../types/job";
import { CandidatePreviewPanel } from "./CandidatePreviewPanel";
import { PipelineFilterPanel } from "./PipelineFilterPanel";
import { exportPipelineToCSV } from "../../utils/csv";
import { useJobPipeline } from "../../hooks/useJobPipeline";
import { DraggableCard, StaticApplicantCard } from "./ApplicantCard";
import { PipelineColumn } from "./PipelineColumn";
import { PipelineToolbar } from "./PipelineToolbar";

const JobPipelinePage = () => {
  const { agencyId, jobId } = useParams<{ agencyId: string; jobId: string }>();
  const navigate = useNavigate();
  const {
    data: job,
    isLoading,
    error,
  } = useFetch<Position>( // <-- FIXED: Removed 'refetch'
    agencyId && jobId ? `/agencies/${agencyId}/jobs/${jobId}/pipeline` : null
  );

  const pipelineLogic = useJobPipeline(job!, agencyId!);

  const {
    applications,
    setApplications,
    selectedIds,
    setSelectedIds,
    setLastSelectedId,
    selectionAnchor,
    setSelectionAnchor,
    isQueryLoading,
    queryResults,
    focusedStage,
    setFocusedStage,
    deleteTarget,
    setDeleteTarget,
    undoStack,
    redoStack,
    isFilteredView,
    activeApplication,
    pipelineColumns,
    categorizedApps,
    focusedStageData,
    navigableApps,
    handleCardClick,
    handleDragStart,
    handleDragEnd,
    handleUndo,
    handleRedo,
    handleApplyFilters,
    handleClearFilters,
    handleConfirmDelete,
    isDragging,
    setIsDragging,
    setActiveId,
  } = pipelineLogic;

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [previewingApplication, setPreviewingApplication] =
    useState<Application | null>(null);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const { socket } = useSocket();

  const handleInlineDelete = (applicationId: string) => {
    setDeleteTarget([applicationId]);
  };

  useEffect(() => {
    if (!socket) return;
    const handlePipelineUpdate = (data: {
      jobId: string;
      application: Application;
    }) => {
      if (data.jobId === jobId) {
        setApplications((prev) => {
          const currentApp = prev.find((app) => app.id === data.application.id);
          if (currentApp && currentApp.status === data.application.status) {
            return prev;
          }
          toast("Pipeline updated by another user.", { icon: "🔄" });
          return prev.map((app) =>
            app.id === data.application.id
              ? { ...app, status: data.application.status }
              : app
          );
        });
      }
    };
    socket.on("pipeline:application_updated", handlePipelineUpdate);
    return () => {
      socket.off("pipeline:application_updated", handlePipelineUpdate);
    };
  }, [socket, jobId, setApplications]);

  const handlePreviewClick = (app: Application) => {
    setPreviewingApplication(app);
  };

  const handleExport = async () => {
    if (!job || !applications || applications.length === 0) {
      toast.error("No applicant data to export.");
      return;
    }
    toast.loading("Preparing your export...");
    try {
      exportPipelineToCSV(applications, job.title);
      toast.dismiss();
      toast.success("Export started!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to generate export.");
    }
  };

  const toggleAllInFocusedView = () => {
    if (!focusedStageData) return;
    const appIds = focusedStageData.applications.map((app) => app.id);
    const allSelected = appIds.every((id) => selectedIds.has(id));
    appIds.forEach((id) => {
      const isSelected = selectedIds.has(id);
      if ((allSelected && isSelected) || (!allSelected && !isSelected)) {
        const fakeEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.MouseEvent;
        handleCardClick(id, fakeEvent);
      }
    });
  };

  // Keyboard Navigation and Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isFilterPanelOpen ||
        previewingApplication ||
        deleteTarget ||
        (e.target as HTMLElement).tagName === "INPUT"
      ) {
        return;
      }

      const isGridView = (focusedStageData || isFilteredView) && !isDragging;
      const flatVisibleApps = navigableApps.flat();

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "a": {
            e.preventDefault();
            if (focusedCardId) {
              const column = navigableApps.find((col) =>
                col.some((app) => app.id === focusedCardId)
              );
              if (column) {
                setSelectedIds(new Set(column.map((app) => app.id)));
              }
            } else {
              const allIds = navigableApps.flat().map((app) => app.id);
              setSelectedIds(new Set(allIds));
            }
            setSelectionAnchor(null);
            return;
          }
          case "z": {
            e.preventDefault();
            handleUndo();
            return;
          }
          case "y": {
            e.preventDefault();
            handleRedo();
            return;
          }
          case "ArrowUp":
          case "ArrowDown":
          case "ArrowLeft":
          case "ArrowRight": {
            e.preventDefault();
            let currentCoords = { col: -1, row: -1 };
            for (let i = 0; i < navigableApps.length; i++) {
              const rowIndex = navigableApps[i].findIndex(
                (app) => app.id === focusedCardId
              );
              if (rowIndex !== -1) {
                currentCoords = { col: i, row: rowIndex };
                break;
              }
            }
            if (currentCoords.col === -1) return;
            const dir =
              e.key === "ArrowUp"
                ? "up"
                : e.key === "ArrowDown"
                ? "down"
                : e.key === "ArrowLeft"
                ? "left"
                : "right";
            let nextCol = currentCoords.col;
            let nextRow = currentCoords.row;
            if (dir === "up") nextRow = currentCoords.row - 1;
            else if (dir === "down") nextRow = currentCoords.row + 1;
            else if (dir === "left") nextCol = currentCoords.col - 1;
            else if (dir === "right") nextCol = currentCoords.col + 1;
            if (nextCol < 0 || nextCol >= navigableApps.length) return;
            if (dir === "left" || dir === "right") {
              let scan = dir === "right" ? nextCol + 1 : nextCol - 1;
              while (
                scan >= 0 &&
                scan < navigableApps.length &&
                navigableApps[scan].length === 0
              ) {
                scan = dir === "right" ? scan + 1 : scan - 1;
              }
              if (scan < 0 || scan >= navigableApps.length) return;
              nextCol = scan;
              const targetColAfter = navigableApps[nextCol];
              nextRow = Math.min(
                currentCoords.row,
                Math.max(0, targetColAfter.length - 1)
              );
            }
            const targetColumn = navigableApps[nextCol];
            if (!targetColumn || nextRow < 0 || nextRow >= targetColumn.length)
              return;
            const nextId = targetColumn[nextRow].id;
            if (!selectionAnchor) {
              setSelectionAnchor(focusedCardId);
            }
            setFocusedCardId(nextId);
            const allAppsInView = navigableApps.flat();
            const anchorIndex = allAppsInView.findIndex(
              (a) => a.id === selectionAnchor
            );
            const focusIndex = allAppsInView.findIndex((a) => a.id === nextId);
            if (anchorIndex !== -1 && focusIndex !== -1) {
              const [start, end] = [anchorIndex, focusIndex].sort(
                (a, b) => a - b
              );
              const idsInRange = allAppsInView
                .slice(start, end + 1)
                .map((a) => a.id);
              setSelectedIds(new Set(idsInRange));
            }
            return;
          }
        }
      }

      switch (e.key) {
        case "Backspace": {
          e.preventDefault();
          const toDelete =
            selectedIds.size > 0
              ? Array.from(selectedIds)
              : focusedCardId
              ? [focusedCardId]
              : [];
          if (toDelete.length > 0) {
            setDeleteTarget(toDelete);
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          if (previewingApplication) {
            setPreviewingApplication(null);
          } else if (isFilterPanelOpen) {
            setIsFilterPanelOpen(false);
          } else if (focusedStage) {
            setFocusedStage(null);
          } else {
            setFocusedCardId(null);
            setSelectedIds(new Set());
            setLastSelectedId(null);
            setSelectionAnchor(null);
          }
          break;
        case "Enter": {
          e.preventDefault();
          const app = flatVisibleApps.find((a) => a.id === focusedCardId);
          if (app) {
            navigate(`/dashboard/agency/applications/${app.id}`);
          }
          break;
        }
        case " ": {
          e.preventDefault();
          if (focusedCardId) {
            handleCardClick(focusedCardId, {
              preventDefault: () => {},
              stopPropagation: () => {},
              shiftKey: e.shiftKey,
            } as unknown as React.MouseEvent);
          }
          break;
        }
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight": {
          e.preventDefault();
          let nextFocusedCardId: string | null = null;
          if (!focusedCardId) {
            if (flatVisibleApps.length > 0) {
              nextFocusedCardId = flatVisibleApps[0].id;
            }
          } else {
            let currentCoords = { col: -1, row: -1 };
            for (let i = 0; i < navigableApps.length; i++) {
              const rowIndex = navigableApps[i].findIndex(
                (app) => app.id === focusedCardId
              );
              if (rowIndex !== -1) {
                currentCoords = { col: i, row: rowIndex };
                break;
              }
            }
            if (currentCoords.col === -1) break;
            if (isGridView) {
              const numCols = 5;
              const currentIndex = currentCoords.row;
              const currentColumn = navigableApps[0];
              if (
                e.key === "ArrowRight" &&
                currentIndex < currentColumn.length - 1
              ) {
                nextFocusedCardId = currentColumn[currentIndex + 1].id;
              } else if (e.key === "ArrowLeft" && currentIndex > 0) {
                nextFocusedCardId = currentColumn[currentIndex - 1].id;
              } else if (
                e.key === "ArrowDown" &&
                currentIndex + numCols < currentColumn.length
              ) {
                nextFocusedCardId = currentColumn[currentIndex + numCols].id;
              } else if (e.key === "ArrowUp" && currentIndex - numCols >= 0) {
                nextFocusedCardId = currentColumn[currentIndex - numCols].id;
              }
            } else {
              if (e.key === "ArrowDown") {
                if (
                  currentCoords.row <
                  navigableApps[currentCoords.col].length - 1
                ) {
                  nextFocusedCardId =
                    navigableApps[currentCoords.col][currentCoords.row + 1].id;
                }
              } else if (e.key === "ArrowUp") {
                if (currentCoords.row > 0) {
                  nextFocusedCardId =
                    navigableApps[currentCoords.col][currentCoords.row - 1].id;
                }
              } else if (e.key === "ArrowRight") {
                let nextColIndex = currentCoords.col + 1;
                while (
                  nextColIndex < navigableApps.length &&
                  navigableApps[nextColIndex].length === 0
                ) {
                  nextColIndex++;
                }
                if (nextColIndex < navigableApps.length) {
                  const nextCol = navigableApps[nextColIndex];
                  const nextRow = Math.min(
                    currentCoords.row,
                    nextCol.length - 1
                  );
                  nextFocusedCardId = nextCol[nextRow].id;
                }
              } else if (e.key === "ArrowLeft") {
                let prevColIndex = currentCoords.col - 1;
                while (
                  prevColIndex >= 0 &&
                  navigableApps[prevColIndex].length === 0
                ) {
                  prevColIndex--;
                }
                if (prevColIndex >= 0) {
                  const prevCol = navigableApps[prevColIndex];
                  const nextRow = Math.min(
                    currentCoords.row,
                    prevCol.length - 1
                  );
                  nextFocusedCardId = prevCol[nextRow].id;
                }
              }
            }
          }
          if (nextFocusedCardId) {
            setFocusedCardId(nextFocusedCardId);
            if (e.shiftKey) {
              const allAppsInView = navigableApps.flat();
              if (!selectionAnchor) {
                setSelectionAnchor(focusedCardId);
              }
              const anchor = selectionAnchor || focusedCardId;
              if (!anchor) return;
              const anchorIndex = allAppsInView.findIndex(
                (a) => a.id === anchor
              );
              const nextIndex = allAppsInView.findIndex(
                (a) => a.id === nextFocusedCardId
              );
              if (anchorIndex !== -1 && nextIndex !== -1) {
                const [start, end] = [anchorIndex, nextIndex].sort(
                  (a, b) => a - b
                );
                const idsInRange = allAppsInView
                  .slice(start, end + 1)
                  .map((a) => a.id);
                setSelectedIds(new Set(idsInRange));
              }
            } else {
              setSelectionAnchor(null);
              setLastSelectedId(nextFocusedCardId);
              setSelectedIds(new Set([nextFocusedCardId]));
            }
          }
          break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    focusedCardId,
    isFilterPanelOpen,
    previewingApplication,
    deleteTarget,
    navigate,
    navigableApps,
    selectedIds,
    selectionAnchor,
    handleCardClick,
    handleUndo,
    handleRedo,
    setDeleteTarget,
    setFocusedCardId,
    setLastSelectedId,
    setSelectionAnchor,
    setSelectedIds,
    setFocusedStage,
  ]);

  useLayoutEffect(() => {
    if (focusedCardId) {
      const cardElement = document.querySelector(
        `[data-application-id="${focusedCardId}"]`
      );
      cardElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focusedCardId]);

  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 4 },
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 10 },
  })
);

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  if (error || !job)
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-10 bg-red-50 dark:bg-red-950/60 rounded-lg">
        Error loading job pipeline. Please try again later.
      </div>
    );

  const renderContent = () => {
    if (isFilteredView && !isDragging) {
      return (
        <SortableContext
          items={queryResults?.map((q) => q.id) || []}
          strategy={rectSwappingStrategy}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {queryResults &&
              queryResults.map((app) => (
                <DraggableCard
                  key={app.id}
                  app={app}
                  onCardClick={(e) => handleCardClick(app.id, e)}
                  onPreview={handlePreviewClick}
                  isFocused={app.id === focusedCardId}
                  isSelected={selectedIds.has(app.id)}
                  isFilteredView={isFilteredView}
                  onDelete={handleInlineDelete}
                />
              ))}
          </div>
        </SortableContext>
      );
    }
    if (focusedStageData && !isDragging) {
      const { title, applications: stageApps, metrics } = focusedStageData;
      const appIds = stageApps.map((app) => app.id);
      const allInStageSelected =
        appIds.length > 0 && appIds.every((id) => selectedIds.has(id));
      return (
        <div className="rounded-2xl bg-gray-100 dark:bg-zinc-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 w-full flex flex-col min-h-[650px]">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                {title} ({stageApps.length})
              </h2>
              {metrics && (
                <div className="flex items-center text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  <span>Avg. {metrics.avgDaysInStage} days in stage</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div
                onClick={toggleAllInFocusedView}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-white/60 backdrop-blur-sm cursor-pointer dark:bg-zinc-700/50"
              >
                {allInStageSelected ? (
                  <CheckSquare className="h-5 w-5 text-primary-600" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                )}
              </div>
              <button
                onClick={() => setFocusedStage(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-4 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400">
            <SortableContext
              items={stageApps.map((a) => a.id)}
              strategy={rectSwappingStrategy}
            >
              {stageApps.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {stageApps.map((app) => (
                    <DraggableCard
                      key={app.id}
                      app={app}
                      onCardClick={(e) => handleCardClick(app.id, e)}
                      onPreview={handlePreviewClick}
                      isFocused={app.id === focusedCardId}
                      isSelected={selectedIds.has(app.id)}
                      isFilteredView={isFilteredView}
                      onDelete={handleInlineDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px] rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-700">
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    No applicants in this stage.
                  </p>
                </div>
              )}
            </SortableContext>
          </div>
        </div>
      );
    }
    return (
      <div
        className={`pt-2 transition-all duration-300 ease-in-out ${
          isDragging
            ? "flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:scale-95 md:gap-2"
            : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        }`}
      >
        {pipelineColumns.map((col) => (
          <div
            key={col.status}
            className={isDragging ? "w-64 flex-shrink-0 md:w-auto" : ""}
          >
            <PipelineColumn
              title={col.title}
              status={col.status}
              applications={categorizedApps[col.status]}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onCardClick={handleCardClick}
              metrics={job.metrics?.[col.status]}
              onHeaderClick={setFocusedStage}
              onPreview={handlePreviewClick}
              focusedCardId={focusedCardId}
              onDelete={handleInlineDelete}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete Application${
          deleteTarget && deleteTarget.length > 1 ? "s" : ""
        }`}
        description={`Are you sure you want to permanently delete ${
          deleteTarget?.length ?? 0
        } application(s)? This action cannot be undone.`}
        confirmButtonText="Delete"
        isDestructive
      />
      <CandidatePreviewPanel
        candidateId={previewingApplication?.candidate.id ?? null}
        applicationId={previewingApplication?.id ?? null}
        onClose={() => setPreviewingApplication(null)}
      />
      <PipelineFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={handleApplyFilters}
        onClear={() => {
          handleClearFilters();
          setIsFilterPanelOpen(false);
        }}
        isLoading={isQueryLoading}
        institutions={job?.pipelineInstitutions || []}
      />
      <div className="space-y-5">
        <PipelineToolbar
          jobTitle={job.title}
          applicationCount={applications.length}
          onExport={handleExport}
          onFilter={() => setIsFilterPanelOpen(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
        />
        {isFilteredView && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  Showing {queryResults?.length || 0} search result(s)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleClearFilters();
                    setIsFilterPanelOpen(false);
                  }}
                >
                  Clear Search
                </Button>
              </div>
            </div>
          </div>
        )}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setIsDragging(false);
            setActiveId(null);
          }}
          collisionDetection={closestCenter}
          measuring={
            isFilteredView || focusedStageData
              ? undefined
              : { droppable: { strategy: MeasuringStrategy.Always } }
          }
        >
          <div>{renderContent()}</div>
          <DragOverlay adjustScale={false} dropAnimation={null}>
            {activeApplication ? (
              <div className="relative">
                <StaticApplicantCard
                  application={activeApplication}
                  isSelected={true}
                  onSelectToggle={() => {}}
                  isFocused={false}
                  onDelete={handleInlineDelete}
                />
                {selectedIds.size > 1 && (
                  <div className="absolute -top-2 -left-2 bg-primary-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                    +{selectedIds.size}
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
};

export default JobPipelinePage;
