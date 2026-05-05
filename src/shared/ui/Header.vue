<script setup lang="ts">
defineEmits(["toggleProfile"]);
</script>

<template>
  <section class="d-flex align-items-center justify-content-between p-2">

    <!-- Search -->
    <div
      class="d-flex align-items-center border rounded px-3 py-1 gap-2 flex-grow-1 me-3"
      style="max-width: 500px;"
    >
      <button class="btn p-0 border-0 header-btn">
        <i class="bi bi-search fs-5"></i>
      </button>

      <input
        type="text"
        placeholder="Buscar en Citrus Chat..."
        class="form-control border-0 shadow-none bg-transparent"
      />
    </div>

    <!-- Actions -->
    <div class="d-flex align-items-center gap-2">
      <button class="btn p-0 border-0 header-btn">
        <i class="bi bi-bell fs-5"></i>
      </button>

      <button class="btn p-0 border-0" @click="$emit('toggleProfile')">
        <img
          src="@/shared/assets/avatar-profile.svg"
          alt="Avatar"
          class="rounded-circle"
          style="width: 40px; height: 40px;"
        />
      </button>
    </div>

  </section>
</template>