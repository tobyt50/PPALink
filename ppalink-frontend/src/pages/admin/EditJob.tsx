import { ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import type { Position } from '../../types/job';
import JobForm, { type JobFormValues } from '../agencies/forms/JobForm';
import adminService from '../../services/admin.service';

const AdminEditJobPage = () => {
    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();

    const { data: job, isLoading, error } = useFetch<Position>(jobId ? `/admin/jobs/${jobId}` : null);

    const handleSubmit = async (data: JobFormValues) => {
        if (!jobId) return;

        const updatePromise = adminService.adminUpdateJob(jobId, data);

        await toast.promise(updatePromise, {
            loading: "Updating job post...",
            success: () => {
                navigate(`/admin/jobs/${jobId}`);
                return "Job updated successfully!";
            },
            error: (err) => err.response?.data?.message || "Failed to update job.",
        });
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <Link
                    to={jobId ? `/admin/jobs/${jobId}` : '/admin/jobs'}
                    className="flex items-center text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to Job Details
                </Link>
                <h1 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                    Edit Job Post
                </h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-300">You are editing this job as an administrator. Changes will be live immediately.</p>
            </div>
            
            {isLoading && (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
            )}

            {error && (
                 <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
                    Could not load job data to edit.
                </div>
            )}

            {!isLoading && !error && job && (
                <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
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

