export function generateDeviceName(): string {
  return `${getBrowserName()} Web`;
}

function getBrowserName(): string {
  const ua = navigator.userAgent;

  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Google Chrome";
  if (ua.includes("Safari")) return "Safari";

  return "Unknown Browser";
}
