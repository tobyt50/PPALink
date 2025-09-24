import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import type { Position } from '../../types/job';
import JobForm, { type JobFormValues } from '../agencies/forms/JobForm';
import adminService from '../../services/admin.service';

const AdminEditJobPage = () => {
    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();

    // 1. Fetch the specific job's data to pre-fill the form
    const { data: job, isLoading } = useFetch<Position>(jobId ? `/public/jobs/${jobId}` : null);

    const handleSubmit = async (data: JobFormValues) => {
        if (!jobId) return;

        const updatePromise = adminService.adminUpdateJob(jobId, data);

        await toast.promise(updatePromise, {
            loading: "Updating job post...",
            success: () => {
                navigate('/admin/jobs');
                return "Job updated successfully!";
            },
            error: (err) => err.response?.data?.message || "Failed to update job.",
        });
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Back to Job List
                </button>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary-600">Edit Job Post</h1>
                <p className="mt-1 text-gray-500">You are editing this job as an administrator.</p>
            </div>
            
            {isLoading || !job ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <JobForm 
                        initialData={job} 
                        onSubmit={handleSubmit} 
                        submitButtonText="Save Changes" 
                    />
                </div>
            )}
        </div>
    );
};

export default AdminEditJobPage;