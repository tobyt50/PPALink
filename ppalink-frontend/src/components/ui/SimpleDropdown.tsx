import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const SimpleDropdown = ({ trigger, children }: SimpleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If not enough space below but enough space above → drop up
      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen]);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {/* Wrap trigger in a generic div to handle clicks */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: dropUp ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropUp ? 10 : -10 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className={`origin-top-right absolute right-0 ${
              dropUp ? "bottom-full mb-2" : "mt-2"
            } min-w-full w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 p-1`}
          >
            <div
              className="py-1 max-h-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
              role="menu"
              aria-orientation="vertical"
            >
              {React.Children.map(children, (child) =>
                React.isValidElement(child)
                  ? React.cloneElement(child, { setIsOpen } as any)
                  : child
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SimpleDropdownItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SimpleDropdownItem = ({
  children,
  onSelect,
  className,
  setIsOpen,
}: SimpleDropdownItemProps) => {
  return (
    <a
      href="#"
      className={`flex items-center px-3 py-2 text-sm rounded-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 whitespace-nowrap ${className}`}
      role="menuitem"
      onClick={(e) => {
        e.preventDefault();
        if (onSelect) {
          onSelect();
        }
        if (setIsOpen) {
          setIsOpen(false);
        }
      }}
    >
      {children}
    </a>
  );
};
