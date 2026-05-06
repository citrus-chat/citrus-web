import type { RouteRecordRaw } from "vue-router";
import AppLayout from "@/app/layouts/AppLayout.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppLayout,
    children: [
      {
        path: "",
        name: "chat",
        component: () =>
          import("@/features/chat/presentation/pages/ChatPage.vue"),
      },
      {
        path: "/profile",
        name: "profile",
        component: () =>
          import("@/features/profile/presentation/pages/ProfilePage.vue"),
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("@/app/layouts/AdminLayout.vue"),
    children: [
      {
        path: "",
        name: "admin-dashboard",
        component: () =>
          import("@/features/admin/presentation/pages/AdminDashboardPage.vue"),
      },
    ],
  },
];
