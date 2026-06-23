<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import "primeicons/primeicons.css";
import type { WorkspaceUser } from "@/features/chat/domain/WorkspaceUser";

const props = defineProps<{
  users: WorkspaceUser[];
  focusId: string;
  isOpen: boolean;
}>();

const emit = defineEmits<{ close: [] }>();

// ── Dark mode detection ───────────────────────────────────────────────────────
const isDark = ref(document.documentElement.classList.contains("dark"));
const observer = new MutationObserver(() => {
  isDark.value = document.documentElement.classList.contains("dark");
});
onMounted(() => observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }));
onUnmounted(() => observer.disconnect());

// Colors that work in both modes
const C = computed(() => isDark.value
  ? {
      nodeBg: "#1e293b",       // slate-800
      nodeBorder: "#334155",   // slate-700
      focusBg: "#431407",      // orange-950
      focusBorder: "#f97316",
      text: "#f1f5f9",         // slate-100
      textMuted: "#94a3b8",    // slate-400
      edge: "#475569",         // slate-600
      focusEdge: "#fb923c",
      badgeCollapse: "#0284c7",
      canvasBg: "#0f172a",
    }
  : {
      nodeBg: "#ffffff",
      nodeBorder: "#e2e8f0",
      focusBg: "#fff7ed",
      focusBorder: "#f97316",
      text: "#0f172a",
      textMuted: "#64748b",
      edge: "#cbd5e1",
      focusEdge: "#f97316",
      badgeCollapse: "#0ea5e9",
      canvasBg: "#f8fafc",
    }
);

function roleBg(role?: string) {
  if (!role) return isDark.value ? { bg: "#1e293b", text: "#94a3b8" } : { bg: "#f1f5f9", text: "#64748b" };
  const r = role.toLowerCase();
  if (r.includes("ceo") || r.includes("director"))
    return isDark.value ? { bg: "#451a03", text: "#fbbf24" } : { bg: "#fef3c7", text: "#92400e" };
  if (r.includes("manager"))
    return isDark.value ? { bg: "#1e1b4b", text: "#a5b4fc" } : { bg: "#e0e7ff", text: "#3730a3" };
  if (r.includes("senior"))
    return isDark.value ? { bg: "#052e16", text: "#6ee7b7" } : { bg: "#d1fae5", text: "#065f46" };
  return isDark.value ? { bg: "#1e293b", text: "#94a3b8" } : { bg: "#f1f5f9", text: "#475569" };
}

function statusColor(s: WorkspaceUser["status"]) {
  return s === "online" ? "#10b981" : s === "away" ? "#f59e0b" : "#94a3b8";
}

// ── Tree maps ─────────────────────────────────────────────────────────────────
const byId = computed(() => {
  const m = new Map<string, WorkspaceUser>();
  for (const u of props.users) m.set(u.id, u);
  return m;
});

const childrenOf = computed(() => {
  const m = new Map<string, WorkspaceUser[]>();
  for (const u of props.users) {
    if (u.managerId) {
      if (!m.has(u.managerId)) m.set(u.managerId, []);
      m.get(u.managerId)!.push(u);
    }
  }
  return m;
});

function findRoot(id: string): string {
  const u = byId.value.get(id);
  return u?.managerId ? findRoot(u.managerId) : id;
}
const rootId = computed(() => findRoot(props.focusId));

// ── Collapsed state ───────────────────────────────────────────────────────────
const collapsed = ref(new Set<string>());

function isOnPathToFocus(id: string): boolean {
  if (id === props.focusId) return true;
  for (const child of childrenOf.value.get(id) ?? []) {
    if (isOnPathToFocus(child.id)) return true;
  }
  return false;
}

function initCollapsed() {
  const next = new Set<string>();
  function walk(id: string) {
    const kids = childrenOf.value.get(id) ?? [];
    if (!kids.length) return;
    if (isOnPathToFocus(id)) {
      for (const k of kids) walk(k.id);
    } else {
      next.add(id);
    }
  }
  walk(rootId.value);
  collapsed.value = next;
}

watch(() => props.isOpen, (v) => { if (v) { initCollapsed(); nextTick(centerOnFocus); } }, { immediate: true });

function toggleCollapse(id: string) {
  const s = new Set(collapsed.value);
  if (s.has(id)) s.delete(id); else s.add(id);
  collapsed.value = s;
}

// ── Layout ────────────────────────────────────────────────────────────────────
const NODE_W = 172;
const NODE_H = 60;
const H_GAP  = 20;
const V_GAP  = 80;

interface TNode {
  user: WorkspaceUser;
  x: number; y: number;
  children: TNode[];
  hasMore: boolean;
  childCount: number;
}

// Returns subtree width (for centering parent)
function layout(id: string, depth: number, xOffset: number): { node: TNode; totalWidth: number } {
  const user = byId.value.get(id)!;
  const kids  = childrenOf.value.get(id) ?? [];
  const isCol = collapsed.value.has(id);
  const hasMore = kids.length > 0 && isCol;

  if (isCol || kids.length === 0) {
    return {
      node: { user, x: xOffset, y: depth * (NODE_H + V_GAP), children: [], hasMore, childCount: kids.length },
      totalWidth: NODE_W,
    };
  }

  // Layout children left-to-right
  const childResults: Array<{ node: TNode; totalWidth: number }> = [];
  let cursor = xOffset;
  for (const k of kids) {
    const r = layout(k.id, depth + 1, cursor);
    childResults.push(r);
    cursor += r.totalWidth + H_GAP;
  }
  const childrenSpan = cursor - xOffset - H_GAP;
  const parentX = xOffset + childrenSpan / 2 - NODE_W / 2;

  return {
    node: {
      user,
      x: parentX,
      y: depth * (NODE_H + V_GAP),
      children: childResults.map(r => r.node),
      hasMore: false,
      childCount: kids.length,
    },
    totalWidth: Math.max(childrenSpan, NODE_W),
  };
}

const treeRoot = computed(() => {
  if (!props.isOpen) return null;
  return layout(rootId.value, 0, 0).node;
});

interface FlatNode {
  user: WorkspaceUser;
  x: number; y: number;
  hasMore: boolean;
  childCount: number;
  isFocus: boolean;
  px?: number; py?: number; // parent connector point
}

function flatten(n: TNode, parent?: TNode): FlatNode[] {
  const out: FlatNode[] = [{
    user: n.user, x: n.x, y: n.y,
    hasMore: n.hasMore, childCount: n.childCount,
    isFocus: n.user.id === props.focusId,
    px: parent ? parent.x + NODE_W / 2 : undefined,
    py: parent ? parent.y + NODE_H       : undefined,
  }];
  for (const c of n.children) out.push(...flatten(c, n));
  return out;
}

const flatNodes = computed(() => treeRoot.value ? flatten(treeRoot.value) : []);

// ── Pan & Zoom ────────────────────────────────────────────────────────────────
const svgRef   = ref<SVGSVGElement | null>(null);
const tx       = ref(0);
const ty       = ref(60);
const scale    = ref(1);
const dragging = ref(false);
const drag0    = ref({ mx: 0, my: 0, tx: 0, ty: 0 });

function centerOnFocus(animated = false) {
  const focus = flatNodes.value.find(n => n.isFocus);
  if (!focus || !svgRef.value) return;
  const rect = svgRef.value.getBoundingClientRect();
  const targetX = rect.width  / 2 - (focus.x + NODE_W / 2) * scale.value;
  const targetY = rect.height / 2 - (focus.y + NODE_H  / 2) * scale.value;

  if (!animated) {
    tx.value = targetX;
    ty.value = targetY;
    return;
  }
  // Smooth animate
  const startX = tx.value, startY = ty.value;
  const dx = targetX - startX, dy = targetY - startY;
  const dur = 400;
  const start = performance.now();
  function step(now: number) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
    tx.value = startX + dx * e;
    ty.value = startY + dy * e;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Center on open
watch(flatNodes, (nodes) => {
  if (nodes.length && svgRef.value) centerOnFocus();
}, { flush: "post" });

function onWheel(e: WheelEvent) {
  e.preventDefault();
  const factor = e.deltaY > 0 ? 0.9 : 1.1;
  const ns = Math.min(2.5, Math.max(0.2, scale.value * factor));
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  tx.value = mx - (mx - tx.value) * (ns / scale.value);
  ty.value = my - (my - ty.value) * (ns / scale.value);
  scale.value = ns;
}

function onMouseDown(e: MouseEvent) {
  if ((e.target as Element).closest(".org-node")) return;
  dragging.value = true;
  drag0.value = { mx: e.clientX, my: e.clientY, tx: tx.value, ty: ty.value };
}
function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return;
  tx.value = drag0.value.tx + (e.clientX - drag0.value.mx);
  ty.value = drag0.value.ty + (e.clientY - drag0.value.my);
}
function onMouseUp() { dragging.value = false; }

const touch0 = ref({ x: 0, y: 0, tx: 0, ty: 0 });
function onTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1) return;

  const touch = e.touches[0];
  if (!touch) return;

  touch0.value = {
    x: touch.clientX,
    y: touch.clientY,
    tx: tx.value,
    ty: ty.value
  };
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length !== 1) return;

  const touch = e.touches[0];
  if (!touch) return;

  e.preventDefault();

  tx.value = touch0.value.tx + (touch.clientX - touch0.value.x);
  ty.value = touch0.value.ty + (touch.clientY - touch0.value.y);
}

function zoomIn()  { scale.value = Math.min(2.5, scale.value * 1.2); }
function zoomOut() { scale.value = Math.max(0.2, scale.value / 1.2); }

function onKey(e: KeyboardEvent) { if (e.key === "Escape") emit("close"); }
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));

// ── Tooltip ───────────────────────────────────────────────────────────────────
const tooltip = ref<{ user: WorkspaceUser; x: number; y: number } | null>(null);
function showTip(node: FlatNode, e: MouseEvent) {
  const r = (e.currentTarget as Element).getBoundingClientRect();
  tooltip.value = { user: node.user, x: r.left + r.width / 2, y: r.bottom + 10 };
}
function hideTip() { tooltip.value = null; }
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col"
        :style="`background: ${C.canvasBg}`"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-3 border-b shrink-0"
          :style="`background: ${isDark ? '#0f172a' : '#fff'}; border-color: ${isDark ? '#1e293b' : '#e2e8f0'}`"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" :style="`background: ${isDark ? '#0c4a6e33' : '#e0f2fe'}`">
              <i class="pi pi-sitemap" :style="`color: #0ea5e9`" />
            </div>
            <div>
              <h3 class="text-sm font-semibold" :style="`color: ${C.text}`">Organigrama</h3>
              <p class="text-xs" :style="`color: ${C.textMuted}`">{{ users.length }} personas · Click para expandir/colapsar</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Ir a mi posición -->
            <button
              @click="centerOnFocus(true)"
              class="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition"
              :style="`background: #f97316; color: white`"
              title="Centrar en mi posición"
            >
              <i class="pi pi-crosshairs text-xs" />
              Mi posición
            </button>

            <!-- Zoom -->
            <div class="flex items-center gap-1 rounded-xl border p-1" :style="`border-color: ${isDark ? '#1e293b' : '#e2e8f0'}; background: ${isDark ? '#1e293b' : '#f8fafc'}`">
              <button @click="zoomOut" class="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold transition hover:opacity-70" :style="`color: ${C.textMuted}`">−</button>
              <span class="text-xs w-10 text-center font-mono" :style="`color: ${C.textMuted}`">{{ Math.round(scale * 100) }}%</span>
              <button @click="zoomIn"  class="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold transition hover:opacity-70" :style="`color: ${C.textMuted}`">+</button>
            </div>

            <button
              @click="emit('close')"
              class="flex h-9 w-9 items-center justify-center rounded-xl border transition hover:opacity-70"
              :style="`border-color: ${isDark ? '#1e293b' : '#e2e8f0'}; background: ${isDark ? '#1e293b' : '#f8fafc'}; color: ${C.textMuted}`"
            >
              <i class="pi pi-times text-sm" />
            </button>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-2 border-b shrink-0 text-xs"
          :style="`border-color: ${isDark ? '#1e293b' : '#f1f5f9'}; background: ${isDark ? '#0f172a' : '#fff'}; color: ${C.textMuted}`"
        >
          <span class="flex items-center gap-1.5">
            <span class="inline-block w-3 h-3 rounded-full border-2" style="border-color:#f97316" />
            Vos
          </span>
          <span class="flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />Online</span>
          <span class="flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />Ausente</span>
          <span class="flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />Offline</span>
          <span class="ml-auto flex items-center gap-1">Arrastrar · Scroll para zoom</span>
        </div>

        <!-- SVG Canvas -->
        <div class="flex-1 overflow-hidden">
          <svg
            ref="svgRef"
            class="w-full h-full select-none"
            :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
            @wheel.prevent="onWheel"
            @mousedown="onMouseDown"
            @touchstart.prevent="onTouchStart"
            @touchmove.prevent="onTouchMove"
          >
            <g :transform="`translate(${tx},${ty}) scale(${scale})`">

              <!-- Edges -->
              <g v-for="n in flatNodes" :key="`e-${n.user.id}`">
                <path
                  v-if="n.px !== undefined"
                  :d="`M ${n.px} ${n.py} C ${n.px} ${n.py! + V_GAP * 0.4}, ${n.x + NODE_W/2} ${n.y - V_GAP * 0.4}, ${n.x + NODE_W/2} ${n.y}`"
                  fill="none"
                  :stroke="n.isFocus ? C.focusEdge : C.edge"
                  :stroke-width="n.isFocus ? 2 : 1"
                  stroke-linecap="round"
                />
              </g>

              <!-- Nodes -->
              <g
                v-for="n in flatNodes"
                :key="`n-${n.user.id}`"
                class="org-node"
                :transform="`translate(${n.x},${n.y})`"
                style="cursor:pointer"
                @click="n.isFocus ? centerOnFocus(true) : toggleCollapse(n.user.id)"
                @mouseenter="showTip(n, $event)"
                @mouseleave="hideTip"
              >
                <!-- Drop shadow rect (behind card) -->
                <rect
                  :width="NODE_W" :height="NODE_H" rx="12"
                  :fill="isDark ? '#00000040' : '#0000000a'"
                  transform="translate(0,3)"
                />

                <!-- Card -->
                <rect
                  :width="NODE_W" :height="NODE_H" rx="12"
                  :fill="n.isFocus ? C.focusBg : C.nodeBg"
                  :stroke="n.isFocus ? C.focusBorder : C.nodeBorder"
                  :stroke-width="n.isFocus ? 2 : 1"
                />

                <!-- Status dot -->
                <circle :cx="NODE_W - 14" cy="14" r="5" :fill="statusColor(n.user.status)" />

                <!-- Name -->
                <text
                  :x="NODE_W / 2" y="24"
                  text-anchor="middle"
                  font-size="12" font-weight="600"
                  :fill="n.isFocus ? '#f97316' : C.text"
                >{{ n.user.name.length > 19 ? n.user.name.slice(0,17)+'…' : n.user.name }}</text>

                <!-- Role pill -->
                <rect
                  :x="(NODE_W - Math.min((n.user.role?.length ?? 0) * 7 + 16, NODE_W - 16)) / 2"
                  y="32"
                  :width="Math.min((n.user.role?.length ?? 0) * 7 + 16, NODE_W - 16)"
                  height="17" rx="8.5"
                  :fill="roleBg(n.user.role).bg"
                />
                <text
                  :x="NODE_W / 2" y="44"
                  text-anchor="middle"
                  font-size="10" font-weight="500"
                  :fill="roleBg(n.user.role).text"
                >{{ (n.user.role ?? '').length > 20 ? (n.user.role ?? '').slice(0,18)+'…' : n.user.role }}</text>

                <!-- "Vos" label for focus node -->
                <g v-if="n.isFocus">
                  <rect :x="NODE_W/2 - 15" :y="NODE_H - 8" width="30" height="14" rx="7" fill="#f97316" />
                  <text :x="NODE_W/2" :y="NODE_H + 3" text-anchor="middle" font-size="8" font-weight="700" fill="white">VOS</text>
                </g>

                <!-- Expand badge -->
                <g v-else-if="n.hasMore">
                  <rect :x="NODE_W/2 - 18" :y="NODE_H - 8" width="36" height="14" rx="7" :fill="C.badgeCollapse" />
                  <text :x="NODE_W/2" :y="NODE_H + 3" text-anchor="middle" font-size="9" font-weight="700" fill="white">+{{ n.childCount }}</text>
                </g>

                <!-- Collapse badge -->
                <g v-else-if="(childrenOf.get(n.user.id) ?? []).length > 0">
                  <rect :x="NODE_W/2 - 12" :y="NODE_H - 8" width="24" height="14" rx="7" :fill="isDark ? '#334155' : '#94a3b8'" />
                  <text :x="NODE_W/2" :y="NODE_H + 3" text-anchor="middle" font-size="9" fill="white">▲</text>
                </g>
              </g>
            </g>
          </svg>
        </div>

        <!-- Tooltip -->
        <Teleport to="body">
          <div
            v-if="tooltip"
            class="fixed z-[60] pointer-events-none rounded-xl border px-3 py-2.5 shadow-xl text-xs"
            :style="`left:${tooltip.x}px; top:${tooltip.y}px; transform:translateX(-50%);
              background:${isDark ? '#1e293b' : '#fff'};
              border-color:${isDark ? '#334155' : '#e2e8f0'};
              color:${C.text}`"
          >
            <p class="font-semibold">{{ tooltip.user.name }}</p>
            <p :style="`color:${C.textMuted}`">{{ tooltip.user.role }}</p>
            <p v-if="tooltip.user.department" :style="`color:${isDark ? '#475569' : '#94a3b8'}`">{{ tooltip.user.department }}</p>
            <p :style="`color:${isDark ? '#475569' : '#94a3b8'}; font-family: monospace`">{{ tooltip.user.email }}</p>
          </div>
        </Teleport>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>