<script setup lang="ts">
const stats = [
  { label: 'Usuarios', value: 1240, icon: 'bi-people' },
  { label: 'Chats activos', value: 342, icon: 'bi-chat' },
  { label: 'Reportes', value: 18, icon: 'bi-flag' },
  { label: 'Sanciones', value: 7, icon: 'bi-slash-circle' },
]
</script>

<template>
  <section class="p-4">
    <!-- Title -->
    <div class="mb-4">
      <h2 class="fw-bold mb-1">
        Dashboard
      </h2>
      <p class="text-muted mb-0">
        Resumen general del sistema
      </p>
    </div>

    <!-- Stats -->
    <div class="row g-3 mb-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="col-12 col-md-6 col-lg-3"
      >
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="bg-primary text-white rounded p-3">
              <i :class="`bi ${stat.icon} fs-4`"></i>
            </div>

            <div>
              <h5 class="mb-0 fw-bold">
                {{ stat.value }}
              </h5>
              <small class="text-muted">
                {{ stat.label }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent activity -->
    <div class="card shadow-sm">
      <div class="card-body">
        <h5 class="fw-semibold mb-3">
          Actividad reciente
        </h5>

        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between">
            <span>Nuevo usuario registrado</span>
            <small class="text-muted">hace 5 min</small>
          </li>

          <li class="list-group-item d-flex justify-content-between">
            <span>Reporte enviado</span>
            <small class="text-muted">hace 20 min</small>
          </li>

          <li class="list-group-item d-flex justify-content-between">
            <span>Usuario bloqueado</span>
            <small class="text-muted">hace 1 hora</small>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>