import { motion } from 'framer-motion';
import { Bell, Briefcase, Heart, LogOut, Mail, Package, Search as SearchIcon, User, UserCircle2, Users } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';
import { useShortlistStore } from '../../context/ShortlistStore';
import { Button } from '../ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Select each piece of state individually for performance.
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
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Logo and main navigation */}
<div className="flex items-center space-x-8">
  <Link to={dashboardPath} className="flex flex-shrink-0 items-center space-x-2">
  <img
    src="/header.png"
    alt="ppalink Logo"
    className="h-8 w-32"
  />
</Link>

          {/* Agency-specific navigation links */}
          {user?.role === 'AGENCY' && (
            <nav className="hidden md:flex items-center space-x-4">
              <NavLink
                to="/dashboard/agency/jobs"
                className={({ isActive }) =>
                  `flex items-center text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'}`
                }
              >
                <Briefcase className="mr-2 h-5 w-5" />
                My Jobs
              </NavLink>
              <NavLink
                to="/dashboard/agency/candidates/browse"
                className={({ isActive }) =>
                  `flex items-center text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'}`
                }
              >
                <Users className="mr-2 h-5 w-5" />
                Find Candidates
              </NavLink>
              <NavLink
                to="/dashboard/agency/candidates/shortlisted"
                className={({ isActive }) =>
                  `flex items-center text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'}`
                }
              >
                <Heart className="mr-2 h-5 w-5" />
                Shortlist
              </NavLink>
            </nav>
          )}

          {user?.role === 'CANDIDATE' && (
            <nav className="hidden md:flex items-center space-x-4">
              <NavLink
                to="/dashboard/candidate/profile"
                className={({ isActive }) =>
                  `flex items-center text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'}`
                }
              >
                <User className="mr-2 h-5 w-5" />
                My Profile
              </NavLink>
              <NavLink
                to="/dashboard/candidate/jobs/browse"
                className={({ isActive }) =>
                  `flex items-center text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'}`
                }
              >
                <SearchIcon className="mr-2 h-5 w-5" />
                Browse Jobs
              </NavLink>
              <NavLink
                to="/dashboard/candidate/applications"
                className={({ isActive }) =>
                  `flex items-center text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'}`
                }
              >
                <Package className="mr-2 h-5 w-5" />
                My Applications
              </NavLink>
            </nav>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
        {(user?.role === 'CANDIDATE' || user?.role === 'AGENCY') && (
            <Link to="/inbox">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="sr-only">Inbox</span>
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Notifications</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <UserCircle2 className="h-6 w-6 text-gray-600" />
              <span className="sr-only">User Menu</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;