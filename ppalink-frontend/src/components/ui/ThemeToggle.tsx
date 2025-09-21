import { Moon, Sun, Monitor } from 'lucide-react';
import { SimpleDropdown, SimpleDropdownItem } from './SimpleDropdown';
import { useTheme } from '../../context/ThemeProvider';
import { Button } from './Button';

export const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <SimpleDropdown
      trigger={
        <Button
          size="icon"
          className="bg-transparent hover:bg-transparent focus:ring-0 border-none shadow-none"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      }
    >
      <SimpleDropdownItem onSelect={() => setTheme('light')}>
        <Sun className="mr-2 h-4 w-4" /> Light
      </SimpleDropdownItem>
      <SimpleDropdownItem onSelect={() => setTheme('dark')}>
        <Moon className="mr-2 h-4 w-4" /> Dark
      </SimpleDropdownItem>
      <SimpleDropdownItem onSelect={() => setTheme('system')}>
        <Monitor className="mr-2 h-4 w-4" /> System
      </SimpleDropdownItem>
    </SimpleDropdown>
  );
};
