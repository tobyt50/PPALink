import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import agencyService from '../../services/agency.service';
import type { Agency } from '../../types/agency';
import CompanyProfileForm, { type CompanyProfileFormValues } from './forms/CompanyProfileForm';

const EditCompanyProfilePage = () => {
  const navigate = useNavigate();
  const { data: agency, isLoading, error } = useFetch<Agency>('/agencies/me');

  const handleUpdateProfile = async (data: CompanyProfileFormValues) => {
    try {
      // We will create this service function next
      await agencyService.updateMyAgency(data);
      toast.success('Company profile updated successfully!');
      navigate('/dashboard/agency/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load company data.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Edit Company Profile</h1>
        <p className="mt-1 text-gray-500">Update your public-facing company details.</p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <CompanyProfileForm initialData={agency} onSubmit={handleUpdateProfile} />
      </div>
    </div>
  );
};

export default EditCompanyProfilePage;