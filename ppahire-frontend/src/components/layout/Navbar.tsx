import { motion } from 'framer-motion';
import { Bell, LogOut, UserCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand Name */}
        <div className="flex items-center">
          <a href="/" className="flex items-center space-x-2">
            {/* You can replace this with an SVG logo later */}
            <div className="h-8 w-8 rounded-full bg-primary-500" /> 
            <span className="text-xl font-bold tracking-tight text-primary-600">
              PPAHire
            </span>
          </a>
        </div>

        {/* Right side actions: Notifications & User Menu */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* This would be a dropdown menu in a real app */}
          <div className="flex items-center space-x-2">
             <Button variant="ghost" size="icon">
                <UserCircle2 className="h-6 w-6 text-gray-600" />
                <span className="sr-only">User Menu</span>
            </Button>
            <Button variant="ghost" size="sm">
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