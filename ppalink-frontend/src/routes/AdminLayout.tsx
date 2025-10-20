import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { ImpersonationBar } from '../components/layout/ImpersonationBar';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import { ADMIN_NAV_ITEMS, SUPER_ADMIN_NAV_ITEMS, ESSENTIAL_ADMIN_NAV_ITEMS, ESSENTIAL_SUPER_ADMIN_NAV_ITEMS } from '../utils/constants';
import { useAuthStore } from '../context/AuthContext';

const AdminLayout = () => {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const isInbox = pathname.startsWith('/inbox');
  const fullNavItems = user?.role === 'SUPER_ADMIN' ? SUPER_ADMIN_NAV_ITEMS : ADMIN_NAV_ITEMS;
  const essentialNavItems = user?.role === 'SUPER_ADMIN' ? ESSENTIAL_SUPER_ADMIN_NAV_ITEMS : ESSENTIAL_ADMIN_NAV_ITEMS;
  const hideBottomNav = isInbox && searchParams.get('view') === 'chat';

  const mainClassName = isInbox
    ? `flex-1 min-h-0 overflow-hidden ${hideBottomNav ? 'pb-0' : 'pb-[calc(4rem+env(safe-area-inset-bottom,0px))]' } md:pb-0`
    : `flex-1 min-h-0 overflow-y-auto scrollbar-thin pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0`;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-920 has-[[data-impersonating]]:pt-10">
      <ImpersonationBar /> 
      <Navbar />

      <div className="flex flex-grow overflow-y-hidden">
        <Sidebar navItems={fullNavItems} />

        <BottomNav className={hideBottomNav ? 'hidden' : ''} navItems={essentialNavItems} />

        <main className={mainClassName}>
          {isInbox ? (
            <Outlet />
          ) : (
            <div className="p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-5">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;