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
import { EmptyState } from '../../components/ui/EmptyState'; // For a polished empty state

// Polished Table Rows
const MemberRow = ({ member }: { member: AgencyMember }) => (
  <tr className="hover:bg-gray-50/50 transition-colors">
    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800">
      {member.user.candidateProfile?.firstName || member.user.email}
    </td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.user.email}</td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.role}</td>
    <td className="whitespace-nowrap px-6 py-4 text-sm">
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
        {member.user.status.toLowerCase()}
      </span>
    </td>
    <td className="relative whitespace-nowrap py-4 pr-6 text-right text-sm font-medium" />
  </tr>
);

const InvitationRow = ({ invitation, onRevoke }: { invitation: Invitation; onRevoke: () => void }) => (
  <tr className="hover:bg-gray-50/50 transition-colors">
    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800 italic">
      {invitation.email}
    </td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{invitation.email}</td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
        <Clock className="h-3 w-3 mr-1.5" /> Pending
      </span>
    </td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
      Expires {new Date(invitation.expiresAt).toLocaleDateString()}
    </td>
    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-red-100 hover:text-red-700"
        onClick={onRevoke}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </td>
  </tr>
);

// Polished Mobile Cards
const MemberCard = ({ member }: { member: AgencyMember }) => (
  <div className="px-4 py-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">{member.user.candidateProfile?.firstName || member.user.email}</p>
        <p className="text-sm text-gray-500">{member.user.email}</p>
      </div>
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
        {member.user.status.toLowerCase()}
      </span>
    </div>
    <div className="mt-2 pt-2 border-t border-gray-100">
      <p className="text-sm text-gray-500">Role: <span className="font-medium text-gray-700">{member.role}</span></p>
    </div>
  </div>
);

const InvitationCard = ({ invitation, onRevoke }: { invitation: Invitation; onRevoke: () => void }) => (
  <div className="px-4 py-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800 italic">{invitation.email}</p>
        <p className="text-sm text-gray-500">Invitation Pending</p>
      </div>
       <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
        <Clock className="h-3 w-3 mr-1.5" /> Pending
      </span>
    </div>
    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
      <p className="text-sm text-gray-500">Expires {new Date(invitation.expiresAt).toLocaleDateString()}</p>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-red-100 hover:text-red-700"
        onClick={onRevoke}
      >
        <Trash2 className="h-4 w-4 mr-1" /> Revoke
      </Button>
    </div>
  </div>
);

const TeamManagementPage = () => {
  const { data: agency, isLoading, error, refetch } = useFetch<Agency>('/agencies/me');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; invitation: Invitation | null }>({
    isOpen: false,
    invitation: null,
  });

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

  const openDeleteModal = (invitation: Invitation) => setDeleteModalState({ isOpen: true, invitation });
  const closeDeleteModal = () => setDeleteModalState({ isOpen: false, invitation: null });

  const handleDeleteInvitation = async () => {
    if (!deleteModalState.invitation) return;
    const deletePromise = agencyService.deleteInvitation(deleteModalState.invitation.id);
    await toast.promise(deletePromise, {
      loading: 'Revoking invitation...',
      success: () => {
        refetch();
        closeDeleteModal();
        return 'Invitation has been revoked.';
      },
      error: (err) => {
        closeDeleteModal();
        return err.response?.data?.message || 'Failed to revoke invitation.';
      },
    });
  };

  if (isLoading) {
    return <div className="flex h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }
  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md">Could not load team data.</div>;
  }

  const members = agency?.members || [];
  const invitations = agency?.invitations || [];

  return (
    <>
      <InviteMemberFormModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onSubmit={handleSendInvite} />
      <ConfirmationModal isOpen={deleteModalState.isOpen} onClose={closeDeleteModal} onConfirm={handleDeleteInvitation} title="Revoke Invitation" description={`Are you sure you want to revoke the invitation for ${deleteModalState.invitation?.email}? They will no longer be able to join your team with this link.`} confirmButtonText="Revoke" isDestructive={true} />
      
      <div className="space-y-5">
        {/* Header - Replicated from AgencyDashboard */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="mt-2 text-gray-600">Invite and manage members of your agency.</p>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)} size="lg" className="rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite Member
          </Button>
        </div>

        {/* Replicated Card Layout */}
        <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/70">
  <tr>
    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Member</th>
    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
  </tr>
</thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {members.map((member) => <MemberRow key={member.id} member={member} />)}
                {invitations.map((invitation) => <InvitationRow key={invitation.id} invitation={invitation} onRevoke={() => openDeleteModal(invitation)} />)}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden">
            <ul className="divide-y divide-gray-100">
                {members.map((member) => <li key={member.id}><MemberCard member={member} /></li>)}
                {invitations.map((invitation) => <li key={invitation.id}><InvitationCard invitation={invitation} onRevoke={() => openDeleteModal(invitation)} /></li>)}
            </ul>
          </div>
          
          {/* Polished Empty State */}
          {members.length === 0 && invitations.length === 0 && (
            <div className="p-8">
                <EmptyState icon={UserPlus} title="Build Your Team" description="Invite your colleagues to collaborate on hiring." />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeamManagementPage;