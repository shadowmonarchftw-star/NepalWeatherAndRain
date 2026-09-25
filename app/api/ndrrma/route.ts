import { NextResponse } from "next/server";
import { NDRRMAAlert } from "@/lib/types";

// BIPAD leaves some alerts with no expireOn indefinitely; beyond this age they are not treated as live
const MAX_OPEN_ALERT_AGE_MS = 72 * 60 * 60 * 1000;

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://bipadportal.gov.np/api/v1/alert/?limit=100&ordering=-started_on", {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`BIPAD alert returned HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data.results)) throw new Error("BIPAD alert response has no results array");

    const now = Date.now();
    const parsedAlerts: NDRRMAAlert[] = data.results
      .map((item: any) => {
        const coords = item.point?.coordinates;
        if (!coords || coords.length < 2) return null;

        // Only alerts that are still in force: expiry in the future, or no expiry and recently started
        const started = Date.parse(item.startedOn || item.createdOn);
        const expires = item.expireOn ? Date.parse(item.expireOn) : NaN;
        const isActive = Number.isFinite(expires)
          ? expires > now
          : Number.isFinite(started) && now - started <= MAX_OPEN_ALERT_AGE_MS;
        if (!isActive) return null;

        return {
          id: item.id,
          title: item.title || "Disaster Alert",
          titleNe: item.titleNe || item.title || "विपद् पूर्वसूचना",
          source: item.source || "ndrrma",
          referenceType: item.referenceType || "hazard",
          startedOn: item.startedOn || item.createdOn,
          expireOn: item.expireOn,
          lon: coords[0],
          lat: coords[1],
          description: item.description || undefined,
        };
      })
      .filter(Boolean) as NDRRMAAlert[];

    return NextResponse.json({
      success: true,
      source: "National Disaster Risk Reduction and Management Authority (NDRRMA) BIPAD Portal",
      count: parsedAlerts.length,
      alerts: parsedAlerts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("NDRRMA BIPAD alerts unavailable:", err);
    return NextResponse.json(
      {
        success: false,
        error: "NDRRMA alerts are currently unavailable from BIPAD portal",
        alerts: [],
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
