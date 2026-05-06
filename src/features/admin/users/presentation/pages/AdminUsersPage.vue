<script setup lang="ts">
const users = [
  {
    id: "1",
    username: "nacho",
    email: "nacho@citrus.com",
    phoneNumber: "+59899123456",
    status: "Activo",
  },
];
</script>

<template>
  <section class="p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Usuarios</h2>
        <p class="text-muted mb-0">Gestión de usuarios del sistema</p>
      </div>

      <RouterLink to="/admin/users/register" class="btn btn-primary">
        Crear usuario
      </RouterLink>
    </div>

    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="fw-semibold">
                {{ user.username }}
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phoneNumber }}</td>
              <td>
                <span class="badge bg-success">{{ user.status }}</span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary me-2">
                  Ver
                </button>
                <button class="btn btn-sm btn-outline-danger">
                  Desactivar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
