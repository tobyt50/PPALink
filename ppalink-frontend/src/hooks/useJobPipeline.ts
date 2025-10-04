import { useState, useMemo, useEffect } from "react";
import { type DragStartEvent, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "react-hot-toast";
import type { Application, ApplicationStatus } from "../types/application";
import type { Position } from "../types/job";
import applicationService from "../services/application.service";
import { type PipelineFilterValues } from "../pages/jobs/PipelineFilterPanel";

type StatusChange = {
  id: string;
  from: ApplicationStatus;
  to: ApplicationStatus;
};
type Batch = StatusChange[];

export const useJobPipeline = (job: Position, agencyId: string) => {
  const [applications, setApplications] = useState<Application[]>(
    job?.applications || []
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [_appliedFilters, setAppliedFilters] =
    useState<Partial<PipelineFilterValues>>({});
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionAnchor, setSelectionAnchor] = useState<string | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [queryResults, setQueryResults] = useState<Application[] | null>(null);
  const [focusedStage, setFocusedStage] = useState<ApplicationStatus | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const [undoStack, setUndoStack] = useState<Batch[]>([]);
  const [redoStack, setRedoStack] = useState<Batch[]>([]);

  useEffect(() => {
    if (job?.applications) setApplications(job.applications);
  }, [job]);

  const isFilteredView = queryResults !== null;

  const activeApplication = useMemo(() => {
    const source = isFilteredView ? queryResults! : applications;
    return source.find((a) => a.id === activeId);
  }, [activeId, applications, queryResults, isFilteredView]);

  const pipelineColumns: { title: string; status: ApplicationStatus }[] =
    useMemo(
      () => [
        { title: "Applied", status: "APPLIED" },
        { title: "Reviewing", status: "REVIEWING" },
        { title: "Interview", status: "INTERVIEW" },
        { title: "Offer", status: "OFFER" },
        { title: "Rejected", status: "REJECTED" },
      ],
      []
    );

  const categorizedApps = useMemo(() => {
    const initial: Record<ApplicationStatus, Application[]> = {
      APPLIED: [],
      REVIEWING: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: [],
      WITHDRAWN: [],
    };
    return applications.reduce((acc, app) => {
      if (acc[app.status]) acc[app.status].push(app);
      return acc;
    }, initial);
  }, [applications]);

  const focusedStageData = useMemo(() => {
    if (focusedStage && !isFilteredView && job?.metrics) {
      const column = pipelineColumns.find((c) => c.status === focusedStage);
      if (column) {
        return {
          ...column,
          applications: categorizedApps[column.status],
          metrics: job.metrics[column.status],
        };
      }
    }
    return null;
  }, [focusedStage, isFilteredView, pipelineColumns, categorizedApps, job]);

  const navigableApps = useMemo(() => {
    const isGridView = (focusedStageData || isFilteredView) && !isDragging;
    if (isGridView) {
      const source = focusedStageData
        ? focusedStageData.applications
        : queryResults!;
      return [source];
    }
    return pipelineColumns.map((col) => categorizedApps[col.status] || []);
  }, [
    isFilteredView,
    queryResults,
    focusedStageData,
    isDragging,
    pipelineColumns,
    categorizedApps,
  ]);
  
  const handleCardClick = (appId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) => {
      const newSelectedIds = new Set(prev);
      if (e.shiftKey && lastSelectedId) {
        const allAppsInView = navigableApps.flat();
        const lastIndex = allAppsInView.findIndex(
          (app) => app.id === lastSelectedId
        );
        const currentIndex = allAppsInView.findIndex((app) => app.id === appId);
        const [start, end] = [lastIndex, currentIndex].sort((a, b) => a - b);
        for (let i = start; i <= end; i++) {
          newSelectedIds.add(allAppsInView[i].id);
        }
      } else {
        if (newSelectedIds.has(appId)) {
          newSelectedIds.delete(appId);
        } else {
          newSelectedIds.add(appId);
        }
      }
      return newSelectedIds;
    });
    setLastSelectedId(appId);
    setSelectionAnchor(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(String(event.active.id));
    if (!selectedIds.has(String(event.active.id))) {
      setSelectedIds(new Set([String(event.active.id)]));
      setLastSelectedId(String(event.active.id));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveId(null);
    const { active, over } = event;
    if (!over || !active.id) return;
    const destinationContainerId = over.id as ApplicationStatus;
    const idsToMove = Array.from(
      selectedIds.size > 0 ? selectedIds : [String(active.id)]
    );
    const sourceApps = idsToMove
      .map((id) => applications.find((app) => app.id === id))
      .filter((app): app is Application => !!app);
    const batch: StatusChange[] = sourceApps
      .filter((app) => app.status !== destinationContainerId)
      .map((app) => ({
        id: app.id,
        from: app.status,
        to: destinationContainerId,
      }));
    if (batch.length === 0) return;

    setUndoStack((prev) => [...prev, batch]);
    setRedoStack([]);

    const updateFunction = (prev: Application[]) => {
      const restOfApps = prev.filter((app) => !idsToMove.includes(app.id));
      const movedApps = prev
        .filter((app) => idsToMove.includes(app.id))
        .map((app) => ({ ...app, status: destinationContainerId }));
      return [...restOfApps, ...movedApps];
    };

    if (isFilteredView) {
      setQueryResults(null);
      setAppliedFilters({});
    }
    setFocusedStage(null);
    setApplications(updateFunction);

    const updatePromises = idsToMove.map((id) =>
      applicationService.updateApplicationStatus(id, destinationContainerId)
    );
    toast.promise(Promise.all(updatePromises), {
      loading: `Moving ${idsToMove.length} candidate(s)...`,
      success: "Status updated successfully!",
      error: (err) => {
        return err.response?.data?.message || "Failed to update status.";
      },
    });
    setSelectedIds(new Set());
    setLastSelectedId(null);
  };

  const applyBatch = (batch: Batch, isUndo: boolean) => {
    const statusMap = new Map<string, ApplicationStatus>();
    batch.forEach((change) => {
      statusMap.set(change.id, isUndo ? change.from : change.to);
    });
    setApplications((prev) =>
      prev.map((app) => {
        const newStatus = statusMap.get(app.id);
        return newStatus ? { ...app, status: newStatus } : app;
      })
    );
    const promises = batch.map((change) =>
      applicationService.updateApplicationStatus(
        change.id,
        isUndo ? change.from : change.to
      )
    );
    toast.promise(Promise.all(promises), {
      loading: isUndo ? "Undoing..." : "Redoing...",
      success: isUndo ? "Undone!" : "Redone!",
      error: (err) => err?.response?.data?.message || "Error",
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const batch = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, batch]);
    applyBatch(batch, true);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const batch = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, batch]);
    applyBatch(batch, false);
  };

  const handleApplyFilters = async (filters: PipelineFilterValues) => {
    if (!job.id || !agencyId) return;

    setAppliedFilters(filters);
    setFocusedStage(null);

    const hasSearchCriteria =
      filters.q ||
      filters.skills ||
      filters.appliedAfter ||
      filters.appliedBefore ||
      filters.institution;

    if (hasSearchCriteria) {
      setIsQueryLoading(true);
      try {
        const payload = {
          q: filters.q,
          skills: filters.skills
            ? filters.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
          appliedAfter: filters.appliedAfter
            ? new Date(filters.appliedAfter).toISOString()
            : undefined,
          appliedBefore: filters.appliedBefore
            ? new Date(filters.appliedBefore).toISOString()
            : undefined,
          institution: filters.institution || undefined,
        };
        const results = await applicationService.queryPipeline(
          agencyId,
          job.id,
          payload
        );
        setQueryResults(results);
        if (results.length === 0)
          toast.success("No applicants found matching your criteria.");
      } catch (err) {
        toast.error("Failed to apply filters.");
      } finally {
        setIsQueryLoading(false);
      }
    } else {
      setQueryResults(null);
    }
  };

  const handleClearFilters = () => {
    setQueryResults(null);
    setAppliedFilters({});
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const promise = toast.promise(
      Promise.all(
        deleteTarget.map((id) => applicationService.deleteApplication(id))
      ),
      {
        loading: `Deleting ${deleteTarget.length} application(s)...`,
        success: "Application(s) deleted successfully.",
        error: "Failed to delete application(s).",
      }
    );

    try {
      await promise;
      setApplications((prev) =>
        prev.filter((app) => !deleteTarget.includes(app.id))
      );
      setSelectedIds(new Set());
      setLastSelectedId(null);
    } catch (e) {
      // Error is handled by toast.promise
    } finally {
      setDeleteTarget(null);
    }
  };

  return {
    applications,
    setApplications,
    activeId,
    setActiveId,
    isDragging,
    setIsDragging,
    selectedIds,
    setSelectedIds,
    lastSelectedId,
    setLastSelectedId,
    selectionAnchor,
    setSelectionAnchor,
    isQueryLoading,
    queryResults,
    setQueryResults,
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
  };
};