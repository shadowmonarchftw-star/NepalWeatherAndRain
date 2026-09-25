import { NextRequest, NextResponse } from "next/server";
import { BIPAD_API, BIPAD_HEADERS } from "@/lib/bipad";

const WINDOW_MS = 24 * 60 * 60 * 1000;
// A change this large between readings under an hour apart is not physically plausible for these
// rivers; it is flagged as a possible sensor error (never removed or altered)
const JUMP_FLAG_M = 5;
const JUMP_WINDOW_MS = 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const id = Number(searchParams.get("id"));
  if ((kind !== "river" && kind !== "rain") || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ success: false, error: "kind must be river|rain and id a positive integer" }, { status: 400 });
  }

  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const url =
    kind === "river"
      ? `${BIPAD_API}/river/?limit=1000&station=${id}&water_level_on__gt=${since}&ordering=water_level_on`
      : `${BIPAD_API}/rain/?limit=500&station=${id}&measured_on__gt=${since}&ordering=measured_on`;

  try {
    const res = await fetch(url, { cache: "no-store", headers: BIPAD_HEADERS });
    if (!res.ok) throw new Error(`BIPAD ${kind} history returned HTTP ${res.status}`);
    const data = await res.json();
    const rows: Record<string, unknown>[] = data.results || [];

    if (kind === "river") {
      const points = rows
        .filter((r) => typeof r.waterLevel === "number" && typeof r.waterLevelOn === "string")
        .map((r) => ({ t: r.waterLevelOn as string, v: Number((r.waterLevel as number).toFixed(3)) }));

      const jumps: { t: string; from: number; to: number }[] = [];
      for (let i = 1; i < points.length; i++) {
        const dt = Date.parse(points[i].t) - Date.parse(points[i - 1].t);
        if (dt <= JUMP_WINDOW_MS && Math.abs(points[i].v - points[i - 1].v) >= JUMP_FLAG_M) {
          jumps.push({ t: points[i].t, from: points[i - 1].v, to: points[i].v });
        }
      }
      return NextResponse.json(
        { success: true, kind, id, unit: "m", points, jumps, jumpFlagM: JUMP_FLAG_M },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" } }
      );
    }

    // Rain: each record carries rolling totals; the 1-hour total gives an hourly series
    const points = rows
      .map((r) => {
        const avg = (r.averages as { interval: number; value: number | null }[] | undefined)?.find((a) => a.interval === 1);
        return { t: r.measuredOn as string, v: avg?.value ?? null };
      })
      .filter((p): p is { t: string; v: number } => typeof p.t === "string" && typeof p.v === "number" && p.v >= 0 && p.v < 500);
    return NextResponse.json(
      { success: true, kind, id, unit: "mm/h", points, jumps: [] },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error(`BIPAD ${kind} history unavailable`, error);
    return NextResponse.json({ success: false, error: "History is currently unavailable from BIPAD portal" }, { status: 502 });
  }
}
