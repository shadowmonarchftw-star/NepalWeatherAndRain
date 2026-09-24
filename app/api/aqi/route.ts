import { NextResponse } from "next/server";
import { AirQualityStation } from "@/lib/types";
import { BIPAD_API, BIPAD_HEADERS, fetchBipadDistrictMap, isFresh } from "@/lib/bipad";

// Air quality stations report hourly; older readings mean the station is offline
const MAX_READING_AGE_MS = 3 * 60 * 60 * 1000;

interface BipadPollutionStation {
  id: number;
  name?: string;
  nepaliName?: string;
  dateTime?: string | null;
  aqi?: number | null;
  aqiColor?: string;
  point?: { coordinates: [number, number] }; // [lon, lat]
  district?: number | null;
  observation?: { parameterCode: string; data?: { value: number | null } }[];
}

export async function GET() {
  try {
    const [res, districtMap] = await Promise.all([
      fetch(`${BIPAD_API}/pollution-stations/?limit=200`, { next: { revalidate: 600 }, headers: BIPAD_HEADERS }),
      fetchBipadDistrictMap(),
    ]);
    if (!res.ok) throw new Error(`BIPAD pollution-stations returned HTTP ${res.status}`);

    const data = await res.json();
    const raw: BipadPollutionStation[] = data.results || [];
    const now = Date.now();
    let staleCount = 0;
    const stations: AirQualityStation[] = [];

    for (const s of raw) {
      const coords = s.point?.coordinates;
      if (!coords || coords.length < 2) continue;
      if (s.aqi == null || !Number.isFinite(s.aqi) || s.aqi < 0) continue;
      if (!isFresh(s.dateTime, MAX_READING_AGE_MS, now)) {
        staleCount++;
        continue;
      }

      const pm25 = s.observation?.find((o) => o.parameterCode === "PM2.5_I")?.data?.value;

      stations.push({
        id: s.id,
        name: (s.name || "").trim(),
        nepaliName: s.nepaliName?.trim() || undefined,
        districtId: s.district != null ? districtMap.get(s.district) ?? null : null,
        coordinates: [coords[1], coords[0]],
        measuredOn: s.dateTime as string,
        aqi: Math.round(s.aqi),
        aqiColor: s.aqiColor,
        pm25: pm25 != null && pm25 >= 0 ? Number(pm25.toFixed(1)) : null,
      });
    }

    stations.sort((a, b) => b.aqi - a.aqi);

    return NextResponse.json(
      {
        success: true,
        source: "Department of Environment (pollution.gov.np) via NDRRMA BIPAD Portal",
        count: stations.length,
        totalStations: raw.length,
        staleCount,
        timestamp: new Date().toISOString(),
        stations,
      },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } }
    );
  } catch (error) {
    console.error("BIPAD air quality unavailable", error);
    return NextResponse.json(
      { success: false, error: "Air quality data is currently unavailable from BIPAD portal", stations: [] },
      { status: 502 }
    );
  }
}
