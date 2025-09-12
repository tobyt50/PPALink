import { Briefcase, Calendar, CheckCircle, ChevronLeft, Edit, Globe, Loader2, MapPin, Tag, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import { useDataStore } from '../../context/DataStore';
import useFetch from '../../hooks/useFetch';
import jobService from '../../services/job.service';
import type { Position } from '../../types/job';

const DetailField = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: string | number | null, children?: React.ReactNode }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 mt-1" />
        <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className="mt-1 text-base text-gray-800">{children || value || 'N/A'}</div>
        </div>
    </div>
);


const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { agencyId, jobId } = useParams<{ agencyId: string; jobId: string }>();
  
  const { data: job, isLoading, error } = useFetch<Position>(
    agencyId && jobId ? `/agencies/${agencyId}/jobs/${jobId}` : null
  );

  const { states } = useDataStore();

  // 2. Add state to control the delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 3. Create the handler for the delete action
  const handleDeleteJob = async () => {
    if (!agencyId || !jobId) {
      toast.error('Could not verify agency and job ID.');
      return;
    }
    
    try {
      await jobService.deleteJob(agencyId, jobId); // We will create this service function next
      toast.success('Job posting deleted successfully.');
      navigate('/dashboard/agency/jobs');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete job posting.');
      setIsDeleteModalOpen(false); // Close modal on error
    }
  };


  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }
  if (error || !job) {
    return <div className="text-center text-red-500 p-8">Error loading job details.</div>;
  }

  const locationState = job.stateId ? states.find(s => s.id === job.stateId)?.name : undefined;

  return (
    <>
      {/* 4. Render the ConfirmationModal component */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteJob}
        title="Delete Job Posting"
        description="Are you sure you want to permanently delete this job posting? This action cannot be undone."
        confirmButtonText="Delete"
        isDestructive={true}
      />

      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link to="/dashboard/agency/jobs" className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to All Jobs
          </Link>
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-600">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 mt-2">
                <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1.5" />{job.employmentType}</span>
                {!job.isRemote && locationState && (
                    <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" />{locationState}</span>
                )}
                 {job.isRemote && (
                    <span className="flex items-center"><Globe className="h-4 w-4 mr-1.5" />Remote</span>
                )}
              </div>
            </div>
            {/* 5. Add the "Delete" button alongside the "Edit" button */}
            <div className="flex flex-shrink-0 gap-2">
              <Link to={`/dashboard/agency/${agencyId}/jobs/${job.id}/edit`}>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
              </Link>
              <Button size="sm" variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
               <DetailField icon={Wallet} label="Salary Range" value={job.minSalary && job.maxSalary ? `₦${job.minSalary.toLocaleString()} - ₦${job.maxSalary.toLocaleString()}` : 'Not specified'} />
               <DetailField icon={Globe} label="Visibility" value={job.visibility} />
               <DetailField icon={CheckCircle} label="Status">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                      {job.status}
                  </span>
               </DetailField>
               <DetailField icon={Calendar} label="Date Posted" value={new Date(job.createdAt).toLocaleDateString()} />
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Job Description</h2>
                <div className="prose prose-sm max-w-none mt-2 text-gray-600 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Skills Required</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(job.skillsReq) && job.skillsReq.length > 0 ? (
                    job.skillsReq.map((skill: any) => (
                      <span key={skill} className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
                        <Tag className="h-4 w-4 mr-1.5" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No specific skills listed.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetailsPage;