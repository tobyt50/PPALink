import { ChevronDown, Loader2, MoreHorizontal, Search, UserCheck, UserX } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from '../../components/ui/Modal';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import useFetch from '../../hooks/useFetch';
import adminService from '../../services/admin.service';
import type { User, UserStatus, Role } from '../../types/user';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { useDebounce } from '../../hooks/useDebounce';

const UserRoleBadge = ({ role }: { role: User['role'] }) => {
  const roleStyles: Record<User['role'], string> = {
    ADMIN: 'bg-red-100 text-red-800',
    AGENCY: 'bg-blue-100 text-blue-800',
    CANDIDATE: 'bg-green-100 text-green-800',
  };
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
    DEACTIVATED: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>((searchParams.get('role') as Role) || 'ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>((searchParams.get('status') as UserStatus) || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  const debouncedQuery = useDebounce(query, 500);

  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (roleFilter !== 'ALL') params.set('role', roleFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    return `/admin/users?${params.toString()}`;
  }, [debouncedQuery, roleFilter, statusFilter, sortBy, sortOrder]);

  const { data: users, isLoading, error, refetch } = useFetch<User[]>(fetchUrl);
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (roleFilter !== 'ALL') params.set('role', roleFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    setSearchParams(params, { replace: true });
  }, [query, roleFilter, statusFilter, sortBy, sortOrder, setSearchParams]);


  const [modalState, setModalState] = useState<{ isOpen: boolean; user: User | null; action: 'SUSPENDED' | 'ACTIVE' | null; }>({ isOpen: false, user: null, action: null });
  const openConfirmationModal = (user: User, action: 'SUSPENDED' | 'ACTIVE') => setModalState({ isOpen: true, user, action });
  const closeConfirmationModal = () => setModalState({ isOpen: false, user: null, action: null });
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

  const roleOptions: { [key: string]: string } = { ALL: 'All Roles', CANDIDATE: 'Candidate', AGENCY: 'Agency', ADMIN: 'Admin' };
  const statusOptions: { [key: string]: string } = { ALL: 'All Statuses', ACTIVE: 'Active', SUSPENDED: 'Suspended' };

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

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">Manage Users</h1>
          <p className="mt-2 text-gray-600">View, search, and manage all users on the platform.</p>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-gray-400" /></div><input type="search" placeholder="Search by name, agency, or email..." value={query} onChange={e => setQuery(e.target.value)} className="block w-full rounded-md border-gray-300 pl-10"/></div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleDropdown trigger={<DropdownTrigger>{roleOptions[roleFilter]}<ChevronDown className="h-4 w-4 text-gray-500" /></DropdownTrigger>}>
                {Object.entries(roleOptions).map(([key, value]) => <SimpleDropdownItem key={key} onSelect={() => setRoleFilter(key as Role | 'ALL')}>{value}</SimpleDropdownItem>)}
              </SimpleDropdown>
              <SimpleDropdown trigger={<DropdownTrigger>{statusOptions[statusFilter]}<ChevronDown className="h-4 w-4 text-gray-500" /></DropdownTrigger>}>
                {Object.entries(statusOptions).map(([key, value]) => <SimpleDropdownItem key={key} onSelect={() => setStatusFilter(key as UserStatus | 'ALL')}>{value}</SimpleDropdownItem>)}
              </SimpleDropdown>
            </div>
          </div>
        </div>

        {isLoading && <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md">Could not load users.</div>}

        {!isLoading && !error && users && (
          <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Platform Users ({users.length})</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Sort by:</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm rounded-md border-gray-200">
                        <option value="createdAt">Date Joined</option>
                        <option value="email">Email</option>
                    </select>
                </div>
            </div>
            
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
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 text-gray-500">No users found matching your criteria.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.candidateProfile ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}` : (user.ownedAgencies?.[0]?.name || 'N/A')}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm"><UserRoleBadge role={user.role} /></td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm"><UserStatusBadge status={user.status} /></td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                           {user.role !== 'ADMIN' && (
                             <SimpleDropdown
                               trigger={
                                 <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800">
                                   <MoreHorizontal className="h-5 w-5" />
                                 </button>
                               }
                             >
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
                    ))
                  )}
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