<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useChatStore } from "../../store/ChatStore";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  close: [];
}>();

const { addChat, selectChat, chatExists } = useChatStore();

const visible = ref(props.show);
const searchTerm = ref("");
const errorMessage = ref("");
const selectedContactIds = ref<number[]>([]);

type Contact = {
  id: number;
  name: string;
  status: string;
};

const contacts: Contact[] = [
  { id: 1, name: "John Doe", status: "Disponible" },
  { id: 2, name: "Jane Smith", status: "Disponible" },
  { id: 3, name: "Bob Lee", status: "Disponible" },
];

const filteredContacts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) {
    return contacts;
  }

  return contacts.filter((contact) =>
    contact.name.toLowerCase().includes(term),
  );
});

const clearModalState = () => {
  searchTerm.value = "";
  errorMessage.value = "";
  selectedContactIds.value = [];
};

const closeModal = () => {
  clearModalState();
  visible.value = false;
};

const toggleContact = (contactId: number) => {
  errorMessage.value = "";

  if (selectedContactIds.value.includes(contactId)) {
    selectedContactIds.value = selectedContactIds.value.filter(
      (id) => id !== contactId,
    );
    return;
  }

  // Keep array contract but enforce a single selection for now.
  selectedContactIds.value = [contactId];
};

const onSubmit = () => {
  errorMessage.value = "";

  if (selectedContactIds.value.length === 0) {
    errorMessage.value =
      "Seleccioná al menos un contacto para iniciar el chat.";
    return;
  }

  if (selectedContactIds.value.length > 1) {
    errorMessage.value =
      "El chat grupal todavía no está disponible. Seleccioná solo un contacto.";
    return;
  }

  const selectedContactId = selectedContactIds.value[0];
  const selectedContact = contacts.find(
    (contact) => contact.id === selectedContactId,
  );

  if (!selectedContact) {
    errorMessage.value = "No se pudo identificar el contacto seleccionado.";
    return;
  }

  if (chatExists(selectedContact.name)) {
    errorMessage.value = "Ya existe un chat con este contacto.";
    return;
  }

  addChat(selectedContact.name, "direct");
  selectChat(selectedContact.name);
  closeModal();
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && visible.value) {
    closeModal();
  }
};

watch(
  () => props.show,
  (newValue) => {
    visible.value = newValue;
    if (!newValue) {
      clearModalState();
    }
  },
);

watch(visible, (newValue) => {
  if (!newValue) {
    emit("close");
  }
});

onMounted(() => {
  window.addEventListener("keydown", onEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEscape);
});
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
        class="relative z-10 w-full max-w-[520px] rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-7"
        @click.stop
        @submit.prevent="onSubmit"
      >
        <div class="mb-6 flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 ring-1 ring-orange-300/40 dark:bg-orange-400/15 dark:text-orange-300 dark:ring-orange-300/20"
            >
              <i class="pi pi-comments text-lg" />
            </div>

            <div>
              <h3
                class="text-xl font-semibold text-slate-900 dark:text-slate-50"
              >
                Nuevo chat
              </h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Selecciona un contacto para iniciar una conversacion
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
          <div
            class="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-300/40 dark:border-white/10 dark:bg-slate-900/70 dark:focus-within:border-orange-300/50"
          >
            <i
              class="pi pi-search text-sm text-slate-400 dark:text-slate-500"
            />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar contacto..."
              class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>

          <p
            class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
          >
            Contactos frecuentes
          </p>

          <div class="max-h-64 space-y-2 overflow-auto pr-1">
            <button
              v-for="contact in filteredContacts"
              :key="contact.id"
              type="button"
              class="flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition"
              :class="
                selectedContactIds.includes(contact.id)
                  ? 'border-orange-300 bg-orange-50/80 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.18)] dark:border-orange-300/30 dark:bg-orange-400/10'
                  : 'border-slate-200/80 bg-white/70 hover:border-orange-200 hover:bg-orange-50/50 dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-orange-300/20 dark:hover:bg-white/5'
              "
              @click="toggleContact(contact.id)"
            >
              <div class="flex items-center gap-3">
                <img
                  src="@/shared/assets/avatar-profile.svg"
                  alt="Avatar"
                  class="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200/80 dark:ring-white/10"
                />

                <div>
                  <p
                    class="text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    {{ contact.name }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ contact.status }}
                  </p>
                </div>
              </div>

              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition"
                :class="
                  selectedContactIds.includes(contact.id)
                    ? 'border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-400'
                    : 'border-slate-300 text-transparent dark:border-white/20'
                "
              >
                <i class="pi pi-check" />
              </span>
            </button>

            <div
              v-if="filteredContacts.length === 0"
              class="rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/15 dark:bg-slate-900/50 dark:text-slate-400"
            >
              No se encontraron contactos
            </div>
          </div>

          <div
            v-if="errorMessage"
            class="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            <i class="pi pi-exclamation-triangle mt-0.5" />
            <p>{{ errorMessage }}</p>
          </div>
        </div>

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
            class="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 disabled:cursor-not-allowed disabled:bg-orange-300 dark:bg-orange-500 dark:hover:bg-orange-400 dark:disabled:bg-orange-900/70"
            :disabled="selectedContactIds.length === 0"
          >
            Iniciar chat
          </button>
        </div>
      </form>
    </div>
  </transition>
</template>
