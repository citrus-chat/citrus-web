export const DEFAULT_CHAT_ROLE_PRIORITY = 10;

export function parseChatRolePriority(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeChatRolePriority(value: unknown): number {
  const parsed = parseChatRolePriority(value);

  if (parsed === null) {
    return DEFAULT_CHAT_ROLE_PRIORITY;
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 100);
}

export function getChatRolePriorityValidationError(value: unknown): string {
  const parsed = parseChatRolePriority(value);

  if (parsed === null) {
    return "La prioridad es obligatoria.";
  }

  if (parsed < 1) {
    return "La prioridad debe ser mayor o igual a 1.";
  }

  if (parsed > 100) {
    return "La prioridad debe ser menor o igual a 100.";
  }

  return "";
}
