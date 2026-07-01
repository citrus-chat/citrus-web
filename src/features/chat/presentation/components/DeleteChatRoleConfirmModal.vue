<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import type { IChatRole } from "../../domain/IChatRole";

const props = defineProps<{
  modelValue: boolean;
  role: IChatRole | null;
  roles: IChatRole[];
  participantCount: number;
  deleting: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
  delete: [replacementRoleId?: string];
}>();

const replacementRoleId = ref("");
const validationMessage = ref("");

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const requiresReplacement = computed(() => props.participantCount > 0);

const replacementOptions = computed(() =>
  props.roles.filter((role) => role.id !== props.role?.id),
);

const canDelete = computed(
  () =>
    Boolean(props.role) &&
    !props.deleting &&
    (!requiresReplacement.value || Boolean(replacementRoleId.value)),
);

const closeModal = () => {
  visible.value = false;
  emit("close");
};

const submit = () => {
  validationMessage.value = "";

  if (!props.role) {
    return;
  }

  if (requiresReplacement.value && !replacementRoleId.value) {
    validationMessage.value =
      "Este rol está asignado a participantes. Elegí un rol de reemplazo.";
    return;
  }

  if (replacementRoleId.value === props.role.id) {
    validationMessage.value = "Elegí un rol de reemplazo distinto.";
    return;
  }

  emit("delete", replacementRoleId.value || undefined);
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && visible.value && !props.deleting) {
    closeModal();
  }
};

watch(
  () => [props.modelValue, props.role?.id] as const,
  ([isOpen]) => {
    if (!isOpen) {
      return;
    }

    replacementRoleId.value = "";
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
        @click="!deleting && closeModal()"
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
              Eliminar rol
            </h3>
            <p
              v-if="role"
              class="mt-1 break-words text-sm text-slate-500 dark:text-slate-400"
            >
              {{ role.name }}
            </p>
          </div>

          <button
            type="button"
            aria-label="Cerrar modal"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
            :disabled="deleting"
            @click="closeModal"
          >
            <i class="pi pi-times" />
          </button>
        </header>

        <div class="space-y-4 p-5">
          <p class="text-sm text-slate-600 dark:text-slate-300">
            {{ participantCount }}
            {{
              participantCount === 1
                ? "participante usa este rol."
                : "participantes usan este rol."
            }}
          </p>

          <label v-if="requiresReplacement" class="block">
            <span
              class="mb-1.5 block text-xs font-semibold uppercase text-slate-400"
            >
              Rol de reemplazo
            </span>
            <select
              v-model="replacementRoleId"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-blue-300 dark:focus:ring-blue-300/20"
              :disabled="deleting"
            >
              <option value="">Seleccionar rol</option>
              <option
                v-for="option in replacementOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.name }}
              </option>
            </select>
          </label>

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
            :disabled="deleting"
            @click="closeModal"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            :disabled="!canDelete"
            @click="submit"
          >
            <i v-if="deleting" class="pi pi-spin pi-spinner text-sm" />
            Eliminar
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
