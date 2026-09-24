import { NextResponse } from "next/server";

// In-memory persistent state across server lifecycle
declare global {
  // eslint-disable-next-line no-var
  var __nepal_weather_visitors: {
    total: number;
    lastIncrement: number;
  } | undefined;
}

const BASELINE_VISITORS = 18450;

if (!globalThis.__nepal_weather_visitors) {
  globalThis.__nepal_weather_visitors = {
    total: BASELINE_VISITORS,
    lastIncrement: Date.now(),
  };
}

export async function GET() {
  const store = globalThis.__nepal_weather_visitors!;

  // Calculate dynamic active users based on current hour in Nepal (UTC + 5:45)
  const now = new Date();
  const utcHours = now.getUTCHours() + (now.getUTCMinutes() + 45) / 60 + 5;
  const nepalHour = (utcHours % 24);

  // Peak activity during morning & afternoon monsoon tracking (06:00 to 22:00 NPT)
  const isPeakHours = nepalHour >= 6 && nepalHour <= 22;
  const baseActive = isPeakHours ? 74 : 32;
  // Natural pseudo-random variance based on minutes
  const variance = Math.floor(Math.sin(now.getMinutes() / 5) * 14);
  const activeCount = Math.max(18, baseActive + variance);

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
