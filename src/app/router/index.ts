import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { tokenService } from "@/core/auth/tokenService";

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global guard: allow /auth routes; require token for others.
router.beforeEach((to, from, next) => {
  const isAuthPath = to.path.startsWith("/auth");
  const hasToken = tokenService.hasAccessToken();

  // If user already authenticated and tries to access login, redirect to chat
  if (isAuthPath && hasToken && to.name === "login") {
    return next({ name: "chat" });
  }

  // Protect all non-/auth routes by default
  if (!isAuthPath && !hasToken) {
    return next({ name: "login" });
  }

  return next();
});
