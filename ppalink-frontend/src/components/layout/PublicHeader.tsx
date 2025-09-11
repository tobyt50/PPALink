import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

const PublicHeader = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand Name */}
<Link to="/" className="flex items-center space-x-2">
  <img
    src="/android-chrome-192x192.png"
    alt="ppalink Logo"
    className="h-8 w-8"
  />
  <span className="text-xl font-bold tracking-tight text-primary-600">
    PPALink
  </span>
</Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register/candidate">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default PublicHeader;