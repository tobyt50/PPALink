import { Briefcase, ChevronLeft, Loader2, MapPin, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import useFetch from '../../hooks/useFetch';
import applicationService from '../../services/application.service';
import type { Position } from '../../types/job';

const PublicJobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const { data: job, isLoading, error } = useFetch<Position>(
    jobId ? `/public/jobs/${jobId}` : null
  );

  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!jobId) return;

    setIsApplying(true);
    try {
      await applicationService.applyForJob(jobId);
      toast.success("Your application has been submitted!");
      // Redirect to the "My Applications" page to see the new entry
      navigate('/dashboard/candidate/applications');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (error || !job) {
    return <div className="text-center text-red-500 p-8">Error loading job details. This job may no longer be available.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link to="/dashboard/candidate/jobs/browse" className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to All Jobs
        </Link>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-600">{job.title}</h1>
              <p className="mt-1 text-lg text-gray-700">{job.agency?.name}</p>
            </div>
            <div className="flex-shrink-0">
              {/* 6. Wire up the button state */}
              <Button size="lg" onClick={handleApply} isLoading={isApplying} disabled={isApplying}>
                Apply Now
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left Column for Key Details */}
            <div className="md:col-span-1 space-y-6 border-r-0 md:border-r pr-0 md:pr-6">
                 <div className="flex items-start">
                    <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400 mt-1" />
                    <div className="ml-3"><p className="text-sm font-medium text-gray-500">Location</p><p className="mt-1 text-base text-gray-800">{job.isRemote ? 'Remote' : 'On-site'}</p></div>
                </div>
                 <div className="flex items-start">
                    <Briefcase className="h-5 w-5 flex-shrink-0 text-gray-400 mt-1" />
                    <div className="ml-3"><p className="text-sm font-medium text-gray-500">Type</p><p className="mt-1 text-base text-gray-800">{job.employmentType}</p></div>
                </div>
                <div className="flex items-start">
                    <Wallet className="h-5 w-5 flex-shrink-0 text-gray-400 mt-1" />
                    <div className="ml-3"><p className="text-sm font-medium text-gray-500">Salary</p><p className="mt-1 text-base text-gray-800">{job.minSalary ? `₦${job.minSalary.toLocaleString()}` : 'Not specified'}</p></div>
                </div>
            </div>

            {/* Right Column for Description */}
            <div className="md:col-span-3">
                 <h2 className="text-lg font-semibold text-gray-800">Full Job Description</h2>
                 <div className="prose prose-sm max-w-none mt-2 text-gray-600 whitespace-pre-wrap">
                    {job.description}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PublicJobDetailsPage;