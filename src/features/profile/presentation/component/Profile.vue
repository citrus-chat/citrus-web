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

    <div class="mt-4">
      <div
        class="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-2"
      >
        Contact Information
      </div>
      <div class="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <div class="flex items-center gap-2 justify-center">
          <svg
            class="h-4 w-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 12H8m8 4H8M3 7h18"
            /></svg
          ><span>john.doe@example.com</span>
        </div>
        <div class="flex items-center gap-2 justify-center">
          <svg
            class="h-4 w-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
            /></svg
          ><span>+1 (555) 123-4567</span>
        </div>
        <div class="flex items-center gap-2 justify-center">
          <svg
            class="h-4 w-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-2M7 8H5a2 2 0 00-2 2v8a2 2 0 002 2h2"
            /></svg
          ><span>San Francisco, CA</span>
        </div>
      </div>
    </div>

    <div class="mt-6 space-y-2">
      <button
        class="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300"
      >
        Create support ticket
      </button>
      <button
        class="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300"
      >
        Send Template
      </button>
      <button
        class="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
      >
        Block User
      </button>
    </div>
  </div>
</template>
