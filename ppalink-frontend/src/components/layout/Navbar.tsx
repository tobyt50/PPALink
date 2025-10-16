import { motion } from 'framer-motion';
import useMediaQuery from '../../hooks/useMediaQuery';
import {
  Building,
  Calendar,
  CreditCard,
  FileQuestion,
  LogOut,
  Rss,
  Settings,
  Shield,
  ShieldCheck,
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
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearShortlist = useShortlistStore((state) => state.clearShortlist);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  let dashboardPath;
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    dashboardPath = '/admin/dashboard';
  } else if (user?.role === 'AGENCY') {
    dashboardPath = '/dashboard/agency';
  } else {
    dashboardPath = '/dashboard/candidate';
  }

  const handleLogout = () => {
    logout();
    clearShortlist();
    navigate('/login');
  };

  const ProfileDropdown = () => (
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
            {!isDesktop && (
              <>
                <SimpleDropdownItem
                  onSelect={() => navigate('/dashboard/agency/posts')}
                >
                  <Rss className="mr-2 h-4 w-4" /> My Posts
                </SimpleDropdownItem>
                <SimpleDropdownItem
                  onSelect={() => navigate('/dashboard/agency/interviews')}
                >
                  <Calendar className="mr-2 h-4 w-4" /> Interviews
                </SimpleDropdownItem>
              </>
            )}
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

        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <>
            {user?.role === 'SUPER_ADMIN' && (
              <SimpleDropdownItem
                onSelect={() => navigate('/admin/admins')}
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Manage Admins
              </SimpleDropdownItem>
            )}
            {!isDesktop && (
              <>
                <SimpleDropdownItem
                  onSelect={() => navigate('/admin/plans')}
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Plans & Subscriptions
                </SimpleDropdownItem>
                <SimpleDropdownItem
                  onSelect={() => navigate('/admin/quizzes')}
                >
                  <FileQuestion className="mr-2 h-4 w-4" /> Skill Assessments
                </SimpleDropdownItem>
                <SimpleDropdownItem
                  onSelect={() => navigate('/admin/feed')}
                >
                  <Rss className="mr-2 h-4 w-4" /> Manage Feed
                </SimpleDropdownItem>
              </>
            )}
            <SimpleDropdownItem
              onSelect={() => navigate('/admin/audit-logs')}
            >
              <Shield className="mr-2 h-4 w-4" /> Audit Logs
            </SimpleDropdownItem>
            <SimpleDropdownItem
              onSelect={() => navigate('/admin/settings')}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </SimpleDropdownItem>
          </>
        )}

        <SimpleDropdownItem
          onSelect={handleLogout}
          className="!text-red-600 dark:!text-red-400 hover:!text-red-700 dark:hover:!text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </SimpleDropdownItem>
      </div>
    </SimpleDropdown>
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-zinc-800 bg-surface/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Logo and main navigation */}
        <div className="flex items-center space-x-2 md:space-x-8">
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
          <ProfileDropdown />
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;