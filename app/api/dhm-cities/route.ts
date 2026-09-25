import { NextResponse } from "next/server";

// DHM Meteorological Forecasting Division: official city forecasts and observed daily weather
// (same feeds as dhm.gov.np/mfd). Only DHM's own "manual" forecast is used, not its model output.
const MFD = "https://dhm.gov.np/mfd/api";
const HEADERS = { Accept: "application/json", "User-Agent": "Mozilla/5.0 (NepalWeatherTracker)" };

interface MfdPeriod {
  day: number; // 1 = today (daytime), 2 = tonight, 3 = tomorrow — as used on dhm.gov.np/mfd
  rain_probability: number | null;
  from_temperature: number | null;
  to_temperature: number | null;
  weather?: { name?: string; nepali_name?: string } | null;
}

export interface DhmCityForecastPeriod {
  period: "today" | "tonight" | "tomorrow";
  weather: string;
  weatherNe: string;
  tempFrom: number | null;
  tempTo: number | null;
  rainChance: number | null;
}

export interface DhmCityWeather {
  id: number;
  name: string;
  nepaliName?: string;
  coordinates: [number, number];
  forecast: DhmCityForecastPeriod[];
  observed: { maxTemp: number | null; minTemp: number | null; rainfallMm: number | null; trace: boolean } | null;
}

const PERIOD: Record<number, DhmCityForecastPeriod["period"]> = { 1: "today", 2: "tonight", 3: "tomorrow" };
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export async function GET() {
  const [fc, obs] = await Promise.allSettled([
    fetch(`${MFD}/weather`, { cache: "no-store", headers: HEADERS }).then((r) => {
      if (!r.ok) throw new Error(`MFD weather HTTP ${r.status}`);
      return r.json();
    }),
    fetch(`${MFD}/manual-observation`, { cache: "no-store", headers: HEADERS }).then((r) => {
      if (!r.ok) throw new Error(`MFD observation HTTP ${r.status}`);
      return r.json();
    }),
  ]);

  if (fc.status === "rejected" && obs.status === "rejected") {
    console.error("DHM city weather unavailable", fc.reason, obs.reason);
    return NextResponse.json({ success: false, error: "DHM city weather is currently unavailable" }, { status: 502 });
  }

  const obsById = new Map<number, Record<string, unknown>>();
  if (obs.status === "fulfilled") {
    for (const s of obs.value?.stations || []) obsById.set(s.id, s);
  }

  const cities: DhmCityWeather[] = [];
  const seen = new Set<number>();
  if (fc.status === "fulfilled") {
    for (const s of fc.value?.stations || []) {
      seen.add(s.id);
      const o = obsById.get(s.id);
      cities.push({
        id: s.id,
        name: s.name,
        nepaliName: s.nepali_name || undefined,
        coordinates: [s.latitude, s.longitude],
        forecast: ((s.manual_forecast || []) as MfdPeriod[])
          .filter((p) => PERIOD[p.day])
          .sort((a, b) => a.day - b.day)
          .map((p) => ({
            period: PERIOD[p.day],
            weather: p.weather?.name || "",
            weatherNe: p.weather?.nepali_name || "",
            tempFrom: num(p.from_temperature),
            tempTo: num(p.to_temperature),
            rainChance: num(p.rain_probability),
          })),
        observed: o
          ? {
              maxTemp: num(o.max_temperature),
              minTemp: num(o.min_temperature),
              // DHM publishes 0.01 to mean "trace" (rain too small to measure)
              rainfallMm: num(o.rainfall) === 0.01 ? 0 : num(o.rainfall),
              trace: num(o.rainfall) === 0.01,
            }
          : null,
      });
    }
  }
  // Observation stations with no city forecast
  if (obs.status === "fulfilled") {
    for (const o of obs.value?.stations || []) {
      if (seen.has(o.id)) continue;
      cities.push({
        id: o.id,
        name: o.name,
        coordinates: [o.latitude, o.longitude],
        forecast: [],
        observed: {
          maxTemp: num(o.max_temperature),
          minTemp: num(o.min_temperature),
          rainfallMm: num(o.rainfall) === 0.01 ? 0 : num(o.rainfall),
          trace: num(o.rainfall) === 0.01,
        },
      });
    }
  }

  return NextResponse.json(
    {
      success: true,
      source: "Department of Hydrology and Meteorology — Meteorological Forecasting Division",
      forecastIssuedAt: fc.status === "fulfilled" ? fc.value?.datetime ?? null : null,
      observedIssuedAt: obs.status === "fulfilled" ? obs.value?.issue_date ?? null : null,
      cities,
    },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300" } }
  );
}
