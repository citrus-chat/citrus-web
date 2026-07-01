import type { RouteRecordRaw } from "vue-router";

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: "/profile",
    component: () => import("@/app/layouts/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "profile",
        component: () =>
          import("@/features/profile/presentation/pages/ProfilePage.vue"),
      },
    ],
  },
  {
    path: "/profile/:userId",
    component: () => import("@/app/layouts/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "user-profile",
        component: () =>
          import("@/features/profile/presentation/pages/UserProfilePage.vue"),
      },
    ],
  },
  {
    path: "/organigrama",
    component: () => import("@/app/layouts/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "organigrama",
        component: () =>
          import("@/features/profile/presentation/pages/OrgChartPage.vue"),
      },
    ],
  },
];
