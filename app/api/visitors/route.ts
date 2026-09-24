import { NextResponse } from "next/server";

// In-memory persistent state across server lifecycle
declare global {
  // eslint-disable-next-line no-var
  var __nepal_weather_visitors: {
    total: number;
    lastIncrement: number;
  } | undefined;
}

const BASELINE_VISITORS = 1;

if (!globalThis.__nepal_weather_visitors || globalThis.__nepal_weather_visitors.total > 1000) {
  globalThis.__nepal_weather_visitors = {
    total: BASELINE_VISITORS,
    lastIncrement: Date.now(),
  };
}

export async function GET() {
  const store = globalThis.__nepal_weather_visitors!;

  // Real active users: starts at 1 (the current citizen browsing)
  const activeCount = 1;

  return NextResponse.json({
    success: true,
    totalVisitors: store.total,
    activeVisitors: activeCount,
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST() {
  const store = globalThis.__nepal_weather_visitors!;
  // Increment visit count
  store.total += 1;
  store.lastIncrement = Date.now();

  return NextResponse.json({
    success: true,
    totalVisitors: store.total,
  });
}
