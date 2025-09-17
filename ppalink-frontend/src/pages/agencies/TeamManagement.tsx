import { Clock, Loader2, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import useFetch from '../../hooks/useFetch';
import agencyService from '../../services/agency.service';
import type { Agency, Invitation } from '../../types/agency';
import type { AgencyMember } from '../../types/user';
import { InviteMemberFormModal, type InviteFormValues } from './forms/InviteMemberForm';

const MemberRow = ({ member }: { member: AgencyMember }) => (
    <tr>
        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{member.user.candidateProfile?.firstName || member.user.email}</td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.user.email}</td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.role}</td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.user.status}</td>
        <td className="relative whitespace-nowrap py-4 pr-6 text-right text-sm font-medium">
            {/* Placeholder for future member actions like 'Remove' */}
        </td>
    </tr>
);

const InvitationRow = ({ invitation, onRevoke }: { invitation: Invitation; onRevoke: () => void; }) => (
    <tr>
        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 italic">{invitation.email}</td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{invitation.email}</td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
            <span className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Pending</span>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Expires on {new Date(invitation.expiresAt).toLocaleDateString()}</td>
        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={onRevoke}>
                <Trash2 className="h-4 w-4 mr-1" />
                Revoke
            </Button>
        </td>
    </tr>
);

const TeamManagementPage = () => {
  const { data: agency, isLoading, error, refetch } = useFetch<Agency>('/agencies/me');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; invitation: Invitation | null }>({ isOpen: false, invitation: null });

  const handleSendInvite = async (data: InviteFormValues) => {
    const invitePromise = agencyService.sendInvitation(data.email);
    await toast.promise(invitePromise, {
      loading: 'Sending invitation...',
      success: (res) => {
        refetch();
        return `Invitation sent to ${res.email}!`;
      },
      error: (err) => err.response?.data?.message || 'Failed to send invitation.',
    });
  };

  const openDeleteModal = (invitation: Invitation) => {
    setDeleteModalState({ isOpen: true, invitation });
  };
  
  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, invitation: null });
  };

  const handleDeleteInvitation = async () => {
    if (!deleteModalState.invitation) return;
    
    const deletePromise = agencyService.deleteInvitation(deleteModalState.invitation.id);

    await toast.promise(deletePromise, {
      loading: 'Revoking invitation...',
      success: () => {
        refetch();
        closeDeleteModal();
        return "Invitation has been revoked.";
      },
      error: (err) => {
        closeDeleteModal();
        return err.response?.data?.message || 'Failed to revoke invitation.';
      }
    });
  };

  if (isLoading) { return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>; }
  if (error) { return <div className="text-center text-red-500 p-8">Could not load team data.</div>; }

  const members = agency?.members || [];
  const invitations = agency?.invitations || [];

  return (
    <>
      <InviteMemberFormModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleSendInvite}
      />
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteInvitation}
        title="Revoke Invitation"
        description={`Are you sure you want to revoke the invitation for ${deleteModalState.invitation?.email}? They will no longer be able to join your team with this link.`}
        confirmButtonText="Revoke"
        isDestructive={true}
      />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-600">Team Management</h1>
            <p className="mt-1 text-gray-500">Invite and manage members of your agency.</p>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-5 w-5" />
            Invite Member
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Member</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {members.map((member) => <MemberRow key={member.id} member={member} />)}
              {invitations.map((invitation) => <InvitationRow key={invitation.id} invitation={invitation} onRevoke={() => openDeleteModal(invitation)} />)}
            </tbody>
          </table>
          {members.length === 0 && invitations.length === 0 && (
               <div className="p-12 text-center text-gray-500">No team members or pending invitations found.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeamManagementPage;