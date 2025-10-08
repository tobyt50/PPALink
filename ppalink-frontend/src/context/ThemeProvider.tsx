import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const THEME_KEY = "ppalink:theme";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem(THEME_KEY) as Theme | null;
      return raw ?? "system";
    } catch {
      return "system";
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // apply theme to <html data-theme="...">
  const applyTheme = useCallback((r: "light" | "dark") => {
  setResolvedTheme(r);
  const root = document.documentElement;
  root.setAttribute("data-theme", r);

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
if (meta) {
  const exactColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--navbar-bg')
    .trim();

  // Always provide a fallback just in case
  meta.content = exactColor || (r === "dark" ? "#111111" : "#f4f4f5");
}
}, []);

  // init from storage + system preference
  useEffect(() => {
    const raw = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial = raw ?? "system";
    setThemeState(initial);

    if (initial === "system") {
      const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(isDark ? "dark" : "light");
    } else {
      applyTheme(initial === "dark" ? "dark" : "light");
    }
  }, [applyTheme]);

  // listen for system changes when theme === system
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (ev: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme(ev.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    if (t === "system") {
      const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(isDark ? "dark" : "light");
    } else {
      applyTheme(t === "dark" ? "dark" : "light");
    }
  }, [applyTheme]);

  const toggle = () => {
  setTheme(theme === "dark" ? "light" : "dark");
};


  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

