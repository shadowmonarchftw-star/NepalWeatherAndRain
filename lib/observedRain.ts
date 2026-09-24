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
