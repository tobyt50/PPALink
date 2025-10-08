// SimpleDropdown.tsx
import { AnimatePresence, motion } from 'framer-motion';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

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
  multiselect?: boolean;
}

// Context to allow child items to close the dropdown
const DropdownContext = createContext<{
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  multiselect: boolean;
} | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('useDropdown must be used within a SimpleDropdown provider');
  return context;
};

export const SimpleDropdown = ({
  trigger,
  children,
  isIndustryDropdown = false,
  industries = [],
  onSelectIndustry,
  multiselect = false,
}: SimpleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [animationY, setAnimationY] = useState(-10);
  const [menuPositionStyle, setMenuPositionStyle] = useState<CSSProperties>({
    left: '-9999px',
    top: '0px',
    visibility: 'hidden',
  });

  // Reset styles when portal unmounts
  useEffect(() => {
    if (!isOpen) {
      setMenuPositionStyle({
        left: '-9999px',
        top: '0px',
        visibility: 'hidden',
      });
      setAnimationY(-10);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isVisible &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  // Position and measure the menu
  useEffect(() => {
    if (!isVisible) return;

    const measureAndPosition = () => {
      if (!dropdownRef.current || !menuRef.current) return;

      const triggerRect = dropdownRef.current.getBoundingClientRect();
      const menuElement = menuRef.current;

      // Set minWidth if not already set
      if (!menuElement.style.minWidth) {
        menuElement.style.minWidth = `${triggerRect.width}px`;
        requestAnimationFrame(measureAndPosition);
        return;
      }

      const menuHeight = menuElement.offsetHeight;
      const menuWidth = menuElement.offsetWidth;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const shouldDropUp = spaceBelow < menuHeight && spaceAbove > menuHeight;
      const y = shouldDropUp ? 10 : -10;
      setAnimationY(y);

      const margin = 8;
      const top = shouldDropUp ? triggerRect.top - menuHeight - margin : triggerRect.bottom + margin;
      const left = triggerRect.right - menuWidth;

      setMenuPositionStyle({
        left: `${left}px`,
        top: `${top}px`,
        visibility: 'visible',
      });
    };

    measureAndPosition();
  }, [isVisible]);

  // Optional: auto-focus input in dropdown
  useEffect(() => {
    if (isVisible && menuRef.current) {
      const timer = setTimeout(() => {
        const input = menuRef.current?.querySelector('input[type="text"]');
        if (input) (input as HTMLInputElement).focus();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

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

  const handleToggle = () => {
    if (isVisible) {
      setIsVisible(false);
    } else {
      setIsOpen(true);
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const menuY = animationY;

  return (
    <DropdownContext.Provider value={{ setIsVisible: handleClose, multiselect }}>
      <div className="relative w-full text-left" ref={dropdownRef}>
        <div onClick={handleToggle} className="cursor-pointer">{trigger}</div>

        {isOpen &&
          createPortal(
            <AnimatePresence onExitComplete={() => setIsOpen(false)}>
              {isVisible && (
                <motion.div
                  key="dropdown-menu"
                  ref={menuRef}
                  style={menuPositionStyle}
                  initial={{ opacity: 0, scale: 0.95, y: menuY }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: menuY }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="fixed origin-top-right w-auto rounded-2xl shadow-md dark:shadow-none dark:ring-1 bg-white dark:bg-zinc-900 ring-1 ring-black dark:ring-white/10 ring-opacity-5 focus:outline-none z-50 p-1"
                >
                  <div
                    className={`py-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600 ${
                      isIndustryDropdown ? 'max-h-80' : 'max-h-60'
                    }`}
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {groupedIndustries.length > 0 && isIndustryDropdown
                      ? groupedIndustries.map(({ heading, children: industryChildren }) => (
                          <div key={heading.id}>
                            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">
                              {heading.name}
                            </div>
                            {industryChildren.map((child) => (
                              <SimpleDropdownItem
                                key={child.id}
                                onSelect={() => {
                                  onSelectIndustry && onSelectIndustry(child.id);
                                  handleClose();
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
            </AnimatePresence>,
            document.body
          )}
      </div>
    </DropdownContext.Provider>
  );
};

interface SimpleDropdownItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
}

export const SimpleDropdownItem = ({ children, onSelect, className }: SimpleDropdownItemProps) => {
  const { setIsVisible, multiselect } = useDropdown();

  return (
    <a
      href="#"
      className={`flex items-center px-3 py-2 text-sm rounded-md text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 ${className}`}
      role="menuitem"
      onClick={(e) => {
        e.preventDefault();
        if (onSelect) onSelect();
        if (!multiselect) setIsVisible(false);
      }}
    >
      {children}
    </a>
  );
};