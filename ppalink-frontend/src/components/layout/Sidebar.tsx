import {
  ChevronLeft,
  type LucideIcon,
  FileQuestion,
} from "lucide-react";
import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useUIStore } from "../../context/UISlice";
import { useNotificationStore } from "../../context/NotificationStore";
import { InteractiveToast } from "../ui/InteractiveToast";
import type { Notification } from "../../types/notification";

export interface NavItem {
  to: string;
  icon: LucideIcon;
  text: string;
  end?: boolean;
  hasNotification?: boolean;
}

const SidebarLink = ({
  to,
  icon: Icon,
  text,
  isCollapsed,
  end,
  onClick,
  hasNotification,
}: NavItem & { isCollapsed: boolean; onClick?: () => void }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center p-3 text-sm font-medium rounded-xl transition-all duration-200 w-full ${
          isActive
            ? "bg-gradient-to-r from-primary-50 dark:from-primary-950/60 to-green-50 dark:to-green-950/60 text-primary-600 dark:text-primary-400 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10"
            : "text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-zinc-200"
        }`
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="ml-3 truncate">{text}</span>}
      {hasNotification && !isCollapsed && (
        <span className="ml-auto h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
      )}
      {hasNotification && isCollapsed && (
        <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-primary-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
      )}
      {isCollapsed && (
        <div className="absolute left-full top-1/2 z-20 ml-4 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-100 dark:bg-zinc-900 px-2 py-1.5 text-xs font-medium text-zinc-900 dark:text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
          {text}
        </div>
      )}
    </NavLink>
  );
};

const SidebarContent = ({ navItems }: { navItems: NavItem[] }) => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const isCollapsed = !isSidebarOpen;
  const title = "Menu";
  const handleLinkClick = () => {
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }
  };
  return (
    <aside
      className={`flex flex-col flex-shrink-0 h-full bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 transition-all duration-300 ease-in-out overflow-y-auto ${
        isSidebarOpen ? "w-64" : "w-[70px]"
      }`}
    >
      <div
        className={`p-4 flex items-center h-14 border-b border-gray-100 dark:border-zinc-800 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            {title}
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 hidden md:block"
        >
          <ChevronLeft
            className={`h-5 w-5 text-gray-500 dark:text-zinc-400 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      <nav className="flex-grow space-y-1.5 px-3 py-4">
        {navItems.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            isCollapsed={isCollapsed}
            onClick={handleLinkClick}
          />
        ))}
      </nav>
    </aside>
  );
};

const Sidebar = ({ navItems }: { navItems: NavItem[] }) => {
  const { setSidebarOpen } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);

  const hasNewQuiz = useNotificationStore((state) => state.hasNewQuiz());
  const hasNewGeneric = useNotificationStore((state) => state.hasNewGeneric());
  const incrementCount = useNotificationStore((state) => state.incrementCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  useEffect(() => {
    if (!socket || !user || user.role !== "CANDIDATE") return;
    const handleNewQuiz = (notification: Notification) => {
      incrementCount("NEW_QUIZ");
      toast.custom(
        (t) => (
          <InteractiveToast
            t={t}
            Icon={FileQuestion}
            iconColorClass="text-primary-500"
            title="Assessment Update"
            message={notification.message}
            link={notification.link || "#"}
            navigate={navigate}
          />
        ),
        { duration: 6000 }
      );
    };
    
    socket.on("new_quiz_notification", handleNewQuiz);
    return () => {
      socket.off("new_quiz_notification", handleNewQuiz);
    };
  }, [socket, user, incrementCount, navigate]);

  useEffect(() => {
    if (
      location.pathname.startsWith("/dashboard/candidate/assessments") &&
      hasNewQuiz
    ) {
      markAsRead("NEW_QUIZ");
    }
    if (
      location.pathname.startsWith("/dashboard/candidate/applications") &&
      hasNewGeneric
    ) {
      markAsRead("GENERIC");
    }
  }, [location.pathname, hasNewQuiz, hasNewGeneric, markAsRead]);

  const navItemsWithNotif = navItems.map((item) => {
    // Only apply notifications for candidate paths
    if (item.to === "/dashboard/candidate/assessments") {
      return { ...item, hasNotification: hasNewQuiz };
    }
    if (item.to === "/dashboard/candidate/applications") {
      return { ...item, hasNotification: hasNewGeneric };
    }
    return item;
  });

  useEffect(() => {
    const stored = localStorage.getItem("sidebarOpen");
    if (stored !== null) {
      setSidebarOpen(stored === "true");
    }
    const shouldCollapseForInbox = location.pathname.startsWith("/inbox");
    if (shouldCollapseForInbox) {
      setSidebarOpen(false);
    }
    const handleResize = () => {
      const mediaQuery = window.matchMedia("(min-width: 768px)");
      if (!mediaQuery.matches) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname, setSidebarOpen]);

  return (
    <div className="hidden md:block">
      <SidebarContent navItems={navItemsWithNotif} />
    </div>
  );
};

export default Sidebar;