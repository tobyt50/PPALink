import { ArrowUpDown, Loader2, PlusCircle, Search, Shield, Trash2, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import adminService from '../../services/admin.service';
import useFetch from '../../hooks/useFetch';
import type { User, Role } from '../../types/user';
import { AdminFormModal, type AdminFormValues } from './forms/AdminForm';
import { RoleUpdateModal } from './forms/RoleUpdateModal';
import { Input } from '../../components/forms/Input';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';

const AdminRoleBadge = ({ role }: { role: User['role'] }) => {
  const roleStyles: Record<User['role'], string> = {
    ADMIN: 'bg-red-100 dark:bg-red-950/60 text-red-800',
    SUPER_ADMIN: 'bg-purple-100 text-purple-800',
    CANDIDATE: '',
    AGENCY: ''
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[role] || 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100'}`}>
      {role}
    </span>
  );
};

const AdminStatusIcon = ({ status }: { status: User['status'] }) => {
  const icon = status === 'ACTIVE' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />;
  const colorClass = status === 'ACTIVE' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400';
  return (
    <span className={`inline-flex items-center ${colorClass}`}>
      {icon}
    </span>
  );
};

const ManageAdminsPage = () => {
  const [queryParams, setQueryParams] = useState(() => new URLSearchParams({ sortBy: 'createdAt', sortOrder: 'desc' }));
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const newParams = new URLSearchParams(queryParams);
    if (debouncedSearch) {
      newParams.set('q', debouncedSearch);
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');
    setQueryParams(newParams);
  }, [debouncedSearch]);

  const { data: admins, isLoading, error, refetch } = useFetch<User[]>(
    `/admin/admins?${queryParams.toString()}`
  );
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [roleModalState, setRoleModalState] = useState<{ isOpen: boolean; admin: User | null }>({ isOpen: false, admin: null });
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; admin: User | null }>({ isOpen: false, admin: null });

  const openDeleteModal = (admin: User) => setDeleteModalState({ isOpen: true, admin });
  const closeDeleteModal = () => setDeleteModalState({ isOpen: false, admin: null });

  const handleCreateAdmin = async (data: AdminFormValues) => {
    const createPromise = adminService.createAdmin(data.email, data.role as Role);
    await toast.promise(createPromise, {
        loading: 'Creating admin account...',
        success: 'Admin created successfully! A temporary password has been sent to their email.',
        error: (err) => err.response?.data?.message || 'Failed to create admin.'
    });
    refetch();
  };
  
  const handleDeleteAdmin = async () => {
    if (!deleteModalState.admin) return;
    const deletePromise = adminService.deleteAdmin(deleteModalState.admin.id);
    await toast.promise(deletePromise, {
        loading: 'Deleting admin...',
        success: 'Admin account deleted.',
        error: (err) => err.response?.data?.message || 'Failed to delete admin.'
    });
    refetch();
    closeDeleteModal();
  };
  
  const handleRoleUpdate = async (role: Role) => {
    if (!roleModalState.admin) return;
    const updatePromise = adminService.updateAdminRole(roleModalState.admin.id, role);
    await toast.promise(updatePromise, {
        loading: "Updating admin's role...",
        success: "Role updated successfully!",
        error: (err) => err.response?.data?.message || 'Failed to update role.'
    });
    refetch();
    setRoleModalState({ isOpen: false, admin: null });
  };
  
  const handleSort = (column: string) => {
      const newParams = new URLSearchParams(queryParams);
      const currentOrder = newParams.get('sortOrder');
      newParams.set('sortBy', column);
      newParams.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
      setQueryParams(newParams);
  };

  return (
    <>
      <AdminFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSubmit={handleCreateAdmin} />
      <RoleUpdateModal isOpen={roleModalState.isOpen} onClose={() => setRoleModalState({ isOpen: false, admin: null })} onSubmit={handleRoleUpdate} admin={roleModalState.admin} />
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAdmin}
        title={`Delete Admin: ${deleteModalState.admin?.email}`}
        description="Are you sure you want to permanently delete this admin account? This action cannot be undone."
        isDestructive
        confirmButtonText="Delete"
      />
      
      <div className="space-y-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">Admin Management</h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-300">Create, manage, and assign roles to administrators.</p>
          </div>
          <div className="flex w-full sm:w-auto space-x-2">
            <div className="relative flex-grow">
                <Input icon={Search} type="search" placeholder="Search by email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => setIsFormModalOpen(true)}><PlusCircle className="mr-2 h-5 w-5" />Create</Button>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">Could not load admin accounts. It's likely you do not have SUPER_ADMIN privileges.</div>}
        
        {!error && (
          <>
            {isLoading && <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>}
            {!isLoading && admins && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Admin Accounts ({admins.length})</h2>
                </div>
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50 dark:bg-gray-920">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                            <button onClick={() => handleSort('email')} className="flex items-center group">EMAIL <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600"/></button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                            <button onClick={() => handleSort('role')} className="flex items-center group">ROLE <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600"/></button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">STATUS</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                            <button onClick={() => handleSort('createdAt')} className="flex items-center group">CREATED ON <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600"/></button>
                          </th>
                          <th className="relative px-6 py-3"><span className="sr-only">ACTIONS</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white dark:bg-zinc-900">
                        {admins.length === 0 ? (
                          <tr><td colSpan={5} className="text-center p-8 text-gray-500 dark:text-zinc-400">No admin accounts found.</td></tr>
                        ) : (
                          admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/70 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-zinc-50">{admin.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm"><AdminRoleBadge role={admin.role} /></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm"><AdminStatusIcon status={admin.status} /></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{new Date(admin.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                <SimpleDropdown
                                  trigger={
                                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                  }
                                >
                                  <SimpleDropdownItem onSelect={() => setRoleModalState({ isOpen: true, admin })} className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800">
                                    <Shield className="mr-2 h-4 w-4" /> <span>Update Role</span>
                                  </SimpleDropdownItem>
                                  <SimpleDropdownItem onSelect={() => openDeleteModal(admin)} className="group text-red-700 hover:bg-red-50 hover:text-red-800 dark:hover:text-red-100">
                                    <Trash2 className="mr-2 h-4 w-4" /> <span>Delete Admin</span>
                                  </SimpleDropdownItem>
                                </SimpleDropdown>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="md:hidden">
                  {admins.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-zinc-400">No admin accounts found.</div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {admins.map((admin) => {
                        const createdDate = new Date(admin.createdAt).toLocaleDateString();
                        return (
                          <div key={admin.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/70 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-zinc-50 text-base mb-1">{admin.email}</h3>
                                <div className="flex items-center gap-2 mb-1">
                                  <AdminRoleBadge role={admin.role} />
                                  <AdminStatusIcon status={admin.status} />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Created on {createdDate}</p>
                              </div>
                              <div className="ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <SimpleDropdown
                                  trigger={
                                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                  }
                                >
                                  <SimpleDropdownItem onSelect={() => setRoleModalState({ isOpen: true, admin })} className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800">
                                    <Shield className="mr-2 h-4 w-4" /> <span>Update Role</span>
                                  </SimpleDropdownItem>
                                  <SimpleDropdownItem onSelect={() => openDeleteModal(admin)} className="group text-red-700 hover:bg-red-50 hover:text-red-800 dark:hover:text-red-100">
                                    <Trash2 className="mr-2 h-4 w-4" /> <span>Delete Admin</span>
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
          </>
        )}
      </div>
    </>
  );
};

export default ManageAdminsPage;