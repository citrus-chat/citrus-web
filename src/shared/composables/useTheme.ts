import { ref, readonly } from "vue";
import themeService from "@/core/theme/themeService";

type Theme = "light" | "dark" | "system";

const theme = ref<Theme>(themeService.get());

function isDarkMode(): boolean {
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return theme.value === "dark" || (theme.value === "system" && prefersDark);
}

export function useTheme() {
  function setTheme(t: Theme) {
    theme.value = t;
    themeService.set(t);
  }

  function toggleTheme() {
    const next = isDarkMode() ? "light" : "dark";
    setTheme(next);
  }

  // initialize
  themeService.apply(theme.value);

  return {
    theme: readonly(theme),
    isDark: isDarkMode,
    setTheme,
    toggleTheme,
  };
}

export default useTheme;
