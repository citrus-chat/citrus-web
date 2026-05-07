import type { RouteRecordRaw } from "vue-router";

import { adminRoutes } from "@/features/admin/router/admin.routes";
import { chatRoutes } from "@/features/chat/router/chat.routes";
import { profileRoutes } from "@/features/profile/presentation/router/profile.routes";
import { authRoutes } from "@/features/auth/router/auth.routes";

export const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...profileRoutes,
  ...chatRoutes,
  ...adminRoutes,
];
