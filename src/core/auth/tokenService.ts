const TOKEN_KEY = "access_token";

export const tokenService = {
  // existing API (kept for compatibility)
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // New, explicit API requested by the project requirements
  saveAccessToken(token: string) {
    this.setToken(token);
  },

  getAccessToken(): string | null {
    return this.getToken();
  },

  removeAccessToken() {
    this.removeToken();
  },

  hasAccessToken(): boolean {
    return this.isAuthenticated();
  },
};
