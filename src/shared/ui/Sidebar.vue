<script setup lang="ts">
import { defineAsyncComponent, computed } from "vue";
import { useRouter } from "vue-router";

const ThemeToggle = defineAsyncComponent(
  () => import("@/shared/ui/ThemeToggle.vue"),
);

const router = useRouter();
const goProfile = () => router.push("/profile");
const goChats = () => router.push("/");

const items = [
  { icon: "chat", label: "Chats", to: "/" },
  { icon: "users", label: "Contactos", to: "/contacts" },
  { icon: "flag", label: "Reportes", to: "/reports" },
];

const current = computed(() => router.currentRoute.value.path);
</script>

<template>
  <aside
    class="flex h-screen w-72 flex-col border-r border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90"
  >
    <div>
      <div class="flex items-center gap-3 px-4 py-4">
        <button class="-ml-1" @click="goChats">
          <img
            src="@/shared/assets/citrus-chat.png"
            alt="Citrus Chat logo"
            class="h-14 w-14 rounded-full object-cover"
          />
        </button>

        <div>
          <h5 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Citrus Chat
          </h5>
          <button
            class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            @click="goProfile"
          >
            Mi perfil
          </button>
        </div>
      </div>

      <div class="px-3">
        <nav class="space-y-1">
          <RouterLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
            :class="{
              'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-300/60 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20':
                current === item.to,
            }"
          >
            <svg
              v-if="item.icon === 'chat'"
              class="h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.8L3 20l1.2-3.6A7.963 7.963 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'users'"
              class="h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 11a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              class="h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>

            <span class="truncate">{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </div>

    <div class="px-3 pb-4 mt-auto">
      <div class="border-t border-slate-200 pt-3 dark:border-white/10">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <img
              src="@/shared/assets/avatar-profile.svg"
              alt="Me"
              class="h-10 w-10 rounded-full object-cover"
            />
            <div class="text-sm">
              <div class="font-semibold text-slate-900 dark:text-slate-100">
                Usuario
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Online
              </div>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </div>
  </aside>
</template>
