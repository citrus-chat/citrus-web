import type { WorkspaceUser } from "@/features/chat/domain/WorkspaceUser";

const statuses = ["online", "away", "offline"] as const;

export const mockWorkspaceUsers: WorkspaceUser[] = [
  {
    id: "user-1",
    name: "Carlos Martinez",
    username: "carlos.martinez",
    email: "carlos@example.com",
    status: "online",
    role: "CEO",
    department: "Management",
    timezone: "America/Argentina/Buenos_Aires",
    phoneNumber: "+54 11 5555 0001",
    bio: "Director general.",
  },
  {
    id: "user-101",
    name: "Agricultor Uno",
    username: "agricultor1",
    email: "agricultor1@citrus.com",
    status: "online",
    role: "Manager",
    department: "Operations",
    managerId: "user-2",
    timezone: "America/Argentina/Buenos_Aires",
    phoneNumber: "+54 11 5555 0101",
    bio: "Usuario de prueba",
  },
];

for (let i = 2; i <= 100; i++) {
  mockWorkspaceUsers.push({
    id: `user-${i}`,
    name: `Empleado ${i}`,
    username: `empleado${i}`,
    email: `empleado${i}@citrus.com`,
    status: statuses[i % 3] as "online" | "away" | "offline",
    role:
      i <= 5
        ? "Director"
        : i <= 20
          ? "Manager"
          : i <= 50
            ? "Senior Developer"
            : "Developer",
    department: i <= 20 ? "Management" : i <= 60 ? "Engineering" : "Operations",
    managerId:
      i <= 5
        ? "user-1"
        : i <= 20
          ? `user-${2 + ((i - 6) % 4)}`
          : `user-${6 + ((i - 21) % 15)}`,
    timezone: "America/Argentina/Buenos_Aires",
    phoneNumber: `+54 11 5555 ${String(i).padStart(4, "0")}`,
    bio: `Empleado de prueba ${i}.`,
  });
}

// Usuario actual: un Manager con jefe y subordinados para ver las tres capas
export const currentWorkspaceUser: WorkspaceUser = mockWorkspaceUsers.find(
  (u) => u.id === "user-35",
)!;
