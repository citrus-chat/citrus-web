import type { RouteRecordRaw } from "vue-router";

export const channelsRoutes: RouteRecordRaw[] = [
  {
    path: "/channels",
    component: () => import("@/app/layouts/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "channels",
        component: () =>
          import("@/features/channels/presentation/pages/ChannelPage.vue"),
      },
    ],
  },
];
