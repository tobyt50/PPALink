import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, type LucideIcon, X } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';
import { useUIStore } from '../../context/UISlice';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  text: string;
  end?: boolean;
}

const SidebarLink = ({ to, icon: Icon, text, isCollapsed, end, onClick }: NavItem & { isCollapsed: boolean; onClick?: () => void; }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center p-3 text-sm font-medium rounded-xl transition-all duration-200 w-full ${
          isActive
            ? 'bg-gradient-to-r from-primary-50 to-green-50 text-primary-600 shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="ml-3 truncate">{text}</span>}
      
      {/* Tooltip for collapsed sidebar */}
      {isCollapsed && (
          <div className="absolute left-full top-1/2 z-20 ml-4 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            {text}
          </div>
        )}
    </NavLink>
  );
};

const SidebarContent = ({ navItems }: { navItems: NavItem[] }) => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const isCollapsed = !isSidebarOpen;
  const user = useAuthStore((state) => state.user);

  const title = user?.role === 'ADMIN' ? 'Admin Panel' : 'Quick Links';
  
  const handleLinkClick = () => {
    // Auto-close sidebar on mobile when a link is clicked
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <aside className={`flex flex-col flex-shrink-0 h-full bg-white border-r border-gray-100 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-17.5'}`}>
      <div className={`p-4 flex items-center h-14 border-b border-gray-100 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
         {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
              {title}
            </span>
         )}
        {/* Desktop Collapse Button */}
        <button onClick={toggleSidebar} className="p-1.5 rounded-full transition-colors hover:bg-gray-100 hidden md:block">
          <ChevronLeft className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        {/* Mobile Close Button (now integrated here) */}
        <button onClick={toggleSidebar} className="p-1.5 rounded-full transition-colors hover:bg-gray-100 md:hidden">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <nav className="flex-grow space-y-1.5 px-3 py-4">
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} isCollapsed={isCollapsed} onClick={handleLinkClick} />
        ))}
      </nav>
    </aside>
  );
};

const Sidebar = ({ navItems }: { navItems: NavItem[] }) => {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleResize = () => setSidebarOpen(mediaQuery.matches);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent navItems={navItems} />
      </div>

      {/* Mobile Sidebar with Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-0 h-full z-50 md:hidden shadow-xl"
            >
              <SidebarContent navItems={navItems} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
