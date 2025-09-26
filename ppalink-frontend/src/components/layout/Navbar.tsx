import { motion } from 'framer-motion';
import { Building, CreditCard, LogOut, Menu, User, UserCircle2, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';
import { useShortlistStore } from '../../context/ShortlistStore';
import { SimpleDropdown, SimpleDropdownItem } from '../ui/SimpleDropdown';
import { InboxBell } from './InboxBell';
import { NotificationBell } from './NotificationBell';
import { useUIStore } from '../../context/UISlice';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';

// const NavItem = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
//   <NavLink
//     to={to}
//     className={({ isActive }) =>
//       `flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
//         isActive 
//         ? 'bg-primary-50 dark:bg-primary-950/60 dark:bg-primary-950 text-primary-600 dark:text-primary-400 dark:text-primary-400' 
//         : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:bg-gray-900 dark:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:text-gray-900'
//       }`
//     }
//   >
//     <Icon className="mr-2 h-5 w-5" />
//     {children}
//   </NavLink>
// );

const Navbar = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearShortlist = useShortlistStore((state) => state.clearShortlist);

  const dashboardPath = user?.role === 'AGENCY' ? '/dashboard/agency' : '/dashboard/candidate';

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
          <Link to={dashboardPath} className="flex flex-shrink-0 items-center space-x-2">
            <img src="/header.png" alt="ppalink Logo" className="h-9 w-28" />
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <InboxBell />
          <NotificationBell />

          <SimpleDropdown
            trigger={
              <Button
          size="icon"
          className="bg-transparent hover:bg-transparent focus:ring-0 border-none shadow-none"
          variant="ghost"
        >
                <UserCircle2 className="h-6 w-6 text-gray-500 dark:text-gray-500" />
              </Button>
            }
          >
            <div className="p-2 text-sm border-b border-gray-100 dark:border-zinc-800">
              <p className="font-semibold text-gray-800 dark:text-zinc-100 dark:text-gray-200">Signed in as</p>
              <p className="text-gray-500 dark:text-gray-500 truncate">{user?.email}</p>
            </div>
            {/* Polished dropdown items with gradient hover */}
            <div className="p-1">
              {user?.role === 'AGENCY' && (
                <>
                  <SimpleDropdownItem onSelect={() => navigate('/dashboard/agency/profile')} className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 dark:from-primary-950 hover:to-green-50 dark:hover:to-green-950/60 dark:to-green-950">
                    <Building className="mr-2 h-4 w-4" /> <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 dark:text-primary-400">Company Profile</span>
                  </SimpleDropdownItem>
                  <SimpleDropdownItem onSelect={() => navigate('/dashboard/agency/team')} className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 dark:from-primary-950 hover:to-green-50 dark:hover:to-green-950/60 dark:to-green-950">
                    <Users className="mr-2 h-4 w-4" /> <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 dark:text-primary-400">Manage Team</span>
                  </SimpleDropdownItem>
                  <SimpleDropdownItem onSelect={() => navigate('/dashboard/agency/billing')} className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 dark:from-primary-950 hover:to-green-50 dark:hover:to-green-950/60 dark:to-green-950">
                    <CreditCard className="mr-2 h-4 w-4" /> <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 dark:text-primary-400">Billing</span>
                  </SimpleDropdownItem>
                </>
              )}
              {user?.role === 'CANDIDATE' && (
                <SimpleDropdownItem onSelect={() => navigate('/dashboard/candidate/profile')} className="group rounded-xl transition-all hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-950/60 dark:from-primary-950 hover:to-green-50 dark:hover:to-green-950/60 dark:to-green-950">
                  <User className="mr-2 h-4 w-4" /> <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 dark:text-primary-400">My Profile</span>
                </SimpleDropdownItem>
              )}
              <SimpleDropdownItem onSelect={handleLogout} className="group rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-950/60 dark:bg-red-950 text-red-600 dark:text-red-400">
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



