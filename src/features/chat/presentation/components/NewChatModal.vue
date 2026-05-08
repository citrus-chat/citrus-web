<script setup lang="ts">
import { watch, ref } from "vue";
const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ close: [] }>();

const visible = ref(props.show);

watch(
  () => props.show,
  (v) => (visible.value = v),
);
watch(visible, (v) => {
  if (!v) emit("close");
});
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

      <div
        class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-900/80"
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
          <div
            class="flex items-center gap-3 rounded-lg border border-slate-200 p-2 dark:border-white/10"
          >
            <svg
              class="h-5 w-5 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35m0 0A7 7 0 1111 4a7 7 0 015.65 11.65z"
              />
            </svg>
            <input
              type="text"
              placeholder="Nombre del chat o usuario"
              class="flex-1 bg-transparent outline-none"
            />
          </div>

          <p class="text-sm text-slate-500 dark:text-slate-400">
            CONTACTOS FRECUENTES
          </p>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img
                  src="@/shared/assets/avatar-profile.svg"
                  class="h-7 w-7 rounded-full"
                />
                <span>John Doe</span>
              </div>
              <input type="checkbox" />
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img
                  src="@/shared/assets/avatar-profile.svg"
                  class="h-7 w-7 rounded-full"
                />
                <span>Jane Smith</span>
              </div>
              <input type="checkbox" />
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img
                  src="@/shared/assets/avatar-profile.svg"
                  class="h-7 w-7 rounded-full"
                />
                <span>Bob Lee</span>
              </div>
              <input type="checkbox" />
            </div>
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
      </div>
    </div>
  </transition>
</template>
