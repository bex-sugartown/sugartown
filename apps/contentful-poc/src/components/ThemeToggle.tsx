"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "st-poc-theme";
const LIGHT = "light-pink-moon light-shop";
const DARK = "dark-pink-moon dark-shop";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>(LIGHT);

  useEffect(() => {
    // Read persisted preference on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === LIGHT || stored === DARK) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  function toggle() {
    const next = theme === LIGHT ? DARK : LIGHT;
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === LIGHT ? "dark" : "light"} mode`}
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 100,
        padding: "0.4rem 0.75rem",
        fontFamily: "var(--st-font-family-ui)",
        fontSize: "var(--st-font-size-label)",
        background: "var(--st-color-bg-surface)",
        color: "var(--st-color-text-primary)",
        border: "1px solid var(--st-color-rule-accent)",
        cursor: "pointer",
      }}
    >
      {theme === LIGHT ? "Dark" : "Light"}
    </button>
  );
}
