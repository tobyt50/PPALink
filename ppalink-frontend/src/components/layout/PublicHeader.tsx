import { motion } from "framer-motion";
import { Users, GraduationCap, Building2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

const PublicHeader = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalOpen(false);
      }
    };
    if (isModalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 dark:backdrop-blur-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/header.png" alt="ppalink Logo" className="h-9 w-28" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="whitespace-nowrap">
                Login
              </Button>
            </Link>
            <Button
            size="sm"
              onClick={() => setModalOpen(true)}
              className="whitespace-nowrap"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-sm rounded-xl bg-white/95 dark:bg-zinc-900/95 dark:backdrop-blur-sm backdrop-blur-md p-6 shadow-xl dark:shadow-none dark:ring-1 dark:ring-white/10"
          >
            <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400 text-center mb-6">
              Choose Your Role
            </h2>

            <div className="flex flex-col">
  {[
    {
      to: "/register/candidate?type=NYSC",
      icon: <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />,
      title: "Corps Member",
      desc: "For serving corps members.",
    },
    {
      to: "/register/candidate?type=PROFESSIONAL",
      icon: <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />,
      title: "Professional",
      desc: "For graduates and professionals.",
    },
    {
      to: "/register/agency",
      icon: <Building2 className="h-6 w-6 text-gray-600 dark:text-gray-400 flex-shrink-0" />,
      title: "Agency / Employer",
      desc: "Hire top Nigerian talent.",
    },
  ].map((item, index) => (
    <Link key={index} to={item.to} onClick={() => setModalOpen(false)} className="block mb-5 last:mb-0">
      <motion.div
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center gap-4 rounded-xl border border-gray-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-800/30 p-6 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-150"
      >
        {item.icon}
        <div>
          <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">
            {item.title}
          </p>
          <p className="text-xs text-gray-600 dark:text-zinc-400">{item.desc}</p>
        </div>
      </motion.div>
    </Link>
  ))}
</div>


            <Button
              variant="ghost"
              className="mt-4 w-full text-sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default PublicHeader;