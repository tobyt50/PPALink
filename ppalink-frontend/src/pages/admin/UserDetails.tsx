import { Briefcase, CheckCircle, ChevronLeft, List, Loader2, LogIn, Mail, MoreVertical, Package, ShieldCheck, User as UserIcon, XOctagon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import adminService from '../../services/admin.service';
import useFetch from '../../hooks/useFetch';
import type { User } from '../../types/user';
import UserActivityTab from './tabs/UserActivityTab';
import UserContentTab from './tabs/UserContentTab';
import { SendMessageFormModal, type MessageFormValues } from './forms/SendMessageForm';
import { useAuthStore } from '../../context/AuthContext';

const DetailField = ({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || children}</dd>
  </div>
);

const UserOverview = ({ user }: { user: User }) => {
    const isCandidate = user.role === 'CANDIDATE';
    const agency = user.role === 'AGENCY' ? user.ownedAgencies?.[0] : null;
    return (
        <dl className="divide-y">
            <DetailField label="Email Address" value={user.email} />
            <DetailField label="Phone Number" value={user.phone || 'N/A'} />
            <DetailField label="Role" value={user.role} />
            <DetailField label="Account Status"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></DetailField>
            <DetailField label="Joined On" value={new Date(user.createdAt).toLocaleDateString()} />
            {agency && (
              <>
                <DetailField label="Agency Name" value={agency.name} />
                <DetailField label="Verification Status">
                  <div className="flex flex-wrap gap-2">
                      {agency.domainVerified ? <span className="flex items-center text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3 mr-1" />Verified Domain</span> : <span className="flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">Domain Unverified</span>}
                      {agency.cacVerified ? <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3 mr-1" />CAC Verified</span> : <span className="flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">CAC Unverified</span>}
                  </div>
                </DetailField>
              </>
            )}
            {isCandidate && user.candidateProfile && (<DetailField label="Verification Level"><span className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-600" />{user.candidateProfile.verificationLevel || 'UNVERIFIED'}</span></DetailField>)}
        </dl>
    );
};

type ModalAction = 'suspend' | 'reactivate' | 'verifyEmail' | 'verifyNysc' | 'verifyDomain' | 'verifyCac' | 'impersonate';

const UserDetailsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, error, refetch } = useFetch<User>(userId ? `/admin/users/${userId}` : null);

  const [modalState, setModalState] = useState<{ isOpen: boolean; action: ModalAction | null }>({ isOpen: false, action: null });
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'content'>('overview');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  
  const openModal = (action: ModalAction) => setModalState({ isOpen: true, action });
  const closeModal = () => setModalState({ isOpen: false, action: null });
  const startImpersonation = useAuthStore((state) => state.startImpersonation);

  const handleAction = async () => {
    if (!userId || !modalState.action) return;

    let actionPromise: Promise<any>;
    let successMessage = 'Action completed successfully!';

    switch (modalState.action) {
      case 'suspend':
        actionPromise = adminService.updateUserStatus(userId, 'SUSPENDED');
        successMessage = 'User has been suspended.'; break;
      case 'reactivate':
        actionPromise = adminService.updateUserStatus(userId, 'ACTIVE');
        successMessage = 'User has been reactivated.'; break;
      case 'verifyEmail':
        actionPromise = adminService.forceVerifyEmail(userId);
        successMessage = "User's email has been manually verified."; break;
      case 'verifyNysc':
        actionPromise = adminService.forceVerifyNysc(userId);
        successMessage = "Candidate has been manually marked as NYSC Verified."; break;
      case 'verifyDomain':
        actionPromise = adminService.forceVerifyDomain(userId);
        successMessage = "Agency's domain has been manually verified."; break;
      case 'verifyCac':
        actionPromise = adminService.forceVerifyCac(userId);
        successMessage = "Agency has been manually marked as CAC Verified."; break;
      case 'impersonate': {
        if (!userId) return;
        try {
          toast.loading('Starting impersonation session...');
          const { user: impersonatedUser, token: impersonationToken } = await adminService.impersonateUser(userId);
          startImpersonation(impersonatedUser, impersonationToken);
          closeModal();
          toast.dismiss(); // Dismiss the loading toast
          // Redirect to the appropriate dashboard
          const dashboardPath = impersonatedUser.role === 'AGENCY' ? '/dashboard/agency' : '/dashboard/candidate';
          window.location.href = dashboardPath; // Use a full refresh to ensure all state is reloaded
        } catch (err: any) {
          toast.dismiss();
          toast.error(err.response?.data?.message || 'Failed to start impersonation.');
          closeModal();
        }
        return;
      }
      default: return;
    }

    await toast.promise(actionPromise, {
      loading: 'Processing action...',
      success: () => { refetch(); closeModal(); return successMessage; },
      error: (err) => { closeModal(); return err.response?.data?.message || 'Action failed.'; }
    });
  };
  
  const getModalContent = () => {
    switch (modalState.action) {
      case 'suspend': return { title: 'Suspend User', description: 'Suspend this user? They will be logged out and unable to access their account.', isDestructive: true };
      case 'reactivate': return { title: 'Reactivate User', description: 'Reactivate this user? They will be able to log in again.' };
      case 'verifyEmail': return { title: 'Force Verify Email', description: "Manually mark this user's email as verified?" };
      case 'verifyNysc': return { title: 'Force Verify NYSC', description: "Manually mark this candidate as NYSC Verified?" };
      case 'verifyDomain': return { title: 'Force Verify Domain', description: "Manually mark this agency's domain as verified?" };
      case 'verifyCac': return { title: 'Force Verify CAC', description: "Manually mark this agency as CAC Verified?" };
      case 'impersonate': return { title: 'Impersonate User', description: `Are you sure you want to impersonate ${user?.email}? You will be logged in as this user and will see the platform exactly as they do. Your actions will be audited.` };
      default: return { title: 'Confirm Action', description: 'Are you sure?' };
    }
  };
  
  const handleSendSystemMessage = async (data: MessageFormValues) => {
    if (!userId) return;
    const messagePromise = adminService.sendSystemMessage(userId, data.message);
    await toast.promise(messagePromise, {
        loading: 'Sending message...',
        success: 'Message sent successfully!',
        error: (err) => err.response?.data?.message || 'Failed to send message.',
    });
  };

  if (isLoading) { return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>; }
  if (error || !user) { return <div className="text-center text-red-500 p-8">Error loading user details.</div>; }

  const isCandidate = user.role === 'CANDIDATE';
  const agency = user.role === 'AGENCY' ? user.ownedAgencies?.[0] : null;
  const isSuspended = user.status === 'SUSPENDED';

   const displayName = isCandidate && user.candidateProfile?.firstName
    ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`
    : agency?.name || user.email;

  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleAction}
        title={getModalContent().title}
        description={getModalContent().description}
        isDestructive={getModalContent().isDestructive}
        confirmButtonText="Confirm"
      />
      
      {user && (
        <SendMessageFormModal
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            onSubmit={handleSendSystemMessage}
            recipientEmail={user.email}
        />
      )}

      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link to="/admin/users" className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700 mb-4"><ChevronLeft className="h-5 w-5 mr-1" />Back to User List</Link>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                  <h1 className="text-2xl font-bold tracking-tight text-primary-600">{displayName}</h1>
                  <p className="mt-1 text-gray-500">User ID: {user.id}</p>
              </div>
              <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setIsMessageModalOpen(true)}><Mail className="mr-2 h-4 w-4" />Send Message</Button>
                  <SimpleDropdown trigger={<Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button>}>
                      <SimpleDropdownItem onSelect={() => openModal('impersonate')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Impersonate User
                </SimpleDropdownItem>
                      <div className="my-1 h-px bg-gray-100" />
                      {isSuspended ? (
                          <SimpleDropdownItem onSelect={() => openModal('reactivate')} className="text-green-600"><CheckCircle className="mr-2 h-4 w-4" />Reactivate User</SimpleDropdownItem>
                      ) : (
                          <SimpleDropdownItem onSelect={() => openModal('suspend')} className="text-red-600"><XOctagon className="mr-2 h-4 w-4" />Suspend User</SimpleDropdownItem>
                      )}
                      <div className="my-1 h-px bg-gray-100" />
                      <p className="px-3 py-1 text-xs text-gray-500">Force Verify</p>
                      {!user.emailVerifiedAt && <SimpleDropdownItem onSelect={() => openModal('verifyEmail')}>Verify Email</SimpleDropdownItem>}
                      {isCandidate && !user.candidateProfile?.isVerified && <SimpleDropdownItem onSelect={() => openModal('verifyNysc')}>Verify NYSC</SimpleDropdownItem>}
                      {agency && !agency.domainVerified && <SimpleDropdownItem onSelect={() => openModal('verifyDomain')}>Verify Domain</SimpleDropdownItem>}
                      {agency && !agency.cacVerified && <SimpleDropdownItem onSelect={() => openModal('verifyCac')}>Verify CAC</SimpleDropdownItem>}
                  </SimpleDropdown>
              </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`${activeTab === 'overview' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    <UserIcon className="mr-2 h-5 w-5" /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`${activeTab === 'activity' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    <List className="mr-2 h-5 w-5" /> Activity Log
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`${activeTab === 'content' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    <Package className="mr-2 h-5 w-5" /> {user.role === 'AGENCY' ? 'Jobs' : 'Applications'}
                </button>
            </nav>
        </div>

        <div className="mt-6">
            {activeTab === 'overview' && (
                <div className="rounded-lg border bg-white shadow-sm">
                    <div className="p-6 border-b"><h2 className="text-lg font-semibold flex items-center">{isCandidate ? <UserIcon className="h-5 w-5 mr-2 text-primary-600" /> : <Briefcase className="h-5 w-5 mr-2 text-primary-600" />} User Overview</h2></div>
                    <div className="p-6">
                        <UserOverview user={user}/>
                    </div>
                </div>
            )}
            {activeTab === 'activity' && (
                <div className="rounded-lg border bg-white shadow-sm p-6">
                    <UserActivityTab />
                </div>
            )}
            {activeTab === 'content' && ( 
                <div className="rounded-lg border bg-white shadow-sm p-6">
                  <UserContentTab user={user} />
                </div> 
            )}
        </div>
      </div>
    </>
  );
};

export default UserDetailsPage;