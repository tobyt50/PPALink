import { Briefcase, Calendar, ChevronLeft, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DebouncedTextarea } from '../../components/forms/DebouncedTextArea';
import { Button } from '../../components/ui/Button';
import DocumentLink from '../../components/ui/DocumentLink';
import useFetch from '../../hooks/useFetch';
import applicationService from '../../services/application.service';
import type { Application } from '../../types/application';
import EducationSection from '../candidates/sections/EducationSection';
import WorkExperienceSection from '../candidates/sections/WorkExperienceSection';

const CandidateProfileSnapshot = ({ candidate }: { candidate: Application['candidate'] }) => (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="h-14 w-16 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="ml-4">
          <h2 className="text-xl font-bold text-primary-600">
            {candidate.firstName} {candidate.lastName}
          </h2>
          <p className="text-sm text-gray-500">{candidate.user?.email}</p>
        </div>
      </div>
  
      {candidate.summary && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          {candidate.summary}
        </p>
      )}
  
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Documents
        </h3>
        {candidate.cvFileKey ? (
          <DocumentLink fileKey={candidate.cvFileKey} fileName="View CV" />
        ) : (
          <p className="text-sm text-gray-500">No CV uploaded.</p>
        )}
  
        {candidate.nyscFileKey ? (
          <DocumentLink fileKey={candidate.nyscFileKey} fileName="View NYSC Document" />
        ) : (
          <p className="text-sm text-gray-500">No NYSC document uploaded.</p>
        )}
      </div>
    </div>
);
  
const ApplicationDetailsPage = () => {
    const navigate = useNavigate();
    const { applicationId } = useParams<{ applicationId: string }>();
    
    const { data: application, isLoading, error } = useFetch<Application>(
      applicationId ? `/applications/${applicationId}` : null
    );
  
    const handleSaveNotes = async (notes: string) => {
      if (!applicationId) return;
      try {
        await applicationService.updateApplicationNotes(applicationId, notes);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to save notes.");
        throw err;
      }
    };
  
    const handleMessageCandidate = () => {
      if (!application?.candidate?.user) {
        toast.error("Candidate user information is not available.");
        return;
      };

      const { user, firstName, lastName } = application.candidate;

      const conversationState = {
        otherUser: {
          id: user.id,
          email: user.email,
          candidateProfile: { firstName, lastName },
        },
      };

      navigate('/inbox', { 
          state: { 
              activeConversation: conversationState
          } 
      });
    };
  
    if (isLoading) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    if (error || !application) {
      return (
        <div className="text-center text-red-500 p-8">
          Error loading application details.
        </div>
      );
    }
  
    const { candidate, position } = application;
  
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            to={`/dashboard/agency/${position.agencyId}/jobs/${position.id}/pipeline`}
            className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Pipeline
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-1 lg:sticky top-20 space-y-6">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <CandidateProfileSnapshot candidate={candidate} />
                </div>
                <div className="mt-4">
                    <Button className="w-full" onClick={handleMessageCandidate}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Candidate
                    </Button>
                </div>
                <div className="rounded-lg border bg-white shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800">Application Details</h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 text-sm">
                        <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                            <strong>Position:</strong>
                            <span className="ml-2">{position.title}</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <strong>Applied On:</strong>
                            <span className="ml-2">
                                {new Date(application.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
  
            <div className="lg:col-span-2 space-y-6">
                <div className="rounded-lg border bg-white shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800">Internal Notes</h2>
                    <div className="mt-4">
                        <DebouncedTextarea
                            initialValue={application.notes || ''}
                            onSave={handleSaveNotes}
                            placeholder="Add notes for your team (auto-saves)..."
                        />
                    </div>
                </div>

                <WorkExperienceSection
                    experiences={candidate.workExperiences || []}
                    isOwner={false}
                />

                <EducationSection 
                    educationHistory={candidate.education || []} 
                    isOwner={false}
                />
            </div>

        </div>
      </div>
    );
};
  
export default ApplicationDetailsPage;