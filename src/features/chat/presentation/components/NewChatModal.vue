<script setup lang="ts">
import { watch, ref } from "vue";
import { useChatStore } from "../../store/ChatStore";
const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ close: [] }>();
const { addChat, selectChat } = useChatStore();

const visible = ref(props.show);

watch(
  () => props.show,
  (v) => (visible.value = v),
);
watch(visible, (v) => {
  if (!v) emit("close");
});

const contacts = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Bob Lee" },
];

const onSubmit = (e: Event) => {
  e.preventDefault();

  const selectedContacts = contacts.filter(
    (contact) =>
      (document.getElementById(`contact-${contact.id}`) as HTMLInputElement)
        ?.checked,
  );

  if (selectedContacts.length === 0) {
    alert("Please select at least one contact to start a chat.");
    return;
  }

  if (selectedContacts.length > 1) {
    alert(
      "Group chat creation is not implemented yet. Please select only one contact.",
    );
    return;
  }

  addChat(selectedContacts[0]!.name, "direct");
  selectChat(selectedContacts[0]!.name);
  visible.value = false;
};
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="visible = false"
      />

      <form
        class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-900/80"
        @submit="onSubmit"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Nuevo chat</h3>
          <button
            class="text-slate-500 hover:text-slate-700 dark:text-slate-400"
            @click="visible = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <button
            class="w-full flex items-center gap-3 rounded-lg border border-slate-200 p-2 dark:border-white/10"
          >
            <i class="pi pi-search" />
            <input
              type="text"
              placeholder="Nombre del chat o usuario"
              class="flex-1 bg-transparent outline-none"
            />
          </button>

          <p class="text-sm text-slate-500 dark:text-slate-400">
            CONTACTOS FRECUENTES
          </p>

          <div
            v-for="contact in contacts"
            :key="contact.id"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <img
                src="@/shared/assets/avatar-profile.svg"
                class="h-7 w-7 rounded-full"
              />
              <span>{{ contact.name }}</span>
            </div>
            <input :id="`contact-${contact.id}`" type="checkbox" />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-white/10"
            @click="visible = false"
          >
            Cancelar
          </button>
          <button class="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">
            Iniciar chat
          </button>
        </div>
      </form>
    </div>
  </transition>
</template>
