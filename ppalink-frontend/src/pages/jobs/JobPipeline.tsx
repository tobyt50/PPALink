import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import {
  BadgeCheck,
  ChevronLeft,
  Filter,
  Loader2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from '../../components/ui/SimpleDropdown';
import useFetch from '../../hooks/useFetch';
import applicationService from '../../services/application.service';
import type {
  Application,
  ApplicationStatus,
} from '../../types/application';
import type { Position } from '../../types/job';

// ---------- STATIC CARD (used inside DragOverlay) ----------
const StaticApplicantCard = ({ application }: { application: Application }) => {
  const { candidate } = application;
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
      <div className="flex items-start">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0" />
        <div className="ml-3 flex-1 min-w-0">
          <div className="relative group">
            <p className="font-semibold text-sm text-gray-800 dark:text-zinc-100 truncate transition-all group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:whitespace-normal group-hover:break-words">
              {candidate.firstName} {candidate.lastName}
            </p>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-zinc-400 mt-1">
            <BadgeCheck className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
            {candidate.verificationLevel.replace('_', ' ')}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.skills && candidate.skills.length > 0 ? (
          candidate.skills.slice(0, 3).map((skillInfo) => (
            <span
              key={skillInfo.skill.id}
              className="rounded-full bg-green-50 dark:bg-green-950/60 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300"
            >
              {skillInfo.skill.name}
            </span>
          ))
        ) : (
          <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
            No skills listed
          </p>
        )}
      </div>
    </div>
  );
};

// ---------- SORTABLE CARD (hidden while dragging) ----------
const ApplicantCard = ({ application }: { application: Application }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? -1 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group"
    >
      <Link to={`/dashboard/agency/applications/${application.id}`}>
        <StaticApplicantCard application={application} />
      </Link>
    </div>
  );
};

// ---------- PIPELINE COLUMN ----------
const PipelineColumn = ({
  title,
  status,
  applications,
}: {
  title: string;
  status: ApplicationStatus;
  applications: Application[];
}) => {
  const applicationIds = useMemo(
    () => applications.map((app) => app.id),
    [applications]
  );
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      data-status={status}
      style={{ scrollSnapAlign: 'center' }} // ✅ snap center horizontally
      className={`
        rounded-2xl bg-gray-100 dark:bg-zinc-800 shadow-md dark:shadow-none
        dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 w-full flex flex-col
        min-h-[600px] overflow-hidden transition-all duration-200
        ${isOver ? 'scale-[1.05] ring-2 ring-primary-500 z-10' : ''}
      `}
    >
      <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
          {title} ({applications.length})
        </h2>
      </div>
      <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
        <div className="bg-gray-100 dark:bg-zinc-800 p-4 space-y-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600">
          {applications.length > 0 ? (
            applications.map((app) => (
              <ApplicantCard key={app.id} application={app} />
            ))
          ) : (
            <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-800">
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Drop applicants here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

// ---------- MAIN PAGE ----------
const JobPipelinePage = () => {
  const { agencyId, jobId } = useParams<{ agencyId: string; jobId: string }>();
  const { data: job, isLoading, error } = useFetch<Position>(
    agencyId && jobId
      ? `/agencies/${agencyId}/jobs/${jobId}/pipeline`
      : null
  );

  const [applications, setApplications] = useState<Application[]>([]);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | null>(null);

  const isTouchDevice = () =>
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 5,
    },
  });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });

  const sensors = useSensors(isTouchDevice() ? touchSensor : pointerSensor);

  const pipelineColumns: { title: string; status: ApplicationStatus }[] = [
    { title: 'Applied', status: 'APPLIED' },
    { title: 'Reviewing', status: 'REVIEWING' },
    { title: 'Interview', status: 'INTERVIEW' },
    { title: 'Offer', status: 'OFFER' },
    { title: 'Rejected', status: 'REJECTED' },
  ];

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

  const allApplicationIds = useMemo(
    () => applications.map((app) => app.id),
    [applications]
  );

  useEffect(() => {
    if (job?.applications) {
      setApplications(job.applications);
    }
  }, [job]);

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const { active } = event;
    const app = applications.find((a) => a.id === active.id);
    if (app) setActiveApplication(app);

    // ✅ Center source pipeline horizontally in viewport
    const sourceId = active.data.current?.sortable.containerId;
    const sourceColumn = document.querySelector(
      `[data-status="${sourceId}"]`
    ) as HTMLElement | null;

    if (sourceColumn) {
      sourceColumn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest', // keep vertical position
        inline: 'center', // ✅ horizontal centering
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveApplication(null);
    const { active, over } = event;
    if (over && active.id) {
      const sourceContainerId = active.data.current?.sortable.containerId;
      const destinationContainerId = over.id;
      const applicationId = String(active.id);

      if (sourceContainerId !== destinationContainerId) {
        const newStatus = destinationContainerId as ApplicationStatus;
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );

        toast.promise(
          applicationService.updateApplicationStatus(applicationId, newStatus),
          {
            loading: 'Updating status...',
            success: 'Status updated successfully!',
            error: (err) => {
              setApplications(job?.applications || []);
              return err.response?.data?.message || 'Failed to update status.';
            },
          }
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-10 bg-red-50 dark:bg-red-950/60 rounded-lg">
        Error loading job pipeline. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            {job.title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Drag and drop to manage your applicant pipeline.
          </p>
        </div>
        <Link
          to="/dashboard/agency/profile"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to All Jobs
        </Link>
      </div>

      <div className="md:hidden">
        <SimpleDropdown
          isIndustryDropdown={false}
          trigger={
            <button className="flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-200 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          }
        >
          <SimpleDropdownItem onSelect={() => setActiveFilter(null)}>
            {activeFilter === null && (
              <BadgeCheck className="h-4 w-4 mr-2 text-blue-500" />
            )}
            Show All
          </SimpleDropdownItem>
          {pipelineColumns.map((col) => (
            <SimpleDropdownItem
              key={col.status}
              onSelect={() => setActiveFilter(col.status)}
            >
              {activeFilter === col.status && (
                <BadgeCheck className="h-4 w-4 mr-2 text-blue-500" />
              )}
              {col.title}
            </SimpleDropdownItem>
          ))}
        </SimpleDropdown>
      </div>

      <DndContext
        sensors={sensors}
        modifiers={[snapCenterToCursor]} // ✅ keep drag overlay under cursor
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <SortableContext items={allApplicationIds}>
          <div
            id="pipelineWrapper"
            className={
              'pt-2 transition-all duration-300 ease-in-out flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory ' +
              (isDragging
                ? 'pb-4 md:scale-95'
                : '')
            }
          >
            {pipelineColumns.map((col) => {
              const isVisible = !activeFilter || activeFilter === col.status;
              return (
                <div
                  key={col.status}
                  style={{ display: isVisible ? 'flex' : 'none' }}
                  className={isDragging ? 'w-64 flex-shrink-0 md:w-auto' : ''}
                >
                  <PipelineColumn
                    title={col.title}
                    status={col.status}
                    applications={categorizedApps[col.status]}
                  />
                </div>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={false} dropAnimation={null}>
          {activeApplication ? (
            <StaticApplicantCard application={activeApplication} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default JobPipelinePage;
