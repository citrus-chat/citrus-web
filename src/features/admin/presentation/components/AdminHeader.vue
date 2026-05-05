<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <header class="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white">
    <!-- Left -->
    <div>
      <h6 class="mb-0 fw-semibold">
        {{ title || 'Dashboard' }}
      </h6>
      <small class="text-muted">
        Administración del sistema
      </small>
    </div>

    <!-- Right -->
    <div class="d-flex align-items-center gap-3">
      <button class="btn p-0 border-0">
        <i class="bi bi-bell fs-5" />
      </button>

      <div class="d-flex align-items-center gap-2">
        <img
          src="@/shared/assets/avatar-profile.svg"
          alt="Admin"
          class="rounded-circle"
          style="width: 36px; height: 36px;"
        />

        <div class="d-none d-md-block">
          <div class="fw-semibold small">
            Admin
          </div>
          <div class="text-muted small">
            Superuser
          </div>
        </div>
      </div>
    </div>
  </header>
</template>