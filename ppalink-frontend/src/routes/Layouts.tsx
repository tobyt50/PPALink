import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../context/AuthContext';
import { AGENCY_NAV_ITEMS, CANDIDATE_NAV_ITEMS } from '../utils/constants';

const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);

  const navItems = user?.role === 'AGENCY' ? AGENCY_NAV_ITEMS : CANDIDATE_NAV_ITEMS;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-grow overflow-hidden">
        <Sidebar navItems={navItems} />
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-5 bg-gray-50 overflow-y-auto">
          {/* Outlet is where the specific dashboard pages will be rendered */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;