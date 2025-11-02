import { Briefcase, CheckCircle, ChevronLeft, CreditCard, List, Loader2, LogIn, Mail, MoreHorizontal, Package, ShieldCheck, User as UserIcon, XOctagon } from 'lucide-react';
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
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 dark:text-zinc-50 sm:mt-0 sm:col-span-2">{value || children}</dd>
  </div>
);

const UserOverview = ({ user }: { user: User }) => {
    const isCandidate = user.role === 'CANDIDATE';
    const agency = user.role === 'AGENCY' ? user.ownedAgencies?.[0] : null;
    return (
        <dl className="divide-y divide-gray-100">
            <DetailField label="Email Address" value={user.email} />
            <DetailField label="Phone Number" value={user.phone || 'N/A'} />
            <DetailField label="Role" value={user.role} />
            <DetailField label="Account Status"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-950/60 text-red-800'}`}>{user.status}</span></DetailField>
            <DetailField label="Joined On" value={new Date(user.createdAt).toLocaleDateString()} />
            {agency && (
              <>
                <DetailField label="Agency Name" value={agency.name} />
                <DetailField label="Verification Status">
                  <div className="flex flex-wrap gap-2">
                      {agency.domainVerified ? <span className="flex items-center text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3 mr-1" />Verified Domain</span> : <span className="flex items-center text-xs font-semibold text-gray-700 dark:text-zinc-200 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Domain Unverified</span>}
                      {agency.cacVerified ? <span className="flex items-center text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/60 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3 mr-1" />CAC Verified</span> : <span className="flex items-center text-xs font-semibold text-gray-700 dark:text-zinc-200 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">CAC Unverified</span>}
                  </div>
                </DetailField>
              </>
            )}
            {isCandidate && user.candidateProfile && (<DetailField label="Verification Level"><span className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />{user.candidateProfile.verificationLevel || 'UNVERIFIED'}</span></DetailField>)}
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
      case 'suspend': actionPromise = adminService.updateUserStatus(userId, 'SUSPENDED'); successMessage = 'User has been suspended.'; break;
      case 'reactivate': actionPromise = adminService.updateUserStatus(userId, 'ACTIVE'); successMessage = 'User has been reactivated.'; break;
      case 'verifyEmail': actionPromise = adminService.forceVerifyEmail(userId); successMessage = "User's email has been manually verified."; break;
      case 'verifyNysc': actionPromise = adminService.forceVerifyNysc(userId); successMessage = "Candidate has been manually marked as NYSC Verified."; break;
      case 'verifyDomain': actionPromise = adminService.forceVerifyDomain(userId); successMessage = "Agency's domain has been manually verified."; break;
      case 'verifyCac': actionPromise = adminService.forceVerifyCac(userId); successMessage = "Agency has been manually marked as CAC Verified."; break;
      case 'impersonate': {
        if (!userId) return;
        try {
          toast.loading('Starting impersonation session...');
          const { user: impersonatedUser, token: impersonationToken } = await adminService.impersonateUser(userId);
          startImpersonation(impersonatedUser, impersonationToken);
          closeModal();
          toast.dismiss();
          const dashboardPath = impersonatedUser.role === 'AGENCY' ? '/dashboard/agency' : '/dashboard/candidate';
          window.location.href = dashboardPath;
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

  const handleManageSubscription = async () => {
      if (!agency?.id) return;
      const actionPromise = adminService.createStripePortalSession(agency.id);
      toast.promise(actionPromise, {
          loading: 'Redirecting to Stripe...',
          success: (data) => { window.location.href = data.url; return 'Redirecting...'; },
          error: (err) => err.response?.data?.message || 'Could not open Stripe portal.'
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

  if (isLoading) { return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>; }
  if (error || !user) { return <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">Error loading user details.</div>; }

  const isCandidate = user.role === 'CANDIDATE';
  const agency = user.role === 'AGENCY' ? user.ownedAgencies?.[0] : null;
  const isSuspended = user.status === 'SUSPENDED';
  const displayName = isCandidate && user.candidateProfile?.firstName ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}` : agency?.name || user.email;

  const tabStyle = "flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors";
  const activeTabStyle = "border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400";
  const inactiveTabStyle = "border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 hover:border-gray-300";

  return (
    <>
      <ConfirmationModal isOpen={modalState.isOpen} onClose={closeModal} onConfirm={handleAction} title={getModalContent().title} description={getModalContent().description} isDestructive={getModalContent().isDestructive} confirmButtonText="Confirm" />
      {user && ( <SendMessageFormModal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} onSubmit={handleSendSystemMessage} recipientEmail={user.email} /> )}

      <div className="space-y-5">
        <div className="mb-2">
          <Link to="/admin/users" className="flex items-center text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition mb-4"><ChevronLeft className="h-5 w-5 mr-1" />Back to User List</Link>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">{displayName}</h1>
                  <p className="mt-2 text-gray-600 dark:text-zinc-300 font-mono text-xs">User ID: {user.id}</p>
              </div>
              <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setIsMessageModalOpen(true)}><Mail className="mr-2 h-4 w-4" />Message</Button>
                  {agency && agency.subscriptions && agency.subscriptions.length > 0 && (
                      <Button variant="outline" onClick={handleManageSubscription}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscriptions
                      </Button>
                  )}
                  <SimpleDropdown trigger={<Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>}>
                      <SimpleDropdownItem onSelect={() => openModal('impersonate')}><LogIn className="mr-2 h-4 w-4" />Impersonate User</SimpleDropdownItem>
                      <div className="my-1 h-px bg-gray-100 dark:bg-zinc-800" />
                      {isSuspended ? (
                          <SimpleDropdownItem onSelect={() => openModal('reactivate')} className="text-green-700 dark:text-green-300 hover:bg-green-50"><CheckCircle className="mr-2 h-4 w-4" />Reactivate User</SimpleDropdownItem>
                      ) : (
                          <SimpleDropdownItem onSelect={() => openModal('suspend')} className="text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60"><XOctagon className="mr-2 h-4 w-4" />Suspend User</SimpleDropdownItem>
                      )}
                      <div className="my-1 h-px bg-gray-100 dark:bg-zinc-800" />
                      <p className="px-3 py-1 text-xs text-gray-500 dark:text-zinc-400 uppercase font-semibold">Force Verify</p>
                      {!user.emailVerifiedAt && <SimpleDropdownItem onSelect={() => openModal('verifyEmail')}>Verify Email</SimpleDropdownItem>}
                      {isCandidate && !user.candidateProfile?.isVerified && <SimpleDropdownItem onSelect={() => openModal('verifyNysc')}>Verify NYSC</SimpleDropdownItem>}
                      {agency && !agency.domainVerified && <SimpleDropdownItem onSelect={() => openModal('verifyDomain')}>Verify Domain</SimpleDropdownItem>}
                      {agency && !agency.cacVerified && <SimpleDropdownItem onSelect={() => openModal('verifyCac')}>Verify CAC</SimpleDropdownItem>}
                  </SimpleDropdown>
              </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 dark:border-zinc-800">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('overview')} className={`${tabStyle} ${activeTab === 'overview' ? activeTabStyle : inactiveTabStyle}`}><UserIcon className="mr-2 h-5 w-5" />Overview</button>
                <button onClick={() => setActiveTab('activity')} className={`${tabStyle} ${activeTab === 'activity' ? activeTabStyle : inactiveTabStyle}`}><List className="mr-2 h-5 w-5" />Activity Log</button>
                <button onClick={() => setActiveTab('content')} className={`${tabStyle} ${activeTab === 'content' ? activeTabStyle : inactiveTabStyle}`}><Package className="mr-2 h-5 w-5" />{user.role === 'AGENCY' ? 'Jobs' : 'Applications'}</button>
            </nav>
        </div>

        <div className="pt-1">
            {activeTab === 'overview' && (
                <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50 flex items-center">{isCandidate ? <UserIcon className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" /> : <Briefcase className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />} User Overview</h2></div>
                    <div className="p-6"><UserOverview user={user}/></div>
                </div>
            )}
            {activeTab === 'activity' && ( <UserActivityTab /> )}
            {activeTab === 'content' && ( <UserContentTab user={user} /> )}
        </div>
      </div>
    </>
  );
};

export default UserDetailsPage;

