import { motion } from 'framer-motion';
import { Briefcase, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

const PublicHeader = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false);
      }
    };
    if (isModalOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 dark:backdrop-blur-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/header.png" alt="ppalink Logo" className="h-9 w-28" />
          </Link>

          {/* Buttons */}
          <div className="flex items-center gap-2">
  <Link to="/login">
    <Button variant="ghost" className="whitespace-nowrap">Login</Button>
  </Link>
  <Button onClick={() => setModalOpen(true)} className="whitespace-nowrap">
    Sign Up
  </Button>
</div>

        </div>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }} // instant
            className="w-full max-w-lg rounded-2xl bg-white/90 dark:bg-zinc-900/90 dark:backdrop-blur-sm backdrop-blur-lg p-6 shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10"
          >
            <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 text-center mb-6">
              Create Your Account
            </h2>

            <div className="grid gap-4">
              <Link to="/register/candidate" onClick={() => setModalOpen(false)}>
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.05 }}
                  className="flex items-start gap-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 hover:shadow-lg transition backdrop-blur-sm"
                >
                  <Users className="h-8 w-8 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-zinc-50">Corp Member</p>
                    <p className="text-sm text-gray-700 dark:text-zinc-200">Find jobs & internships fast.</p>
                  </div>
                </motion.div>
              </Link>

              <Link to="/register/agency" onClick={() => setModalOpen(false)}>
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.05 }}
                  className="flex items-start gap-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 hover:shadow-lg transition backdrop-blur-sm"
                >
                  <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-zinc-50">Agency</p>
                    <p className="text-sm text-gray-700 dark:text-zinc-200">Hire top NYSC talent easily.</p>
                  </div>
                </motion.div>
              </Link>

              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default PublicHeader;


