<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useChatStore } from "../../store/ChatStore";
import {
  CAN_MODIFY_CHAT,
  permissionDeniedMessage,
} from "../../utils/groupPermissions";

const props = defineProps<{
  show: boolean;
  chatId: string | null;
  canModify: boolean;
}>();
const emit = defineEmits<{
  close: [];
}>();

const { chats, updateChatRoomName } = useChatStore();

const visible = ref(props.show);
const name = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const closeModal = () => {
  errorMessage.value = "";
  isLoading.value = false;
  visible.value = false;
};

const onSubmit = async () => {
  if (!props.chatId) return;

  if (!props.canModify) {
    errorMessage.value = permissionDeniedMessage(CAN_MODIFY_CHAT);
    return;
  }

  const trimmedName = name.value.trim();

  if (!trimmedName) {
    errorMessage.value = "El nombre no puede estar vacío.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    await updateChatRoomName(props.chatId, trimmedName);
    closeModal();
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el grupo. Intenta de nuevo.";
  } finally {
    isLoading.value = false;
  }
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && visible.value) closeModal();
};

watch(
  () => props.show,
  (newValue) => {
    visible.value = newValue;

    if (newValue && props.chatId) {
      const chat = chats.value.find((c) => c.id === props.chatId);
      name.value = chat?.name ?? "";
      errorMessage.value = "";
    }
  },
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
      class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-6"
    >
      <div
        class="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        @click="closeModal"
      />

      <form
        class="relative z-10 w-full max-w-[440px] rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-7"
        @click.stop
        @submit.prevent="onSubmit"
      >
        <!-- Header -->
        <div class="mb-5 flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 ring-1 ring-orange-300/40 dark:bg-orange-400/15 dark:text-orange-300 dark:ring-orange-300/20"
            >
              <i class="pi pi-pencil text-lg" />
            </div>

            <div>
              <h3
                class="text-xl font-semibold text-slate-900 dark:text-slate-50"
              >
                Editar grupo
              </h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Cambiá el nombre del grupo
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar modal"
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
            @click="closeModal"
          >
            <i class="pi pi-times" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Name field -->
          <div
            class="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-300/40 dark:border-white/10 dark:bg-slate-900/70 dark:focus-within:border-orange-300/50"
          >
            <i class="pi pi-tag text-sm text-slate-400 dark:text-slate-500" />
            <input
              v-model="name"
              type="text"
              placeholder="Nombre del grupo..."
              class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
              :disabled="!canModify || isLoading"
            />
          </div>

          <!-- Error message -->
          <div
            v-if="errorMessage"
            class="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            <i class="pi pi-exclamation-triangle mt-0.5" />
            <p>{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
            @click="closeModal"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 disabled:cursor-not-allowed disabled:bg-orange-300 dark:bg-orange-500 dark:hover:bg-orange-400 dark:disabled:bg-orange-900/70"
            :disabled="isLoading || !canModify"
            :title="canModify ? '' : permissionDeniedMessage(CAN_MODIFY_CHAT)"
          >
            <i v-if="isLoading" class="pi pi-spin pi-spinner text-sm" />
            Guardar
          </button>
        </div>
      </form>
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
