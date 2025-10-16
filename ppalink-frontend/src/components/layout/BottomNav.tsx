import { NavLink } from "react-router-dom";
import { useNotificationStore } from "../../context/NotificationStore";
import type { NavItem } from "./Sidebar";

const BottomNavLink = ({
  to,
  icon: Icon,
  text,
  end,
  hasNotification,
}: NavItem & { end?: boolean; hasNotification?: boolean }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex flex-col items-center flex-1 py-2 min-h-[60px] transition-colors duration-200 group ${
          isActive
            ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
            : "text-gray-600 dark:text-zinc-300"
        }`
      }
    >
      <div className="relative p-1.5 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-zinc-800">
        <Icon className="h-5 w-5 flex-shrink-0" />
        {hasNotification && (
          <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
        )}
      </div>
      <span className="text-xs font-medium truncate mt-0.5">{text}</span>
    </NavLink>
  );
};

const BottomNav = ({ navItems }: { navItems: NavItem[] }) => {
  const hasNewQuiz = useNotificationStore((state) => state.hasNewQuiz());
  const hasNewGeneric = useNotificationStore((state) => state.hasNewGeneric());

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-zinc-900 rounded-t-[2rem] overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 dark:via-primary-400/30 to-transparent" />
      <nav className="flex h-16 px-4">
        {navItemsWithNotif.map((item) => (
          <BottomNavLink key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
