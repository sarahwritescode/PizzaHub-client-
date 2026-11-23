"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Switches between light and dark. Both icons are always rendered and CSS shows
 * the right one, so the server HTML and the first client render match.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative inline-flex size-10 items-center justify-center rounded-full text-ink outline-none transition-colors hover:bg-crust/60 focus-visible:ring-2 focus-visible:ring-tomato"
    >
      <SunIcon aria-hidden="true" className="size-5 dark:hidden" />
      <MoonIcon aria-hidden="true" className="hidden size-5 dark:block" />
      <span className="sr-only">Toggle light and dark theme</span>
    </button>
  );
}
