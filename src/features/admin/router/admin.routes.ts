import type { RouteRecordRaw } from "vue-router";

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: () =>
      import("@/features/admin/presentation/layouts/AdminLayout.vue"),
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
        path: "users/register",
        name: "admin-users-register",
        component: () =>
          import("@/features/admin/users/presentation/pages/AdminRegisterUserPage.vue"),
      },
    ],
  },
];
