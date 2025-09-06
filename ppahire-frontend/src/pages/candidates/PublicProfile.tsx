import { BadgeCheck, Briefcase, CheckCircle, ChevronLeft, GraduationCap, Loader2, MapPin, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useDataStore } from '../../context/DataStore';
import useFetch from '../../hooks/useFetch';
import agencyService from '../../services/agency.service';
import type { CandidateProfile } from '../../types/candidate';
import ProfileField from './ProfileField'; // Reusing the same helper component

const PublicProfilePage = () => {
  // 1. Get the candidate's ID from the URL
  const { candidateId } = useParams<{ candidateId: string }>();

  // 2. Fetch the specific candidate's profile
  // We will build this new API endpoint in the next steps
  const { data: profile, isLoading, error } = useFetch<CandidateProfile>(
    candidateId ? `/candidates/${candidateId}/profile` : null
  );

    const { states } = useDataStore();
    
    const [isShortlisting, setIsShortlisting] = useState(false);

    const handleShortlist = async () => {
        if (!candidateId) return;
    
        setIsShortlisting(true);
        try {
          const response = await agencyService.shortlistCandidate(candidateId);
          toast.success(response.message || "Candidate shortlisted!");
          // Optionally, you could change the button state here (e.g., to "Shortlisted")
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to shortlist candidate.");
        } finally {
          setIsShortlisting(false);
        }
      };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }
  if (error || !profile) {
    return <div className="text-center text-red-500 p-8">Could not load candidate profile.</div>;
  }
  
  const locationState = states.find(s => s.id === profile.primaryStateId)?.name;

  return (
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
              {/* 6. Wire up the button's onClick and isLoading state */}
              <Button onClick={handleShortlist} isLoading={isShortlisting}>
                Shortlist Candidate
              </Button>
            </div>
          </div>
          {/* Summary Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Professional Summary</h2>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{profile.summary || 'No summary provided.'}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
           {/* Details Card */}
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
  );
};

export default PublicProfilePage;