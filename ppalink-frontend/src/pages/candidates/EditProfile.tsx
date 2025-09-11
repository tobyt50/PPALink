import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import candidateService from '../../services/candidate.service';
import type { CandidateProfile } from '../../types/candidate';
import ProfileForm, { type ProfileFormValues } from './ProfileForm';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading, error, refetch } = useFetch<CandidateProfile>('/candidates/me');

  // --- THIS FUNCTION IS THE FIX ---
  const handleUpdateProfile = async (data: ProfileFormValues) => {
    // 1. Wrap the API call in toast.promise
    const promise = candidateService.updateMyProfile(data);

    toast.promise(
      promise,
      {
        // 2. Define messages for each state
        loading: 'Saving changes...',
        success: <b>Profile updated successfully!</b>,
        error: (err) => err.response?.data?.message || 'Failed to update profile.',
      }
    );

    try {
      // 3. Await the promise to complete
      await promise;
      
      // 4. Refetch the profile data so the view page is up-to-date
      await refetch();

      // 5. Navigate AFTER the toast has shown and data is refetched
      setTimeout(() => {
        navigate('/dashboard/candidate/profile');
      }, 800); // A small delay so the user can read the success message
      
    } catch (err) {
      // Errors are already handled by toast.promise, but we catch here to prevent unhandled promise rejections
      console.error("Update failed:", err);
    }
  };
  
  // ... rest of the component is unchanged ...
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load profile data.</div>;
  }
  
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Edit Profile</h1>
        <p className="mt-1 text-gray-500">Keep your professional information up to date.</p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <ProfileForm initialData={profile} onSubmit={handleUpdateProfile} />
      </div>
    </div>
  );
};

export default EditProfilePage;