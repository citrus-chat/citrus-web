<script setup lang="ts">
import { computed, ref } from "vue";
import { useChatStore } from "@/features/chat/store/ChatStore";
import type { WorkspaceUser } from "@/features/chat/domain/WorkspaceUser";
import avatarProfile from "@/shared/assets/avatar-profile.svg";

const { selectedProfileUser, closeUserProfile, openDirectMessage } =
  useChatStore();

const copiedEmail = ref(false);

const profile = computed(() => selectedProfileUser.value);

const statusLabel = computed(() => {
  if (!profile.value) return "";

  if (profile.value.status === "online") return "En línea";
  if (profile.value.status === "away") return "Ausente";

  return "Desconectado";
});

const statusClass = computed(() => {
  if (!profile.value) return "";

  if (profile.value.status === "online") {
    return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20";
  }

  if (profile.value.status === "away") {
    return "bg-amber-500/15 text-amber-300 ring-amber-500/20";
  }

  return "bg-slate-500/15 text-slate-300 ring-slate-500/20";
});

const statusDotClass = computed(() => {
  if (!profile.value) return "";

  if (profile.value.status === "online") return "bg-emerald-400";
  if (profile.value.status === "away") return "bg-amber-400";

  return "bg-slate-400";
});

const copyEmail = async () => {
  if (!profile.value) return;

  try {
    await navigator.clipboard.writeText(profile.value.email);
    copiedEmail.value = true;
    window.setTimeout(() => {
      copiedEmail.value = false;
    }, 1200);
  } catch {
    copiedEmail.value = false;
  }
};

const sendMessage = (user: WorkspaceUser) => {
  if (user.isCurrentUser) return;

  openDirectMessage(user);
  closeUserProfile();
};
</script>

<template>
  <aside
    v-if="profile"
    class="flex h-full w-[392px] shrink-0 flex-col border-l border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90"
  >
    <div
      class="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-white/10"
    >
      <div>
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Perfil
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Información del usuario
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100"
        @click="closeUserProfile"
      >
        <i class="pi pi-times" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-5">
      <div
        class="rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:shadow-[0_12px_40px_rgba(0,0,0,0.22)]"
      >
        <div class="flex flex-col items-center text-center">
          <div class="relative">
            <img
              :src="profile.avatar ?? avatarProfile"
              :alt="profile.name"
              class="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-sm dark:ring-slate-950"
            />
            <span
              class="absolute bottom-1 right-1 h-4 w-4 rounded-full ring-4 ring-white dark:ring-slate-950"
              :class="statusDotClass"
            />
          </div>

          <div class="mt-4 space-y-1">
            <h3 class="text-xl font-semibold text-slate-950 dark:text-slate-50">
              {{ profile.name }}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              @{{ profile.username }}
            </p>
          </div>

          <span
            class="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset"
            :class="statusClass"
          >
            <span class="h-2 w-2 rounded-full" :class="statusDotClass" />
            {{ statusLabel }}
          </span>
        </div>

        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            :disabled="profile.isCurrentUser"
            @click="sendMessage(profile)"
          >
            <i class="pi pi-comment" />
            {{ profile.isCurrentUser ? "Este es tu perfil" : "Enviar mensaje" }}
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
            @click="copyEmail"
          >
            <i class="pi" :class="copiedEmail ? 'pi-check' : 'pi-copy'" />
            {{ copiedEmail ? "Copiado" : "Copiar email" }}
          </button>
        </div>

        <div
          class="mt-5 space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300"
        >
          <div class="flex items-start gap-3">
            <i class="pi pi-envelope mt-0.5 text-slate-400" />
            <div>
              <p
                class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
              >
                Email
              </p>
              <p class="font-medium text-slate-900 dark:text-slate-100">
                {{ profile.email }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <i class="pi pi-briefcase mt-0.5 text-slate-400" />
            <div>
              <p
                class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
              >
                Rol
              </p>
              <p class="font-medium text-slate-900 dark:text-slate-100">
                {{ profile.role ?? "Sin rol definido" }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <i class="pi pi-clock mt-0.5 text-slate-400" />
            <div>
              <p
                class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
              >
                Zona horaria
              </p>
              <p class="font-medium text-slate-900 dark:text-slate-100">
                {{ profile.timezone ?? "No disponible" }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <i class="pi pi-phone mt-0.5 text-slate-400" />
            <div>
              <p
                class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
              >
                Teléfono
              </p>
              <p class="font-medium text-slate-900 dark:text-slate-100">
                {{ profile.phoneNumber ?? "No disponible" }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <i class="pi pi-align-left mt-0.5 text-slate-400" />
            <div>
              <p
                class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
              >
                Bio
              </p>
              <p class="font-medium text-slate-900 dark:text-slate-100">
                {{ profile.bio ?? "Sin descripción disponible." }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
