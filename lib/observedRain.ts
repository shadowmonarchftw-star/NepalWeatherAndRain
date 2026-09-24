import { DHMRainStation, ObservedDistrictRain } from "./types";

/** Highest measured 24h rainfall per district from live DHM rain gauges. */
export function summarizeObservedRainByDistrict(stations: DHMRainStation[]): Record<string, ObservedDistrictRain> {
  const out: Record<string, ObservedDistrictRain> = {};
  for (const s of stations) {
    if (!s.districtId || s.rain24h === null) continue;
    const cur = out[s.districtId];
    if (!cur) {
      out[s.districtId] = { max24hMm: s.rain24h, stationName: s.name, gaugeCount: 1 };
    } else {
      cur.gaugeCount++;
      if (s.rain24h > cur.max24hMm) {
        cur.max24hMm = s.rain24h;
        cur.stationName = s.name;
      }
    }
  }
  return out;
}

export const BASIN_RAIN_RADIUS_KM = 50;

// BIPAD basin labels vary slightly between river and rain gauges
function normBasin(b?: string): string {
  const s = (b || "").toLowerCase().replace(/\s+basin$/, "").trim();
  return s === "kamla" ? "kamala" : s;
}

function distanceKm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export interface BasinRainSummary {
  gaugeCount: number;
  max24hMm: number;
  maxStation: string;
  max1hMm: number;
}

/** Rain gauges in the same DHM basin and within BASIN_RAIN_RADIUS_KM of a river gauge. */
export function basinRainNear(
  river: { basin?: string; coordinates: [number, number] },
  rainStations: DHMRainStation[]
): BasinRainSummary | null {
  const basin = normBasin(river.basin);
  if (!basin) return null;
  let out: BasinRainSummary | null = null;
  for (const s of rainStations) {
    if (normBasin(s.basin) !== basin || s.rain24h === null) continue;
    if (distanceKm(river.coordinates, s.coordinates) > BASIN_RAIN_RADIUS_KM) continue;
    if (!out) out = { gaugeCount: 0, max24hMm: -1, maxStation: "", max1hMm: 0 };
    out.gaugeCount++;
    if (s.rain24h > out.max24hMm) {
      out.max24hMm = s.rain24h;
      out.maxStation = s.name;
    }
    out.max1hMm = Math.max(out.max1hMm, s.rain1h ?? 0);
  }
  return out;
}
