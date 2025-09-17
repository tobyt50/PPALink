import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

interface BellDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  widthClass?: string;
  maxHeight?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export const BellDropdown = ({
  trigger,
  children,
  widthClass = 'w-[calc(40vw-0.8rem)] sm:w-[8rem] md:w-[9.6rem] lg:w-[12.8rem]',
  maxHeight = 'max-h-[4.8rem]',
  onOpenChange,
}: BellDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionClass, setPositionClass] = useState('right-0');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    onOpenChange?.(nextState);
  };

  // Close when clicking outside
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

  // Flip horizontally if overflowing viewport
  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const menuWidth = menuRef.current.offsetWidth;
      const viewportWidth = window.innerWidth;
      const spaceOnLeft = rect.right;
      const spaceOnRight = viewportWidth - rect.left;

      let newPositionClass = 'right-0';

      if (viewportWidth < 640) {
        newPositionClass = 'left-1/2 -translate-x-1/2';
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
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute ${positionClass} mt-2 origin-top rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${widthClass}`}
          >
            <div
              className={`overflow-y-auto ${maxHeight} divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400`}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface BellDropdownItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
}

export const BellDropdownItem = ({
  children,
  onSelect,
  className,
}: BellDropdownItemProps) => {
  return (
    <button
      type="button"
      className={`w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
      onClick={onSelect}
    >
      {children}
    </button>
  );
};