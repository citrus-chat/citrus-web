<script setup lang="ts">
import { defineAsyncComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  useChatStore,
  type WorkspaceUser,
} from "@/features/chat/store/ChatStore";
import "primeicons/primeicons.css";

const ThemeToggle = defineAsyncComponent(
  () => import("@/shared/ui/ThemeToggle.vue"),
);

const router = useRouter();
const { openDirectMessage, workspaceUsers, chats } = useChatStore();

const goProfile = () => router.push("/profile");

const searchQuery = ref("");
const isSearchOpen = ref(false);

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return [];

  return workspaceUsers.value.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query),
  );
});

const filteredChats = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return [];

  return chats.value.filter((chat) => chat.name.toLowerCase().includes(query));
});

const handleUserClick = (user: WorkspaceUser) => {
  openDirectMessage(user);
  searchQuery.value = "";
  isSearchOpen.value = false;
};

const hasResults = computed(
  () => filteredUsers.value.length > 0 || filteredChats.value.length > 0,
);
</script>

<template>
  <header class="sticky top-0 z-20 px-4 pt-4">
    <div
      class="mx-auto flex max-w-400 items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:shadow-none"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <div class="flex items-center w-full max-w-2xl relative">
          <i
            class="pi pi-search absolute left-3 text-slate-400 pointer-events-none"
          />

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar chats, mensajes o usuarios..."
            class="w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
            @focus="isSearchOpen = true"
            @input="isSearchOpen = searchQuery.length > 0"
            @blur="
              setTimeout(() => {
                isSearchOpen = false;
              }, 200)
            "
          />

          <!-- Dropdown Results -->
          <div
            v-if="isSearchOpen && searchQuery.length > 0"
            class="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/95 z-50 max-h-96 overflow-y-auto"
          >
            <!-- No results -->
            <div
              v-if="!hasResults"
              class="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
            >
              No se encontraron resultados
            </div>

            <!-- Users section -->
            <div v-if="filteredUsers.length > 0">
              <div
                class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10"
              >
                Usuarios del workspace
              </div>
              <button
                v-for="user in filteredUsers"
                :key="user.id"
                type="button"
                class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-900/50 transition"
                @click="handleUserClick(user)"
              >
                <div class="relative flex-shrink-0">
                  <div
                    class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-semibold text-white"
                  >
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <span
                    class="absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-white dark:ring-slate-950"
                    :class="{
                      'bg-green-500': user.status === 'online',
                      'bg-yellow-500': user.status === 'away',
                      'bg-gray-400': user.status === 'offline',
                    }"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p
                    class="text-sm font-medium text-slate-900 dark:text-slate-100"
                  >
                    {{ user.name }}
                  </p>
                  <p
                    class="text-xs text-slate-500 dark:text-slate-400 truncate"
                  >
                    @{{ user.username }} · {{ user.email }}
                  </p>
                </div>
                <span
                  class="text-xs px-2 py-1 rounded-full flex-shrink-0"
                  :class="{
                    'bg-green-500/20 text-green-700 dark:bg-green-500/20 dark:text-green-300':
                      user.status === 'online',
                    'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300':
                      user.status === 'away',
                    'bg-gray-200/50 text-gray-600 dark:bg-gray-600/20 dark:text-gray-400':
                      user.status === 'offline',
                  }"
                >
                  {{
                    user.status === "online"
                      ? "En línea"
                      : user.status === "away"
                        ? "Ausente"
                        : "Desconectado"
                  }}
                </span>
              </button>
            </div>

            <!-- Chats section -->
            <div v-if="filteredChats.length > 0">
              <div
                class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10"
                :class="{ 'border-t': filteredUsers.length > 0 }"
              >
                Chats existentes
              </div>
              <button
                v-for="chat in filteredChats"
                :key="chat.id"
                type="button"
                class="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-900/50 transition text-sm text-slate-700 dark:text-slate-300"
                @click="
                  () => {
                    $emit('selectChat', chat.name);
                    searchQuery = '';
                    isSearchOpen = false;
                  }
                "
              >
                <i
                  class="pi text-slate-400 flex-shrink-0"
                  :class="[chat.type === 'direct' ? 'pi-user' : 'pi-hashtag']"
                />
                <span>{{ chat.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100"
        >
          <i class="pi pi-bell text-lg" />
        </button>

        <ThemeToggle />

        <button
          class="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-2 py-1 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/5"
          @click="goProfile"
        >
          <img
            src="@/shared/assets/avatar-profile.svg"
            alt="Avatar"
            class="h-8 w-8 rounded-full object-cover"
          />
        </button>
      </div>
    </div>
  </header>
</template>
