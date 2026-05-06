<template>
  <section
    class="d-flex flex-column p-3"
    style="flex: 0 0 30%"
  >
    <!-- Avatar centrado manualmente -->
    <div class="text-center">
      <img
        class="rounded-circle"
        src="@/shared/assets/avatar-profile.svg"
        alt="Profile Picture"
        style="width: 128px; height: 128px"
      >
      <h2 class="fs-4 fw-semibold mt-3 mb-1">
        John Doe
      </h2>
      <p class="text-muted mb-3">
        Software Engineer at Tech Company
      </p>
    </div>

    <!-- Contact Information -->
    <div class="mt-3 d-flex flex-column align-items-center">
      <p class="fw-bold text-uppercase mb-2 small text-black">
        Contact Information
      </p>
      <div class="d-flex align-items-center gap-2 mb-2">
        <i class="bi bi-envelope text-muted" />
        <p class="text-muted mb-0">
          john.doe@example.com
        </p>
      </div>
      <div class="d-flex align-items-center gap-2 mb-2">
        <i class="bi bi-telephone text-muted" />
        <p class="text-muted mb-0">
          +1 (555) 123-4567
        </p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-geo-alt text-muted" />
        <p class="text-muted mb-0">
          San Francisco, CA
        </p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-4 d-flex flex-column align-items-center">
      <p class="fw-bold text-uppercase mb-2 small text-black">
        Quick Actions
      </p>
      <button
        class="btn btn-link d-flex align-items-center gap-2 text-muted p-0 mb-2"
      >
        <i class="bi bi-ticket text-primary" />
        <span>Create support ticket</span>
      </button>
      <button
        class="btn btn-link d-flex align-items-center gap-2 text-muted p-0 mb-2"
      >
        <i class="bi bi-send text-primary" />
        <span>Send Template</span>
      </button>
      <button
        class="btn btn-link d-flex align-items-center gap-2 text-danger p-0"
      >
        <i class="bi bi-slash-circle" />
        <span>Block User</span>
      </button>
    </div>
  </section>
</template>
