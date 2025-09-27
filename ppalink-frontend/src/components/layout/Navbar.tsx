import { motion } from 'framer-motion';
import {
  Building,
  CreditCard,
  LogOut,
  Menu,
  User,
  UserCircle2,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';
import { useShortlistStore } from '../../context/ShortlistStore';
import { SimpleDropdown, SimpleDropdownItem } from '../ui/SimpleDropdown';
import { InboxBell } from './InboxBell';
import { NotificationBell } from './NotificationBell';
import { useUIStore } from '../../context/UISlice';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearShortlist = useShortlistStore((state) => state.clearShortlist);

  const dashboardPath =
    user?.role === 'AGENCY'
      ? '/dashboard/agency'
      : '/dashboard/candidate';

  const handleLogout = () => {
    logout();
    clearShortlist();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-zinc-800 bg-surface/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Logo and main navigation */}
        <div className="flex items-center space-x-8">
          {/* Mobile Sidebar Toggle */}
          <button onClick={toggleSidebar} className="md:hidden p-1">
            <Menu className="h-6 w-6" />
          </button>
          <Link
            to={dashboardPath}
            className="flex flex-shrink-0 items-center space-x-2"
          >
            <img src="/header.png" alt="ppalink Logo" className="h-9 w-28" />
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <InboxBell />
          <NotificationBell />

          <SimpleDropdown
            trigger={
              <Button
                size="icon"
                className="bg-transparent hover:bg-transparent focus:ring-0 border-none shadow-none"
                variant="ghost"
              >
                <UserCircle2 className="h-6 w-6 text-gray-600 dark:text-zinc-300" />
              </Button>
            }
          >
            {/* Signed in as section with theme icon */}
            <div className="flex items-center p-2 text-sm border-b border-gray-100 dark:border-zinc-800">
  <div className="flex-grow">
    <p className="font-semibold text-gray-800 dark:text-zinc-100">
      Signed in as
    </p>
    <p className="text-gray-500 dark:text-gray-500 truncate">
      {user?.email}
    </p>
  </div>
  <div className="ml-auto pl-2">
    <ThemeToggle />
  </div>
</div>


            <div className="p-1">
              {user?.role === 'AGENCY' && (
                <>
                  <SimpleDropdownItem
                    onSelect={() => navigate('/dashboard/agency/profile')}
                  >
                    <Building className="mr-2 h-4 w-4" /> Company Profile
                  </SimpleDropdownItem>
                  <SimpleDropdownItem
                    onSelect={() => navigate('/dashboard/agency/team')}
                  >
                    <Users className="mr-2 h-4 w-4" /> Manage Team
                  </SimpleDropdownItem>
                  <SimpleDropdownItem
                    onSelect={() => navigate('/dashboard/agency/billing')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Billing
                  </SimpleDropdownItem>
                </>
              )}

              {user?.role === 'CANDIDATE' && (
                <SimpleDropdownItem
                  onSelect={() => navigate('/dashboard/candidate/profile')}
                >
                  <User className="mr-2 h-4 w-4" /> My Profile
                </SimpleDropdownItem>
              )}

              <SimpleDropdownItem
                onSelect={handleLogout}
                className="!text-red-600 dark:!text-red-400 hover:!text-red-700 dark:hover:!text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </SimpleDropdownItem>
            </div>
          </SimpleDropdown>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
