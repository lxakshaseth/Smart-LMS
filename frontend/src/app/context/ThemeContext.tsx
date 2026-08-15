import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark" | "eye-care";

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "eye-care"; // Default to eye-care warm theme for student visual comfort
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "eye-care");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "eye-care";
      if (prev === "eye-care") return "dark";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

