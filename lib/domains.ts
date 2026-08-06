const BASE_DOMAIN = "tirbeo.app";

// Local dev ports for the platform apps (matches accountsUrl in lib/auth).
const DEV_PORTS: Record<string, number> = {
  accounts: 3002,
  dashboard: 3005,
  forms: 3004,
  admin: 4000,
  support: 3003,
};

function isLocalDev(): boolean {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";
  return apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1");
}

export function appUrl(subdomain: string, path = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const port = DEV_PORTS[subdomain];
  if (isLocalDev() && port) return `http://localhost:${port}${cleanPath}`;
  const domain = subdomain === "www" || !subdomain ? BASE_DOMAIN : `${subdomain}.${BASE_DOMAIN}`;
  return `https://${domain}${cleanPath}`;
}
