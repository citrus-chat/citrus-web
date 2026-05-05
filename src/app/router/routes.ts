import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/app/layouts/AppLayout.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'chat',
        component: () => import('@/features/chat/presentation/pages/ChatPage.vue'),
      },
    ],
  },
]