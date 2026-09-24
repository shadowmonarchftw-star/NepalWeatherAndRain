import { NextResponse } from "next/server";
import { BipadIncident } from "@/lib/types";
import { BIPAD_API, BIPAD_HEADERS, isFresh } from "@/lib/bipad";

const WINDOW_DAYS = 7;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

interface BipadIncidentRaw {
  id: number;
  title?: string;
  titleNe?: string;
  incidentOn?: string | null;
  reportedOn?: string | null;
  verified?: boolean;
  approved?: boolean;
  point?: { coordinates: [number, number] } | null; // [lon, lat]
  hazard?: { title?: string; titleNe?: string; color?: string } | null;
  loss?: {
    peopleDeathCount?: number | null;
    peopleMissingCount?: number | null;
    peopleInjuredCount?: number | null;
    infrastructureDestroyedHouseCount?: number | null;
    familyAffectedCount?: number | null;
  } | null;
}

const n = (v: number | null | undefined) => (typeof v === "number" && v > 0 ? v : 0);

export async function GET() {
  try {
    const res = await fetch(`${BIPAD_API}/incident/?limit=300&ordering=-incident_on&expand=loss,hazard`, {
      next: { revalidate: 900 },
      headers: BIPAD_HEADERS,
    });
    if (!res.ok) throw new Error(`BIPAD incident returned HTTP ${res.status}`);

    const data = await res.json();
    const raw: BipadIncidentRaw[] = data.results || [];
    const now = Date.now();
    let excludedBadDate = 0;

    const incidents: BipadIncident[] = [];
    for (const i of raw) {
      if (!i.verified || !i.approved) continue;
      // Some records carry future incident dates (data-entry errors); those are excluded, not guessed
      if (!isFresh(i.incidentOn, WINDOW_MS, now)) {
        if (i.incidentOn && Date.parse(i.incidentOn) > now) excludedBadDate++;
        continue;
      }
      const coords = i.point?.coordinates;
      incidents.push({
        id: i.id,
        title: (i.title || "").trim(),
        titleNe: i.titleNe?.trim() || undefined,
        hazard: i.hazard?.title || "Other",
        hazardNe: i.hazard?.titleNe || undefined,
        hazardColor: i.hazard?.color || undefined,
        incidentOn: i.incidentOn as string,
        reportedOn: i.reportedOn || undefined,
        coordinates: coords && coords.length >= 2 ? [coords[1], coords[0]] : null,
        deaths: n(i.loss?.peopleDeathCount),
        missing: n(i.loss?.peopleMissingCount),
        injured: n(i.loss?.peopleInjuredCount),
        housesDestroyed: n(i.loss?.infrastructureDestroyedHouseCount),
        familiesAffected: n(i.loss?.familyAffectedCount),
      });
    }

    return NextResponse.json(
      {
        success: true,
        source: "NDRRMA BIPAD Portal — verified incident reports",
        windowDays: WINDOW_DAYS,
        count: incidents.length,
        excludedBadDate,
        timestamp: new Date().toISOString(),
        incidents,
      },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } }
    );
  } catch (error) {
    console.error("BIPAD incidents unavailable", error);
    return NextResponse.json(
      { success: false, error: "Incident reports are currently unavailable from BIPAD portal", incidents: [] },
      { status: 502 }
    );
  }
}
