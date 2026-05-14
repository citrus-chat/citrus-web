<script setup lang="ts">
import { useChatStore } from "../../store/ChatStore";

const { messages, selectedChat } = useChatStore();
</script>

<template>
  <section
    class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
  >
    <div
      class="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10"
    >
      <img
        src="@/shared/assets/avatar-profile.svg"
        alt="Group Avatar"
        class="h-9 w-9 rounded-full object-cover"
      />
      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {{ selectedChat?.name }}
        </h2>
      </div>
    </div>

    <div class="flex-1 overflow-auto px-4 py-4 space-y-4">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.sender === 'me' ? 'justify-end' : 'justify-start'"
      >
        <div class="max-w-[70%]">
          <div
            class="mb-2 flex items-center gap-3"
            :class="message.sender === 'me' ? 'justify-end' : 'justify-start'"
          >
            <p class="text-xs text-slate-500 dark:text-slate-500">
              {{
                message.deliveredAt
                  ? new Date(message.deliveredAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }}
            </p>
            <img
              src="@/shared/assets/avatar-profile.svg"
              alt="User Avatar"
              class="h-8 w-8 rounded-full object-cover"
            />
          </div>

          <div
            :class="
              message.sender === 'me'
                ? 'ml-auto rounded-2xl rounded-br-md bg-blue-600 px-4 py-2 text-sm text-white shadow-sm'
                : 'rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800/90 dark:text-slate-100 dark:ring-white/5'
            "
          >
            {{ message.text }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="border-t border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/90"
    >
      <div class="mx-auto flex max-w-4xl items-center gap-3">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
        >
          Enviar
        </button>
      </div>
    </div>
  </section>
</template>
