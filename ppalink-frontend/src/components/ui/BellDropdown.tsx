import { AnimatePresence, motion } from 'framer-motion';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface BellDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  widthClass?: string;
  maxHeight?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

interface BellDropdownItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
}

/* ✅ NEW: Context to allow items to close the dropdown */
const DropdownContext = createContext<() => void>(() => {});
export const useBellDropdown = () => useContext(DropdownContext);

export const BellDropdown = ({
  trigger,
  children,
  widthClass = 'w-screen max-w-sm sm:w-96',
  maxHeight = 'max-h-96',
  onOpenChange,
}: BellDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionClass, setPositionClass] = useState('right-0');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    onOpenChange?.(nextState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
          onOpenChange?.(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const menuWidth = menuRef.current.offsetWidth;
      const viewportWidth = window.innerWidth;
      const spaceOnLeft = rect.right;
      const spaceOnRight = viewportWidth - rect.left;

      let newPositionClass = 'right-0';

      if (viewportWidth < 640) {
        newPositionClass = 'left-[35%] -translate-x-[75%]';
      } else {
        if (spaceOnLeft < menuWidth && spaceOnRight > menuWidth) {
          newPositionClass = 'left-0';
        } else {
          newPositionClass = 'right-0';
        }
      }

      setPositionClass(newPositionClass);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={toggleDropdown}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <DropdownContext.Provider value={closeDropdown}>
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`absolute ${positionClass} mt-2 origin-top rounded-2xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${widthClass}`}
            >
              <div
                className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 ${maxHeight} divide-y divide-gray-100 scrollbar-thumb-rounded-full`}
              >
                {children}
              </div>
            </motion.div>
          </DropdownContext.Provider>
        )}
      </AnimatePresence>
    </div>
  );
};

export const BellDropdownItem = ({
  children,
  onSelect,
  className,
}: BellDropdownItemProps) => {
  const closeDropdown = useBellDropdown();
  const handleClick = () => {
    closeDropdown(); // ✅ closes dropdown immediately
    onSelect?.();
  };

  return (
    <button
      type="button"
      className={`group w-full text-left px-4 py-3 text-sm text-gray-700 transition-all hover:bg-gradient-to-r hover:from-primary-50 hover:to-green-50 hover:text-primary-600 ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
