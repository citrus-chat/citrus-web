<script setup lang="ts">
import "primeicons/primeicons.css";
</script>

<template>
  <div class="text-center">
    <img
      src="@/shared/assets/avatar-profile.svg"
      alt="Profile Picture"
      class="mx-auto h-32 w-32 rounded-full object-cover"
    />
    <h2 class="text-xl font-semibold mt-3 mb-1">John Doe</h2>
    <p class="text-slate-600 dark:text-slate-400 mb-3">
      Software Engineer at Tech Company
    </p>

    <div class="flex flex-col mt-4">
      <h2
        class="text-md font-semibold uppercase text-slate-700 dark:text-slate-300 mb-2"
      >
        Contact Information
      </h2>

      <div class="flex flex-col space-y-2 text-base">
        <div class="flex justify-center items-center space-x-2">
          <i class="pi pi-envelope" />
          <p>john.doe@example.com</p>
        </div>

        <div class="flex justify-center items-center space-x-2">
          <i class="pi pi-phone" />
          <p>+598 99 999 999</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col mt-4">
      <h2
        class="text-md font-semibold uppercase text-slate-700 dark:text-slate-300 mb-2"
      >
        Acciones rápidas
      </h2>

      <div class="flex flex-col space-y-2 text-base">
        <div class="flex justify-center items-center space-x-2">
          <i class="pi pi-ticket" />
          <button
            class="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300"
          >
            Create support ticket
          </button>
        </div>

        <div class="flex justify-center items-center space-x-2">
          <i class="pi pi-send" />
          <button
            class="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300"
          >
            Send Template
          </button>
        </div>

        <div
          class="flex justify-center items-center space-x-2 text-red-500 hover:text-red-600"
        >
          <i class="pi pi-ban" />
          <button class="text-sm">Block User</button>
        </div>
      </div>
    </div>
  </div>
</template>
