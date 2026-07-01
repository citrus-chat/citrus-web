<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import type { IChatParticipant } from "../../domain/IChatParticipant";
import type { IChatRole } from "../../domain/IChatRole";
import {
  hasRoleSelectionChanged,
  isActiveParticipant,
  normalizeRoleIds,
} from "../../utils/groupPermissions";

const props = defineProps<{
  modelValue: boolean;
  participant: IChatParticipant | null;
  availableRoles: IChatRole[];
  saving: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
  save: [roleIds: string[]];
}>();

const selectedRoleIds = ref<string[]>([]);
const validationMessage = ref("");

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const sortedRoles = computed(() =>
  [...props.availableRoles].sort((a, b) => a.priority - b.priority),
);

const normalizedSelectedRoleIds = computed(() =>
  normalizeRoleIds(selectedRoleIds.value),
);

const hasCatalog = computed(() => sortedRoles.value.length > 0);

const canSave = computed(() => {
  if (!props.participant || !isActiveParticipant(props.participant)) {
    return false;
  }

  return (
    hasCatalog.value &&
    normalizedSelectedRoleIds.value.length > 0 &&
    hasRoleSelectionChanged(
      props.participant.roleIds,
      normalizedSelectedRoleIds.value,
    ) &&
    !props.saving
  );
});

const closeModal = () => {
  visible.value = false;
  emit("close");
};

const shortId = (value: string) =>
  value.length <= 16 ? value : `${value.slice(0, 8)}...${value.slice(-4)}`;

const toggleRole = (roleId: string) => {
  if (selectedRoleIds.value.includes(roleId)) {
    selectedRoleIds.value = selectedRoleIds.value.filter((id) => id !== roleId);
    return;
  }

  selectedRoleIds.value = [...selectedRoleIds.value, roleId];
};

const submit = () => {
  validationMessage.value = "";

  if (!props.participant || !isActiveParticipant(props.participant)) {
    validationMessage.value =
      "Este participante ya no está activo en el grupo.";
    return;
  }

  if (!hasCatalog.value) {
    validationMessage.value =
      "No hay catálogo de roles disponible para este grupo.";
    return;
  }

  if (normalizedSelectedRoleIds.value.length === 0) {
    validationMessage.value = "Seleccioná al menos un rol.";
    return;
  }

  if (
    !hasRoleSelectionChanged(
      props.participant.roleIds,
      normalizedSelectedRoleIds.value,
    )
  ) {
    validationMessage.value = "No hay cambios para guardar.";
    return;
  }

  emit("save", normalizedSelectedRoleIds.value);
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && visible.value && !props.saving) {
    closeModal();
  }
};

watch(
  () => [props.modelValue, props.participant?.id] as const,
  ([isOpen]) => {
    if (!isOpen || !props.participant) {
      return;
    }

    selectedRoleIds.value = [...props.participant.roleIds];
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
      class="fixed inset-0 z-[60] flex items-center justify-center px-3 py-4 sm:p-6"
    >
      <div
        class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        @click="!saving && closeModal()"
      />

      <section
        class="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
        @click.stop
      >
        <header
          class="flex items-start justify-between gap-4 border-b border-slate-200/80 p-5 dark:border-white/10"
        >
          <div class="min-w-0">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Editar roles
            </h3>
            <p
              v-if="participant"
              class="mt-1 break-all text-sm text-slate-500 dark:text-slate-400"
            >
              {{ shortId(participant.userId) }}
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

        <div class="space-y-4 p-5">
          <div
            v-if="!hasCatalog"
            class="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
          >
            No hay catálogo de roles disponible para este grupo.
          </div>

          <div
            v-else-if="participant && !isActiveParticipant(participant)"
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            Este participante ya no está activo en el grupo.
          </div>

          <div v-else class="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
            <button
              v-for="role in sortedRoles"
              :key="role.id"
              type="button"
              class="flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition"
              :class="
                selectedRoleIds.includes(role.id)
                  ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-400/40 dark:bg-blue-400/10 dark:text-blue-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-white/5'
              "
              :disabled="saving"
              @click="toggleRole(role.id)"
            >
              <span
                class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
                :class="
                  selectedRoleIds.includes(role.id)
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-slate-300 text-transparent dark:border-slate-600'
                "
              >
                <i class="pi pi-check text-[10px]" />
              </span>

              <span class="min-w-0">
                <span class="block break-words text-sm font-semibold">
                  {{ role.name }}
                </span>
                <span class="mt-1 block break-all text-xs opacity-70">
                  {{ shortId(role.id) }}
                </span>
              </span>
            </button>
          </div>

          <p
            v-if="validationMessage || error"
            class="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {{ validationMessage || error }}
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
