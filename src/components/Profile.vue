<template>
  <section class="flex flex-[0.3] items-center flex-col p-2">
    <img
      class="w-32 h-32 rounded-full"
      src="../assets/avatar-profile.svg"
      alt="Profile Picture"
    />
    <h2 class="text-2xl font-semibold mt-4">John Doe</h2>
    <p class="text-gray-600 mt-2">Software Engineer at Tech Company</p>

    <div class="flex flex-col items-start w-full space-y-1">
      <p class="font-medium mt-4 uppercase">Contact Information</p>

      <div class="flex items-center space-x-2">
        <i class="pi pi-envelope text-gray-600" />
        <p class="text-gray-600">john.doe@example.com</p>
      </div>

      <div class="flex items-center space-x-2">
        <i class="pi pi-phone text-gray-600" />
        <p class="text-gray-600">+1 (555) 123-4567</p>
      </div>

      <div class="flex items-center space-x-2">
        <i class="pi pi-map-marker text-gray-600" />
        <p class="text-gray-600">San Francisco, CA</p>
      </div>
    </div>

    <div class="flex flex-col items-start w-full space-y-1">
      <p class="font-medium mt-4 uppercase">Quick Actions</p>

      <button class="flex items-center space-x-2">
        <i class="pi pi-ticket text-primary" />
        <p class="text-gray-600">Create support ticket</p>
      </button>

      <button class="flex items-center space-x-2">
        <i class="pi pi-send text-primary" />
        <p class="text-gray-600">Send Template</p>
      </button>

      <button class="flex items-center space-x-2 text-red-500">
        <i class="pi pi-ban" />
        <p>Block User</p>
      </button>
    </div>
  </section>
</template>
