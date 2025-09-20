import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BadgeCheck, ChevronLeft, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import applicationService from '../../services/application.service';
import type { Application, ApplicationStatus } from '../../types/application';
import type { Position } from '../../types/job';

// Replicated the polished styling for the Applicant Card
const ApplicantCard = ({ application }: { application: Application }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    boxShadow: isDragging ? '0 10px 20px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' : 'none',
  };

  const { candidate } = application;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <Link 
        to={`/dashboard/agency/applications/${application.id}`} 
        className="group block rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:bg-gradient-to-r hover:from-primary-50 hover:to-green-50"
      >
        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="ml-3">
            <p className="font-semibold text-sm text-gray-800 group-hover:text-primary-600 transition-colors">
              {candidate.firstName} {candidate.lastName}
            </p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <BadgeCheck className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
              {candidate.verificationLevel.replace('_', ' ')}
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1.5">
          {candidate.skills && candidate.skills.length > 0 ? (
            candidate.skills.slice(0, 2).map((skillInfo) => (
              <span key={skillInfo.skill.id} className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                {skillInfo.skill.name}
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No skills listed</p>
          )}
        </div>
      </Link>
    </div>
  );
};

// Replicated the polished styling for the Pipeline Column
const PipelineColumn = ({ title, status, applications }: { title: string; status: ApplicationStatus; applications: Application[] }) => {
  const applicationIds = useMemo(() => applications.map(app => app.id), [applications]);
  const { setNodeRef } = useSortable({ id: status });

  return (
    <div
  ref={setNodeRef}
  className="rounded-2xl bg-gray-100 shadow-md ring-1 ring-gray-100 flex-1 min-h-[500px] flex flex-col overflow-hidden"
>
  <div className="p-5 border-b border-gray-200 flex-shrink-0">
    <h2 className="text-lg font-semibold text-gray-900">
      {title} ({applications.length})
    </h2>
  </div>
  <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
    <div className="bg-gray-100 p-4 space-y-3 h-full overflow-y-auto">
      {applications.length > 0 ? (
        applications.map((app) => (
          <ApplicantCard key={app.id} application={app} />
        ))
      ) : (
        <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-500">Drop applicants here</p>
        </div>
      )}
    </div>
  </SortableContext>
</div>

  );
};

// Main page component with updated layout and styling
const JobPipelinePage = () => {
  const { agencyId, jobId } = useParams<{ agencyId: string; jobId: string }>();
  const { data: job, isLoading, error } = useFetch<Position>(
    agencyId && jobId ? `/agencies/${agencyId}/jobs/${jobId}/pipeline` : null
  );

  const [applications, setApplications] = useState<Application[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  const categorizedApps = useMemo(() => {
    const initialCategories: Record<ApplicationStatus, Application[]> = {
      APPLIED: [], REVIEWING: [], INTERVIEW: [], OFFER: [], REJECTED: [], WITHDRAWN: [],
    };
    return applications.reduce((acc, app) => {
      if (acc[app.status]) { 
        acc[app.status].push(app);
      }
      return acc;
    }, initialCategories);
  }, [applications]);

  const allApplicationIds = useMemo(() => applications.map(app => app.id), [applications]);

  useEffect(() => {
    if (job?.applications) {
      setApplications(job.applications);
    }
  }, [job]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id) {
      const sourceContainerId = active.data.current?.sortable.containerId;
      const destinationContainerId = over.id;
      const applicationId = String(active.id);

      if (sourceContainerId !== destinationContainerId) {
        const newStatus = destinationContainerId as ApplicationStatus;
        setApplications((prevApps) => 
          prevApps.map(app => 
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
                    return err.response?.data?.message || "Failed to update status.";
                }
            }
        );
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary-600" /></div>;
  }
  if (error || !job) {
    return <div className="text-center text-red-600 p-10 bg-red-50 rounded-lg">Error loading job pipeline. Please try again later.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="mb-4">
        <Link to="/dashboard/agency/jobs" className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to All Jobs
        </Link>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
          {job.title}
        </h1>
        <p className="mt-2 text-gray-600">Drag and drop to manage your applicant pipeline.</p>
      </div>
    
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={allApplicationIds}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pt-2">
              <PipelineColumn title="Applied" status="APPLIED" applications={categorizedApps.APPLIED} />
              <PipelineColumn title="Reviewing" status="REVIEWING" applications={categorizedApps.REVIEWING} />
              <PipelineColumn title="Interview" status="INTERVIEW" applications={categorizedApps.INTERVIEW} />
              <PipelineColumn title="Offer" status="OFFER" applications={categorizedApps.OFFER} />
              <PipelineColumn title="Rejected" status="REJECTED" applications={categorizedApps.REJECTED} />
            </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default JobPipelinePage;