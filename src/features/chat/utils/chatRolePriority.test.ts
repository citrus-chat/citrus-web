import { describe, expect, it } from "vitest";

import {
  DEFAULT_CHAT_ROLE_PRIORITY,
  getChatRolePriorityValidationError,
  normalizeChatRolePriority,
  parseChatRolePriority,
} from "./chatRolePriority";

describe("chatRolePriority", () => {
  it("parses visible numeric input values", () => {
    expect(parseChatRolePriority(1)).toBe(1);
    expect(parseChatRolePriority("50")).toBe(50);
    expect(parseChatRolePriority(100)).toBe(100);
  });

  it("normalizes priority without ever returning 101", () => {
    expect(normalizeChatRolePriority("")).toBe(DEFAULT_CHAT_ROLE_PRIORITY);
    expect(normalizeChatRolePriority(0)).toBe(1);
    expect(normalizeChatRolePriority(100)).toBe(100);
    expect(normalizeChatRolePriority(101)).toBe(100);
  });

  it("validates the backend priority range before submit", () => {
    expect(getChatRolePriorityValidationError(1)).toBe("");
    expect(getChatRolePriorityValidationError(100)).toBe("");
    expect(getChatRolePriorityValidationError(101)).toBe(
      "La prioridad debe ser menor o igual a 100.",
    );
  });
});
