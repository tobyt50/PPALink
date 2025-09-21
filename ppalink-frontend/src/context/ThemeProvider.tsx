import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

// We will also create a custom hook to easily access the theme state
import { useTheme as useNextTheme } from 'next-themes';

export const useTheme = () => {
    const { theme, setTheme, systemTheme } = useNextTheme();
    return {
        theme: theme,
        setTheme: setTheme,
        isDarkMode: theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    };
};


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}