<script setup lang="ts">
import { computed, ref } from "vue";

import type { IChatParticipant } from "../../domain/IChatParticipant";
import type { IChatPermission } from "../../domain/IChatPermission";
import type { IChatRole } from "../../domain/IChatRole";
import type { IChatRoom } from "../../domain/IChatRoom";
import type { ICreateChatRoleRequest } from "../../domain/ICreateChatRoleRequest";
import { useChatStore } from "../../store/ChatStore";
import { DEFAULT_CHAT_ROLE_PRIORITY } from "../../utils/chatRolePriority";
import {
  canCreateChatRole,
  canDeleteChatRole,
  canModifyChatRole,
  isActiveParticipant,
} from "../../utils/groupPermissions";
import DeleteChatRoleConfirmModal from "./DeleteChatRoleConfirmModal.vue";
import EditChatRoleModal from "./EditChatRoleModal.vue";

const props = defineProps<{
  chatRoom: IChatRoom;
  currentUserId: string;
  currentUserPermissions: IChatPermission[];
  roles: IChatRole[];
  participants: IChatParticipant[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  success: [message: string];
}>();

const {
  availableChatPermissions,
  availableChatPermissionsLoading,
  availableChatPermissionsError,
  chatRoleSavingById,
  chatRoleDeletingById,
  chatRoleErrorById,
  loadAvailableChatPermissions,
  createRole,
  updateRole,
  deleteRole,
} = useChatStore();

const isRoleModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingRole = ref<IChatRole | null>(null);
const deletingRole = ref<IChatRole | null>(null);

const sortedRoles = computed(() =>
  [...props.roles].sort(
    (a, b) => a.priority - b.priority || a.name.localeCompare(b.name),
  ),
);

const highestRoleId = computed(() => sortedRoles.value[0]?.id ?? null);

const defaultPriority = DEFAULT_CHAT_ROLE_PRIORITY;

const canCreateRoles = computed(() =>
  canCreateChatRole({
    chatRoom: props.chatRoom,
    currentUserId: props.currentUserId,
    currentUserPermissions: props.currentUserPermissions,
  }),
);

const canModifyRoles = computed(() =>
  canModifyChatRole({
    chatRoom: props.chatRoom,
    currentUserId: props.currentUserId,
    currentUserPermissions: props.currentUserPermissions,
  }),
);

const canDeleteRoles = computed(() =>
  canDeleteChatRole({
    chatRoom: props.chatRoom,
    currentUserId: props.currentUserId,
    currentUserPermissions: props.currentUserPermissions,
  }),
);

const createRoleSavingId = computed(() => `new:${props.chatRoom.id}`);

const isCreateSaving = computed(() =>
  Boolean(chatRoleSavingById.value[createRoleSavingId.value]),
);

const roleModalSaving = computed(() =>
  editingRole.value
    ? Boolean(chatRoleSavingById.value[editingRole.value.id])
    : isCreateSaving.value,
);

const roleModalError = computed(() =>
  editingRole.value
    ? (chatRoleErrorById.value[editingRole.value.id] ?? null)
    : (chatRoleErrorById.value[createRoleSavingId.value] ?? null),
);

const deletingRoleCount = computed(() =>
  deletingRole.value ? participantCountForRole(deletingRole.value.id) : 0,
);

const deletingRoleError = computed(() =>
  deletingRole.value
    ? (chatRoleErrorById.value[deletingRole.value.id] ?? null)
    : null,
);

const isDeletingRole = computed(() =>
  deletingRole.value
    ? Boolean(chatRoleDeletingById.value[deletingRole.value.id])
    : false,
);

function participantCountForRole(roleId: string): number {
  return props.participants.filter(
    (participant) =>
      isActiveParticipant(participant) && participant.roleIds.includes(roleId),
  ).length;
}

function openCreateRole() {
  if (!canCreateRoles.value) {
    return;
  }

  editingRole.value = null;
  isRoleModalOpen.value = true;
  void loadAvailableChatPermissions().catch(() => undefined);
}

function openEditRole(role: IChatRole) {
  if (!canModifyRoles.value) {
    return;
  }

  editingRole.value = role;
  isRoleModalOpen.value = true;
  void loadAvailableChatPermissions().catch(() => undefined);
}

function openDeleteRole(role: IChatRole) {
  if (!canDeleteRoles.value) {
    return;
  }

  deletingRole.value = role;
  isDeleteModalOpen.value = true;
}

async function saveRole(payload: ICreateChatRoleRequest) {
  try {
    if (editingRole.value) {
      await updateRole(props.chatRoom.id, editingRole.value.id, payload);
      emit("success", "Rol actualizado.");
    } else {
      await createRole(props.chatRoom.id, payload);
      emit("success", "Rol creado.");
    }

    isRoleModalOpen.value = false;
    editingRole.value = null;
  } catch {
    return;
  }
}

async function confirmDeleteRole(replacementRoleId?: string) {
  if (!deletingRole.value) {
    return;
  }

  try {
    await deleteRole(
      props.chatRoom.id,
      deletingRole.value.id,
      replacementRoleId,
    );
    emit("success", "Rol eliminado.");
    isDeleteModalOpen.value = false;
    deletingRole.value = null;
  } catch {
    return;
  }
}

const closeRoleModal = () => {
  editingRole.value = null;
};

const closeDeleteModal = () => {
  deletingRole.value = null;
};
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h4 class="text-base font-semibold text-slate-900 dark:text-slate-50">
          Roles del grupo
        </h4>
      </div>

      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400 sm:w-auto"
        :disabled="!canCreateRoles || isCreateSaving"
        :title="canCreateRoles ? '' : 'No tenés permisos para crear roles.'"
        @click="openCreateRole"
      >
        <i v-if="isCreateSaving" class="pi pi-spin pi-spinner text-sm" />
        <i v-else class="pi pi-plus text-sm" />
        Crear rol
      </button>
    </div>

    <div
      v-if="error"
      class="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      <i class="pi pi-exclamation-triangle mt-0.5" />
      <p>{{ error }}</p>
    </div>

    <div
      v-if="loading"
      class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
    >
      <i class="pi pi-spin pi-spinner" />
      Cargando roles...
    </div>

    <p
      v-else-if="sortedRoles.length === 0"
      class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
    >
      No hay roles cargados para este grupo.
    </p>

    <div v-else class="space-y-3">
      <article
        v-for="role in sortedRoles"
        :key="role.id"
        class="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-slate-900/70"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h5
                class="break-words text-sm font-semibold text-slate-900 dark:text-slate-50"
              >
                {{ role.name }}
              </h5>
              <span
                v-if="role.id === highestRoleId"
                class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200"
              >
                Rol mas alto
              </span>
            </div>

            <div
              class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <span>Prioridad {{ role.priority }}</span>
              <span aria-hidden="true">•</span>
              <span>
                {{ participantCountForRole(role.id) }}
                {{
                  participantCountForRole(role.id) === 1
                    ? "participante"
                    : "participantes"
                }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 sm:justify-end">
            <button
              v-if="canModifyRoles"
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 dark:disabled:text-slate-500"
              :disabled="Boolean(chatRoleSavingById[role.id])"
              @click="openEditRole(role)"
            >
              <i
                v-if="chatRoleSavingById[role.id]"
                class="pi pi-spin pi-spinner text-xs"
              />
              <i v-else class="pi pi-pencil text-xs" />
              Editar
            </button>

            <button
              v-if="canDeleteRoles"
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/10 dark:disabled:text-red-500/60"
              :disabled="Boolean(chatRoleDeletingById[role.id])"
              @click="openDeleteRole(role)"
            >
              <i
                v-if="chatRoleDeletingById[role.id]"
                class="pi pi-spin pi-spinner text-xs"
              />
              <i v-else class="pi pi-trash text-xs" />
              Eliminar
            </button>
          </div>
        </div>

        <div class="mt-4">
          <p class="mb-2 text-xs font-semibold uppercase text-slate-400">
            Permisos
          </p>
          <div
            v-if="role.chatPermissions.length > 0"
            class="flex flex-wrap gap-2"
          >
            <span
              v-for="permission in role.chatPermissions"
              :key="permission.permissionId"
              class="max-w-full break-all rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-200"
              :title="permission.description ?? permission.code"
            >
              {{ permission.code }}
            </span>
          </div>
          <p v-else class="text-sm text-slate-500 dark:text-slate-400">
            Sin permisos asignados.
          </p>

          <p
            v-if="chatRoleErrorById[role.id]"
            class="mt-2 text-sm text-red-600 dark:text-red-300"
          >
            {{ chatRoleErrorById[role.id] }}
          </p>
        </div>
      </article>
    </div>

    <EditChatRoleModal
      v-model="isRoleModalOpen"
      :role="editingRole"
      :permissions="availableChatPermissions"
      :permissions-loading="availableChatPermissionsLoading"
      :permissions-error="availableChatPermissionsError"
      :saving="roleModalSaving"
      :error="roleModalError"
      :default-priority="defaultPriority"
      @save="saveRole"
      @close="closeRoleModal"
    />

    <DeleteChatRoleConfirmModal
      v-model="isDeleteModalOpen"
      :role="deletingRole"
      :roles="sortedRoles"
      :participant-count="deletingRoleCount"
      :deleting="isDeletingRole"
      :error="deletingRoleError"
      @delete="confirmDeleteRole"
      @close="closeDeleteModal"
    />
  </div>
</template>
