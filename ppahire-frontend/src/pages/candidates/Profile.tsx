import { AtSign, BadgeCheck, Briefcase, Cake, CheckCircle, Edit, FileText, GraduationCap, Link as LinkIcon, Loader2, MapPin, Phone, User, XCircle } from 'lucide-react'; // 1. Add missing imports
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import DocumentLink from '../../components/ui/DocumentLink';
import { useAuthStore } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import type { CandidateProfile } from '../../types/candidate';
import ProfileField from './ProfileField';
import EducationSection from './sections/EducationSection';
import WorkExperienceSection from './sections/WorkExperienceSection';

const CandidateProfilePage = () => {
  const { data: profile, isLoading, error, refetch } = useFetch<CandidateProfile>('/candidates/me');
  const userEmail = useAuthStore((state) => state.user?.email);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center text-red-800">
        <h3 className="text-lg font-semibold">Could Not Load Profile</h3>
        <p className="mt-1 text-sm">{error || 'An unexpected error occurred. Please try again later.'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-600">My Profile</h1>
          <p className="mt-1 text-gray-500">View and manage your professional details.</p>
        </div>
        <Link to="/dashboard/candidate/profile/edit">
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ProfileField icon={User} label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
              <ProfileField icon={AtSign} label="Email Address" value={userEmail} />
              <ProfileField icon={Phone} label="Phone Number" value={profile.phone} />
              <ProfileField icon={Cake} label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString() : null} />
              {/* 2. ADD fields for LinkedIn and Portfolio */}
              <ProfileField icon={LinkIcon} label="LinkedIn Profile" value={profile.linkedin} />
              <ProfileField icon={LinkIcon} label="Portfolio URL" value={profile.portfolio} />
            </div>
          </div>

          

          <div className="lg:col-span-1 space-y-8">
            {/* ... Verification, NYSC, Job Preferences cards ... */}
            
            {/* Summary */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Professional Summary</h2>
            <ProfileField icon={FileText} label="" value={profile.summary} />
          </div>
          <WorkExperienceSection 
            experiences={profile.workExperiences || []} 
            isOwner={true} 
            refetchProfile={refetch} 
          />
          </div>
          
          <EducationSection 
            educationHistory={profile.education || []} 
            isOwner={true} 
            refetchProfile={refetch} 
          />

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
          <div className="mt-4 space-y-4">
            {profile.cvFileKey ? (
              <DocumentLink fileKey={profile.cvFileKey} fileName="View Curriculum Vitae (CV)" />
            ) : (
              <p className="text-sm text-gray-400 flex items-center">
                <FileText className="h-4 w-4 mr-2" /> CV not yet uploaded.
              </p>
            )}
            {profile.nyscFileKey ? (
              <DocumentLink fileKey={profile.nyscFileKey} fileName="View NYSC Call-up Letter" />
            ) : (
               <p className="text-sm text-gray-400 flex items-center">
                <FileText className="h-4 w-4 mr-2" /> NYSC document not yet uploaded.
              </p>
            )}
          </div>
        </div>
      </div>

          

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Verification Status */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Verification Status</h2>
            <ProfileField icon={BadgeCheck} label="Current Level">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                {profile.verificationLevel.replace('_', ' ')}
              </span>
            </ProfileField>
            <div className="pt-2">
                    <Link to="/dashboard/candidate/verifications/submit">
                        <Button variant="outline" size="sm" className="w-full">
                            Submit NYSC Documents
                        </Button>
                    </Link>
                </div>
          </div>

          {/* 3. ADD new NYSC & Education Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">NYSC & Education</h2>
            <div className="mt-6 space-y-6">
              <ProfileField icon={GraduationCap} label="NYSC Details" value={`${profile.nyscBatch || ''} ${profile.nyscStream || ''}`.trim()} />
              <ProfileField icon={GraduationCap} label="Graduation Year" value={profile.graduationYear} />
            </div>
          </div>

          {/* Job Preferences Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Job Preferences</h2>
            <div className="mt-6 space-y-6">
              <ProfileField icon={Briefcase} label="Minimum Salary" value={profile.salaryMin ? `₦${profile.salaryMin.toLocaleString()}` : null} />
              {/* 4. UPDATE display for Remote/Relocation to be cleaner */}
              <ProfileField icon={MapPin} label="Work Location">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center text-sm font-medium ${profile.isRemote ? 'text-green-700' : 'text-gray-500'}`}>
                    <CheckCircle className={`mr-1.5 h-4 w-4 ${profile.isRemote ? '' : 'hidden'}`} />
                    <XCircle className={`mr-1.5 h-4 w-4 ${profile.isRemote ? 'hidden' : ''}`} />
                    Remote
                  </span>
                  <span className={`inline-flex items-center text-sm font-medium ${profile.isOpenToReloc ? 'text-green-700' : 'text-gray-500'}`}>
                    <CheckCircle className={`mr-1.5 h-4 w-4 ${profile.isOpenToReloc ? '' : 'hidden'}`} />
                    <XCircle className={`mr-1.5 h-4 w-4 ${profile.isOpenToReloc ? 'hidden' : ''}`} />
                    Relocation
                  </span>
                </div>
              </ProfileField>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CandidateProfilePage;