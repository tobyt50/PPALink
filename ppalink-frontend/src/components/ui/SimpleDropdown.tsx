import { AnimatePresence, motion } from 'framer-motion';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface Industry {
  id: number;
  name: string;
  isHeading?: boolean;
  order: number;
}

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  children?: React.ReactNode;
  isIndustryDropdown?: boolean;
  industries?: Industry[];
  onSelectIndustry?: (industryId: number | null) => void;
}

// 1. Create a Context to share the `setIsOpen` function.
// This is a cleaner way to allow child components to control the state of the parent.
const DropdownContext = createContext<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// Custom hook for easy access to the context
const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a SimpleDropdown provider');
  }
  return context;
};

export const SimpleDropdown = ({
  trigger,
  children,
  isIndustryDropdown = false,
  industries = [],
  onSelectIndustry,
}: SimpleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDropUp(spaceBelow < menuHeight && spaceAbove > menuHeight);
      
      const timer = setTimeout(() => {
        const searchInput = menuRef.current?.querySelector('input[type="text"]');
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const groupedIndustries = useMemo(() => {
    if (!isIndustryDropdown || industries.length === 0) return [];

    const groups: { heading: Industry; children: Industry[] }[] = [];
    let currentHeading: Industry | null = null;
    const sortedByOrder = [...industries].sort((a, b) => a.order - b.order);

    for (const item of sortedByOrder) {
      if (item.isHeading) {
        currentHeading = item;
        groups.push({ heading: item, children: [] });
      } else if (currentHeading) {
        groups[groups.length - 1].children.push(item);
      }
    }

    groups.sort((a, b) => a.heading.name.localeCompare(b.heading.name));
    groups.forEach((g) => g.children.sort((a, b) => a.name.localeCompare(b.name)));

    return groups;
  }, [industries, isIndustryDropdown]);

  return (
    // 2. Provide the context value to all children.
    <DropdownContext.Provider value={{ setIsOpen }}>
      <div className="relative w-full text-left" ref={dropdownRef}>
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
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className={`origin-top-right absolute right-0 ${
                dropUp ? 'bottom-full mb-2' : 'mt-2'
              } min-w-full w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 p-1`}
            >
              <div
                className={`py-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 ${
                  isIndustryDropdown ? 'max-h-80' : 'max-h-50'
                }`}
                role="menu"
                aria-orientation="vertical"
              >
                {groupedIndustries.length > 0 && isIndustryDropdown
                  ? groupedIndustries.map(({ heading, children: industryChildren }) => (
                      <div key={heading.id}>
                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                          {heading.name}
                        </div>
                        {industryChildren.map((child) => (
                          <SimpleDropdownItem
                            key={child.id}
                            onSelect={() => {
                              onSelectIndustry && onSelectIndustry(child.id);
                              setIsOpen(false);
                            }}
                          >
                            {child.name}
                          </SimpleDropdownItem>
                        ))}
                      </div>
                    ))
                  : children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DropdownContext.Provider>
  );
};

interface SimpleDropdownItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
  // `setIsOpen` is no longer needed as a prop.
}

export const SimpleDropdownItem = ({
  children,
  onSelect,
  className,
}: SimpleDropdownItemProps) => {
  // 3. Consume the context to get the `setIsOpen` function.
  const { setIsOpen } = useDropdown();

  return (
    <a
      href="#"
      className={`flex items-center px-3 py-2 text-sm rounded-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 whitespace-nowrap ${className}`}
      role="menuitem"
      onClick={(e) => {
        e.preventDefault();
        if (onSelect) onSelect();
        setIsOpen(false); // Close the dropdown on any item click.
      }}
    >
      {children}
    </a>
  );
};

