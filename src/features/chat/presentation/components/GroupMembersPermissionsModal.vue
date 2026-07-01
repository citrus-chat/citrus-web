<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import avatarProfile from "@/shared/assets/avatar-profile.svg";
import type { IChatParticipant } from "../../domain/IChatParticipant";
import type { IChatPermission } from "../../domain/IChatPermission";
import type { IChatRole } from "../../domain/IChatRole";
import type { IChatRoom } from "../../domain/IChatRoom";
import type { WorkspaceUser } from "../../domain/WorkspaceUser";
import { useChatStore } from "../../store/ChatStore";
import ChatRolesManager from "./ChatRolesManager.vue";
import EditParticipantRolesModal from "./EditParticipantRolesModal.vue";
import {
  CAN_MODIFY_ROLE,
  canAssignParticipantRoles,
  canManageGroupRoles,
  isActiveParticipant,
  isGroupChat,
  permissionDeniedMessage,
} from "../../utils/groupPermissions";

const props = defineProps<{
  show: boolean;
  chatRoom: IChatRoom | null;
  currentUserId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const {
  findWorkspaceUserById,
  loadParticipantPermissions,
  participantPermissionsById,
  participantPermissionsLoadingById,
  participantPermissionsErrorById,
  participantRolesSavingById,
  participantRolesErrorById,
  chatRolesByChatRoomId,
  chatRolesLoadingByChatRoomId,
  chatRolesErrorByChatRoomId,
  updateParticipantRoles,
  loadChatRoles,
} = useChatStore();

type ActiveTab = "members" | "roles";

const visible = ref(props.show);
const activeTab = ref<ActiveTab>("members");
const canManageMembers = ref(false);
const isLoadingPermissions = ref(false);
const participantUsersById = ref<Record<string, WorkspaceUser | null>>({});
const editRolesParticipant = ref<IChatParticipant | null>(null);
const isEditRolesModalOpen = ref(false);
const successMessage = ref("");
const currentUserPermissions = ref<IChatPermission[]>([]);
const loadedModalKey = ref<string | null>(null);
const loadingModalKey = ref<string | null>(null);

let loadRun = 0;

// TODO frontend/backend contract: el selector de roles necesita catálogo de roles del grupo.
// El OpenAPI muestra roles en CreateChatRoomResponse, pero ChatRoomResponse de sync puede no exponerlos.
// Si sync no devuelve roles en runtime, pedir endpoint o extender sync para incluir roles.
const missingRoleCatalogMessage =
  "No se pudo cargar el catálogo de roles del grupo.";

const participants = computed(() => props.chatRoom?.participants ?? []);

const activeParticipants = computed(() =>
  participants.value.filter((participant) => isActiveParticipant(participant)),
);

const availableRoles = computed<IChatRole[]>(() => {
  const chatRoomId = props.chatRoom?.id;
  const storeRoles = chatRoomId
    ? (chatRolesByChatRoomId.value[chatRoomId] ?? [])
    : [];
  const roles = storeRoles.length
    ? storeRoles
    : Object.values(props.chatRoom?.roles ?? {});

  return [...roles].sort((a, b) => a.priority - b.priority);
});

const rolesLoading = computed(() =>
  Boolean(
    props.chatRoom && chatRolesLoadingByChatRoomId.value[props.chatRoom.id],
  ),
);

const roleLoadError = computed(() =>
  props.chatRoom
    ? (chatRolesErrorByChatRoomId.value[props.chatRoom.id] ?? null)
    : null,
);

const roleById = computed(
  () => new Map(availableRoles.value.map((role) => [role.id, role])),
);

const hasRoleCatalog = computed(() => availableRoles.value.length > 0);

const currentUserParticipant = computed(
  () =>
    participants.value.find(
      (participant) => participant.userId === props.currentUserId,
    ) ?? null,
);

const closeModal = () => {
  visible.value = false;
};

const showMembersTab = () => {
  activeTab.value = "members";
};

const showRolesTab = () => {
  activeTab.value = "roles";
};

const shortId = (value: string) =>
  value.length <= 16 ? value : `${value.slice(0, 8)}...${value.slice(-4)}`;

const participantUser = (participant: IChatParticipant) =>
  participantUsersById.value[participant.userId] ?? null;

const participantName = (participant: IChatParticipant) =>
  participantUser(participant)?.username ?? shortId(participant.userId);

const participantAvatar = (participant: IChatParticipant) =>
  participantUser(participant)?.avatar ?? avatarProfile;

const roleIdsFor = (participant: IChatParticipant) =>
  participant.roleIds.length > 0 ? participant.roleIds : ["Sin roles"];

const roleLabel = (roleId: string) =>
  roleById.value.get(roleId)?.name ?? shortId(roleId);

const permissionsFor = (participant: IChatParticipant): IChatPermission[] =>
  participantPermissionsById.value[participant.id] ?? [];

const isParticipantLoading = (participant: IChatParticipant) =>
  Boolean(participantPermissionsLoadingById.value[participant.id]);

const participantError = (participant: IChatParticipant) =>
  participantPermissionsErrorById.value[participant.id] ?? null;

const participantRolesError = (participant: IChatParticipant) =>
  participantRolesErrorById.value[participant.id] ?? null;

const isParticipantRolesSaving = (participant: IChatParticipant | null) =>
  Boolean(participant && participantRolesSavingById.value[participant.id]);

const canEditRolesForParticipant = (participant: IChatParticipant) =>
  Boolean(
    props.chatRoom &&
    canAssignParticipantRoles({
      chatRoom: props.chatRoom,
      currentUserId: props.currentUserId,
      permissions: currentUserPermissions.value,
    }),
  ) &&
  hasRoleCatalog.value &&
  isActiveParticipant(participant);

const editRolesDisabledReason = (participant: IChatParticipant) => {
  if (
    !props.chatRoom ||
    !canAssignParticipantRoles({
      chatRoom: props.chatRoom,
      currentUserId: props.currentUserId,
      permissions: currentUserPermissions.value,
    })
  ) {
    return "No tenes permisos para asignar roles a participantes.";
  }

  if (!isActiveParticipant(participant)) {
    return "Este participante ya no está activo en el grupo.";
  }

  if (!hasRoleCatalog.value) {
    return missingRoleCatalogMessage;
  }

  return "";
};

async function loadParticipantUsers(chatParticipants: IChatParticipant[]) {
  await Promise.all(
    chatParticipants.map(async (participant) => {
      if (participant.userId in participantUsersById.value) {
        return;
      }

      const user = await findWorkspaceUserById(participant.userId).catch(
        () => null,
      );

      participantUsersById.value = {
        ...participantUsersById.value,
        [participant.userId]: user,
      };
    }),
  );
}

async function loadPermissionsForParticipant(
  chatRoom: IChatRoom,
  participant: IChatParticipant,
) {
  if (!isActiveParticipant(participant)) {
    return [];
  }

  try {
    return await loadParticipantPermissions(chatRoom.id, participant.id);
  } catch {
    return [];
  }
}

async function loadModalData() {
  const chatRoom = props.chatRoom;

  if (!visible.value || !chatRoom || !isGroupChat(chatRoom)) {
    canManageMembers.value = false;
    isLoadingPermissions.value = false;
    currentUserPermissions.value = [];
    return;
  }

  const key = `${chatRoom.id}:${props.currentUserId}`;

  if (loadedModalKey.value === key || loadingModalKey.value === key) {
    return;
  }

  const run = ++loadRun;
  loadingModalKey.value = key;
  isLoadingPermissions.value = true;
  currentUserPermissions.value = [];
  const currentParticipant = currentUserParticipant.value;
  canManageMembers.value =
    isActiveParticipant(currentParticipant) &&
    chatRoom.createdBy === props.currentUserId;
  successMessage.value = "";

  try {
    const rolesPromise = loadChatRoles(chatRoom.id, {
      initialRoles: chatRoom.roles,
    }).catch(() => []);

    await loadParticipantUsers(chatRoom.participants);

    const loadedCurrentUserPermissions = currentParticipant
      ? await loadPermissionsForParticipant(chatRoom, currentParticipant)
      : [];

    if (run !== loadRun) {
      return;
    }

    currentUserPermissions.value = loadedCurrentUserPermissions;
    canManageMembers.value =
      isActiveParticipant(currentParticipant) &&
      (canManageGroupRoles({
        chatRoom,
        currentUserId: props.currentUserId,
        permissions: loadedCurrentUserPermissions,
      }) ||
        canAssignParticipantRoles({
          chatRoom,
          currentUserId: props.currentUserId,
          permissions: loadedCurrentUserPermissions,
        }));

    await rolesPromise;

    if (run !== loadRun) {
      return;
    }

    await Promise.all(
      activeParticipants.value
        .filter((participant) => participant.id !== currentParticipant?.id)
        .map((participant) =>
          loadPermissionsForParticipant(chatRoom, participant),
        ),
    );

    if (run === loadRun) {
      loadedModalKey.value = key;
    }
  } finally {
    if (loadingModalKey.value === key) {
      loadingModalKey.value = null;
    }

    if (run === loadRun) {
      isLoadingPermissions.value = false;
    }
  }
}

const openEditRoles = (participant: IChatParticipant) => {
  if (!canEditRolesForParticipant(participant)) {
    return;
  }

  editRolesParticipant.value = participant;
  isEditRolesModalOpen.value = true;
  successMessage.value = "";
};

const saveParticipantRoles = async (roleIds: string[]) => {
  const participant = editRolesParticipant.value;
  const chatRoom = props.chatRoom;

  if (!participant || !chatRoom) {
    return;
  }

  await updateParticipantRoles({
    chatRoomId: chatRoom.id,
    participantId: participant.id,
    roleIds,
  });

  successMessage.value = "Roles actualizados.";
  isEditRolesModalOpen.value = false;
  editRolesParticipant.value = null;
};

const handleRolesSuccess = (message: string) => {
  loadedModalKey.value = null;
  successMessage.value = message;
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && visible.value) closeModal();
};

watch(
  () => [props.show, props.chatRoom?.id, props.currentUserId] as const,
  ([show]) => {
    visible.value = show;

    if (show) {
      void loadModalData();
    }
  },
  { immediate: true },
);

watch(visible, (newValue) => {
  if (!newValue) emit("close");
});

onMounted(() => window.addEventListener("keydown", onEscape));
onBeforeUnmount(() => window.removeEventListener("keydown", onEscape));
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:p-6"
    >
      <div
        class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        @click="closeModal"
      />

      <section
        class="relative z-10 flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
        @click.stop
      >
        <header
          class="flex items-start justify-between gap-4 border-b border-slate-200/80 p-5 dark:border-white/10 sm:p-6"
        >
          <div class="flex min-w-0 items-start gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 ring-1 ring-blue-300/40 dark:bg-blue-400/15 dark:text-blue-300 dark:ring-blue-300/20"
            >
              <i class="pi pi-users text-lg" />
            </div>

            <div class="min-w-0">
              <h3
                class="text-xl font-semibold text-slate-900 dark:text-slate-50"
              >
                Miembros y permisos
              </h3>
              <p
                class="mt-1 truncate text-sm text-slate-500 dark:text-slate-400"
                :title="chatRoom?.name"
              >
                {{ chatRoom?.name }}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar modal"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
            @click="closeModal"
          >
            <i class="pi pi-times" />
          </button>
        </header>

        <div class="space-y-4 overflow-y-auto p-5 sm:p-6">
          <div
            class="grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100 p-1 text-sm font-medium dark:border-white/10 dark:bg-slate-900"
          >
            <button
              type="button"
              class="rounded-xl px-3 py-2 transition"
              :class="
                activeTab === 'members'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              "
              @click="showMembersTab"
            >
              Miembros
            </button>
            <button
              type="button"
              class="rounded-xl px-3 py-2 transition"
              :class="
                activeTab === 'roles'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              "
              @click="showRolesTab"
            >
              Roles
            </button>
          </div>

          <div
            v-if="activeTab === 'members' && !canManageMembers"
            class="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
          >
            <i class="pi pi-lock mt-0.5" />
            <p>{{ permissionDeniedMessage(CAN_MODIFY_ROLE) }}</p>
          </div>

          <div
            v-if="
              activeTab === 'members' &&
              canManageMembers &&
              !hasRoleCatalog &&
              !rolesLoading &&
              !roleLoadError
            "
            class="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
          >
            <i class="pi pi-info-circle mt-0.5" />
            <p>{{ missingRoleCatalogMessage }}</p>
          </div>

          <div
            v-if="activeTab === 'members' && roleLoadError"
            class="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            <i class="pi pi-exclamation-triangle mt-0.5" />
            <p>{{ roleLoadError }}</p>
          </div>

          <div
            v-if="successMessage"
            class="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
          >
            <i class="pi pi-check-circle mt-0.5" />
            <p>{{ successMessage }}</p>
          </div>

          <div
            v-if="activeTab === 'members' && isLoadingPermissions"
            class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
          >
            <i class="pi pi-spin pi-spinner" />
            Cargando permisos...
          </div>

          <div v-if="activeTab === 'members'" class="space-y-3">
            <article
              v-for="participant in participants"
              :key="participant.id"
              class="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-slate-900/70"
            >
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div class="flex min-w-0 flex-1 items-start gap-3">
                  <img
                    :src="participantAvatar(participant)"
                    :alt="participantName(participant)"
                    class="h-10 w-10 shrink-0 rounded-full object-cover"
                  />

                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h4
                        class="break-all text-sm font-semibold text-slate-900 dark:text-slate-50"
                      >
                        {{ participantName(participant) }}
                      </h4>
                      <span
                        v-if="!isActiveParticipant(participant)"
                        class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Salió del grupo
                      </span>
                    </div>

                    <p
                      class="mt-1 break-all text-xs text-slate-400"
                      :title="participant.userId"
                    >
                      {{ shortId(participant.userId) }}
                    </p>
                  </div>
                </div>

                <button
                  v-if="canManageMembers"
                  type="button"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:text-slate-400 dark:border-white/10 dark:disabled:text-slate-500 sm:w-auto"
                  :class="
                    canEditRolesForParticipant(participant)
                      ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5'
                      : 'text-slate-400 dark:text-slate-500'
                  "
                  :disabled="
                    !canEditRolesForParticipant(participant) ||
                    isParticipantRolesSaving(participant)
                  "
                  :title="editRolesDisabledReason(participant)"
                  @click="openEditRoles(participant)"
                >
                  <i
                    v-if="isParticipantRolesSaving(participant)"
                    class="pi pi-spin pi-spinner text-xs"
                  />
                  <i class="pi pi-pencil text-xs" />
                  Editar roles
                </button>
              </div>

              <div class="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p
                    class="mb-2 text-xs font-semibold uppercase text-slate-400"
                  >
                    Roles
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="roleId in roleIdsFor(participant)"
                      :key="roleId"
                      class="max-w-full break-all rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-400/10 dark:text-orange-200"
                      :title="roleId"
                    >
                      {{ roleLabel(roleId) }}
                    </span>
                  </div>
                  <p
                    v-if="participantRolesError(participant)"
                    class="mt-2 text-sm text-red-600 dark:text-red-300"
                  >
                    {{ participantRolesError(participant) }}
                  </p>
                </div>

                <div>
                  <p
                    class="mb-2 text-xs font-semibold uppercase text-slate-400"
                  >
                    Permisos efectivos
                  </p>

                  <p
                    v-if="!isActiveParticipant(participant)"
                    class="text-sm text-slate-500 dark:text-slate-400"
                  >
                    Este participante ya no está activo en el grupo.
                  </p>

                  <div
                    v-else-if="isParticipantLoading(participant)"
                    class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
                  >
                    <i class="pi pi-spin pi-spinner" />
                    Cargando...
                  </div>

                  <p
                    v-else-if="participantError(participant)"
                    class="text-sm text-red-600 dark:text-red-300"
                  >
                    {{ participantError(participant) }}
                  </p>

                  <div
                    v-else-if="permissionsFor(participant).length > 0"
                    class="flex flex-wrap gap-2"
                  >
                    <span
                      v-for="permission in permissionsFor(participant)"
                      :key="permission.permissionId"
                      class="max-w-full break-all rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-200"
                      :title="permission.description ?? permission.code"
                    >
                      {{ permission.code }}
                    </span>
                  </div>

                  <p v-else class="text-sm text-slate-500 dark:text-slate-400">
                    Sin permisos efectivos.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <ChatRolesManager
            v-else-if="chatRoom"
            :chat-room="chatRoom"
            :current-user-id="currentUserId"
            :current-user-permissions="currentUserPermissions"
            :roles="availableRoles"
            :participants="participants"
            :loading="rolesLoading"
            :error="roleLoadError"
            @success="handleRolesSuccess"
          />
        </div>
      </section>

      <EditParticipantRolesModal
        v-model="isEditRolesModalOpen"
        :participant="editRolesParticipant"
        :available-roles="availableRoles"
        :saving="isParticipantRolesSaving(editRolesParticipant)"
        :error="
          editRolesParticipant
            ? (participantRolesError(editRolesParticipant) ?? null)
            : null
        "
        @save="saveParticipantRoles"
        @close="editRolesParticipant = null"
      />
    </div>
  </transition>
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
