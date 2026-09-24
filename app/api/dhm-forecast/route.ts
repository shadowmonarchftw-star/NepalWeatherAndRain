import { NextResponse } from "next/server";

// Official public forecast of DHM's Meteorological Forecasting Division (same feed as dhm.gov.np/mfd)
const DHM_FORECAST_URL = "https://dhm.gov.np/mfd/api/country-forecast";

const clean = (v: unknown): string =>
  typeof v === "string" ? v.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() : "";

export async function GET() {
  try {
    const res = await fetch(DHM_FORECAST_URL, {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (NepalWeatherTracker)" },
    });
    if (!res.ok) throw new Error(`DHM forecast returned HTTP ${res.status}`);
    const d = await res.json();
    if (!d?.issue_date) throw new Error("DHM forecast response has no issue_date");

    // DHM issues an AM bulletin (Today / Tonight) and a PM bulletin (Tonight / Tomorrow)
    const issueHourNpt = Number(
      new Date(d.issue_date).toLocaleString("en-US", { timeZone: "Asia/Kathmandu", hour: "numeric", hour12: false })
    );
    const isAmIssue = issueHourNpt < 12;

    return NextResponse.json(
      {
        success: true,
        source: "Department of Hydrology and Meteorology — Meteorological Forecasting Division",
        issuedAt: d.issue_date,
        isAmIssue,
        periods: [
          { key: isAmIssue ? "today" : "tonight", en: clean(d.en_text_1), np: clean(d.np_text_1) },
          { key: isAmIssue ? "tonight" : "tomorrow", en: clean(d.en_text_2), np: clean(d.np_text_2) },
        ],
        analysis: { en: clean(d.analysis_en), np: clean(d.analysis_np) },
        special: clean(d.special),
      },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } }
    );
  } catch (error) {
    console.error("DHM official forecast unavailable", error);
    return NextResponse.json(
      { success: false, error: "DHM official forecast is currently unavailable" },
      { status: 502 }
    );
  }
}
