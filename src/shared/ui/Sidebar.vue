<script setup lang="ts">
import { defineAsyncComponent, computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useChatStore } from "@/features/chat/store/ChatStore";
import avatarProfile from "@/shared/assets/avatar-profile.svg";
import "primeicons/primeicons.css";
import { tokenService } from "@/core/auth/tokenService";
import { checkAdminAccess } from "@/features/admin/application/use-cases/checkAdminAccess";
import { useLogout } from "@/shared/composables/useLogout";
import { useProfileStore } from "@/features/profile/Store/ProfileStore";

const ThemeToggle = defineAsyncComponent(
  () => import("@/shared/ui/ThemeToggle.vue"),
);

const router = useRouter();
const { currentUser } = useChatStore();
const { loadProfile } = useProfileStore();
const goChats = () => router.push("/");
const goProfile = () => router.push("/profile");

const items = [
  { icon: "pi-comments", label: "Chats", to: "/" },
  // { icon: "pi-users", label: "Contactos", to: "/contacts" },
  { icon: "pi-flag", label: "Reportes", to: "/reports" },
  { icon: "pi-hashtag", label: "Channels", to: "/channels" },
  { icon: "pi-sitemap", label: "Ver Organigrama", to: "/organigrama" },
];

const current = computed(() => router.currentRoute.value.path);

const isAdmin = ref(false);

onMounted(async () => {
  const token = tokenService.getAccessToken();
  if (!token) return;
  isAdmin.value = await checkAdminAccess();
  loadProfile(currentUser.value.id);
});

const { isLoggingOut, logout } = useLogout();
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
            <i class="pi" :class="item.icon" />

            <span class="truncate">{{ item.label }}</span>
          </RouterLink>

          <RouterLink
            v-if="isAdmin"
            to="/admin"
            class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
          >
            <i class="pi pi-cog" />
            <span class="truncate">Admin</span>
          </RouterLink>
        </nav>
      </div>
    </div>

    <div class="px-3 pb-4 mt-auto">
      <div class="border-t border-slate-200 pt-3 dark:border-white/10">
        <div class="flex items-center justify-between gap-3">
          <button
            type="button"
            class="flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/5"
            @click="goProfile"
          >
            <img
              :src="currentUser.avatar ?? avatarProfile"
              alt="Mi perfil"
              class="h-10 w-10 rounded-full object-cover"
            />
            <div class="min-w-0 text-sm">
              <div class="font-semibold text-slate-900 dark:text-slate-100">
                {{ currentUser.username }}
              </div>
              <div class="truncate text-xs text-slate-500 dark:text-slate-400">
                {{
                  currentUser.status === "online"
                    ? "Online"
                    : currentUser.status === "away"
                      ? "Ausente"
                      : "Offline"
                }}
              </div>
            </div>
          </button>

          <ThemeToggle />
        </div>
        <button
          type="button"
          :disabled="isLoggingOut"
          class="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          @click="logout"
        >
          <i class="pi pi-sign-out text-sm" />
          <span>{{
            isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"
          }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>
