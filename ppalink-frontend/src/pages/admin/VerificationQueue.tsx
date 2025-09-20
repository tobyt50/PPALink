import { Check, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import DocumentLink from '../../components/ui/DocumentLink';
import { EmptyState } from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import adminService from '../../services/admin.service';
import type { VerificationRequest } from '../../types/user';

const VerificationQueuePage = () => {
  const navigate = useNavigate();
  const { data: verifications, isLoading, error, refetch } = useFetch<VerificationRequest[]>('/admin/verifications/pending');

  const handleUpdateStatus = async (e: React.MouseEvent, id: string, status: 'APPROVED' | 'REJECTED') => {
    e.stopPropagation(); 
    const updatePromise = adminService.updateVerificationStatus(id, status);
    await toast.promise(updatePromise, {
      loading: 'Updating status...',
      success: () => {
        refetch();
        return `Verification has been ${status.toLowerCase()}.`;
      },
      error: 'Failed to update verification status.',
    });
  };

  return (
    // Replicated Page Layout
    <div className="space-y-5">
      {/* Replicated Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
          Verification Queue
        </h1>
        <p className="mt-2 text-gray-600">
          Review and process pending user verifications.
        </p>
      </div>

      {isLoading && <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md">Could not load the verification queue.</div>}

      {!isLoading && !error && verifications && (
        // Replicated Card Styling
        <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Pending Requests ({verifications.length})</h2>
          </div>

          {/* Conditional Content: Table or Empty State */}
          {verifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User / Company</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Evidence</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Submitted</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {verifications.map((v) => (
                    <tr 
                      key={v.id} 
                      className="transition-colors hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => navigate(`/admin/verifications/${v.id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {v.user.candidateProfile ? `${v.user.candidateProfile.firstName} ${v.user.candidateProfile.lastName}` : (v.user.ownedAgencies?.[0]?.name || v.user.email)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{v.type}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {v.evidence?.fileKey ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <DocumentLink fileKey={v.evidence.fileKey} fileName="View Document" />
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                        {/* Polished Action Buttons */}
                        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700" onClick={(e) => handleUpdateStatus(e, v.id, 'REJECTED')}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700" onClick={(e) => handleUpdateStatus(e, v.id, 'APPROVED')}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Polished Empty State
            <div className="p-12">
              <EmptyState
                icon={Check}
                title="Queue is Empty"
                description="There are no pending verification requests to review. Great job!"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationQueuePage;