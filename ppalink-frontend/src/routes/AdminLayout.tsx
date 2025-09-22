import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { ADMIN_NAV_ITEMS } from '../utils/constants';

const AdminLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-grow overflow-y-hidden">
        <Sidebar navItems={ADMIN_NAV_ITEMS} />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;