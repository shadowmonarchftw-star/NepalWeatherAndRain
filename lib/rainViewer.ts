import { RainViewerData, RadarFrame } from "./types";

/**
 * Fetch available radar and satellite timestamps from RainViewer API
 */
export async function getRainViewerData(): Promise<RainViewerData | null> {
  try {
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`RainViewer API returned status ${res.status}`);
    }
    const data = await res.json();
    return {
      host: data.host || "https://tilecache.rainviewer.com",
      radarPast: (data.radar?.past || []).map((f: { time: number; path: string }) => ({
        time: f.time,
        path: f.path,
      })),
      radarNowcast: (data.radar?.nowcast || []).map((f: { time: number; path: string }) => ({
        time: f.time,
        path: f.path,
      })),
      satellite: (data.satellite?.infrared || []).map((f: { time: number; path: string }) => ({
        time: f.time,
        path: f.path,
      })),
    };
  } catch (err) {
    console.warn("Could not fetch live RainViewer frames, fallback available", err);
    return null;
  }
}

/**
 * Generate a radar tile URL from host and path
 * Scheme: host + path + /256/{z}/{x}/{y}/2/1_1.png
 * Options: color scheme 2 (Universal Blue-Red-Pink), smooth 1, snow 1
 */
export function getRadarTileUrl(host: string, framePath: string): string {
  return `${host}${framePath}/256/{z}/{x}/{y}/2/1_1.png`;
}

/**
 * Generate satellite infrared tile URL
 */
export function getSatelliteTileUrl(host: string, framePath: string): string {
  return `${host}${framePath}/256/{z}/{x}/{y}/0/0_0.png`;
}
