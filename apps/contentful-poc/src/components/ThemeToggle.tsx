"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "st-poc-theme";
const LIGHT = "light-pink-moon light-shop";
const DARK = "dark-pink-moon dark-shop";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>(LIGHT);

  useEffect(() => {
    // Read persisted preference on mount.
    //
    // This genuinely needs an effect rather than a lazy useState initializer: the page is
    // server-rendered, localStorage does not exist on the server, and initializing from it
    // on the client would render a different first tree than the server sent — a hydration
    // mismatch. Setting state after mount is the correct trade for SSR, at the cost of one
    // extra render.
    //
    // The rule is still pointing at something real. Removing the extra render properly means
    // useSyncExternalStore, or a pre-paint inline script that sets data-theme before React
    // boots (which would also fix the brief light-mode flash a returning dark-mode visitor
    // sees today). Both are behavioural changes, out of scope for a lint-recovery pass —
    // tracked separately.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === LIGHT || stored === DARK) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
