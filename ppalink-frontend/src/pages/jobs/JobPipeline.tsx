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

const ApplicantCard = ({ application }: { application: Application }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
  };
  
  const { candidate } = application;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white p-3 rounded-md border shadow-sm touch-none">
      <Link to={`/dashboard/agency/applications/${application.id}`} className="block">
        <div className="flex items-start">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="ml-3">
                <p className="font-semibold text-sm text-gray-800 hover:text-primary-600 transition-colors">
                  {candidate.firstName} {candidate.lastName}
                </p>
                {/* --- THIS IS THE FIX: Verification Level Display --- */}
                <div className="flex items-center text-xs text-gray-500 mt-1">
                    <BadgeCheck className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    {candidate.verificationLevel.replace('_', ' ')}
                </div>
            </div>
        </div>
        
        {/* --- THIS IS THE FIX: Top Skills Display --- */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {candidate.skills && candidate.skills.length > 0 ? (
            candidate.skills.slice(0, 2).map((skillInfo) => (
              <span key={skillInfo.skill.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
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

const PipelineColumn = ({ title, status, applications }: { title: string; status: ApplicationStatus; applications: Application[] }) => {
  const applicationIds = useMemo(() => applications.map(app => app.id), [applications]);
  const { setNodeRef } = useSortable({ id: status });

  return (
    <div ref={setNodeRef} className="bg-gray-100/70 rounded-lg p-3 flex-1 min-h-[400px] flex flex-col">
      <h3 className="font-semibold text-gray-600 text-sm px-1 pb-2 border-b flex-shrink-0">{title} ({applications.length})</h3>
      <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5 mt-3 h-full overflow-y-auto p-1">
          {applications.length > 0 ? (
            applications.map(app => <ApplicantCard application={app} />)
          ) : (
             <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-400 text-center pt-4">Drop applicants here</p>
             </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

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
                success: 'Status updated!',
                error: (err) => {
                    setApplications(job?.applications || []);
                    return err.response?.data?.message || "Failed to update.";
                }
            }
        );
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (error || !job) {
    return <div className="text-center text-red-500 p-8">Error loading job pipeline.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl">
       <div className="mb-6">
        <Link to="/dashboard/agency/jobs" className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to All Jobs
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">{job.title}</h1>
        <p className="mt-1 text-gray-500">Applicant Pipeline</p>
      </div>
    
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={allApplicationIds}>
            <div className="flex flex-col md:flex-row gap-4">
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