import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useMediaQuery from '../../hooks/useMediaQuery';
import {
  Building,
  Calendar,
  ChevronDown,
  CreditCard,
  FileQuestion,
  Home,
  LogOut,
  Rss,
  Settings,
  Shield,
  ShieldCheck,
  User,
  Users
} from 'lucide-react';
import { useAuthStore } from '../../context/AuthContext';
import { useShortlistStore } from '../../context/ShortlistStore';
import { SimpleDropdown, SimpleDropdownItem } from '../ui/SimpleDropdown';
import { InboxBell } from './InboxBell';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const getNavLinkClass = (to: string) => {
    const baseClasses = 'text-sm font-medium transition-colors';
    const defaultClasses = 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100';
    const activeClasses = 'text-gray-900 dark:text-zinc-100';
    const isActive = location.pathname === to;
    return `${baseClasses} ${isActive ? activeClasses : defaultClasses}`;
  };

  const LogoDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <SimpleDropdown
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <Button
            variant="ghost"
            className="flex flex-shrink-0 items-center space-x-2 p-0 h-auto py-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <img src="/header.png" alt="ppalink Logo" className="h-6 w-18" />
            <motion.span
              initial={false}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </Button>
        }
      >
        <div className="p-1">
          <SimpleDropdownItem
            onSelect={() => navigate(dashboardPath)}
          >
            <Home className="mr-2 h-4 w-4" /> Dashboard
          </SimpleDropdownItem>

          {user?.role === 'AGENCY' && (
            <>
              {!isDesktop && (
                <SimpleDropdownItem
                  onSelect={() => navigate('/dashboard/agency/interviews')}
                >
                  <Calendar className="mr-2 h-4 w-4" /> Interviews
                </SimpleDropdownItem>
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
            </>
          )}
        </div>
      </SimpleDropdown>
    );
  };

  const ProfileDropdown = () => (
    <SimpleDropdown
      trigger={
        <Button
          size="icon"
          className="bg-transparent hover:bg-transparent focus:ring-0 border-none shadow-none"
          variant="ghost"
        >
          <Avatar user={user} name={user?.email} size="sm" />
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
          <SimpleDropdownItem
            onSelect={() => navigate('/dashboard/agency/profile')}
          >
            <Building className="mr-2 h-4 w-4" /> Company Profile
          </SimpleDropdownItem>
        )}

        {user?.role === 'CANDIDATE' && (
          <SimpleDropdownItem
            onSelect={() => navigate('/dashboard/candidate/profile')}
          >
            <User className="mr-2 h-4 w-4" /> My Profile
          </SimpleDropdownItem>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <SimpleDropdownItem
            onSelect={() => navigate('/admin/settings')}
          >
            <Settings className="mr-2 h-4 w-4" /> Settings
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
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`w-full z-40 md:border-b border-gray-100 dark:border-zinc-800 bg-surface/95 backdrop-blur-sm ${isDesktop ? 'sticky top-0' : ''}`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        {user?.role === 'CANDIDATE' ? (
          <Link
            to={dashboardPath}
            className="flex flex-shrink-0 items-center py-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <img src="/header.png" alt="ppalink Logo" className="h-6 w-18" />
          </Link>
        ) : isDesktop ? (
          <Link
            to={dashboardPath}
            className="flex flex-shrink-0 items-center py-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <img src="/header.png" alt="ppalink Logo" className="h-6 w-18" />
          </Link>
        ) : (
          <LogoDropdown />
        )}

        {/* Middle nav */}
        {isDesktop && user?.role !== 'CANDIDATE' && (
          <nav className="flex items-center space-x-8">
            {user?.role === 'AGENCY' && (
              <>
                <Link
                  to="/dashboard/agency/interviews"
                  className={getNavLinkClass('/dashboard/agency/interviews')}
                >
                  Interviews
                </Link>
                <Link
                  to="/dashboard/agency/team"
                  className={getNavLinkClass('/dashboard/agency/team')}
                >
                  Manage Team
                </Link>
                <Link
                  to="/dashboard/agency/billing"
                  className={getNavLinkClass('/dashboard/agency/billing')}
                >
                  Billing
                </Link>
              </>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <>
                {user?.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/admin/admins"
                    className={getNavLinkClass('/admin/admins')}
                  >
                    Manage Admins
                  </Link>
                )}
                <Link
                  to="/admin/plans"
                  className={getNavLinkClass('/admin/plans')}
                >
                  Plans & Subscriptions
                </Link>
                <Link
                  to="/admin/quizzes"
                  className={getNavLinkClass('/admin/quizzes')}
                >
                  Skill Assessments
                </Link>
                <Link
                  to="/admin/feed"
                  className={getNavLinkClass('/admin/feed')}
                >
                  Manage Feed
                </Link>
                <Link
                  to="/admin/audit-logs"
                  className={getNavLinkClass('/admin/audit-logs')}
                >
                  Audit Logs
                </Link>
              </>
            )}
          </nav>
        )}

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