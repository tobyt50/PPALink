import { BadgeCheck, Briefcase, CheckCircle, ChevronDown, ChevronLeft, GraduationCap, Heart, Loader2, MapPin, Tag, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import { useDataStore } from '../../context/DataStore';
import { useShortlistStore } from '../../context/ShortlistStore';
import useFetch from '../../hooks/useFetch';
import agencyService from '../../services/agency.service';
import applicationService from '../../services/application.service';
import type { CandidateProfile } from '../../types/candidate';
import { AddToJobModal } from '../agencies/AddToJobModal';
import ProfileField from './ProfileField';
import EducationSection from './sections/EducationSection';
import WorkExperienceSection from './sections/WorkExperienceSection';

const PublicProfilePage = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const { data: profile, isLoading, error, refetch } = useFetch<CandidateProfile>(
    candidateId ? `/candidates/${candidateId}/profile` : null
  );

  const { states } = useDataStore();
  const { shortlistedIds, addShortlistId, removeShortlistId } = useShortlistStore();
  const isShortlisted = useMemo(() => 
    candidateId ? shortlistedIds.includes(candidateId) : false,
    [shortlistedIds, candidateId]
  );
    
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddToJobModalOpen, setIsAddToJobModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
const backLink = `/dashboard/agency/candidates/browse${
  searchParams.toString() ? `?${searchParams.toString()}` : ''
}`;

  const handleToggleShortlist = async () => {
    if (!candidateId || isProcessing) return;

    setIsProcessing(true);
    const actionPromise = isShortlisted
      ? agencyService.removeShortlist(candidateId)
      : agencyService.shortlistCandidate(candidateId);

    try {
      await toast.promise(actionPromise, {
        loading: 'Processing...',
        success: (_res) => {
          if (isShortlisted) {
            removeShortlistId(candidateId);
            return "Removed from shortlist.";
          } else {
            addShortlistId(candidateId);
            return "Candidate shortlisted!";
          }
        },
        error: (err: any) => err.response?.data?.message || "An error occurred.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToJob = async (positionId: string) => {
    if (!candidateId) return;
    
    const addPromise = applicationService.createApplication(positionId, candidateId);
    
    await toast.promise(addPromise, {
        loading: 'Adding to pipeline...',
        success: 'Candidate successfully added!',
        error: (err: any) => err.response?.data?.message || "Failed to add candidate.",
    });

    setIsAddToJobModalOpen(false);
  };

  if (isLoading) {
    return <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>;
  }
  if (error || !profile) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">Could not load candidate profile.</div>;
  }
  
  const locationState = states.find(s => s.id === profile.primaryStateId)?.name;

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`;

  return (
    <>
      <AddToJobModal
        isOpen={isAddToJobModalOpen}
        onClose={() => setIsAddToJobModalOpen(false)}
        onSubmit={handleAddToJob}
      />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
           <Link to={backLink} className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
  <ChevronLeft className="h-4 w-4 mr-1.5" />
  Back to Search Results
</Link>

        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header Card */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-6">
              <div className="flex items-start">
                {/* Avatar */}
        <div
  className="h-24 w-24 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 text-4xl font-bold"
>
  {initials}
</div>
                <div className="ml-6 flex-grow">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="mt-1 text-gray-600 dark:text-zinc-300">{locationState || 'Location not specified'}</p>
                  <div className="mt-4">
                    <SimpleDropdown 
                        trigger={
                            <Button variant="outline" size="sm" className="rounded-lg border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50" disabled={isProcessing}>
                                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Actions'}
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        }
                    >
                        <SimpleDropdownItem onSelect={handleToggleShortlist} className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60">
                            {isShortlisted ? (
                              <><Trash2 className="mr-2 h-4 w-4 text-red-500" /> <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400">Remove from Shortlist</span></>
                            ) : (
                              <><Heart className="mr-2 h-4 w-4 text-primary-500 dark:text-primary-400" /> <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400">Shortlist Candidate</span></>
                            )}
                        </SimpleDropdownItem>
                        <SimpleDropdownItem onSelect={() => setIsAddToJobModalOpen(true)} className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 hover:to-green-50 dark:hover:to-green-950/60">
                            <Briefcase className="mr-2 h-4 w-4" /> <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400">Add to Job Pipeline</span>
                        </SimpleDropdownItem>
                    </SimpleDropdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Professional Summary</h2></div>
              <div className="p-6"><p className="text-gray-600 dark:text-zinc-300 whitespace-pre-wrap">{profile.summary || 'No summary provided.'}</p></div>
            </div>

            {/* Details & Skills for Mobile View */}
            <div className="space-y-8 lg:hidden">
              <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Details</h2></div>
                <div className="p-6 space-y-5">
                  <ProfileField icon={GraduationCap} label="Graduation Year" value={profile.graduationYear} />
                  <ProfileField icon={BadgeCheck} label="NYSC Batch" value={`${profile.nyscBatch || ''} ${profile.nyscStream || ''}`.trim()} />
                  <ProfileField icon={Briefcase} label="Minimum Salary" value={profile.salaryMin ? `₦${profile.salaryMin.toLocaleString()}` : null} />
                  <ProfileField icon={MapPin} label="Work Preferences">
                    <div className="flex flex-col space-y-2 mt-1">
                      <span className={`inline-flex items-center text-sm font-medium ${profile.isRemote ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-zinc-400'}`}>
                        {profile.isRemote ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-gray-400 dark:text-zinc-500" />}
                        Remote
                      </span>
                      <span className={`inline-flex items-center text-sm font-medium ${profile.isOpenToReloc ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-zinc-400'}`}>
                        {profile.isOpenToReloc ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-gray-400 dark:text-zinc-500" />}
                        Relocation
                      </span>
                    </div>
                  </ProfileField>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Skills</h2></div>
                  <div className="p-6 flex flex-wrap gap-2">
                      {profile.skills && profile.skills.length > 0 ? (
                          profile.skills.map(({ skill }) => (
                          <span key={skill.id} className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/60 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-200">
                              <Tag className="h-4 w-4 mr-1.5" />
                              {skill.name}
                          </span>
                          ))
                      ) : (
                          <p className="text-sm text-gray-500 dark:text-zinc-400">No skills listed by the candidate.</p>
                      )}
                  </div>
              </div>
            </div>
            
            <WorkExperienceSection experiences={profile.workExperiences || []} isOwner={false} />
            <EducationSection educationHistory={profile.education || []} isOwner={false} refetchProfile={refetch} />
          </div>

          {/* Sidebar Column (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 space-y-8">
             <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Details</h2></div>
              <div className="p-6 space-y-5">
                <ProfileField icon={GraduationCap} label="Graduation Year" value={profile.graduationYear} />
                <ProfileField icon={BadgeCheck} label="NYSC Batch" value={`${profile.nyscBatch || ''} ${profile.nyscStream || ''}`.trim()} />
                <ProfileField icon={Briefcase} label="Minimum Salary" value={profile.salaryMin ? `₦${profile.salaryMin.toLocaleString()}` : null} />
                <ProfileField icon={MapPin} label="Work Preferences">
                  <div className="flex flex-col space-y-2 mt-1">
                    <span className={`inline-flex items-center text-sm font-medium ${profile.isRemote ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-zinc-400'}`}>
                      {profile.isRemote ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-gray-400 dark:text-zinc-500" />}
                      Remote
                    </span>
                    <span className={`inline-flex items-center text-sm font-medium ${profile.isOpenToReloc ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-zinc-400'}`}>
                      {profile.isOpenToReloc ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-gray-400 dark:text-zinc-500" />}
                      Relocation
                    </span>
                  </div>
                </ProfileField>
              </div>
             </div>

            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Skills</h2></div>
                <div className="p-6 flex flex-wrap gap-2">
                    {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map(({ skill }) => (
                        <span key={skill.id} className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/60 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-200">
                            <Tag className="h-4 w-4 mr-1.5" />
                            {skill.name}
                        </span>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-zinc-400">No skills listed by the candidate.</p>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfilePage;

