"use client";

import { useTheme } from "./ThemeProvider";
import { FaSun, FaMoon } from "react-icons/fa";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="topbar-icon-btn"
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? <FaMoon style={{ fontSize: 14 }} /> : <FaSun style={{ fontSize: 14 }} />}
    </button>
  );
}

