<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import "primeicons/primeicons.css";
import avatarProfile from "@/shared/assets/avatar-profile.svg";
import OrgChart from "@/features/profile/presentation/component/OrgChart.vue";
import { useChatStore } from "@/features/chat/store/ChatStore";
import { useProfileStore } from "@/features/profile/Store/ProfileStore";
import {
  getPublicUserProfileApi,
  toAbsoluteAvatarUrl,
  type IPublicUserProfile,
} from "@/features/profile/infrastructure/api/publicProfileApi";
import { useUserStore } from "@/features/chat/store/UserStore";
import {
  getOrgUsersApi,
  type IOrgUser,
} from "@/features/profile/infrastructure/api/orgApi";

const route = useRoute();
const router = useRouter();
const { openDirectMessage } = useChatStore();
const { users, loadUsers } = useUserStore();

// ── Estado ────────────────────────────────────────────────────────────────────
const profile = ref<IPublicUserProfile | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isOrgOpen = ref(false);
const orgUsers = ref<IOrgUser[]>([]);
const orgUser = ref<IOrgUser | null>(null);

// ── Carga del perfil ──────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const userId = route.params.userId as string;
    if (!userId) {
      error.value = "ID de usuario no especificado.";
      return;
    }

    profile.value = await getPublicUserProfileApi(userId);

    try {
      orgUsers.value = await getOrgUsersApi();

      orgUser.value =
        orgUsers.value.find(
          (u) =>
            u.username.toLowerCase() === profile.value!.username.toLowerCase(),
        ) ?? null;
    } catch (err) {
      console.error("Error cargando organigrama:", err);
    }
    console.log("Perfil:", profile.value.username);
    console.log("Org user encontrado:", orgUser.value);
    console.log("Username buscado:", profile.value?.username);
    // Asegurar que los usuarios estén cargados (para el botón de chat)
    if (users.value.length === 0) {
      await loadUsers();
    }
  } catch (err) {
    console.error("Error al cargar perfil de usuario:", err);
    error.value = "No se pudo cargar el perfil de este usuario.";
  } finally {
    isLoading.value = false;
  }
});

// ── Computados ────────────────────────────────────────────────────────────────
const avatarSrc = computed(
  () => toAbsoluteAvatarUrl(profile.value?.avatar_url ?? null) ?? avatarProfile,
);

const statusLabel = computed(() => {
  if (!profile.value?.status) return "Estado oculto";
  if (profile.value.status === "online") return "En línea";
  if (profile.value.status === "away") return "Ausente";
  return "Desconectado";
});

const statusColor = computed(() => {
  if (!profile.value?.status) return "bg-slate-500";
  if (profile.value.status === "online") return "bg-emerald-500";
  if (profile.value.status === "away") return "bg-amber-500";
  return "bg-slate-500";
});

// ── Acciones ──────────────────────────────────────────────────────────────────
function goBack() {
  router.back();
}

function sendMessage() {
  if (!profile.value) return;
  // Construir un WorkspaceUser mínimo para abrir el chat directo
  openDirectMessage({
    id: route.params.userId as string,
    name: profile.value.username,
    username: profile.value.username,
    email: profile.value.email ?? "",
    status: "offline" as const,
    avatar: toAbsoluteAvatarUrl(profile.value.avatar_url) ?? undefined,
  });
  router.push("/chats");
}
//Organigrama
const profileStore = useProfileStore();
const currentUserId = computed(() => profileStore.profile.value?.userId ?? "");

function closeOrgChart() {
  isOrgOpen.value = false;
}
</script>

<template>
  <div
    class="flex flex-1 min-h-0 overflow-y-auto items-start justify-center px-6 py-10"
  >
    <!-- Cargando -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500"
    >
      <i class="pi pi-spin pi-spinner text-3xl" />
      <p class="text-sm">Cargando perfil...</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex flex-col items-center gap-3 text-red-500"
    >
      <i class="pi pi-exclamation-circle text-3xl" />
      <p class="text-sm">
        {{ error }}
      </p>
      <button class="mt-2 text-sm text-sky-500 hover:underline" @click="goBack">
        Volver
      </button>
    </div>

    <!-- Contenido -->
    <div v-else-if="profile" class="w-full max-w-3xl space-y-5">
      <!-- Botón volver -->
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        @click="goBack"
      >
        <i class="pi pi-arrow-left text-xs" /> Volver
      </button>

      <!-- Header -->
      <div
        class="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/40"
      >
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <div class="relative shrink-0">
            <img
              :src="avatarSrc"
              :alt="profile.username"
              class="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-sm dark:ring-slate-950"
            />
            <span
              class="absolute bottom-1 right-1 h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-950"
              :class="profile.status ? statusColor : 'bg-slate-400'"
            />
          </div>

          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {{ profile.username }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              @{{ profile.username }}
            </p>
            <span
              class="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset"
              :class="
                profile.status
                  ? 'bg-emerald-500/15 text-emerald-600 ring-emerald-500/20 dark:text-emerald-300'
                  : 'bg-slate-500/15 text-slate-500 ring-slate-500/20'
              "
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="profile.status ? statusColor : 'bg-slate-400'"
              />
              {{ statusLabel }}
            </span>
          </div>

          <!-- Botón enviar mensaje -->
          <button
            v-if="profile"
            type="button"
            class="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
            @click="sendMessage"
          >
            <i class="pi pi-comment" /> Enviar mensaje
          </button>
        </div>
      </div>

      <!-- Dos columnas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Datos personales -->
        <div
          class="rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/40"
        >
          <div class="flex items-center gap-2 mb-4">
            <div
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 dark:bg-orange-500/20"
            >
              <i class="pi pi-user text-orange-500 text-sm" />
            </div>
            <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Datos personales
            </h2>
          </div>

          <div class="space-y-4 text-sm">
            <!-- Teléfono -->
            <div class="flex items-start gap-3">
              <i class="pi pi-phone mt-0.5 text-slate-400 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p
                    class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                  >
                    Teléfono
                  </p>
                  <span
                    class="inline-flex items-center gap-1 text-[10px]"
                    :class="
                      profile.show_phone ? 'text-emerald-500' : 'text-slate-400'
                    "
                  >
                    <i
                      class="pi text-[9px]"
                      :class="profile.show_phone ? 'pi-eye' : 'pi-eye-slash'"
                    />
                    {{ profile.show_phone ? "Visible" : "Oculto" }}
                  </span>
                </div>
                <p
                  class="font-medium text-slate-900 dark:text-slate-100 mt-0.5"
                  :class="{
                    'text-slate-400 dark:text-slate-500 italic':
                      !profile.phone_number,
                  }"
                >
                  {{ profile.phone_number ?? "No disponible" }}
                </p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-start gap-3">
              <i class="pi pi-envelope mt-0.5 text-slate-400 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p
                    class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                  >
                    Email corporativo
                  </p>
                  <span
                    class="inline-flex items-center gap-1 text-[10px]"
                    :class="
                      profile.show_email ? 'text-emerald-500' : 'text-slate-400'
                    "
                  >
                    <i
                      class="pi text-[9px]"
                      :class="profile.show_email ? 'pi-eye' : 'pi-eye-slash'"
                    />
                    {{ profile.show_email ? "Visible" : "Oculto" }}
                  </span>
                </div>
                <p
                  class="font-medium text-slate-900 dark:text-slate-100 mt-0.5 truncate"
                  :class="{
                    'text-slate-400 dark:text-slate-500 italic': !profile.email,
                  }"
                >
                  {{ profile.email ?? "No disponible" }}
                </p>
              </div>
            </div>

            <!-- Descripción -->
            <div class="flex items-start gap-3">
              <i class="pi pi-align-left mt-0.5 text-slate-400 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <p
                    class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                  >
                    Descripción
                  </p>
                  <span
                    class="inline-flex items-center gap-1 text-[10px]"
                    :class="
                      profile.show_description
                        ? 'text-emerald-500'
                        : 'text-slate-400'
                    "
                  >
                    <i
                      class="pi text-[9px]"
                      :class="
                        profile.show_description ? 'pi-eye' : 'pi-eye-slash'
                      "
                    />
                    {{ profile.show_description ? "Visible" : "Oculta" }}
                  </span>
                </div>
                <p
                  class="font-medium text-slate-900 dark:text-slate-100 italic"
                  :class="{
                    'text-slate-400 dark:text-slate-500 not-italic':
                      !profile.description,
                  }"
                >
                  {{ profile.description ?? "Sin descripción disponible." }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Datos corporativos -->
        <div
          class="rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/40"
        >
          <div class="flex items-center gap-2 mb-4">
            <div
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-500/20"
            >
              <i class="pi pi-building text-sky-500 text-sm" />
            </div>
            <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Datos corporativos
            </h2>
          </div>

          <div class="space-y-4 text-sm">
            <!-- Cargo -->
            <div class="flex items-start gap-3">
              <i class="pi pi-briefcase mt-0.5 text-slate-400 shrink-0" />
              <div class="flex-1 min-w-0">
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Cargo / Posición
                </p>
                <div class="flex items-center justify-between gap-3 mt-0.5">
                  <p
                    class="font-medium text-slate-900 dark:text-slate-100 truncate"
                  >
                    {{ profile.position_name ?? "Sin cargo" }}
                  </p>
                  <button
                    type="button"
                    class="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-600 transition hover:bg-sky-500/20 active:scale-95 dark:bg-sky-500/15 dark:text-sky-400 dark:hover:bg-sky-500/25"
                    @click="isOrgOpen = true"
                  >
                    <i class="pi pi-sitemap text-[10px]" /> Ver organigrama
                  </button>
                </div>
              </div>
            </div>

            <!-- Departamento -->
            <div class="flex items-start gap-3">
              <i class="pi pi-sitemap mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Departamento
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ profile.department ?? "Sin departamento" }}
                </p>
              </div>
            </div>

            <!-- Nivel jerárquico -->
            <div class="flex items-start gap-3">
              <i class="pi pi-chart-bar mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Nivel jerárquico
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{
                    profile.hierarchy_level != null
                      ? `Nivel ${profile.hierarchy_level}`
                      : "Sinnivel"
                  }}
                </p>
              </div>
            </div>

            <!-- Jefe encargado -->
            <div class="flex items-start gap-3">
              <i class="pi pi-user-plus mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Jefe encargado
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ profile.manager_username ?? "Sin jefe asignado" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Organigrama -->
  <OrgChart
    :users="[]"
    :org-users="orgUsers"
    :focus-id="orgUser?.id ?? (route.params.userId as string)"
    :current-user-id="currentUserId"
    :is-open="isOrgOpen"
    @close="closeOrgChart"
  />
</template>
