import { ChevronLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import candidateService from "../../services/candidate.service";
import type { CandidateProfile } from "../../types/candidate";
import ProfileForm, { type ProfileFormValues } from "./forms/ProfileForm";
import { ImageUploader } from "../../components/forms/ImageUploader";
import authService from "../../services/auth.service";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useFetch<CandidateProfile>("/candidates/me");

  const handleUpdateProfile = async (data: ProfileFormValues) => {
    const promise = candidateService.updateMyProfile(data);

    toast.promise(promise, {
      loading: "Saving changes...",
      success: <b>Profile updated successfully!</b>,
      error: (err) =>
        err.response?.data?.message || "Failed to update profile.",
    });

    try {
      await promise;
      await refetch();

      setTimeout(() => {
        navigate("/dashboard/candidate/profile");
      }, 800);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleAvatarUpload = async (fileKey: string) => {
    try {
      await authService.updateAvatar(fileKey);
      toast.success("Avatar updated successfully!");
      refetch(); // Refetch the profile data to get the new avatarKey
    } catch (error) {
      toast.error("Failed to save avatar.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
        <h3 className="text-lg font-semibold">Could Not Load Profile Data</h3>
        <p className="mt-2 text-sm">{error?.toString() ?? "Failed to load profile."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Keep your professional information up to date.
          </p>
        </div>
        <Link
          to="/dashboard/candidate/profile"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to Profile
        </Link>
      </div>
      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="space-y-8 md:space-y-0">
            <div className="w-full md:w-64 md:float-left md:mr-8 md:mb-8 md:p-8">
              <ImageUploader
                label="Avatar"
                uploadType="AVATAR"
                initialImageKey={profile.user?.avatarKey}
                onUploadSuccess={handleAvatarUpload}
                shape="circle"
            />
            </div>
            <div className="w-full">
              {profile && (
                <ProfileForm initialData={profile} onSubmit={handleUpdateProfile} />
              )}
            </div>
            <div className="md:clear-both h-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;