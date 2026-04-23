import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { ThemeContext } from "./ThemeContextInstance";

export const ThemeProvider = ({ children }) => {
  // Check local storage so the app remembers the user's choice on refresh
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

useEffect(() => {
    // We use globalThis instead of window to satisfy the linter
    const root = globalThis.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};