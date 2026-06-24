import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { tokenService } from "@/core/auth/tokenService";
import { checkAdminAccess } from "@/features/admin/application/use-cases/checkAdminAccess";

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global guard: handle auth and admin-only routes
router.beforeEach(async (to) => {
  const isAuthPath = to.path.startsWith("/auth");
  const hasToken = tokenService.hasAccessToken();

  // If user already authenticated and tries to access login, redirect to chat
  if (isAuthPath && hasToken && to.name === "login") {
    return { name: "chat" };
  }

  // Protect all non-/auth routes by default
  if (!isAuthPath && !hasToken) {
    return { name: "login" };
  }

  // If route requires admin, enforce check
  if (to.meta?.requiresAdmin) {
    if (!hasToken) return { name: "login" };

    const isAdmin = await checkAdminAccess();

    if (!isAdmin) {
      return { name: "chat" };
    }
  }

  return true;
});
