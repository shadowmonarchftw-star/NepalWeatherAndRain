import { NextResponse } from "next/server";
import { DHMRainStation } from "@/lib/types";
import { BIPAD_API, BIPAD_HEADERS, fetchBipadDistrictMap, isFresh } from "@/lib/bipad";

// Rain gauges report every ~15 min; anything older is an offline station
const MAX_READING_AGE_MS = 3 * 60 * 60 * 1000;
// Datalogger faults in the feed show up as negative or absurd totals (e.g. 858,993,472 mm)
const MAX_PLAUSIBLE_24H_MM = 1000;

interface BipadRainStation {
  id: number;
  title: string;
  basin?: string | null;
  measuredOn?: string | null;
  point?: { coordinates: [number, number] }; // [lon, lat]
  elevation?: number | null;
  averages?: { interval: number; value: number | null }[];
  status?: string;
  district?: number | null;
}

export async function GET() {
  try {
    const [res, districtMap] = await Promise.all([
      fetch(`${BIPAD_API}/rain-stations/?limit=1000`, { next: { revalidate: 300 }, headers: BIPAD_HEADERS }),
      fetchBipadDistrictMap(),
    ]);
    if (!res.ok) throw new Error(`BIPAD rain-stations returned HTTP ${res.status}`);

    const data = await res.json();
    const raw: BipadRainStation[] = data.results || [];
    const now = Date.now();
    let staleCount = 0;
    let faultCount = 0;
    const stations: DHMRainStation[] = [];

    for (const s of raw) {
      const coords = s.point?.coordinates;
      if (!coords || coords.length < 2) continue;

      if (!isFresh(s.measuredOn, MAX_READING_AGE_MS, now)) {
        staleCount++;
        continue;
      }

      const byInterval = new Map((s.averages || []).map((a) => [a.interval, a.value]));
      const values = [...byInterval.values()].filter((v): v is number => v !== null);
      const r24 = byInterval.get(24) ?? null;
      if (values.some((v) => v < 0) || (r24 !== null && r24 > MAX_PLAUSIBLE_24H_MM)) {
        faultCount++;
        continue;
      }

      const rawStatus = (s.status || "").toUpperCase();
      const status: DHMRainStation["status"] = rawStatus.includes("ABOVE DANGER")
        ? "Danger"
        : rawStatus.includes("ABOVE WARNING")
        ? "Warning"
        : "Normal";

      stations.push({
        id: s.id,
        name: (s.title || "").trim(),
        basin: s.basin || undefined,
        districtId: s.district != null ? districtMap.get(s.district) ?? null : null,
        coordinates: [coords[1], coords[0]],
        elevation: s.elevation ?? undefined,
        measuredOn: s.measuredOn as string,
        rain1h: byInterval.get(1) ?? null,
        rain3h: byInterval.get(3) ?? null,
        rain6h: byInterval.get(6) ?? null,
        rain12h: byInterval.get(12) ?? null,
        rain24h: r24,
        status,
      });
    }

    stations.sort((a, b) => (b.rain24h ?? -1) - (a.rain24h ?? -1));

    return NextResponse.json(
      {
        success: true,
        source: "Department of Hydrology & Meteorology (DHM) rain gauges via NDRRMA BIPAD Portal",
        count: stations.length,
        totalStations: raw.length,
        staleCount,
        faultCount,
        timestamp: new Date().toISOString(),
        stations,
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    console.error("BIPAD/DHM rain gauges unavailable", error);
    return NextResponse.json(
      { success: false, error: "DHM rain gauges are currently unavailable from BIPAD portal", stations: [] },
      { status: 502 }
    );
  }
}
