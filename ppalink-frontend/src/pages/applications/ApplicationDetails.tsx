import { Briefcase, Calendar, ChevronLeft, FileText, Loader2, MessageSquare } from 'lucide-react';
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
import ProfileField from '../candidates/ProfileField'; // Using the polished ProfileField

// Polished Candidate Snapshot Card
const CandidateProfileSnapshot = ({ candidate, onMessage }: { candidate: Application['candidate'], onMessage: () => void; }) => (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0" />
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">
              {candidate.firstName} {candidate.lastName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">{candidate.user?.email}</p>
          </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="px-6 pb-6 space-y-6">
        {candidate.summary && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Summary</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-gray-920 p-3 rounded-lg">
              {candidate.summary}
            </p>
          </div>
        )}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Documents</h3>
          <div className="mt-2 space-y-2">
            {candidate.cvFileKey ? (
              <DocumentLink fileKey={candidate.cvFileKey} fileName="View Curriculum Vitae (CV)" />
            ) : (
              <p className="text-sm text-gray-400 dark:text-zinc-500 flex items-center"><FileText className="h-4 w-4 mr-2" /> No CV uploaded.</p>
            )}
            {candidate.nyscFileKey ? (
              <DocumentLink fileKey={candidate.nyscFileKey} fileName="View NYSC Document" />
            ) : (
              <p className="text-sm text-gray-400 dark:text-zinc-500 flex items-center"><FileText className="h-4 w-4 mr-2" /> No NYSC document.</p>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800">
        <Button onClick={onMessage} size="lg" className="w-full rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition">
          <MessageSquare className="h-5 w-5 mr-2" />
          Message Candidate
        </Button>
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
      const conversationState = { otherUser: { id: user.id, email: user.email, candidateProfile: { firstName, lastName } } };
      navigate('/inbox', { state: { activeConversation: conversationState } });
    };
  
    if (isLoading) {
      return <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>;
    }
    if (error || !application) {
      return <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">Error loading application details.</div>;
    }
  
    const { candidate, position } = application;
  
    return (
      <div className="space-y-5">
        {/* Polished Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
                    {candidate.firstName} {candidate.lastName}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-300">Application for <span className="font-semibold text-gray-800 dark:text-zinc-100">{position.title}</span></p>
            </div>
            <Link to={`/dashboard/agency/${position.agencyId}/jobs/${position.id}/pipeline`} className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1.5" />
                Back to Pipeline
            </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 lg:sticky top-24 space-y-8">
                <CandidateProfileSnapshot candidate={candidate} onMessage={handleMessageCandidate} />
                
                <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Application Details</h2></div>
                    <div className="p-6 space-y-5">
                        <ProfileField icon={Briefcase} label="Position" value={position.title} />
                        <ProfileField icon={Calendar} label="Applied On" value={new Date(application.createdAt).toLocaleDateString()} />
                    </div>
                </div>
            </div>
  
            <div className="lg:col-span-2 space-y-8">
                <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Internal Notes</h2></div>
                    <div className="p-6">
                        <DebouncedTextarea
                            initialValue={application.notes || ''}
                            onSave={handleSaveNotes}
                            placeholder="Add private notes for your team (auto-saves)..."
                        />
                    </div>
                </div>

                <WorkExperienceSection experiences={candidate.workExperiences || []} isOwner={false} />
                <EducationSection educationHistory={candidate.education || []} isOwner={false} />
            </div>
        </div>
      </div>
    );
};
  
export default ApplicationDetailsPage;

