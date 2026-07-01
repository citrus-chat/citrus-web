export async function clearClientSession(): Promise<void> {
  try {
    localStorage.removeItem("selectedChat");
  } catch {
    // ignore
  }

  // sessionStorage: por si en algún punto se guarda algo acá.
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }

  // Cookies no-httpOnly accesibles desde JS (si algún día existieran).
  try {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (!name) return;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  } catch {
    // ignore
  }
}
