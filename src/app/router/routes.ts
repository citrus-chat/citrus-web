import type { RouteRecordRaw } from "vue-router";

import { adminRoutes } from "@/features/admin/router/admin.routes";
import { chatRoutes } from "@/features/chat/router/chat.routes";
import { profileRoutes } from "@/features/profile/router/profile.routes";

export const routes: RouteRecordRaw[] = [
  ...chatRoutes,
  ...adminRoutes,
  ...profileRoutes,
];
