<script setup lang="ts">
import { ref } from "vue";
import OrgChart from "@/features/profile/presentation/component/OrgChart.vue";
import { mockWorkspaceUsers, currentWorkspaceUser } from "@/features/chat/infrastructure/mock/workspaceUsers";

// La página abre el organigrama directamente en pantalla completa.
// Si el usuario cierra, vuelve atrás en la historia.
import { useRouter } from "vue-router";
const router = useRouter();

const isOpen = ref(true);

function handleClose() {
  isOpen.value = false;
  router.back();
}
</script>

<template>
  <OrgChart
    :users="mockWorkspaceUsers"
    :focus-id="currentWorkspaceUser.id"
    :is-open="isOpen"
    @close="handleClose"
  />
</template>