import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { ADMIN_NAV_ITEMS } from '../utils/constants';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar navItems={ADMIN_NAV_ITEMS} />
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-5 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;