import { describe, expect, it } from "vitest";

import { mapAdminUsersPaginatedResponse } from "./mapAdminUserResponse";

describe("mapAdminUsersPaginatedResponse", () => {
  it("normalizes supported API fields without requiring optional data", () => {
    const response = mapAdminUsersPaginatedResponse({
      items: [
        {
          id: "user-1",
          firstName: "Ana",
          lastName: "Pérez",
          username: "ana.perez",
          email: "ana@citruschat.com",
          active: true,
          emailVerified: false,
          role: "ADMIN",
        },
      ],
      meta: {
        currentPage: 0,
        perPage: 20,
        total: 135,
        lastPage: 6,
        from: 1,
        to: 20,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    });

    expect(response.items).toEqual([
      expect.objectContaining({
        id: "user-1",
        displayName: "Ana Pérez",
        status: "active",
        validationStatus: "pending",
        role: "ADMIN",
      }),
    ]);
    expect(response.meta).toMatchObject({
      currentPage: 0,
      total: 135,
      lastPage: 6,
      hasNextPage: true,
    });
  });

  it("returns an empty collection for an unsupported payload", () => {
    expect(mapAdminUsersPaginatedResponse({ total: 0 })).toEqual({
      items: [],
      meta: {
        currentPage: 0,
        perPage: 0,
        total: 0,
        lastPage: 0,
        from: 0,
        to: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });
});
