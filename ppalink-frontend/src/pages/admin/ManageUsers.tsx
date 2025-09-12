import { ChevronDown, Loader2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
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
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleStyles[role]}`}>
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
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
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

      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary-600">Manage Users</h1>
          <p className="mt-1 text-gray-500">View and manage all users on the platform.</p>
        </div>

        {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <div className="text-center text-red-500 p-8">Could not load users.</div>}

        {!isLoading && !error && users && (
          <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined On</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.candidateProfile ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}` : (user.ownedAgencies?.[0]?.name || 'N/A')}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm"><UserRoleBadge role={user.role} /></td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm"><UserStatusBadge status={user.status} /></td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                       {user.role !== 'ADMIN' && (
                         <SimpleDropdown
                           trigger={
                             <Button variant="outline" size="sm">
                               Actions <ChevronDown className="h-4 w-4 ml-2" />
                             </Button>
                           }
                         >
                           {user.status === 'ACTIVE' ? (
                             <SimpleDropdownItem onSelect={() => openConfirmationModal(user, 'SUSPENDED')} className="text-yellow-600">
                               <UserX className="mr-2 h-4 w-4" /> Suspend Account
                             </SimpleDropdownItem>
                           ) : (
                             <SimpleDropdownItem onSelect={() => openConfirmationModal(user, 'ACTIVE')} className="text-green-600">
                               <UserCheck className="mr-2 h-4 w-4" /> Reactivate Account
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
        )}
      </div>
    </>
  );
};

export default ManageUsersPage;