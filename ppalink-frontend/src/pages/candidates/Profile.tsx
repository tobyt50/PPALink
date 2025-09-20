import { AtSign, BadgeCheck, Briefcase, Cake, CheckCircle, Edit, FileText, GraduationCap, Link as LinkIcon, Loader2, MapPin, Phone, Tag, User, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import DocumentLink from '../../components/ui/DocumentLink';
import { useAuthStore } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStore';
import useFetch from '../../hooks/useFetch';
import type { CandidateProfile } from '../../types/candidate';
import ProfileField from './ProfileField';
import EducationSection from './sections/EducationSection';
import WorkExperienceSection from './sections/WorkExperienceSection';

const CandidateProfilePage = () => {
  const { data: profile, isLoading, error, refetch } = useFetch<CandidateProfile>('/candidates/me');
  const userEmail = useAuthStore((state) => state.user?.email);
  const { states } = useDataStore();

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md">
        <h3 className="text-lg font-semibold">Could Not Load Profile</h3>
        <p className="mt-2 text-sm">{error?.toString() || 'An unexpected error occurred. Please try again later.'}</p>
      </div>
    );
  }

  const locationState = states.find(s => s.id === profile.primaryStateId)?.name;

  return (
    <div className="space-y-5">
      {/* Header - Replicated from AgencyDashboard */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage your professional details.
          </p>
        </div>
        <Link to="/dashboard/candidate/profile/edit">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg border-primary-600 text-primary-600 hover:bg-primary-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Info Card */}
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">Personal Information</h2></div>
            <div className="p-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <ProfileField icon={User} label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
              <ProfileField icon={AtSign} label="Email Address" value={userEmail} />
              <ProfileField icon={Phone} label="Phone Number" value={profile.phone} />
              <ProfileField icon={Cake} label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString() : null} />
              <ProfileField icon={MapPin} label="Primary Location" value={locationState} />
              <ProfileField icon={LinkIcon} label="LinkedIn Profile" value={profile.linkedin} />
              <ProfileField icon={LinkIcon} label="Portfolio URL" value={profile.portfolio} />
            </div>
          </div>

          {/* Professional Summary Card */}
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">Professional Summary</h2></div>
            <div className="p-6"><p className="text-gray-600 whitespace-pre-wrap">{profile.summary || 'You have not added a summary yet.'}</p></div>
          </div>
          
          {/* Skills Card */}
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">Skills</h2></div>
            <div className="p-6 flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map(({ skill }) => (
                  <span key={skill.id} className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    <Tag className="h-4 w-4 mr-1.5" />
                    {skill.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No skills added yet. Click "Edit Profile" to add your skills.</p>
              )}
            </div>
          </div>

          <WorkExperienceSection experiences={profile.workExperiences || []} isOwner={true} refetchProfile={refetch} />
          <EducationSection educationHistory={profile.education || []} isOwner={true} refetchProfile={refetch} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Verification Status Card */}
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">Verification Status</h2></div>
            <div className="p-6">
              <ProfileField icon={BadgeCheck} label="Current Level">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                  {profile.verificationLevel.replace('_', ' ')}
                </span>
              </ProfileField>
              <div className="mt-4">
                <Link to="/dashboard/candidate/verifications/submit">
                    <Button variant="outline" size="sm" className="w-full rounded-lg border-primary-600 text-primary-600 hover:bg-primary-50">
                        Submit Documents
                    </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* NYSC & Education Card */}
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">NYSC & Education</h2></div>
            <div className="p-6 space-y-5">
              <ProfileField icon={GraduationCap} label="NYSC Details" value={`${profile.nyscBatch || ''} ${profile.nyscStream || ''}`.trim()} />
              <ProfileField icon={GraduationCap} label="Graduation Year" value={profile.graduationYear} />
            </div>
          </div>
          
          {/* Job Preferences Card */}
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">Job Preferences</h2></div>
            <div className="p-6 space-y-5">
              <ProfileField icon={Briefcase} label="Minimum Salary" value={profile.salaryMin ? `₦${profile.salaryMin.toLocaleString()}` : null} />
              <ProfileField icon={MapPin} label="Work Location">
                <div className="flex flex-col space-y-2 mt-1">
                  <span className={`inline-flex items-center text-sm font-medium ${profile.isRemote ? 'text-green-700' : 'text-gray-500'}`}>
                    {profile.isRemote ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-gray-400" />}
                    Remote
                  </span>
                  <span className={`inline-flex items-center text-sm font-medium ${profile.isOpenToReloc ? 'text-green-700' : 'text-gray-500'}`}>
                    {profile.isOpenToReloc ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-gray-400" />}
                    Relocation
                  </span>
                </div>
              </ProfileField>
            </div>
          </div>
          
          {/* Documents Card */}
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900">Documents</h2></div>
            <div className="p-6 space-y-4">
              {profile.cvFileKey ? (
                <DocumentLink fileKey={profile.cvFileKey} fileName="View Curriculum Vitae (CV)" />
              ) : (
                <p className="text-sm text-gray-400 flex items-center"><FileText className="h-4 w-4 mr-2" /> CV not yet uploaded.</p>
              )}
              {profile.nyscFileKey ? (
                <DocumentLink fileKey={profile.nyscFileKey} fileName="View NYSC Call-up Letter" />
              ) : (
                 <p className="text-sm text-gray-400 flex items-center"><FileText className="h-4 w-4 mr-2" /> NYSC document not uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;