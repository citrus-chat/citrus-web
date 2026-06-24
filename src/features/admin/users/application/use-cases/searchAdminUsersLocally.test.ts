import { describe, expect, it } from "vitest";

import { searchAdminUsersLocally } from "./searchAdminUsersLocally";

const users = [
  {
    id: "1",
    displayName: "Ana Pérez",
    username: "ana",
    email: "ana@citruschat.com",
    status: "active" as const,
    validationStatus: "validated" as const,
    role: "ADMIN",
  },
  {
    id: "2",
    displayName: "Bruno Silva",
    username: "bruno",
    email: "bruno@citruschat.com",
    status: "inactive" as const,
    validationStatus: "pending" as const,
    role: "USER",
  },
];

describe("searchAdminUsersLocally", () => {
  it("filters by text and account state without calling the API", () => {
    expect(
      searchAdminUsersLocally(users, { query: "bruno", status: "inactive" }),
    ).toEqual([users[1]]);
  });

  it("filters by validation state and role", () => {
    expect(
      searchAdminUsersLocally(users, {
        validation: "validated",
        role: "ADMIN",
      }),
    ).toEqual([users[0]]);
  });
});
