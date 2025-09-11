import { BadgeCheck, Briefcase, CheckCircle, ChevronDown, ChevronLeft, GraduationCap, Heart, Loader2, MapPin, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
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

  const handleToggleShortlist = async () => {
    if (!candidateId || isProcessing) return;

    setIsProcessing(true);
    const actionPromise = isShortlisted
      ? agencyService.removeShortlist(candidateId)
      : agencyService.shortlistCandidate(candidateId);

    try {
      await toast.promise(actionPromise, {
        loading: 'Processing...',
        success: () => {
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
    } catch (err: any) {
      // Errors are handled by toast
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
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }
  if (error || !profile) {
    return <div className="text-center text-red-500 p-8">Could not load candidate profile.</div>;
  }
  
  const locationState = states.find(s => s.id === profile.primaryStateId)?.name;

  return (
    <>
      <AddToJobModal
        isOpen={isAddToJobModalOpen}
        onClose={() => setIsAddToJobModalOpen(false)}
        onSubmit={handleAddToJob}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link to="/dashboard/agency/candidates/browse" className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Search Results
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-lg border bg-white p-6 shadow-sm flex items-center">
              <div className="h-20 w-20 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="ml-5">
                <h1 className="text-2xl font-bold text-primary-600">{profile.firstName} {profile.lastName}</h1>
                <p className="text-gray-500">{locationState || 'Location not specified'}</p>
              </div>
              <div className="ml-auto">
                <SimpleDropdown 
                    trigger={
                        <Button disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : 'Actions'}
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    }
                >
                    <SimpleDropdownItem onSelect={handleToggleShortlist}>
                        {isShortlisted ? (
                          <><Trash2 className="mr-2 h-4 w-4 text-red-500" /> Remove from Shortlist</>
                        ) : (
                          <><Heart className="mr-2 h-4 w-4 text-primary-500" /> Shortlist Candidate</>
                        )}
                    </SimpleDropdownItem>
                    <SimpleDropdownItem onSelect={() => setIsAddToJobModalOpen(true)}>
                        <Briefcase className="mr-2 h-4 w-4" /> Add to Job Pipeline
                    </SimpleDropdownItem>
                </SimpleDropdown>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">Professional Summary</h2>
              <p className="mt-2 text-gray-600 whitespace-pre-wrap">{profile.summary || 'No summary provided.'}</p>
            </div>
            <WorkExperienceSection 
            experiences={profile.workExperiences || []} 
            isOwner={false} 
            />
            <EducationSection 
            educationHistory={profile.education || []} 
            isOwner={false} 
            refetchProfile={refetch} 
          />
          </div>

          <div className="lg:col-span-1 space-y-8">
             <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">Details</h2>
              <div className="mt-4 space-y-4">
                <ProfileField icon={GraduationCap} label="Graduation Year" value={profile.graduationYear} />
                <ProfileField icon={BadgeCheck} label="NYSC Batch" value={`${profile.nyscBatch || ''} ${profile.nyscStream || ''}`.trim()} />
                <ProfileField icon={Briefcase} label="Minimum Salary" value={profile.salaryMin ? `₦${profile.salaryMin.toLocaleString()}` : null} />
                <ProfileField icon={MapPin} label="Work Preferences">
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
    </>
  );
};

export default PublicProfilePage;