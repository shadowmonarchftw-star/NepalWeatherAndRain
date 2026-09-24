import { NextResponse } from "next/server";

export interface DHMRiverStation {
  id: number;
  name: string;
  river: string;
  basin?: string;
  waterLevelM: number;
  // null when DHM has not published a threshold for this station — never synthesized
  warningLevelM: number | null;
  dangerLevelM: number | null;
  // Status exactly as published by DHM (BELOW WARNING / ABOVE WARNING / ABOVE DANGER LEVEL)
  status: "Normal" | "Warning" | "Danger";
  coordinates: [number, number]; // [lat, lon]
  steady?: string;
  waterLevelOn: string;
  elevation?: number;
}

export interface DHMCityForecast {
  city: string;
  maxTemp: string;
  minTemp: string;
  rainProbability: string;
}

interface BIPADStationResult {
  id: number;
  title: string;
  basin?: string;
  waterLevel?: number | null;
  warningLevel?: number | null;
  dangerLevel?: number | null;
  status?: string;
  steady?: string;
  waterLevelOn?: string;
  elevation?: number | null;
  point?: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
}

// A reading older than this is not "live" — the station is offline and its last value must not be shown as current
const MAX_READING_AGE_MS = 24 * 60 * 60 * 1000;
// Datalogger error codes seen in the feed: -99991.53 and 100000 + value (e.g. 100008.56)
const SENSOR_FAULT_MIN = 0;
const SENSOR_FAULT_MAX = 99000;

function mapDhmStatus(raw: string | undefined): "Normal" | "Warning" | "Danger" | null {
  const s = (raw || "").toUpperCase();
  if (s.includes("ABOVE DANGER")) return "Danger";
  if (s.includes("ABOVE WARNING")) return "Warning";
  if (s.includes("BELOW WARNING")) return "Normal";
  return null;
}

export async function GET() {
  try {
    const bipadRes = await fetch("https://bipadportal.gov.np/api/v1/river-stations/?limit=1000", {
      next: { revalidate: 300 }, // 5-minute edge cache
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!bipadRes.ok) throw new Error(`BIPAD river-stations returned HTTP ${bipadRes.status}`);

    const bipadData = await bipadRes.json();
    const rawStations: BIPADStationResult[] = bipadData.results || [];
    const now = Date.now();

    const parsedStations: DHMRiverStation[] = [];
    let staleCount = 0;
    let faultCount = 0;

    for (const s of rawStations) {
      if (!s.point || !Array.isArray(s.point.coordinates) || s.point.coordinates.length < 2) continue;

      const lon = s.point.coordinates[0];
      const lat = s.point.coordinates[1];
      if (lat < 26.0 || lat > 31.0 || lon < 80.0 || lon > 89.0) continue;

      const title = (s.title || "").trim();
      // Velocity and rainfall sensors report in the same feed but are not water levels
      if (/\((velocity|rainfall)\)/i.test(title)) continue;

      const wl = s.waterLevel;
      if (wl === null || wl === undefined || !Number.isFinite(wl)) continue;

      const readingTime = s.waterLevelOn ? Date.parse(s.waterLevelOn) : NaN;
      if (!Number.isFinite(readingTime) || now - readingTime > MAX_READING_AGE_MS) {
        staleCount++;
        continue;
      }

      if (wl < SENSOR_FAULT_MIN || wl > SENSOR_FAULT_MAX) {
        faultCount++;
        continue;
      }

      const status = mapDhmStatus(s.status);
      if (!status) continue;

      parsedStations.push({
        id: s.id,
        name: title,
        river: s.basin || title.split(" at ")[0],
        basin: s.basin || undefined,
        waterLevelM: Number(wl.toFixed(2)),
        warningLevelM: s.warningLevel != null ? Number(s.warningLevel.toFixed(2)) : null,
        dangerLevelM: s.dangerLevel != null ? Number(s.dangerLevel.toFixed(2)) : null,
        status,
        coordinates: [lat, lon] as [number, number],
        steady: s.steady || undefined,
        waterLevelOn: s.waterLevelOn as string,
        elevation: s.elevation ?? undefined,
      });
    }

    return NextResponse.json(
      {
        success: true,
        source: "Department of Hydrology & Meteorology (DHM) via NDRRMA BIPAD Portal",
        count: parsedStations.length,
        totalStations: rawStations.length,
        staleCount,
        faultCount,
        timestamp: new Date().toISOString(),
        rivers: parsedStations,
        cities: [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("BIPAD/DHM river telemetry unavailable", error);
    return NextResponse.json(
      {
        success: false,
        error: "DHM river telemetry is currently unavailable from BIPAD portal",
        timestamp: new Date().toISOString(),
        rivers: [],
        cities: [],
      },
      { status: 502 }
    );
  }
}
