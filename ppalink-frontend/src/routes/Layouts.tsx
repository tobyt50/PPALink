import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../context/AuthContext';
import { AGENCY_NAV_ITEMS, CANDIDATE_NAV_ITEMS } from '../utils/constants';

const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const navItems = user?.role === 'AGENCY' ? AGENCY_NAV_ITEMS : CANDIDATE_NAV_ITEMS;
  const { pathname } = useLocation();
  const isInbox = pathname.startsWith('/inbox');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-grow overflow-y-hidden">
        <Sidebar navItems={navItems} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {isInbox ? (
            // 🔑 Let Inbox handle its own height/scroll
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

export default DashboardLayout;