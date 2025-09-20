import { ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import candidateService from '../../services/candidate.service';
import type { CandidateProfile } from '../../types/candidate';
import ProfileForm, { type ProfileFormValues } from './forms/ProfileForm';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading, error, refetch } = useFetch<CandidateProfile>('/candidates/me');

  const handleUpdateProfile = async (data: ProfileFormValues) => {
    const promise = candidateService.updateMyProfile(data);

    toast.promise(
      promise,
      {
        loading: 'Saving changes...',
        success: <b>Profile updated successfully!</b>,
        error: (err) => err.response?.data?.message || 'Failed to update profile.',
      }
    );

    try {
      await promise;
      await refetch();

      setTimeout(() => {
        navigate('/dashboard/candidate/profile');
      }, 800);
      
    } catch (err) {
      console.error("Update failed:", err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md">
            <h3 className="text-lg font-semibold">Could Not Load Profile Data</h3>
            <p className="mt-2 text-sm">{error.toString()}</p>
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header - Replicated from AgencyDashboard */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Keep your professional information up to date.
          </p>
        </div>
        <Link to="/dashboard/candidate/profile" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to Profile
        </Link>
      </div>

      {/* Replicated Card Styling */}
      <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6">
            <ProfileForm initialData={profile} onSubmit={handleUpdateProfile} />
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;