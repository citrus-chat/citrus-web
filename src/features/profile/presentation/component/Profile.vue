<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";
import "primeicons/primeicons.css";
import avatarProfile from "@/shared/assets/avatar-profile.svg";
import { getCurrentUserUseCase } from "@/features/profile/application/use-cases/getCurrentUserUseCase";
import type {
  ICurrentUserResponse,
  IPersonalData,
  ICorporateData,
} from "@/features/profile/domain/ICurrentUserResponse";
import {
  mockWorkspaceUsers,
  currentWorkspaceUser,
} from "@/features/chat/infrastructure/mock/workspaceUsers";
import OrgChart from "./OrgChart.vue";
import {
  getOrgUsersApi,
  type IOrgUser,
} from "@/features/profile/infrastructure/api/orgApi";
import EditProfileModal from "./EditProfileModal.vue";
import type { ProfileFormData } from "./EditProfileModal.vue";
import { useProfileStore } from "@/features/profile/Store/ProfileStore.ts";
import { useChatStore } from "@/features/chat/store/ChatStore.ts";
import { useMessageStore } from "@/features/messages/store/MessageStore";
import type { IProfileData } from "@/features/profile/domain/IProfileData";
import { uploadAvatarApi } from "@/features/profile/infrastructure/api/avatarApi";
import { env } from "@/core/config/env";

const user = ref<ICurrentUserResponse | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

//Persistir datos
const profileStore = useProfileStore();

const personal = reactive<IPersonalData>({
  description: "",
  privacy: "public",
});
const corporate = reactive<ICorporateData>({
  role: currentWorkspaceUser.role ?? "Sin cargo",
  department: currentWorkspaceUser.department ?? "Sin departamento",
  area: "Desarrollo de Producto",
  hierarchyLevel: "Senior",
  supervisor: (() => {
    const mgr = mockWorkspaceUsers.find(
      (u) => u.id === currentWorkspaceUser.managerId,
    );
    return mgr ? mgr.username : "Sin asignar";
  })(),
});

const isEditOpen = ref(false);
const isOrgOpen = ref(false);
const orgUsers = ref<IOrgUser[]>([]);

// Busca el ID del usuario actual dentro del array de orgUsers (por username).
// Esto garantiza que el focusId coincide con los IDs que maneja OrgChart,
// ya que el ID del ProfileStore puede tener formato distinto al de /users/org.
const orgFocusId = computed(() => {
  if (!user.value || orgUsers.value.length === 0) return "";
  const found = orgUsers.value.find(
    (u) => u.username.toLowerCase() === user.value!.username.toLowerCase(),
  );
  return found?.id ?? "";
});

// El avatar siempre deriva del ProfileStore (fuente de verdad reactiva).
// No se usa un ref local separado para evitar desincronizaciones.
const avatarSrc = computed(() => {
  return profileStore.profile.value?.avatarUrl ?? avatarProfile;
});
// Teléfono del workspace user actual
const phone = currentWorkspaceUser.phoneNumber ?? "";

// form es la fuente de verdad que se pasa al modal y se actualiza con cada save
const form = reactive<ProfileFormData>({
  username: "",
  email: "",
  phone,
  avatarUrl: null,
  description: "",
  privacy: "public",
  privacySettings: {
    showPhone: true,
    showEmail: true,
    showStatus: true,
    showDescription: true,
    allowGroupInvites: true,
  },
});

const handleSave = async (payload: ProfileFormData) => {
  if (!user.value) return;

  // 1. Preview inmediato: escribir el base64 al store ANTES del upload para
  //    que avatarSrc (que deriva del store) muestre la imagen de inmediato
  //    sin esperar la respuesta del servidor.
  if (payload.avatarFile && payload.avatarUrl) {
    profileStore.setProfile({
      ...profileStore.profile.value!,
      avatarUrl: payload.avatarUrl,
    });
    form.avatarUrl = payload.avatarUrl;
  }

  // 2. Subir la imagen al servidor y obtener la URL persistida.
  let resolvedAvatarUrl: string | null = payload.avatarUrl;

  if (payload.avatarFile) {
    try {
      const avatarResult = await uploadAvatarApi(payload.avatarFile);

      if (avatarResult.avatar_url) {
        const serverOrigin = new URL(env.apiUrl).origin;
        resolvedAvatarUrl = `${serverOrigin}${avatarResult.avatar_url}`;
      }
    } catch (err) {
      console.error("Error al subir el avatar:", err);
      // En caso de error mantener el preview base64 que ya se seteó en el store
      resolvedAvatarUrl = profileStore.profile.value?.avatarUrl ?? null;
    }
  }

  const updatedProfile: IProfileData = {
    userId: user.value.userId,
    email: user.value.email,
    username: payload.username,
    avatarUrl: resolvedAvatarUrl,
    description: payload.description,
    privacy: payload.privacy,
    privacySettings: { ...payload.privacySettings },
  };

  // 3. Persistir en IndexedDB + API — saveProfile actualiza profile.value,
  //    lo que propaga el avatar al ChatStore (sidebar/header) automáticamente.
  await profileStore.saveProfile(updatedProfile);

  // 4. Forzar recarga de chats y mensajes para que las UIs dependientes
  // hagan re-query a sus fuentes y muestren el avatar actualizado.
  try {
    const chatStore = useChatStore();
    const messageStore = useMessageStore();
    await chatStore.loadChats();
    if (chatStore.selectedChat.value?.id) {
      await messageStore.loadMessages(chatStore.selectedChat.value.id);
    }
  } catch (err) {
    // No crítico — si algo falla, la UI seguirá mostrando el preview del perfil
    console.warn("No se pudieron recargar chats/mensajes:", err);
  }

  // 4. Actualizar el resto del estado de la UI
  user.value.username = payload.username;
  personal.description = payload.description;
  personal.privacy = payload.privacy;

  form.username = payload.username;
  form.email = payload.email;
  form.description = payload.description;
  form.privacy = payload.privacy;
  form.avatarUrl = resolvedAvatarUrl;
  Object.assign(form.privacySettings, payload.privacySettings);
};

onMounted(async () => {
  try {
    const backendUser = await getCurrentUserUseCase();
    user.value = backendUser;

    // Initialize base profile if store is empty
    if (!profileStore.profile.value) {
      profileStore.setProfile({
        userId: backendUser.userId,
        email: backendUser.email,
        username: backendUser.username,
        avatarUrl: null,
        description: "",
        privacy: "public",
        privacySettings: {
          showPhone: true,
          showEmail: true,
          showStatus: true,
          showDescription: true,
          allowGroupInvites: true,
        },
      });
    }

    // Load from IndexedDB cache then sync from API
    await profileStore.loadProfile();

    // Cargar el árbol del organigrama desde el back
    orgUsers.value = await getOrgUsersApi();

    const p = profileStore.profile.value!;
    form.username = p.username || backendUser.username;
    form.email = p.email || backendUser.email;
    form.description = p.description;
    form.privacy = p.privacy;
    form.avatarUrl = p.avatarUrl;
    Object.assign(form.privacySettings, p.privacySettings);

    personal.description = p.description;
    personal.privacy = p.privacy;
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    error.value = "No se pudo cargar el perfil.";
  } finally {
    isLoading.value = false;
  }
});

// ── Copy helpers ─────────────────────────────────────────────────────────────
const copiedPhone = ref(false);
const copiedEmail = ref(false);

async function copyPhone() {
  if (!phone) return;

  await navigator.clipboard.writeText(phone);
  copiedPhone.value = true;

  setTimeout(() => {
    copiedPhone.value = false;
  }, 1500);
}

async function copyEmail() {
  const email = user.value?.email;
  if (!email) return;

  await navigator.clipboard.writeText(email);
  copiedEmail.value = true;

  setTimeout(() => {
    copiedEmail.value = false;
  }, 1500);
}

const openEdit = () => {
  if (!user.value) return;
  form.username = user.value.username;
  form.email = user.value.email;
  form.description = personal.description;
  form.privacy = personal.privacy;
  isEditOpen.value = true;
};

const privacyLabel: Record<IPersonalData["privacy"], string> = {
  public: "Público",
  contacts: "Solo contactos",
  private: "Privado",
};
</script>

<template>
  <div
    class="flex flex-1 min-h-0 overflow-y-auto items-start justify-center px-6 py-10"
  >
    <div
      v-if="isLoading"
      class="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500"
    >
      <i class="pi pi-spin pi-spinner text-3xl" />
      <p class="text-sm">Cargando perfil...</p>
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center gap-3 text-red-500"
    >
      <i class="pi pi-exclamation-circle text-3xl" />
      <p class="text-sm">
        {{ error }}
      </p>
    </div>

    <div v-else-if="user" class="w-full max-w-3xl space-y-5">
      <!-- Header -->
      <div
        class="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/40"
      >
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <div class="relative shrink-0">
            <img
              :src="avatarSrc"
              alt="Avatar"
              class="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-sm dark:ring-slate-950"
            />
            <span
              class="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950"
            />
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {{ user.username }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              @{{ user.username }}
            </p>
            <span
              class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />En línea
            </span>
          </div>
          <button
            type="button"
            class="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
            @click="openEdit"
          >
            <i class="pi pi-pencil" />Editar perfil
          </button>
        </div>
      </div>

      <!-- Two columns -->
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
                      form.privacySettings.showPhone
                        ? 'text-emerald-500'
                        : 'text-slate-400'
                    "
                  >
                    <i
                      class="pi text-[9px]"
                      :class="
                        form.privacySettings.showPhone
                          ? 'pi-eye'
                          : 'pi-eye-slash'
                      "
                    />
                    {{ form.privacySettings.showPhone ? "Visible" : "Oculto" }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                  <p class="font-medium text-slate-900 dark:text-slate-100">
                    {{ phone || "No configurado" }}
                  </p>
                  <button
                    v-if="phone"
                    type="button"
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition"
                    :class="
                      copiedPhone
                        ? 'text-emerald-500'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    "
                    :title="copiedPhone ? 'Copiado' : 'Copiar teléfono'"
                    @click="copyPhone"
                  >
                    <i
                      class="pi text-xs"
                      :class="copiedPhone ? 'pi-check' : 'pi-copy'"
                    />
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-envelope mt-0.5 text-slate-400 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p
                    class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                  >
                    Email corporativo
                  </p>
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                  <p
                    class="font-medium text-slate-900 dark:text-slate-100 truncate"
                  >
                    {{ user.email }}
                  </p>
                  <button
                    type="button"
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition"
                    :class="
                      copiedEmail
                        ? 'text-emerald-500'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    "
                    :title="copiedEmail ? 'Copiado' : 'Copiar email'"
                    @click="copyEmail"
                  >
                    <i
                      class="pi text-xs"
                      :class="copiedEmail ? 'pi-check' : 'pi-copy'"
                    />
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-at mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Username
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ user.username }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-align-left mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Descripción
                </p>
                <p
                  class="font-medium text-slate-900 dark:text-slate-100 italic"
                  :class="{
                    'text-slate-400 dark:text-slate-500 not-italic':
                      !personal.description,
                  }"
                >
                  {{
                    personal.description ||
                    "Sin descripción. Editá tu perfil para agregar una."
                  }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-lock mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Privacidad
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ privacyLabel[personal.privacy] }}
                </p>
              </div>
            </div>
            <!-- Badges de visibilidad -->
            <div class="flex flex-wrap gap-2">
              <div
                v-for="badge in [
                  { key: 'showEmail', label: 'Correo' },
                  { key: 'showStatus', label: 'Estado' },
                  { key: 'showDescription', label: 'Descripción' },
                ]"
                :key="badge.key"
                class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                :class="
                  form.privacySettings[
                    badge.key as keyof typeof form.privacySettings
                  ]
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-500/10 text-slate-500'
                "
              >
                <i
                  class="pi"
                  :class="
                    form.privacySettings[
                      badge.key as keyof typeof form.privacySettings
                    ]
                      ? 'pi-eye'
                      : 'pi-eye-slash'
                  "
                />
                {{ badge.label }}
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
                    {{ corporate.role }}
                  </p>
                  <button
                    type="button"
                    class="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-600 transition hover:bg-sky-500/20 active:scale-95 dark:bg-sky-500/15 dark:text-sky-400 dark:hover:bg-sky-500/25"
                    @click="isOrgOpen = true"
                  >
                    <i class="pi pi-sitemap text-[10px]" />Ver organigrama
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-sitemap mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Departamento
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ corporate.department }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-objects-column mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Área
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ corporate.area }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-chart-bar mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Nivel jerárquico
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ corporate.hierarchyLevel }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-user-plus mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-0.5"
                >
                  Jefe encargado
                </p>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ corporate.supervisor }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        v-model:visible="isEditOpen"
        :form="form"
        @save="handleSave"
      />
    </div>
  </div>

  <OrgChart
    :users="[]"
    :org-users="orgUsers"
    :focus-id="orgFocusId"
    :current-user-id="profileStore.profile.value?.userId ?? ''"
    :is-open="isOrgOpen"
    @close="isOrgOpen = false"
  />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
