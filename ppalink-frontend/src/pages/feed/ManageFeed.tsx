import { Edit, Loader2, PlusCircle, Trash2, MoreHorizontal, UserCheck, UserX, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { ConfirmationModal } from "../../components/ui/Modal";
import { SimpleDropdown, SimpleDropdownItem } from "../../components/ui/SimpleDropdown";
import useFetch from "../../hooks/useFetch";
import feedService from "../../services/feed.service";
import type { FeedItem } from "../../types/feed";
import { useAuthStore } from "../../context/AuthContext";
import { BoostPostModal } from "./BoostPostModal";

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const StatusIcon = ({ isActive }: { isActive: boolean }) => {
  const icon = isActive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />;
  const colorClass = isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400';
  return (
    <span className={`inline-flex items-center ${colorClass}`}>
      {icon}
    </span>
  );
};

const ManageFeedPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const fetchUrl = isAdmin ? "/admin/feed" : "/feed/my-posts";
  const createUrl = isAdmin ? "/admin/feed/create" : "/feed/create";

  const [boostModalState, setBoostModalState] = useState<{ isOpen: boolean; item: FeedItem | null }>({ isOpen: false, item: null });

  const {
    data: feedItems,
    isLoading,
    error,
    refetch,
  } = useFetch<FeedItem[]>(fetchUrl);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    item: FeedItem | null;
  }>({ isOpen: false, item: null });

  const handleDelete = (item: FeedItem) => {
    setDeleteModalState({ isOpen: true, item });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.item) return;

    const deletePromise = isAdmin
      ? feedService.adminDeleteFeedItem(deleteModalState.item.id)
      : feedService.deleteMyPost(deleteModalState.item.id);

    await toast.promise(deletePromise, {
      loading: "Deleting post...",
      success: () => {
        refetch();
        setDeleteModalState({ isOpen: false, item: null });
        return "Post deleted successfully.";
      },
      error: "Failed to delete post.",
    });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title={`Delete Post: "${deleteModalState.item?.title}"`}
        description="Are you sure you want to permanently delete this feed post?"
        isDestructive
        confirmButtonText="Delete"
      />
      <BoostPostModal isOpen={boostModalState.isOpen} onClose={() => setBoostModalState({ isOpen: false, item: null })} feedItem={boostModalState.item} />
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
              {isAdmin ? "Feed Management" : "Published Posts"}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-300">
              {isAdmin
                ? "Create, edit, and manage all content for the Career Discovery Feed."
                : "Manage the content you have published to the feed."}
            </p>
          </div>
          <Button size="sm" onClick={() => navigate(createUrl)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Post
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md dark:bg-red-950/40 dark:border-red-500/30 dark:text-red-400 dark:shadow-none">
            Could not load feed items.
          </div>
        )}

        {!isLoading && !error && feedItems && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                {isAdmin ? "Feed Items" : "Published Posts"} ({feedItems.length})
              </h2>
            </div>
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Category
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Audience
                        </th>
                      )}
                      {isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Author
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Status
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {feedItems.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 4} className="text-center p-8 text-gray-500 dark:text-zinc-400">
                          No feed items found.
                        </td>
                      </tr>
                    ) : (
                      feedItems.map((item) => {
                        const canBoost = (user?.role === 'AGENCY' && item.agencyId === user.ownedAgencies?.[0]?.id) || (user?.id === item.userId);
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-sm text-gray-900 dark:text-zinc-50">
                              {item.title}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                              {item.category}
                            </td>
                            {isAdmin && (
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                                {item.audience}
                              </td>
                            )}
                            {isAdmin && (
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                                {item.agency?.name || item.user?.email || "Admin"}
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm">
                              <StatusBadge isActive={item.isActive} />
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end space-x-2">
                                {canBoost && (
                                  <Button variant="outline" size="sm" onClick={() => setBoostModalState({ isOpen: true, item })}>
                                    <Zap className="h-4 w-4 mr-1 text-yellow-500" />Boost
                                  </Button>
                                )}
                                <SimpleDropdown
                                  trigger={
                                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                  }
                                >
                                  <SimpleDropdownItem
                                    onSelect={() => navigate(`/feed/${item.id}/edit`)}
                                    className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> <span>Edit Post</span>
                                  </SimpleDropdownItem>
                                  <SimpleDropdownItem
                                    onSelect={() => handleDelete(item)}
                                    className="group text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-800"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> <span>Delete Post</span>
                                  </SimpleDropdownItem>
                                </SimpleDropdown>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden">
              {feedItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-zinc-400">No feed items found.</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {feedItems.map((item) => {
                    const canBoost = (user?.role === 'AGENCY' && item.agencyId === user.ownedAgencies?.[0]?.id) || (user?.id === item.userId);
                    return (
                      <div key={item.id} className="p-4 hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-zinc-50 text-base">{item.title}</h3>
                              <StatusIcon isActive={item.isActive} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">{item.category}</p>
                            {isAdmin && (
                              <div className="text-sm text-gray-500 dark:text-zinc-400 mb-1">
                                <p>Audience: {item.audience}</p>
                                <p>Author: {item.agency?.name || item.user?.email || "Admin"}</p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-shrink-0 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            {canBoost && (
                              <Button variant="outline" size="sm" onClick={() => setBoostModalState({ isOpen: true, item })}>
                                <Zap className="h-4 w-4 mr-1 text-yellow-500" />Boost
                              </Button>
                            )}
                            <SimpleDropdown
                              trigger={
                                <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                  <MoreHorizontal className="h-5 w-5" />
                                </button>
                              }
                            >
                              <SimpleDropdownItem
                                onSelect={() => navigate(`/feed/${item.id}/edit`)}
                                className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                              >
                                <Edit className="mr-2 h-4 w-4" /> <span>Edit Post</span>
                              </SimpleDropdownItem>
                              <SimpleDropdownItem
                                onSelect={() => handleDelete(item)}
                                className="group text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-800"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> <span>Delete Post</span>
                              </SimpleDropdownItem>
                            </SimpleDropdown>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageFeedPage;