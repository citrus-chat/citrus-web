<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSizeOptions?: number[];
    loading?: boolean;
  }>(),
  {
    pageSizeOptions: () => [10, 20, 50, 100],
    loading: false,
  },
);

const emit = defineEmits<{
  "change-page": [page: number];
  "change-page-size": [size: number];
}>();

const visibleCurrentPage = computed(() => props.currentPage + 1);
const visibleLastPage = computed(
  () => Math.max(props.lastPage, props.currentPage) + 1,
);

function changePageSize(event: Event) {
  const target = event.target as HTMLSelectElement;
  const size = Number(target.value);
  if (Number.isFinite(size) && size > 0) {
    emit("change-page-size", size);
  }
}
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between"
    aria-label="Paginación de usuarios"
  >
    <p v-if="total === 0" class="text-sm text-slate-600 dark:text-slate-400">
      No hay usuarios para mostrar
    </p>
    <div v-else class="text-sm text-slate-600 dark:text-slate-400">
      <p>
        Mostrando
        <strong class="font-semibold text-slate-900 dark:text-white">{{
          from
        }}</strong>
        a
        <strong class="font-semibold text-slate-900 dark:text-white">{{
          to
        }}</strong>
        de
        <strong class="font-semibold text-slate-900 dark:text-white">{{
          total
        }}</strong>
        usuarios
      </p>
      <p class="mt-1 text-xs">
        Página {{ visibleCurrentPage }} de {{ visibleLastPage }}
      </p>
    </div>

    <div class="flex flex-col gap-3 sm:items-end">
      <label
        class="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400"
      >
        Por página
        <select
          :value="perPage"
          :disabled="loading"
          class="min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
          @change="changePageSize"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </label>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="loading || !hasPreviousPage"
          class="min-h-10 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/10"
          @click="emit('change-page', currentPage - 1)"
        >
          Anterior
        </button>
        <button
          type="button"
          :disabled="loading || !hasNextPage"
          class="min-h-10 flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          @click="emit('change-page', currentPage + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>
  </section>
</template>
