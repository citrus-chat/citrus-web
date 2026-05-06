import type { RouteRecordRaw } from "vue-router";

import { adminRoutes } from "@/features/admin/router/admin.routes";
import { chatRoutes } from "@/features/chat/router/chat.routes";

export const routes: RouteRecordRaw[] = [...chatRoutes, ...adminRoutes];
