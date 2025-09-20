import { Loader2, MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from '../../components/ui/Modal';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import useFetch from '../../hooks/useFetch';
import adminService from '../../services/admin.service';
import type { User } from '../../types/user';

const UserRoleBadge = ({ role }: { role: User['role'] }) => {
  const roleStyles: Record<User['role'], string> = {
    ADMIN: 'bg-red-100 text-red-800',
    AGENCY: 'bg-blue-100 text-blue-800',
    CANDIDATE: 'bg-green-100 text-green-800',
  };
  // Polished badge styling
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[role]}`}>
      {role}
    </span>
  );
};

const UserStatusBadge = ({ status }: { status: User['status'] }) => {
  const statusStyles: Record<User['status'], string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-yellow-100 text-yellow-800',
    DELETED: 'bg-red-100 text-red-800',
  };
  // Polished badge styling
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const ManageUsersPage = () => {
  const { data: users, isLoading, error, refetch } = useFetch<User[]>('/admin/users');
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    user: User | null;
    action: 'SUSPENDED' | 'ACTIVE' | null;
  }>({ isOpen: false, user: null, action: null });

  const openConfirmationModal = (user: User, action: 'SUSPENDED' | 'ACTIVE') => {
    setModalState({ isOpen: true, user, action });
  };

  const closeConfirmationModal = () => {
    setModalState({ isOpen: false, user: null, action: null });
  };

  const handleUpdateStatus = async () => {
    if (!modalState.user || !modalState.action) return;
    
    const updatePromise = adminService.updateUserStatus(modalState.user.id, modalState.action);

    await toast.promise(updatePromise, {
      loading: 'Updating user status...',
      success: () => {
        refetch();
        closeConfirmationModal();
        return `User has been ${modalState.action === 'SUSPENDED' ? 'suspended' : 'activated'}.`;
      },
      error: (err) => {
        closeConfirmationModal();
        return err.response?.data?.message || 'Failed to update user status.';
      }
    });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleUpdateStatus}
        title={modalState.action === 'SUSPENDED' ? 'Suspend User' : 'Activate User'}
        description={`Are you sure you want to ${modalState.action?.toLowerCase()} the account for ${modalState.user?.email}?`}
        confirmButtonText={modalState.action === 'SUSPENDED' ? 'Suspend' : 'Activate'}
        isDestructive={modalState.action === 'SUSPENDED'}
      />

      {/* Replicated Page Layout */}
      <div className="space-y-5">
        {/* Replicated Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            Manage Users
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage all users on the platform.
          </p>
        </div>

        {isLoading && <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md">Could not load users. Please try again.</div>}

        {!isLoading && !error && users && (
          // Replicated Card Styling
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Platform Users ({users.length})</h2>
            </div>
            
            {/* Card Body with Polished Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined On</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.candidateProfile ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}` : (user.ownedAgencies?.[0]?.name || 'N/A')}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm"><UserRoleBadge role={user.role} /></td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm"><UserStatusBadge status={user.status} /></td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                         {user.role !== 'ADMIN' && (
                           <SimpleDropdown
                             trigger={
                               <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800">
                                 <MoreHorizontal className="h-5 w-5" />
                               </button>
                             }
                           >
                            {/* Polished Dropdown Items */}
                             {user.status === 'ACTIVE' ? (
                               <SimpleDropdownItem onSelect={() => openConfirmationModal(user, 'SUSPENDED')} className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 text-yellow-600">
                                 <UserX className="mr-2 h-4 w-4" /> <span className="group-hover:text-yellow-700">Suspend Account</span>
                               </SimpleDropdownItem>
                             ) : (
                               <SimpleDropdownItem onSelect={() => openConfirmationModal(user, 'ACTIVE')} className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-primary-50 hover:to-green-50 text-green-600">
                                 <UserCheck className="mr-2 h-4 w-4" /> <span className="group-hover:text-green-700">Reactivate Account</span>
                               </SimpleDropdownItem>
                             )}
                           </SimpleDropdown>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageUsersPage;