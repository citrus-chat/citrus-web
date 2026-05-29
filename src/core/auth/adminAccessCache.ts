let cachedToken: string | null = null;
let cachedIsAdmin: boolean | null = null;

export const adminAccessCache = {
  getCachedAdminAccess(token: string | null): boolean | null {
    if (!token) return null;
    if (!cachedToken) return null;
    if (cachedToken !== token) return null;
    return cachedIsAdmin;
  },

  setCachedAdminAccess(token: string | null, isAdmin: boolean) {
    if (!token) return;
    cachedToken = token;
    cachedIsAdmin = isAdmin;
  },

  clearAdminAccessCache() {
    cachedToken = null;
    cachedIsAdmin = null;
  },
};
