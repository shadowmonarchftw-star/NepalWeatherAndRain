import { NEPAL_DISTRICTS } from "@/data/nepalDistricts";

export const BIPAD_API = "https://bipadportal.gov.np/api/v1";

export const BIPAD_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// BIPAD spells these districts differently from our district ids
const BIPAD_DISTRICT_ALIASES: Record<string, string> = {
  dhanusa: "dhanusha",
  tanahu: "tanahun",
  kapilbastu: "kapilvastu",
  nawalparasieast: "nawalpur",
  nawalparasiwest: "parasi",
  rukumeast: "eastern_rukum",
  rukumwest: "western_rukum",
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/**
 * Map of BIPAD numeric district id -> our district id (e.g. 38 -> "kapilvastu").
 * Built from BIPAD's own district list so station.district can be matched reliably.
 */
export async function fetchBipadDistrictMap(): Promise<Map<number, string>> {
  const res = await fetch(`${BIPAD_API}/district/?limit=100`, {
    next: { revalidate: 86400 },
    headers: BIPAD_HEADERS,
  });
  if (!res.ok) throw new Error(`BIPAD district list returned HTTP ${res.status}`);
  const data = await res.json();
  const ourIds = new Map(NEPAL_DISTRICTS.map((d) => [norm(d.id), d.id]));

  const map = new Map<number, string>();
  for (const d of data.results || []) {
    const key = norm(d.title || "");
    const ourId = ourIds.get(key) ?? BIPAD_DISTRICT_ALIASES[key];
    if (ourId) map.set(d.id, ourId);
  }
  return map;
}

export function isFresh(isoTime: string | null | undefined, maxAgeMs: number, now = Date.now()): boolean {
  if (!isoTime) return false;
  const t = Date.parse(isoTime);
  // Future timestamps are data-entry errors, not fresh readings
  return Number.isFinite(t) && t <= now + 5 * 60 * 1000 && now - t <= maxAgeMs;
}
