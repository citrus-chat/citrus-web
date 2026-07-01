<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useChatStore } from "../../store/ChatStore";
import { useUserStore } from "../../store/UserStore";
import { createChatRoomUseCase } from "../../application/use-cases/createChatroomUseCase";
import { ChatRoomType } from "../../domain/ChatRoomType";
import { getCurrentUserUseCase } from "@/features/profile/application/use-cases/getCurrentUserUseCase";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  close: [];
}>();

const { chats, chatExists, loadChats, selectChat } = useChatStore();

const { users, loadUsers } = useUserStore();

const visible = ref(props.show);
const searchTerm = ref("");
const errorMessage = ref("");
const selectedContactIds = ref<string[]>([]);
const activeTab = ref<ChatRoomType>(ChatRoomType.DIRECT);
const groupName = ref("");
const isLoading = ref(false);

const filteredContacts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return users.value;
  return users.value.filter((c) => c.name.toLowerCase().includes(term));
});

const isGroupTab = computed(() => activeTab.value === ChatRoomType.GROUP);

const canSubmit = computed(() => {
  if (isGroupTab.value) {
    return groupName.value.trim().length > 0;
  }
  return selectedContactIds.value.length === 1;
});

const clearModalState = () => {
  searchTerm.value = "";
  errorMessage.value = "";
  selectedContactIds.value = [];
  groupName.value = "";
  isLoading.value = false;
};

const closeModal = () => {
  clearModalState();
  visible.value = false;
};

const switchTab = (tab: ChatRoomType) => {
  activeTab.value = tab;
  selectedContactIds.value = [];
  errorMessage.value = "";
  searchTerm.value = "";
};

const toggleContact = (contactId: string) => {
  errorMessage.value = "";

  if (isGroupTab.value) {
    if (selectedContactIds.value.includes(contactId)) {
      selectedContactIds.value = selectedContactIds.value.filter(
        (id) => id !== contactId,
      );
    } else {
      selectedContactIds.value = [...selectedContactIds.value, contactId];
    }
    return;
  }

  // Direct: single selection
  selectedContactIds.value = selectedContactIds.value.includes(contactId)
    ? []
    : [contactId];
};

const onSubmit = async () => {
  const currentUser = await getCurrentUserUseCase();
  if (isGroupTab.value) {
    const chatName = groupName.value.trim();

    if (!chatName) {
      return;
    }

    if (chatExists(chatName)) {
      alert("A chat with this name already exists.");
      return;
    }

    const createdChat = await createChatRoomUseCase({
      name: chatName,
      chatRoomType: ChatRoomType.GROUP,
      participantIds: selectedContactIds.value,
    });

    await loadChats();

    selectChat(createdChat.id);
  } else {
    const contact = users.value.find(
      (c) => c.id === selectedContactIds.value[0],
    );

    if (!contact) {
      return;
    }

    if (selectedContactIds.value.length !== 1) {
      errorMessage.value = "Solo puedes iniciar un chat directo con 1 persona.";
      return;
    }

    if (selectedContactIds.value.includes(currentUser.userId)) {
      errorMessage.value = "No puedes iniciar un chat contigo mismo.";
      return;
    }

    const existingChat = chats.value.find(
      (chat) => chat.type === ChatRoomType.DIRECT && chat.name === contact.name,
    );

    if (existingChat) {
      selectChat(existingChat.id);
      closeModal();
      return;
    }

    const createdChat = await createChatRoomUseCase({
      name: contact.name,
      chatRoomType: ChatRoomType.DIRECT,
      participantIds: [contact.id],
    });

    await loadChats();

    selectChat(createdChat.id);
  }

  closeModal();
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && visible.value) closeModal();
};

watch(
  () => props.show,
  (newValue) => {
    visible.value = newValue;
    if (!newValue) {
      clearModalState();
    } else {
      loadUsers();
    }
  },
);

watch(visible, (newValue) => {
  if (!newValue) emit("close");
});

onMounted(() => {
  window.addEventListener("keydown", onEscape);
});
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
        class="relative z-10 w-full max-w-[520px] rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-7"
        @click.stop
        @submit.prevent="onSubmit"
      >
        <!-- Header -->
        <div class="mb-5 flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 ring-1 ring-orange-300/40 dark:bg-orange-400/15 dark:text-orange-300 dark:ring-orange-300/20"
            >
              <i
                :class="isGroupTab ? 'pi pi-users' : 'pi pi-comments'"
                class="text-lg"
              />
            </div>

            <div>
              <h3
                class="text-xl font-semibold text-slate-900 dark:text-slate-50"
              >
                Nuevo chat
              </h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {{
                  isGroupTab
                    ? "Creá un grupo con varios contactos"
                    : "Iniciá una conversación directa"
                }}
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

        <!-- Tabs -->
        <div
          class="mb-5 flex gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 dark:border-white/10 dark:bg-slate-900/60"
        >
          <button
            type="button"
            class="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition"
            :class="
              !isGroupTab
                ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-orange-400 dark:ring-white/10'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            "
            @click="switchTab(ChatRoomType.DIRECT)"
          >
            <i class="pi pi-comment text-[13px]" />
            Individual
          </button>

          <button
            type="button"
            class="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition"
            :class="
              isGroupTab
                ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-orange-400 dark:ring-white/10'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            "
            @click="switchTab(ChatRoomType.GROUP)"
          >
            <i class="pi pi-users text-[13px]" />
            Grupal
          </button>
        </div>

        <div class="space-y-4">
          <!-- Group name field (only for group tab) -->
          <transition name="slide-down">
            <div
              v-if="isGroupTab"
              class="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-300/40 dark:border-white/10 dark:bg-slate-900/70 dark:focus-within:border-orange-300/50"
            >
              <i class="pi pi-tag text-sm text-slate-400 dark:text-slate-500" />
              <input
                v-model="groupName"
                type="text"
                placeholder="Nombre del grupo..."
                class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
          </transition>

          <!-- Search -->
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

          <!-- Section label -->
          <div class="flex items-center justify-between">
            <p
              class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
            >
              Contactos Disponibles
            </p>
            <transition name="fade">
              <span
                v-if="isGroupTab && selectedContactIds.length > 0"
                class="rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-semibold text-orange-600 dark:bg-orange-400/15 dark:text-orange-400"
              >
                {{ selectedContactIds.length }} seleccionado{{
                  selectedContactIds.length !== 1 ? "s" : ""
                }}
              </span>
            </transition>
          </div>

          <!-- Contact list -->
          <div class="max-h-56 space-y-2 overflow-auto pr-1">
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
                    {{ "Disponible" }}
                  </p>
                </div>
              </div>

              <!-- Checkbox (group) or radio (direct) indicator -->
              <span
                class="inline-flex h-5 w-5 items-center justify-center border text-[11px] transition"
                :class="[
                  isGroupTab ? 'rounded-md' : 'rounded-full',
                  selectedContactIds.includes(contact.id)
                    ? 'border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-400'
                    : 'border-slate-300 text-transparent dark:border-white/20',
                ]"
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

          <!-- Helper hint for group -->
          <transition name="fade">
            <p
              v-if="isGroupTab && groupName.trim().length === 0"
              class="text-center text-xs text-slate-400 dark:text-slate-500"
            >
              Ingresa un nombre para el grupo
            </p>
          </transition>

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
            :disabled="!canSubmit || isLoading"
          >
            <i v-if="isLoading" class="pi pi-spin pi-spinner text-sm" />
            {{ isGroupTab ? "Crear grupo" : "Iniciar chat" }}
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
