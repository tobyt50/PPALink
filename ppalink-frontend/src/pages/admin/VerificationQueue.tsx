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

  // The function now directly accepts the ID.
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
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Verification Queue</h1>
        <p className="mt-1 text-gray-500">Review and process pending user verifications.</p>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {error && <div className="text-center text-red-500 p-8">Could not load the verification queue.</div>}

      {!isLoading && !error && verifications && (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Evidence</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Submitted</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {verifications.length > 0 ? verifications.map((v) => (
                <tr 
                key={v.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/verifications/${v.id}`)}
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{v.user.candidateProfile?.firstName || v.user.email}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{v.type}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {v.evidence?.fileKey ? (
                     // Add stopPropagation to prevent the row click
                    <div onClick={(e) => e.stopPropagation()}>
                      <DocumentLink fileKey={v.evidence.fileKey} fileName="View Document" />
                    </div>
                  ) : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                  <Button size="icon" variant="outline" onClick={(e) => handleUpdateStatus(e, v.id, 'REJECTED')}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                   <Button size="icon" variant="outline" onClick={(e) => handleUpdateStatus(e, v.id, 'APPROVED')}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                </td>
              </tr>
              )) : (
                <EmptyState
              icon={Check}
              title="Queue is Empty"
              description="There are no pending verification requests to review. Great job!"
            />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerificationQueuePage;