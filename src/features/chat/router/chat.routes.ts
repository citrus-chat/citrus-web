import type { RouteRecordRaw } from "vue-router";

export const chatRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/app/layouts/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "chat",
        component: () =>
          import("@/features/chat/presentation/pages/ChatPage.vue"),
      },
    ],
  },
];
