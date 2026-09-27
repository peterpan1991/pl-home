"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ThemeMode = "day" | "night";

const STORAGE_KEY = "creative-desk-theme";
const TRANSITION_DURATION = 550;

function readInitialTheme(): ThemeMode {
  if (typeof document === "undefined") return "day";
  const saved = document.documentElement.dataset.theme;
  return saved === "night" ? "night" : "day";
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);
  const [noTransition, setNoTransition] = useState(true);
  const themeRef = useRef<ThemeMode>(theme);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    themeRef.current = theme;
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = themeRef.current === "day" ? "night" : "day";
    window.localStorage.setItem(STORAGE_KEY, next);

    setNoTransition(false);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setTheme(next);

        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          setNoTransition(true);
          timerRef.current = null;
        }, TRANSITION_DURATION);
      });
    });
  }, []);

  return { theme, toggleTheme, noTransition };
}
