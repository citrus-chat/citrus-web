<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

declare global {
  interface Window {
    bootstrap: {
      Modal: new (el: HTMLElement) => {
        show: () => void;
        hide: () => void;
        dispose: () => void;
      };
    };
  }
}

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ close: [] }>();

const modalRef = ref<HTMLElement | null>(null);
let modalInstance: {
  show: () => void;
  hide: () => void;
  dispose: () => void;
} | null = null;

watch(
  () => props.show,
  (val) => {
    if (!modalInstance) return;
    if (val) {
      modalInstance.show();
    } else {
      modalInstance.hide();
    }
  },
  { flush: "post" },
);

onMounted(() => {
  if (modalRef.value) {
    modalInstance = new window.bootstrap.Modal(modalRef.value);
  }
});

onBeforeUnmount(() => modalInstance?.dispose());
</script>

<template>
  <div
    ref="modalRef"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="addChatLabel"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="addChatLabel" class="modal-title">Nuevo chat</h5>
          <button type="button" class="btn-close" @click="emit('close')" />
        </div>
        <div class="modal-body">
          <div
            class="d-flex align-items-center gap-2 border p-2"
            style="border-color: #f57c00 !important; border-radius: 8px"
          >
            <i class="bi bi-search fs-5" />
            <input
              type="text"
              class="flex-grow-1"
              placeholder="Nombre del chat o usuario"
              style="outline: none; border: 0"
            />
          </div>

          <p class="mt-3 fs-8">CONTACTOS FRECUENTES</p>

          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-person-circle fs-5" />
              <span>John Doe</span>
            </div>
            <input type="checkbox" />
          </div>

          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-person-circle fs-5" />
              <span>John Doe</span>
            </div>
            <input type="checkbox" />
          </div>

          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-person-circle fs-5" />
              <span>John Doe</span>
            </div>
            <input type="checkbox" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary">Iniciar chat</button>
          <button class="btn btn-danger" @click="emit('close')">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
