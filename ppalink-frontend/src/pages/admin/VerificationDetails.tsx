import { Building, Check, ChevronLeft, Loader2, User, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import DocumentLink from '../../components/ui/DocumentLink';
import useFetch from '../../hooks/useFetch';
import adminService from '../../services/admin.service';
import type { VerificationRequest } from '../../types/user';

// Replicated the polished ProfileField style for consistency
const VerificationInfoField = ({ label, value }: { label: string, value?: string | null | number }) => (
    <div className="flex flex-col">
        <dt className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</dt>
        <dd className="mt-1.5 text-sm font-medium text-gray-900 dark:text-zinc-50">
            {value || <span className="text-gray-400 dark:text-zinc-500 italic">Not provided</span>}
        </dd>
    </div>
);

const VerificationDetailsPage = () => {
  const navigate = useNavigate();
  const { verificationId } = useParams<{ verificationId: string }>();

  const { data: verification, isLoading, error } = useFetch<VerificationRequest>(
    verificationId ? `/admin/verifications/${verificationId}` : null
  );

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!verificationId) return;
    const updatePromise = adminService.updateVerificationStatus(verificationId, status);
    await toast.promise(updatePromise, {
      loading: 'Updating status...',
      success: () => {
        navigate('/admin/verifications');
        return `Verification has been ${status.toLowerCase()}.`;
      },
      error: 'Failed to update verification status.',
    });
  };

  if (isLoading) {
    return <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>;
  }
  if (error || !verification) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">Error: Could not load verification details.</div>;
  }
  
  const { user, evidence, type } = verification;
  const profile = user.candidateProfile;
  const agency = user.ownedAgencies?.[0];

  return (
    // Replicated Page Layout
    <div className="space-y-5">
      {/* Replicated Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Review Verification
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Approve or reject the submitted document for <span className="font-semibold text-gray-800 dark:text-zinc-100">{user.email}</span>.
          </p>
        </div>
        <Link to="/admin/verifications" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to Queue
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details Panel - Replicated Card Styling */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            {user.role === 'CANDIDATE' && profile && (
              <>
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center">
                  <User className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Candidate Details</h2>
                </div>
                <div className="p-6 space-y-5">
                    <VerificationInfoField label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
                    <VerificationInfoField label="Email" value={user.email} />
                    <VerificationInfoField label="NYSC Batch" value={profile.nyscBatch} />
                    <VerificationInfoField label="NYSC Stream" value={profile.nyscStream} />
                </div>
              </>
            )}
            {user.role === 'AGENCY' && agency && (
              <>
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center">
                  <Building className="h-5 w-5 mr-3 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Agency Details</h2>
                </div>
                <div className="p-6 space-y-5">
                    <VerificationInfoField label="Agency Name" value={agency.name} />
                    <VerificationInfoField label="Owner Email" value={user.email} />
                    <VerificationInfoField label="RC Number" value={agency.rcNumber} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Document Review Panel - Replicated Card Styling */}
        <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Submitted Document: {type}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                        Review the document and compare it with the user's details.
                    </p>
                </div>
                {/* Card Body */}
                <div className="p-6 min-h-[200px] flex items-center justify-center">
                    {evidence?.fileKey ? (
                        <DocumentLink fileKey={evidence.fileKey} fileName={`View Uploaded: ${evidence.fileName}`} />
                    ) : <p>No document was submitted for this verification.</p>}
                </div>
                {/* Card Footer */}
                <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800 flex justify-end space-x-3">
                    <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => handleUpdateStatus('REJECTED')}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                    {/* Replicated Primary Button Style */}
                    <Button 
                        size="sm" 
                        onClick={() => handleUpdateStatus('APPROVED')}
                        className="rounded-lg shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition"
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetailsPage;

