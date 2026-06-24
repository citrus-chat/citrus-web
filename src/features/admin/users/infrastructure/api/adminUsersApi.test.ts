import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/core/api/apiClient", () => ({
  apiClient: { get },
}));

import { getAdminUsersApi } from "./adminUsersApi";

describe("getAdminUsersApi", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ items: [], meta: {} });
  });

  it("requests the first backend page with the default size", async () => {
    await getAdminUsersApi();

    expect(get).toHaveBeenCalledWith("/admin/users", {
      params: {
        page: 0,
        size: 20,
        search: undefined,
        status: undefined,
        sortBy: undefined,
        direction: undefined,
      },
    });
  });

  it("forwards zero-based pagination and supported query parameters", async () => {
    await getAdminUsersApi({
      page: 1,
      size: 10,
      search: "ana",
      status: "ACTIVE",
      sortBy: "email",
      direction: "asc",
    });

    expect(get).toHaveBeenCalledWith("/admin/users", {
      params: {
        page: 1,
        size: 10,
        search: "ana",
        status: "ACTIVE",
        sortBy: "email",
        direction: "asc",
      },
    });
  });
});
