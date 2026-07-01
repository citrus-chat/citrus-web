<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";

import type { IChatPermission } from "../../domain/IChatPermission";
import type { IChatRole } from "../../domain/IChatRole";
import type { ICreateChatRoleRequest } from "../../domain/ICreateChatRoleRequest";
import {
  getChatRolePriorityValidationError,
  normalizeChatRolePriority,
} from "../../utils/chatRolePriority";
import {
  CAN_ADD_CHAT_PARTICIPANT,
  CAN_ATTACH_FILE,
  CAN_CREATE_ROLE,
  CAN_DELETE_CHAT,
  CAN_DELETE_MESSAGE,
  CAN_DELETE_ROLE,
  CAN_EDIT_MESSAGE,
  CAN_MODIFY_CHAT,
  CAN_MODIFY_CHAT_PARTICIPANT,
  CAN_MODIFY_ROLE,
  CAN_PING_MESSAGE,
  CAN_REMOVE_CHAT_PARTICIPANT,
  CAN_SEND_MESSAGE,
  CAN_START_CALL,
  CAN_VIEW_MESSAGE,
  normalizeRoleIds,
} from "../../utils/groupPermissions";

const props = defineProps<{
  modelValue: boolean;
  role: IChatRole | null;
  permissions: IChatPermission[];
  permissionsLoading: boolean;
  permissionsError: string | null;
  saving: boolean;
  error: string | null;
  defaultPriority: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
  save: [payload: ICreateChatRoleRequest];
}>();

const permissionGroups: Array<{ name: string; codes: Set<string> }> = [
  {
    name: "Mensajes",
    codes: new Set([
      CAN_SEND_MESSAGE,
      CAN_VIEW_MESSAGE,
      CAN_EDIT_MESSAGE,
      CAN_DELETE_MESSAGE,
      CAN_PING_MESSAGE,
    ]),
  },
  {
    name: "Multimedia / llamadas",
    codes: new Set([CAN_ATTACH_FILE, CAN_START_CALL]),
  },
  {
    name: "Participantes",
    codes: new Set([
      CAN_ADD_CHAT_PARTICIPANT,
      CAN_REMOVE_CHAT_PARTICIPANT,
      CAN_MODIFY_CHAT_PARTICIPANT,
    ]),
  },
  {
    name: "Roles",
    codes: new Set([CAN_CREATE_ROLE, CAN_MODIFY_ROLE, CAN_DELETE_ROLE]),
  },
  {
    name: "Chat",
    codes: new Set([CAN_MODIFY_CHAT, CAN_DELETE_CHAT]),
  },
];

type ChatRoleForm = {
  name: string;
  priority: number | "";
  permissionIds: string[];
};

const form = reactive<ChatRoleForm>({
  name: "",
  priority: 10,
  permissionIds: [],
});
const initialName = ref("");
const initialPriority = ref<number | null>(null);
const initialPermissionIds = ref<string[]>([]);
const validationMessage = ref("");

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const isEditing = computed(() => props.role !== null);

const normalizedPermissionIds = computed(() =>
  normalizeRoleIds(form.permissionIds),
);

const sortedPermissions = computed(() =>
  [...props.permissions].sort((a, b) => a.code.localeCompare(b.code)),
);

const groupedPermissions = computed(() => {
  const usedPermissionIds = new Set<string>();
  const groups = permissionGroups
    .map((group) => {
      const permissions = sortedPermissions.value.filter((permission) =>
        group.codes.has(permission.code.toUpperCase()),
      );

      permissions.forEach((permission) =>
        usedPermissionIds.add(permission.permissionId),
      );

      return {
        name: group.name,
        permissions,
      };
    })
    .filter((group) => group.permissions.length > 0);

  const otherPermissions = sortedPermissions.value.filter(
    (permission) => !usedPermissionIds.has(permission.permissionId),
  );

  return otherPermissions.length > 0
    ? [...groups, { name: "Otros", permissions: otherPermissions }]
    : groups;
});

const hasPermissionChanges = computed(() => {
  const current = [...normalizedPermissionIds.value].sort();
  const initial = [...initialPermissionIds.value].sort();

  if (current.length !== initial.length) {
    return true;
  }

  return current.some((permissionId, index) => permissionId !== initial[index]);
});

const hasChanges = computed(() => {
  if (!isEditing.value) {
    return true;
  }

  return (
    form.name.trim() !== initialName.value ||
    normalizeChatRolePriority(form.priority) !== initialPriority.value ||
    hasPermissionChanges.value
  );
});

const validationError = computed(() => {
  if (!form.name.trim()) {
    return "El nombre es obligatorio.";
  }

  const priorityError = getChatRolePriorityValidationError(form.priority);
  if (priorityError) {
    return priorityError;
  }

  if (normalizedPermissionIds.value.length === 0) {
    return "Seleccioná al menos un permiso.";
  }

  return "";
});

const canSave = computed(
  () =>
    !props.saving &&
    !props.permissionsLoading &&
    !validationError.value &&
    hasChanges.value,
);

const closeModal = () => {
  visible.value = false;
  emit("close");
};

const togglePermission = (permissionId: string) => {
  if (props.saving) {
    return;
  }

  if (form.permissionIds.includes(permissionId)) {
    form.permissionIds = form.permissionIds.filter((id) => id !== permissionId);
    return;
  }

  form.permissionIds = [...form.permissionIds, permissionId];
};

const submit = () => {
  validationMessage.value = "";

  if (validationError.value) {
    validationMessage.value = validationError.value;
    return;
  }

  if (normalizedPermissionIds.value.length === 0) {
    validationMessage.value = "Seleccioná al menos un permiso.";
    return;
  }

  if (!hasChanges.value) {
    validationMessage.value = "No hay cambios para guardar.";
    return;
  }

  emit("save", {
    name: form.name.trim(),
    priority: normalizeChatRolePriority(form.priority),
    permissionIds: normalizedPermissionIds.value,
  });
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && visible.value && !props.saving) {
    closeModal();
  }
};

watch(
  () => [props.modelValue, props.role?.id] as const,
  ([isOpen]) => {
    if (!isOpen) {
      return;
    }

    const permissionIds =
      props.role?.chatPermissions.map(
        (permission) => permission.permissionId,
      ) ?? [];
    const rolePriority = normalizeChatRolePriority(
      props.role?.priority ?? props.defaultPriority,
    );

    form.name = props.role?.name ?? "";
    form.priority = rolePriority;
    form.permissionIds = [...permissionIds];
    initialName.value = props.role?.name ?? "";
    initialPriority.value = rolePriority;
    initialPermissionIds.value = normalizeRoleIds(permissionIds);
    validationMessage.value = "";
  },
  { immediate: true },
);

onMounted(() => window.addEventListener("keydown", onEscape));
onBeforeUnmount(() => window.removeEventListener("keydown", onEscape));
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[70] flex items-center justify-center px-3 py-4 sm:p-6"
    >
      <div
        class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        @click="!saving && closeModal()"
      />

      <section
        class="relative z-10 flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
        @click.stop
      >
        <header
          class="flex items-start justify-between gap-4 border-b border-slate-200/80 p-5 dark:border-white/10"
        >
          <div class="min-w-0">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {{ isEditing ? "Editar rol" : "Crear rol" }}
            </h3>
            <p
              v-if="role"
              class="mt-1 break-all text-sm text-slate-500 dark:text-slate-400"
            >
              {{ role.id }}
            </p>
          </div>

          <button
            type="button"
            aria-label="Cerrar modal"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
            :disabled="saving"
            @click="closeModal"
          >
            <i class="pi pi-times" />
          </button>
        </header>

        <div class="space-y-5 overflow-y-auto p-5">
          <div class="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <label class="block">
              <span
                class="mb-1.5 block text-xs font-semibold uppercase text-slate-400"
              >
                Nombre
              </span>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-blue-300 dark:focus:ring-blue-300/20"
                :disabled="saving"
              />
            </label>

            <label class="block">
              <span
                class="mb-1.5 block text-xs font-semibold uppercase text-slate-400"
              >
                Prioridad
              </span>
              <input
                v-model.number="form.priority"
                type="number"
                min="1"
                max="100"
                step="1"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-blue-300 dark:focus:ring-blue-300/20"
                :disabled="saving"
              />
            </label>
          </div>

          <div>
            <p class="mb-2 text-xs font-semibold uppercase text-slate-400">
              Permisos
            </p>

            <div
              v-if="permissionsLoading"
              class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
            >
              <i class="pi pi-spin pi-spinner" />
              Cargando permisos...
            </div>

            <p
              v-else-if="permissionsError"
              class="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {{ permissionsError }}
            </p>

            <div v-else class="space-y-4">
              <section v-for="group in groupedPermissions" :key="group.name">
                <h4
                  class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  {{ group.name }}
                </h4>

                <div class="grid gap-2 sm:grid-cols-2">
                  <button
                    v-for="permission in group.permissions"
                    :key="permission.permissionId"
                    type="button"
                    class="flex min-h-16 items-start gap-3 rounded-2xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70"
                    :class="
                      form.permissionIds.includes(permission.permissionId)
                        ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-400/40 dark:bg-blue-400/10 dark:text-blue-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-white/5'
                    "
                    :disabled="saving"
                    @click="togglePermission(permission.permissionId)"
                  >
                    <span
                      class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
                      :class="
                        form.permissionIds.includes(permission.permissionId)
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-300 text-transparent dark:border-slate-600'
                      "
                    >
                      <i class="pi pi-check text-[10px]" />
                    </span>

                    <span class="min-w-0">
                      <span class="block break-all text-sm font-semibold">
                        {{ permission.code }}
                      </span>
                      <span
                        v-if="permission.description"
                        class="mt-1 block break-words text-xs opacity-70"
                      >
                        {{ permission.description }}
                      </span>
                    </span>
                  </button>
                </div>
              </section>
            </div>
          </div>

          <p
            v-if="validationMessage || validationError || error"
            class="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {{ validationMessage || validationError || error }}
          </p>
        </div>

        <footer
          class="flex flex-col-reverse gap-3 border-t border-slate-200/80 p-5 dark:border-white/10 sm:flex-row sm:justify-end"
        >
          <button
            type="button"
            class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
            :disabled="saving"
            @click="closeModal"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            :disabled="!canSave"
            @click="submit"
          >
            <i v-if="saving" class="pi pi-spin pi-spinner text-sm" />
            Guardar
          </button>
        </footer>
      </section>
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
