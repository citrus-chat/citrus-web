import type { RouteRecordRaw } from "vue-router";

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: () =>
      import("@/features/admin/presentation/layouts/AdminLayout.vue"),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
    children: [
      {
        path: "",
        name: "admin-dashboard",
        component: () =>
          import("@/features/admin/dashboard/presentation/pages/AdminDashboardPage.vue"),
      },
      {
        path: "users",
        name: "admin-users",
        component: () =>
          import("@/features/admin/users/presentation/pages/AdminUsersPage.vue"),
      },
      {
        path: "users/new",
        name: "admin-users-register",
        component: () =>
          import("@/features/admin/users/presentation/pages/AdminRegisterUserPage.vue"),
      },
      {
        path: "users/register",
        redirect: { name: "admin-users-register" },
      },
      {
        path: "reports",
        name: "admin-reports",
        component: () =>
          import("@/features/admin/reports/presentation/pages/AdminReportsPage.vue"),
      },
    ],
  },
];
