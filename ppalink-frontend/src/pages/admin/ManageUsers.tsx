import { ChevronDown, Loader2, MoreHorizontal, Search, UserCheck, UserX, Pause } from 'lucide-react';
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
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';

const UserRoleBadge = ({ role }: { role: User['role'] }) => {
  const roleStyles: Record<User['role'], string> = {
    ADMIN: 'bg-red-100 dark:bg-red-950/60 text-red-800',
    AGENCY: 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300',
    CANDIDATE: 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200',
    SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[role]}`}>
      {role}
    </span>
  );
};

const UserStatusIcon = ({ status }: { status: User['status'] }) => {
  const statusStyles: Record<User['status'], string> = {
    ACTIVE: 'text-green-600 dark:text-green-400',
    SUSPENDED: 'text-yellow-600 dark:text-yellow-400',
    DEACTIVATED: 'text-red-600 dark:text-red-400',
  };
  const statusIcons: Record<User['status'], React.ReactNode> = {
    ACTIVE: <UserCheck className="h-4 w-4" />,
    SUSPENDED: <Pause className="h-4 w-4" />,
    DEACTIVATED: <UserX className="h-4 w-4" />,
  };
  return (
    <span className={`inline-flex items-center ${statusStyles[status]}`}>
      {statusIcons[status]}
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

  const roleOptions: { [key: string]: string } = { ALL: 'All Roles', CANDIDATE: 'Candidate', AGENCY: 'Agency', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin' };
  const statusOptions: { [key: string]: string } = { ALL: 'All Statuses', ACTIVE: 'Active', SUSPENDED: 'Suspended' };
  const sortOptions: { [key: string]: string } = { createdAt: 'Date Joined', email: 'Email' };

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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">Manage Users</h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">View, search, and manage all users on the platform.</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                icon={Search}
                type="search"
                placeholder="Search by name, agency, or email..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleDropdown trigger={<DropdownTrigger>{roleOptions[roleFilter]}<ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" /></DropdownTrigger>}>
                {Object.entries(roleOptions).map(([key, value]) => <SimpleDropdownItem key={key} onSelect={() => setRoleFilter(key as Role | 'ALL')}>{value}</SimpleDropdownItem>)}
              </SimpleDropdown>
              <SimpleDropdown trigger={<DropdownTrigger>{statusOptions[statusFilter]}<ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" /></DropdownTrigger>}>
                {Object.entries(statusOptions).map(([key, value]) => <SimpleDropdownItem key={key} onSelect={() => setStatusFilter(key as UserStatus | 'ALL')}>{value}</SimpleDropdownItem>)}
              </SimpleDropdown>
            </div>
          </div>
        </div>

        {isLoading && <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">Could not load users.</div>}

        {!isLoading && !error && users && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Platform Users ({users.length})</h2>
                <div className="flex items-center gap-2 min-w-0 whitespace-nowrap">
                    <SimpleDropdown
                      trigger={
                        <Button variant="ghost" size="sm">
                          {sortOptions[sortBy]}
                          <ChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-zinc-400" />
                        </Button>
                      }
                    >
                      {Object.entries(sortOptions).map(([key, value]) => (
                        <SimpleDropdownItem key={key} onSelect={() => setSortBy(key)}>
                          {value}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                </div>
            </div>
            
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 dark:bg-gray-920">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Joined On</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white dark:bg-zinc-900">
                    {users.length === 0 ? (
                      <tr><td colSpan={6} className="text-center p-8 text-gray-500 dark:text-zinc-400">No users found matching your criteria.</td></tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => navigate(`/admin/users/${user.id}`)}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-zinc-50">{user.candidateProfile ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}` : (user.ownedAgencies?.[0]?.name || 'N/A')}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{user.email}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm"><UserRoleBadge role={user.role} /></td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm"><UserStatusIcon status={user.status} /></td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                             {user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
                               <SimpleDropdown
                                 trigger={
                                   <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                     <MoreHorizontal className="h-5 w-5" />
                                   </button>
                                 }
                               >
                                 {user.status === 'ACTIVE' ? (
                                   <SimpleDropdownItem onSelect={() => openConfirmationModal(user, 'SUSPENDED')} className="group text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:text-yellow-100">
                                     <UserX className="mr-2 h-4 w-4" /> <span>Suspend Account</span>
                                   </SimpleDropdownItem>
                                 ) : (
                                   <SimpleDropdownItem onSelect={() => openConfirmationModal(user, 'ACTIVE')} className="group text-green-700 dark:text-green-300 hover:bg-green-50 hover:text-green-800">
                                     <UserCheck className="mr-2 h-4 w-4" /> <span>Reactivate Account</span>
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

            <div className="md:hidden">
              {users.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-zinc-400">No users found matching your criteria.</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {users.map((user) => {
                    const name = user.candidateProfile ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}` : (user.ownedAgencies?.[0]?.name || 'N/A');
                    const joinedDate = new Date(user.createdAt).toLocaleDateString();
                    return (
                      <div key={user.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-zinc-50 text-base">{name}</h3>
                              <UserRoleBadge role={user.role} />
                              <UserStatusIcon status={user.status} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">{user.email}</p>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Joined on {joinedDate}</p>
                          </div>
                          <div className="ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
                              <SimpleDropdown
                                trigger={
                                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                    <MoreHorizontal className="h-5 w-5" />
                                  </button>
                                }
                              >
                                {user.status === 'ACTIVE' ? (
                                  <SimpleDropdownItem onSelect={() => openConfirmationModal(user, 'SUSPENDED')} className="group text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:text-yellow-100">
                                    <UserX className="mr-2 h-4 w-4" /> <span>Suspend Account</span>
                                  </SimpleDropdownItem>
                                ) : (
                                  <SimpleDropdownItem onSelect={() => openConfirmationModal(user, 'ACTIVE')} className="group text-green-700 dark:text-green-300 hover:bg-green-50 hover:text-green-800">
                                    <UserCheck className="mr-2 h-4 w-4" /> <span>Reactivate Account</span>
                                  </SimpleDropdownItem>
                                )}
                              </SimpleDropdown>
                            )}
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

export default ManageUsersPage;