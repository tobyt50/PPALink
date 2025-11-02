import { Check, Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import DocumentLink from "../../components/ui/DocumentLink";
import { EmptyState } from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import adminService from "../../services/admin.service";
import type { VerificationRequest } from "../../types/user";

const VerificationQueuePage = () => {
  const navigate = useNavigate();
  const {
    data: verifications,
    isLoading,
    error,
    refetch,
  } = useFetch<VerificationRequest[]>("/admin/verifications/pending");

  const handleUpdateStatus = async (
    e: React.MouseEvent,
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    e.stopPropagation();
    const updatePromise = adminService.updateVerificationStatus(id, status);
    await toast.promise(updatePromise, {
      loading: "Updating status...",
      success: () => {
        refetch();
        return `Verification has been ${status.toLowerCase()}.`;
      },
      error: "Failed to update verification status.",
    });
  };

  return (
    // Replicated Page Layout
    <div className="space-y-5">
      {/* Replicated Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Verification Queue
        </h1>
      </div>

      {isLoading && (
        <div className="flex h-80 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
          Could not load the verification queue.
        </div>
      )}

      {!isLoading && !error && verifications && (
        // Replicated Card Styling
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
              Pending Requests ({verifications.length})
            </h2>
          </div>

          {/* Conditional Content: Table or Empty State */}
          {verifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      User / Company
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      Evidence
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      Submitted
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:bg-zinc-900">
                  {verifications.map((v) => (
                    <tr
                      key={v.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                      onClick={() => navigate(`/admin/verifications/${v.id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-zinc-50">
                        {v.user.candidateProfile
                          ? `${v.user.candidateProfile.firstName} ${v.user.candidateProfile.lastName}`
                          : v.user.ownedAgencies?.[0]?.name || v.user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                        {v.type}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                        {v.evidence?.fileKey ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <DocumentLink
                              fileKey={v.evidence.fileKey}
                              fileName="View Document"
                            />
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                        {/* Polished Action Buttons */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 hover:text-red-700 dark:hover:text-red-300"
                          onClick={(e) =>
                            handleUpdateStatus(e, v.id, "REJECTED")
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full h-8 w-8 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/60 hover:text-green-700 dark:hover:text-green-300"
                          onClick={(e) =>
                            handleUpdateStatus(e, v.id, "APPROVED")
                          }
                        >
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
