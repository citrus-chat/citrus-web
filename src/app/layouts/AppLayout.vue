<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useChatStore } from "@/features/chat/store/ChatStore";

const Sidebar = defineAsyncComponent(() => import("@/shared/ui/Sidebar.vue"));
const Header = defineAsyncComponent(() => import("@/shared/ui/Header.vue"));
const UserProfilePanel = defineAsyncComponent(
  () => import("@/features/chat/presentation/components/UserProfilePanel.vue"),
);

const { isUserProfilePanelOpen } = useChatStore();
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100"
  >
    <div
      class="flex min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1020_100%)]"
    >
      <Sidebar />

      <section class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <div class="flex min-h-0 flex-1 overflow-hidden">
          <main class="flex min-w-0 flex-1 overflow-hidden px-4 pb-4">
            <router-view />
          </main>

          <UserProfilePanel v-if="isUserProfilePanelOpen" />
        </div>
      </section>
    </div>
  </div>
</template>
