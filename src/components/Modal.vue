<script setup lang="ts">
const emit = defineEmits(["closeModal"]);

const closeModal = () => {
  emit("closeModal");
};
</script>

<template>
  <section
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Nuevo Mensaje</h2>
        <button
          type="button"
          class="text-gray-400 hover:text-primary transition-colors"
          @click="closeModal"
        >
          <span class="text-4xl">&times;</span>
        </button>
      </div>

      <div class="flex items-center border border-black rounded-lg p-2">
        <i class="pi pi-search text-xl" />
        <input
          type="text"
          placeholder="Buscar contacto o grupo"
          class="w-full p-2 outline-none"
        />
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-md font-bold text-primary uppercase tracking-wider">
          Contactos Frecuentes
        </p>

        <div class="overflow-y-auto flex flex-col">
          <button
            v-for="n in 5"
            :key="n"
            class="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
          >
            <div class="flex items-center space-x-3">
              <img
                src="../assets/avatar-profile.svg"
                alt="Contacto"
                class="w-8 h-8 rounded-full"
              />
              <div class="flex flex-col">
                <p class="font-semibold">Juanita</p>
                <p class="text-sm text-gray-600">Asistente ejecutiva</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-2">
        <button
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          @click="closeModal"
        >
          Cancelar
        </button>
        <button
          class="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors shadow-md"
        >
          Crear grupo
        </button>
      </div>
    </div>
  </section>
</template>
