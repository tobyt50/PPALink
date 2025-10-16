import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';
import { Button } from './Button';

export const ThemeToggle = () => {
  const { setTheme } = useTheme();

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    setTheme(isCurrentlyDark ? 'light' : 'dark');
  };

  return (
    <Button
      size="icon"
      className="bg-transparent hover:bg-transparent focus:ring-0 border-none shadow-none"
      variant="ghost"
      onClick={toggleTheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};