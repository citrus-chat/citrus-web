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
    class="h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100"
  >
    <div class="flex h-full bg-[radial-gradient(...)]">
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
