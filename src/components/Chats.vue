<script setup>
const chats = [
  {
    id: 1,
    name: "Javalinas Empresariales",
    lastMessage: "¿Alguien tiene novedades sobre el proyecto?",
    timestamp: "10:30 AM",
    selected: true,
    isGroup: true,
    lastSender: "FrancoGei",
    isActive: false,
  },
  {
    id: 2,
    name: "María",
    lastMessage: "Nos vemos mañana",
    timestamp: "9:15 AM",
    selected: false,
    isGroup: false,
    lastSender: "María",
    isActive: true,
  },
  {
    id: 3,
    name: "Carlos",
    lastMessage: "¿Puedes enviarme el archivo?",
    timestamp: "8:45 AM",
    lastSender: "Carlos",
    selected: false,
    isGroup: false,
    isActive: true,
  },
  {
    id: 4,
    name: "Ana",
    lastMessage:
      "¡Hola! Quería contarte que el proyecto va muy bien, hemos avanzado mucho en las últimas semanas y estamos a punto de terminar la primera fase. ¿Quieres que te envíe un resumen de lo que hemos hecho hasta ahora?",
    timestamp: "Yesterday",
    selected: false,
    isGroup: false,
    lastSender: "Ana",
    isActive: false,
  },
  {
    id: 5,
    name: "Equipo de Marketing",
    lastMessage: "Reunión programada para el lunes a las 3 PM",
    timestamp: "Yesterday",
    selected: false,
    isGroup: true,
    lastSender: "Juan",
    isActive: false,
  },
  {
    id: 6,
    name: "Soporte Técnico",
    lastMessage: "Tu ticket ha sido resuelto, por favor verifica tu correo.",
    timestamp: "2 days ago",
    selected: false,
    isGroup: false,
    lastSender: "Damián",
    isActive: false,
  },
  {
    id: 7,
    name: "Amigos del Colegio",
    lastMessage: "¿Quién se apunta para la reunión del sábado?",
    timestamp: "3 days ago",
    selected: false,
    isGroup: true,
    lastSender: "Pedro",
    isActive: false,
  },
  {
    id: 8,
    name: "Familia",
    lastMessage: "¡Feliz cumpleaños! Te queremos mucho.",
    timestamp: "4 days ago",
    selected: false,
    isGroup: true,
    lastSender: "Mamá",
    isActive: false,
  },
  {
    id: 9,
    name: "Proyecto de la Universidad",
    lastMessage: "Recordatorio: entrega del informe final el próximo viernes.",
    timestamp: "5 days ago",
    selected: false,
    isGroup: false,
    lastSender: "Juan",
    isActive: false,
  },
  {
    id: 10,
    name: "Grupo de Viaje",
    lastMessage: "¿Alguien tiene sugerencias para el itinerario?",
    timestamp: "6 days ago",
    selected: false,
    isGroup: true,
    lastSender: "Sofía",
    isActive: false,
  },
  {
    id: 11,
    name: "Equipo de Desarrollo",
    lastMessage:
      "La nueva versión del software estará disponible la próxima semana.",
    timestamp: "1 week ago",
    selected: false,
    isGroup: true,
    lastSender: "Juan",
    isActive: false,
  },
];
</script>

<template>
  <section class="flex-[0.4] p-4 overflow-x-hidden overflow-y-auto">
    <div
      class="flex items-center justify-center rounded p-2 mb-4 space-x-1 border border-secondary text-gray-700"
    >
      <button type="button" aria-label="Buscar chats" class="cursor-pointer">
        <i class="pi pi-search text-xl" />
      </button>

      <input
        type="text"
        placeholder="Buscar en Citrus Chat..."
        class="w-full p-2 rounded outline-none bg-transparent"
      />
    </div>

    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold mb-4">Chats</h2>
      <button
        type="button"
        aria-label="Add chat"
        class="cursor-pointer text-primary"
      >
        <i class="pi pi-plus text-xl" />
      </button>
    </div>

    <div class="flex flex-col">
      <div
        v-for="chat in chats"
        :key="chat.id"
        class="flex items-center p-3 rounded cursor-pointer"
        :class="chat.selected ? 'border-l-[6px] border-primary' : ''"
      >
        <div class="relative mr-3">
          <img
            src="../assets/avatar-profile.svg"
            alt="Avatar"
            class="w-10 h-10 rounded-full"
          />
          <span
            v-if="chat.isActive && !chat.isGroup"
            class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
          />
        </div>

        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center justify-between w-full">
            <h3 class="text-lg font-semibold">
              {{ chat.name }}
            </h3>
            <span class="text-xs text-gray-500">{{ chat.timestamp }}</span>
          </div>

          <p class="text-sm text-left text-gray-600 truncate">
            {{
              chat.isGroup
                ? `${chat.lastSender}: ${chat.lastMessage}`
                : chat.lastMessage
            }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
