import { NextResponse } from "next/server";
import { BIPAD_API, BIPAD_HEADERS } from "@/lib/bipad";

// Department of Roads road-block reports via BIPAD. Contact names, phone numbers and free-text
// remarks are deliberately NOT passed through: they can contain personal details.
const REOPENED_WINDOW_MS = 24 * 60 * 60 * 1000;

interface BipadRoad {
  id: number;
  title?: string;
  roadRefno?: string;
  location?: string;
  division?: string;
  status?: string;
  closureReason?: string | null;
  repairEta?: string | null;
  dateRoadblockStart?: string | null;
  dateRoadblockEndEstimated?: string | null;
  dateRoadblockEnd?: string | null;
  modifiedOn?: string;
  point?: { coordinates: [number, number] } | null; // [lon, lat]
}

export interface RoadStatus {
  id: number;
  road: string;
  roadRef?: string;
  location: string;
  status: "CLOSED" | "PARTIAL_OPEN" | "OPEN";
  reason?: string;
  repairEta?: string;
  blockedSince?: string;
  expectedReopen?: string;
  reopenedAt?: string;
  updatedAt?: string;
  coordinates: [number, number] | null; // [lat, lon]
}

export async function GET() {
  try {
    const res = await fetch(`${BIPAD_API}/highway/?limit=300&ordering=-created_on`, {
      cache: "no-store",
      headers: BIPAD_HEADERS,
    });
    if (!res.ok) throw new Error(`BIPAD highway returned HTTP ${res.status}`);
    const data = await res.json();
    const raw: BipadRoad[] = data.results || [];
    const now = Date.now();

    const roads: RoadStatus[] = [];
    for (const r of raw) {
      const status = r.status === "CLOSED" || r.status === "PARTIAL_OPEN" || r.status === "OPEN" ? r.status : null;
      if (!status) continue;
      const ended = r.dateRoadblockEnd ? Date.parse(r.dateRoadblockEnd) : NaN;

      // Keep: every road DoR still lists as closed/partly open, plus roads reopened in the last 24h
      const isBlocked = status !== "OPEN";
      const recentlyReopened = status === "OPEN" && Number.isFinite(ended) && now - ended <= REOPENED_WINDOW_MS;
      if (!isBlocked && !recentlyReopened) continue;

      const c = r.point?.coordinates;
      // Some reports carry Bikram Sambat years in AD fields (e.g. 2083); such dates are dropped, not guessed
      const validDate = (v?: string | null) => {
        const t = v ? Date.parse(v) : NaN;
        return Number.isFinite(t) && t <= now + 30 * 24 * 60 * 60 * 1000 ? (v as string) : undefined;
      };
      roads.push({
        id: r.id,
        road: (r.title || "").trim(),
        roadRef: r.roadRefno || undefined,
        location: (r.location || "").trim(),
        status,
        reason: r.closureReason?.trim() || undefined,
        repairEta: r.repairEta?.trim() || undefined,
        blockedSince: validDate(r.dateRoadblockStart),
        expectedReopen: validDate(r.dateRoadblockEndEstimated),
        reopenedAt: validDate(r.dateRoadblockEnd),
        updatedAt: r.modifiedOn || undefined,
        coordinates: c && c.length >= 2 ? [c[1], c[0]] : null,
      });
    }

    const order = { CLOSED: 0, PARTIAL_OPEN: 1, OPEN: 2 } as const;
    roads.sort(
      (a, b) =>
        order[a.status] - order[b.status] ||
        Date.parse(b.blockedSince || b.updatedAt || "") - Date.parse(a.blockedSince || a.updatedAt || "")
    );

    return NextResponse.json(
      {
        success: true,
        source: "Department of Roads via NDRRMA BIPAD Portal",
        closed: roads.filter((r) => r.status === "CLOSED").length,
        partial: roads.filter((r) => r.status === "PARTIAL_OPEN").length,
        reopened: roads.filter((r) => r.status === "OPEN").length,
        timestamp: new Date().toISOString(),
        roads,
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("BIPAD road status unavailable", error);
    return NextResponse.json(
      { success: false, error: "Road status is currently unavailable from BIPAD portal", roads: [] },
      { status: 502 }
    );
  }
}
