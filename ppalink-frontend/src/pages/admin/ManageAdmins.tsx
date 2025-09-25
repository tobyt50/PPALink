import { Loader2, PlusCircle, Shield, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import { useAuthStore } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import adminService from '../../services/admin.service';
import type { User as UserType } from '../../types/user';
// We will create the form modal in the next step
// import { AdminFormModal, type AdminFormValues } from './forms/AdminForm';

const ManageAdminsPage = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { data: admins, isLoading, error, refetch } = useFetch<UserType[]>('/admin/admins');

  // We will uncomment this when the form is ready
  // const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; admin: UserType | null }>({ isOpen: false, admin: null });

  // Gatekeeping: Only SUPER_ADMINs should see this page's content
  if (currentUser?.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-center text-red-500">You do not have permission to view this page.</div>;
  }
  
  const openDeleteModal = (admin: UserType) => setDeleteModalState({ isOpen: true, admin });
  const closeDeleteModal = () => setDeleteModalState({ isOpen: false, admin: null });

  const handleDeleteAdmin = async () => {
    if (!deleteModalState.admin) return;
    const deletePromise = adminService.deleteAdmin(deleteModalState.admin.id);
    await toast.promise(deletePromise, {
      loading: 'Deleting admin...',
      success: () => {
        refetch();
        closeDeleteModal();
        return 'Admin account deleted.';
      },
      error: (err) => {
        closeDeleteModal();
        return err.response?.data?.message || 'Failed to delete admin.';
      }
    });
  };

  return (
    <>
      {/* <AdminFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSubmit={...} /> */}
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAdmin}
        title={`Delete Admin: ${deleteModalState.admin?.email}`}
        description="Are you sure? This will permanently delete the user account. This action cannot be undone."
        isDestructive
      />
      
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-600">Admin Account Management</h1>
            <p className="mt-1 text-gray-500">Create, view, and manage administrator and support accounts.</p>
          </div>
          <Button onClick={() => alert('Open Create Form')}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Admin
          </Button>
        </div>

        {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <div className="text-center text-red-500 p-8">Could not load admin accounts.</div>}
        
        {!isLoading && !error && admins && (
           <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                 <tbody className="divide-y divide-gray-200 bg-white">
                  {admins.map(admin => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {admin.role === 'SUPER_ADMIN' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Prevent a super admin from deleting themselves */}
                        {currentUser.id !== admin.id && (
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => openDeleteModal(admin)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

export default ManageAdminsPage;