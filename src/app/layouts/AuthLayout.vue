<template>
  <main
    class="auth-page min-vh-100 d-flex align-items-center justify-content-center px-3"
  >
    <section class="w-100" style="max-width: 480px">
      <div class="text-center mb-4">
        <img
          src="@/shared/assets/citrus-chat.png"
          alt="Citrus Chat"
          class="rounded-circle shadow-sm mb-3 auth-logo"
        />

        <h1 class="h3 fw-bold mb-1">Citrus Chat</h1>

        <p class="text-muted mb-0">Acceso seguro al sistema interno</p>
      </div>

      <router-view />
    </section>
  </main>
</template>
