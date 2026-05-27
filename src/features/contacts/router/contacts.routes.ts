import type { RouteRecordRaw } from "vue-router";

export const contactsRoutes: RouteRecordRaw[] = [
  {
    path: "/contacts",
    component: () => import("@/app/layouts/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "contacts",
        component: () =>
          import("@/features/contacts/presentation/pages/ContactsPage.vue"),
      },
    ],
  },
];
