<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import "primeicons/primeicons.css";
import avatarDefault from "@/shared/assets/avatar-profile.svg";

export interface ProfileFormData {
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  avatarFile?: File | null;
  description: string;
  privacy: "public" | "contacts" | "private";
  privacySettings: {
    showPhone: boolean;
    showEmail: boolean;
    showStatus: boolean;
    showDescription: boolean;
    allowGroupInvites: boolean;
  };
}

const props = defineProps<{
  visible: boolean;
  form: ProfileFormData;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "save", value: ProfileFormData): void;
}>();

// ── Local copy — sin structuredClone en el init para no romper reactividad ────
const localForm = reactive<ProfileFormData>({
  username: props.form.username,
  email: props.form.email,
  phone: props.form.phone,
  avatarUrl: props.form.avatarUrl,
  description: props.form.description,
  privacy: props.form.privacy,
  privacySettings: { ...props.form.privacySettings },
});

const tab = ref<"profile" | "privacy">("profile");

// ── hasChanges: flag manual (más estable que JSON.stringify) ──────────────────
const hasChanges = ref(false);

watch(
  localForm,
  () => {
    hasChanges.value = true;
  },
  { deep: true },
);

// Al abrir el modal: sincronizar localForm con el form actual del padre y resetear flag
watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    localForm.username = props.form.username;
    localForm.email = props.form.email;
    localForm.phone = props.form.phone;
    localForm.avatarUrl = props.form.avatarUrl;
    localForm.description = props.form.description;
    localForm.privacy = props.form.privacy;
    Object.assign(localForm.privacySettings, props.form.privacySettings);
    // Reset de estado — hasChanges DESPUÉS del assign para que el watcher no lo active
    setTimeout(() => {
      hasChanges.value = false;
    }, 0);
    tab.value = "profile";
    showUnsaved.value = false;
    isSaving.value = false;
    saveSuccess.value = false;
  },
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const avatarInput = ref<HTMLInputElement | null>(null);
const currentAvatar = computed(() => localForm.avatarUrl ?? avatarDefault);

function pickAvatar() {
  avatarInput.value?.click();
}
function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  localForm.avatarFile = file;

  const reader = new FileReader();

  // Guardamos en localForm para que el watcher deep detecte el cambio y active hasChanges
  reader.onload = (ev) => {
    localForm.avatarUrl = ev.target?.result as string;
  };

  reader.readAsDataURL(file);
}

// ── Save ──────────────────────────────────────────────────────────────────────
const isSaving = ref(false);
const saveSuccess = ref(false);

async function saveChanges() {
  if (isSaving.value || !hasChanges.value) return;
  isSaving.value = true;

  // Emit a plain copy (no proxies) so the parent can start the async work
  // (e.g. upload avatar) immediately — no artificial delay here.
  emit("save", {
    username: localForm.username,
    email: localForm.email,
    phone: localForm.phone,
    avatarUrl: localForm.avatarUrl,
    avatarFile: localForm.avatarFile ?? null,
    description: localForm.description,
    privacy: localForm.privacy,
    privacySettings: { ...localForm.privacySettings },
  });
  isSaving.value = false;
  saveSuccess.value = true;
  hasChanges.value = false;
  // Close after a brief success flash so the user sees the checkmark
  setTimeout(() => {
    saveSuccess.value = false;
    emit("update:visible", false);
  }, 700);
}

// ── Unsaved guard ─────────────────────────────────────────────────────────────
const showUnsaved = ref(false);
function tryClose() {
  if (hasChanges.value) {
    showUnsaved.value = true;
    return;
  }
  emit("update:visible", false);
}
function confirmDiscard() {
  showUnsaved.value = false;
  emit("update:visible", false);
}

// ── Privacy field list ────────────────────────────────────────────────────────
type PrivacyBoolKey = keyof Omit<
  ProfileFormData["privacySettings"],
  "allowGroupInvites"
>;
interface PrivacyField {
  key: PrivacyBoolKey;
  label: string;
  icon: string;
}

const privacyFields: PrivacyField[] = [
  { key: "showPhone", label: "Número de teléfono", icon: "pi-phone" },
  { key: "showEmail", label: "Correo electrónico", icon: "pi-envelope" },
  { key: "showStatus", label: "Estado", icon: "pi-circle" },
  { key: "showDescription", label: "Descripción", icon: "pi-align-left" },
];
</script>

<template>
  <Teleport to="body">
    <Transition name="mfade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        @click.self="tryClose"
      >
        <div
          class="w-full max-w-lg flex flex-col max-h-[90vh] rounded-3xl border shadow-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 pt-6 pb-4 shrink-0"
          >
            <div>
              <h3
                class="text-base font-semibold text-slate-900 dark:text-slate-50"
              >
                Editar perfil
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Modificá tu información personal
              </p>
            </div>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full border transition border-slate-200 bg-white text-slate-400 hover:text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              @click="tryClose"
            >
              <i class="pi pi-times text-sm" />
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex gap-1 px-6 pb-4 shrink-0">
            <button
              v-for="t in [
                { id: 'profile', label: 'Perfil', icon: 'pi-user' },
                { id: 'privacy', label: 'Privacidad', icon: 'pi-lock' },
              ]"
              :key="t.id"
              type="button"
              class="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition"
              :class="
                tab === t.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
              "
              @click="tab = t.id as 'profile' | 'privacy'"
            >
              <i class="pi text-[11px]" :class="t.icon" />{{ t.label }}
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 pb-2 space-y-5">
            <!-- ── PERFIL TAB ── -->
            <template v-if="tab === 'profile'">
              <!-- Avatar row -->
              <div class="flex items-center gap-4">
                <div class="relative shrink-0">
                  <img
                    :src="currentAvatar"
                    alt="Avatar"
                    class="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800"
                  />
                  <button
                    type="button"
                    class="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-400 transition"
                    @click="pickAvatar"
                  >
                    <i class="pi pi-camera text-xs" />
                  </button>
                  <input
                    ref="avatarInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onAvatarChange"
                  />
                </div>
                <div>
                  <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                  >
                    {{ localForm.username }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    @{{ localForm.username }}
                  </p>
                  <button
                    type="button"
                    class="mt-2 text-xs text-orange-500 font-medium hover:underline"
                    @click="pickAvatar"
                  >
                    Cambiar foto de perfil
                  </button>
                </div>
              </div>

              <!-- Username -->
              <div>
                <label
                  class="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2"
                  >Username</label
                >
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none"
                    >@</span
                  >
                  <input
                    v-model="localForm.username"
                    type="text"
                    class="w-full rounded-xl border pl-7 pr-4 py-2.5 text-sm outline-none transition border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                    placeholder="tu_username"
                  />
                </div>
              </div>

              <!-- Email corporativo (solo lectura) -->
              <div>
                <label
                  class="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2"
                >
                  Email corporativo
                  <span
                    class="normal-case tracking-normal font-normal text-slate-400 dark:text-slate-500"
                    >· no editable</span
                  >
                </label>
                <div class="relative">
                  <i
                    class="pi pi-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                  />
                  <div
                    class="w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm border-slate-200/60 bg-slate-100 text-slate-500 dark:border-white/5 dark:bg-slate-800/40 dark:text-slate-500 cursor-not-allowed select-none"
                  >
                    {{ localForm.email }}
                  </div>
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label
                  class="block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2"
                  >Descripción</label
                >
                <textarea
                  v-model="localForm.description"
                  rows="4"
                  maxlength="200"
                  class="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Contá algo sobre vos..."
                />
                <p class="text-right text-[10px] text-slate-400 mt-1">
                  {{ localForm.description.length }}/200
                </p>
              </div>
            </template>

            <!-- ── PRIVACIDAD TAB ── -->
            <template v-if="tab === 'privacy'">
              <!-- Visibilidad de campos -->
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-1"
                >
                  Visibilidad de datos
                </p>
                <p
                  class="text-xs text-slate-400 dark:text-slate-500 mb-3 leading-relaxed"
                >
                  Los admins y tu jefe directo siempre pueden ver todos tus
                  datos.
                </p>
                <div class="space-y-2">
                  <div
                    v-for="field in privacyFields"
                    :key="field.key"
                    class="flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors"
                    :class="
                      localForm.privacySettings[field.key]
                        ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-900/20'
                        : 'border-slate-200 bg-slate-50/60 dark:border-white/8 dark:bg-slate-800/30'
                    "
                    @click="
                      localForm.privacySettings[field.key] =
                        !localForm.privacySettings[field.key]
                    "
                  >
                    <!-- Icon -->
                    <div
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                      :class="
                        localForm.privacySettings[field.key]
                          ? 'bg-emerald-100 dark:bg-emerald-900/50'
                          : 'bg-slate-100 dark:bg-slate-700/60'
                      "
                    >
                      <i
                        class="pi text-sm transition-colors"
                        :class="[
                          field.icon,
                          localForm.privacySettings[field.key]
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400',
                        ]"
                      />
                    </div>
                    <!-- Label -->
                    <p
                      class="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                      {{ field.label }}
                    </p>
                    <!-- Toggle -->
                    <div class="flex items-center gap-2 shrink-0">
                      <span
                        class="text-xs font-medium transition-colors"
                        :class="
                          localForm.privacySettings[field.key]
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-500'
                        "
                      >
                        {{
                          localForm.privacySettings[field.key]
                            ? "Visible"
                            : "Oculto"
                        }}
                      </span>
                      <div
                        class="relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0"
                        :class="
                          localForm.privacySettings[field.key]
                            ? 'bg-emerald-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        "
                      >
                        <div
                          class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                          :class="
                            localForm.privacySettings[field.key]
                              ? 'translate-x-4'
                              : 'translate-x-0.5'
                          "
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Política de grupos -->
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-1"
                >
                  Política de grupos
                </p>
                <p
                  class="text-xs text-slate-400 dark:text-slate-500 mb-3 leading-relaxed"
                >
                  Tu jefe directo siempre puede agregarte independientemente de
                  esta configuración.
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="opt in [
                      {
                        value: true,
                        label: 'Cualquiera',
                        icon: 'pi-users',
                        desc: 'Cualquiera puede agregarte',
                      },
                      {
                        value: false,
                        label: 'Solo invitación',
                        icon: 'pi-envelope-open',
                        desc: 'Debés aceptar la invitación',
                      },
                    ]"
                    :key="String(opt.value)"
                    type="button"
                    class="flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition"
                    :class="
                      localForm.privacySettings.allowGroupInvites === opt.value
                        ? 'border-orange-400 bg-orange-50 dark:border-orange-500/60 dark:bg-orange-900/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-slate-800 dark:hover:border-white/20'
                    "
                    @click="
                      localForm.privacySettings.allowGroupInvites = opt.value
                    "
                  >
                    <i
                      class="pi text-lg"
                      :class="[
                        opt.icon,
                        localForm.privacySettings.allowGroupInvites ===
                        opt.value
                          ? 'text-orange-500'
                          : 'text-slate-400 dark:text-slate-500',
                      ]"
                    />
                    <div>
                      <p
                        class="text-sm font-semibold"
                        :class="
                          localForm.privacySettings.allowGroupInvites ===
                          opt.value
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-slate-900 dark:text-slate-100'
                        "
                      >
                        {{ opt.label }}
                      </p>
                      <p
                        class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed"
                      >
                        {{ opt.desc }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div
            class="px-6 pb-6 pt-4 shrink-0 border-t border-slate-100 dark:border-white/5"
          >
            <p
              v-if="hasChanges && !saveSuccess"
              class="text-xs text-amber-500 dark:text-amber-400 mb-3 flex items-center gap-1.5"
            >
              <i class="pi pi-exclamation-circle" />Tenés cambios sin guardar
            </p>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-2xl border px-4 py-2.5 text-sm font-medium transition border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-white/5"
                :disabled="isSaving"
                @click="tryClose"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                :class="
                  hasChanges && !saveSuccess
                    ? 'bg-orange-500 hover:bg-orange-400'
                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                "
                :disabled="!hasChanges || isSaving || saveSuccess"
                @click="saveChanges"
              >
                <i
                  class="pi"
                  :class="
                    saveSuccess
                      ? 'pi-check'
                      : isSaving
                        ? 'pi-spin pi-spinner'
                        : 'pi-save'
                  "
                />
                {{
                  saveSuccess
                    ? "Guardado"
                    : isSaving
                      ? "Guardando…"
                      : "Guardar cambios"
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- Confirm discard overlay -->
        <Transition name="mfade">
          <div
            v-if="showUnsaved"
            class="fixed inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <div
              class="w-full max-w-sm rounded-2xl border p-6 shadow-2xl bg-white border-slate-200 dark:bg-slate-900 dark:border-white/10"
            >
              <div
                class="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 mb-4"
              >
                <i class="pi pi-exclamation-triangle text-amber-500 text-lg" />
              </div>
              <h4
                class="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1"
              >
                ¿Descartar cambios?
              </h4>
              <p
                class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5"
              >
                Tenés cambios sin guardar en tu perfil. Si salís ahora se
                perderán.
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                  @click="showUnsaved = false"
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition"
                  @click="confirmDiscard"
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mfade-enter-active,
.mfade-leave-active {
  transition: opacity 0.15s ease;
}
.mfade-enter-from,
.mfade-leave-to {
  opacity: 0;
}
</style>
