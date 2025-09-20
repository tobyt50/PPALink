import { CheckSquare, Home, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar'; // We can reuse the main Navbar

const AdminSidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4">
      <div className="flex flex-col h-full">
        <nav className="flex-grow space-y-2">
          <NavLink
            to="/admin/dashboard"
            end // Use 'end' to prevent matching parent routes
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <Users className="mr-3 h-5 w-5" />
            Manage Users
          </NavLink>
          <NavLink
            to="/admin/verifications"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <CheckSquare className="mr-3 h-5 w-5" />
            Verification Queue
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-grow">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-5 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;