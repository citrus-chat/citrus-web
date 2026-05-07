import type { RouteRecordRaw } from "vue-router";

export const authRoutes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: () => import("@/app/layouts/AuthLayout.vue"),
    children: [
      {
        path: "validate-account",
        name: "validate-account",
        component: () =>
          import("@/features/auth/validate-account/presentation/pages/ValidateUserAccountPage.vue"),
      },
    ],
  },
];
