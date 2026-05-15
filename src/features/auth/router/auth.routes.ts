import type { RouteRecordRaw } from "vue-router";

export const authRoutes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: () => import("@/app/layouts/AuthLayout.vue"),
    children: [
      {
        path: "login",
        name: "login",
        component: () =>
          import("@/features/auth/login/presentation/pages/LoginPage.vue"),
      },
      {
        path: "validate-account",
        name: "validate-account",
        component: () =>
          import("@/features/auth/validate-account/presentation/pages/ValidateUserAccountPage.vue"),
      },
    ],
  },
];
