import { writable } from "svelte/store";
import { browser } from "$app/environment";

export const sidebarOpen = writable(false);

const getInitialTheme = () => {
  if (!browser) return "light";
  const saved = localStorage.getItem("theme");
  if (saved) return saved;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

export const theme = writable(getInitialTheme());

if (browser) {
  theme.subscribe((val) => {
    const root = document.documentElement;

    // ✨ Fix: always clear and reapply correctly
    if (val === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", val);
  });
}
