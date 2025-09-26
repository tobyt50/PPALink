import { ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import agencyService from '../../services/agency.service';
import type { Agency } from '../../types/agency';
import CompanyProfileForm, { type CompanyProfileFormValues } from './forms/CompanyProfileForm';

const EditCompanyProfilePage = () => {
  const navigate = useNavigate();
  const { data: agency, isLoading, error } = useFetch<Agency>('/agencies/me');

  const handleUpdateProfile = async (data: CompanyProfileFormValues) => {
    try {
      await agencyService.updateMyAgency(data);
      toast.success('Company profile updated successfully!');
      navigate('/dashboard/agency/profile');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
        <h3 className="text-lg font-semibold">Could Not Load Company Data</h3>
        <p className="mt-2 text-sm">{error.toString()}</p>
      </div>
    );
  }

  return (
    // Restored the original max-width container
    <div className="mx-auto max-w-5xl"> 
      <div className="space-y-5">
        {/* Header - Replicated from AgencyDashboard */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
              Edit Company Profile
            </h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-300">
              Update your public-facing company details.
            </p>
          </div>
          <Link to="/dashboard/agency/profile" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            Back to Profile
          </Link>
        </div>

        {/* Form Card - Replicated from AgencyDashboard card style */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Your Company Details</h2>
          </div>
          <div className="p-6">
              <CompanyProfileForm initialData={agency} onSubmit={handleUpdateProfile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyProfilePage;

