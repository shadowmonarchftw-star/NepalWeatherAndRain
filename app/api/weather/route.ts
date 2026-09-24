import { NextRequest, NextResponse } from "next/server";
import { NEPAL_DISTRICTS } from "@/data/nepalDistricts";
import { fetchDistrictWeather, fetchAll77DistrictsLive } from "@/lib/openMeteo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtId = searchParams.get("districtId");

  try {
    if (districtId) {
      const district = NEPAL_DISTRICTS.find((d) => d.id === districtId);
      if (!district) {
        return NextResponse.json({ error: "District not found" }, { status: 404 });
      }
      const data = await fetchDistrictWeather(district);
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    // Return all 77 districts with live Open-Meteo batch data
    const allDistricts = await fetchAll77DistrictsLive();
    return NextResponse.json(allDistricts, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
