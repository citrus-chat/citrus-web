<script setup lang="ts">
defineEmits(["toggleProfile"]);
</script>

<template>
  <section class="flex items-center p-2 justify-between">
    <div
      class="flex items-center border border-secondary rounded-lg px-3 py-1 space-x-2 flex-[0.5]"
    >
      <button class="cursor-pointer">
        <i class="pi pi-search text-xl" />
      </button>

      <input
        type="text"
        placeholder="Buscar en Citrus Chat..."
        class="w-full p-2 rounded outline-none bg-transparent"
      />
    </div>

    <div class="flex items-center space-x-2">
      <button class="cursor-pointer ml-4">
        <i class="pi pi-bell text-xl" />
      </button>
      <button class="cursor-pointer" @click="$emit('toggleProfile')">
        <img
          src="../../avatar-profile.svg"
          alt="Avatar"
          class="w-10 h-10 rounded-full"
        />
      </button>
    </div>
  </section>
</template>
