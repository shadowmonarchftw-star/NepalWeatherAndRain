import { NextResponse } from "next/server";
import { getRainViewerData } from "@/lib/rainViewer";

export async function GET() {
  try {
    const data = await getRainViewerData();
    if (!data) {
      return NextResponse.json({ error: "Failed to fetch radar frames" }, { status: 502 });
    }
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
