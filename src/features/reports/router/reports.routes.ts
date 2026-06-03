import type { RouteRecordRaw } from "vue-router";

export const reportsRoutes: RouteRecordRaw[] = [
  {
    path: "/reports",
    component: () => import("@/app/layouts/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "reports",
        component: () =>
          import("@/features/reports/presentation/pages/ReportPage.vue"),
      },
    ],
  },
];
