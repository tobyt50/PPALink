import { Check, ChevronLeft, Loader2, User, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import DocumentLink from '../../components/ui/DocumentLink';
import useFetch from '../../hooks/useFetch';
import adminService from '../../services/admin.service';
import type { VerificationRequest } from '../../types/user';

// A simple component to display a piece of profile info for cross-referencing
const VerificationInfoField = ({ label, value }: { label: string, value?: string | null | number }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-base text-gray-800">{value || <span className="text-gray-400">N/A</span>}</p>
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
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (error || !verification || !verification.user.candidateProfile) {
    return (
      <div className="text-center text-red-500 p-8">
        Error: Could not load verification details or the user is not a candidate.
      </div>
    );
  }
  
  const { user, evidence } = verification;
  const profile = user.candidateProfile;

  return (
    <div className="mx-auto max-w-7xl">
       <div className="mb-6">
        <Link to="/admin/verifications" className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Queue
        </Link>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Candidate Info */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" /> Candidate Details
            </h2>
            <div className="space-y-4">
                <VerificationInfoField label="Full Name" value={profile ? `${profile.firstName} ${profile.lastName}` : undefined} />
                <VerificationInfoField label="Email" value={user.email} />
                <VerificationInfoField label="NYSC Batch" value={profile?.nyscBatch} />
                <VerificationInfoField label="NYSC Stream" value={profile?.nyscStream} />
                <VerificationInfoField label="State Code" value={profile?.stateCode} />
            </div>
          </div>
        </div>

        {/* Right Column: Document and Actions */}
        <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Submitted Document</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Review the document below and compare with the candidate's details.
                    </p>
                </div>
                <div className="p-6">
                    {evidence?.fileKey ? (
                        // This assumes you have a component that can embed a PDF.
                        // For now, we'll just provide a download link.
                        <DocumentLink fileKey={evidence.fileKey} fileName={`View: ${evidence.fileName}`} />
                    ) : <p>No document was submitted for this verification.</p>}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                    <Button variant="destructive" onClick={() => handleUpdateStatus('REJECTED')}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                    <Button onClick={() => handleUpdateStatus('APPROVED')}>
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