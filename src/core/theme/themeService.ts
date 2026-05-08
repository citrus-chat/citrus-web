const STORAGE_KEY = "citrus:theme";

type Theme = "light" | "dark" | "system";

export const themeService = {
  get(): Theme {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "system";
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return "system";
  },

  set(value: Theme) {
    localStorage.setItem(STORAGE_KEY, value);
    apply(value);
  },

  apply(value?: Theme) {
    const t = value ?? this.get();
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = t === "dark" || (t === "system" && prefersDark);
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  },
};

function apply(value: Theme) {
  themeService.apply(value);
}

export default themeService;
