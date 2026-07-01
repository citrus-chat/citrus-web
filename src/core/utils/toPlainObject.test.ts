import { computed, isProxy, reactive, ref } from "vue";
import { describe, expect, it } from "vitest";

import { toPlainObject } from "./toPlainObject";

describe("toPlainObject", () => {
  it("keeps primitives untouched", () => {
    expect(toPlainObject("citrus")).toBe("citrus");
    expect(toPlainObject(42)).toBe(42);
    expect(toPlainObject(null)).toBeNull();
  });

  it("converts nested reactive objects and arrays into cloneable values", () => {
    const value = reactive({
      roles: [
        {
          id: "role-1",
          chatPermissions: reactive([
            { permissionId: "permission-1", code: "CAN_VIEW_MESSAGE" },
          ]),
        },
      ],
      nested: ref({ enabled: true }),
      computedValue: computed(() => "ready"),
    });

    const plain = toPlainObject(value);

    expect(isProxy(plain)).toBe(false);
    expect(isProxy(plain.roles)).toBe(false);
    expect(isProxy(plain.roles[0]?.chatPermissions)).toBe(false);
    expect(plain).toEqual({
      roles: [
        {
          id: "role-1",
          chatPermissions: [
            { permissionId: "permission-1", code: "CAN_VIEW_MESSAGE" },
          ],
        },
      ],
      nested: { enabled: true },
      computedValue: "ready",
    });
    expect(() => structuredClone(plain)).not.toThrow();
  });

  it("converts Date, Map and Set values without keeping functions", () => {
    const plain = toPlainObject({
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
      byId: new Map([["role-1", { name: "Admin" }]]),
      selectedIds: new Set(["role-1"]),
      onClick: () => "skip",
    });

    expect(plain).toEqual({
      createdAt: "2026-06-30T12:00:00.000Z",
      byId: { "role-1": { name: "Admin" } },
      selectedIds: ["role-1"],
    });
  });
});
