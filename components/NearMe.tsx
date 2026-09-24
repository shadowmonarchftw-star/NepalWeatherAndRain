"use client";

import React, { useMemo, useState } from "react";
import { LocateFixed, Waves, Gauge, Wind, ShieldAlert, MapPin } from "lucide-react";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { DHMRainStation, AirQualityStation, NDRRMAAlert, DistrictWeatherSummary } from "@/lib/types";
import { Language } from "@/lib/translations";

interface NearMeProps {
  rivers: DHMRiverStation[];
  rainStations: DHMRainStation[];
  aqiStations: AirQualityStation[];
  alerts: NDRRMAAlert[];
  districts: DistrictWeatherSummary[];
  onFocus?: (coords: [number, number]) => void;
  lang?: Language;
}

const ALERT_RADIUS_KM = 25;

function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearest<T>(items: T[], here: [number, number], coords: (t: T) => [number, number]): { item: T; km: number } | null {
  let best: { item: T; km: number } | null = null;
  for (const item of items) {
    const km = distanceKm(here, coords(item));
    if (!best || km < best.km) best = { item, km };
  }
  return best;
}

export default function NearMe({ rivers, rainStations, aqiStations, alerts, districts, onFocus, lang = "en" }: NearMeProps) {
  const [here, setHere] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "denied" | "error">("idle");
  const np = lang === "np";

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere([pos.coords.latitude, pos.coords.longitude]);
        setStatus("idle");
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const result = useMemo(() => {
    if (!here) return null;
    return {
      river: nearest(rivers, here, (r) => r.coordinates),
      rain: nearest(rainStations, here, (r) => r.coordinates),
      aqi: nearest(aqiStations, here, (r) => r.coordinates),
      district: nearest(districts, here, (d) => [d.lat, d.lon]),
      alerts: alerts
        .map((a) => ({ a, km: distanceKm(here, [a.lat, a.lon]) }))
        .filter((x) => x.km <= ALERT_RADIUS_KM)
        .sort((x, y) => x.km - y.km),
    };
  }, [here, rivers, rainStations, aqiStations, alerts, districts]);

  const km = (v: number) => `${v < 10 ? v.toFixed(1) : Math.round(v)} km`;

  const tile = (
    icon: React.ReactNode,
    title: string,
    body: React.ReactNode,
    meta: string | null,
    coords?: [number, number]
  ) => (
    <button
      onClick={() => coords && onFocus?.(coords)}
      className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-left hover:border-slate-400 transition-colors"
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        {icon}
        {title}
      </div>
      <div className="mt-1 text-xs text-slate-900 dark:text-white">{body}</div>
      {meta && <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{meta}</div>}
    </button>
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm text-slate-900 dark:text-white transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight">{np ? "मेरो नजिक" : "Near Me"}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {np
              ? "तपाईंको स्थान यही उपकरणमा मात्र प्रयोग हुन्छ, कहीँ पठाइँदैन।"
              : "Your location is used only on this device and is never sent anywhere."}
          </p>
        </div>
        <button
          onClick={locate}
          disabled={status === "locating"}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003893] hover:bg-[#002a70] text-white text-xs font-bold disabled:opacity-60 touch-manipulation"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          {status === "locating"
            ? np ? "खोज्दै…" : "Locating…"
            : here
            ? np ? "फेरि खोज्नुहोस्" : "Update location"
            : np ? "मेरो स्थान प्रयोग गर्नुहोस्" : "Use my location"}
        </button>
      </div>

      {status === "denied" && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
          {np ? "स्थान अनुमति अस्वीकृत। ब्राउजर सेटिङमा अनुमति दिनुहोस्।" : "Location permission denied. Allow it in your browser settings."}
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
          {np ? "स्थान पत्ता लगाउन सकिएन।" : "Could not get your location."}
        </p>
      )}

      {result && (
        <div className="mt-3 space-y-2.5">
          <div
            className={`p-2.5 rounded-xl border text-xs ${
              result.alerts.length > 0
                ? "bg-red-50 dark:bg-[#C51D34]/15 border-red-300 dark:border-[#C51D34] text-red-900 dark:text-red-100"
                : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              {result.alerts.length > 0
                ? np
                  ? `${ALERT_RADIUS_KM} km भित्र ${result.alerts.length} सक्रिय NDRRMA पूर्वसूचना`
                  : `${result.alerts.length} active NDRRMA alert(s) within ${ALERT_RADIUS_KM} km`
                : np
                ? `${ALERT_RADIUS_KM} km भित्र कुनै सक्रिय NDRRMA पूर्वसूचना छैन`
                : `No active NDRRMA alerts within ${ALERT_RADIUS_KM} km`}
            </div>
            {result.alerts.map(({ a, km: d }) => (
              <div key={a.id} className="mt-1">
                {np && a.titleNe ? a.titleNe : a.title} · {km(d)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {result.river &&
              tile(
                <Waves className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />,
                np ? "नजिकको नदी मापन" : "Nearest river gauge",
                <>
                  <b>{result.river.item.name}</b>
                  <br />
                  {result.river.item.waterLevelM} m ·{" "}
                  <span
                    className={
                      result.river.item.status === "Danger"
                        ? "text-red-600 dark:text-red-400 font-bold"
                        : result.river.item.status === "Warning"
                        ? "text-amber-600 dark:text-amber-400 font-bold"
                        : ""
                    }
                  >
                    DHM {result.river.item.status.toUpperCase()}
                  </span>
                  {result.river.item.steady ? ` · ${result.river.item.steady}` : ""}
                </>,
                km(result.river.km),
                result.river.item.coordinates
              )}
            {result.rain &&
              tile(
                <Gauge className="w-3.5 h-3.5 text-[#C51D34]" />,
                np ? "नजिकको वर्षा मापन" : "Nearest rain gauge",
                <>
                  <b>{result.rain.item.name}</b>
                  <br />
                  {np ? "पछिल्लो २४ घण्टा" : "Past 24h"}: <b>{result.rain.item.rain24h ?? "—"} mm</b> · 1h: {result.rain.item.rain1h ?? "—"} mm
                </>,
                km(result.rain.km),
                result.rain.item.coordinates
              )}
            {result.aqi &&
              tile(
                <Wind className="w-3.5 h-3.5 text-slate-500" />,
                np ? "नजिकको वायु गुणस्तर केन्द्र" : "Nearest air quality station",
                <>
                  <b>{np && result.aqi.item.nepaliName ? result.aqi.item.nepaliName : result.aqi.item.name}</b>
                  <br />
                  AQI <b>{result.aqi.item.aqi}</b>
                </>,
                km(result.aqi.km),
                result.aqi.item.coordinates
              )}
            {result.district &&
              tile(
                <MapPin className="w-3.5 h-3.5 text-slate-500" />,
                np ? "नजिकको जिल्ला (मोडेल पूर्वानुमान)" : "Nearest district (model forecast)",
                <>
                  <b>{np ? result.district.item.nepaliName : result.district.item.districtName}</b>
                  <br />
                  {np ? "आजको पूर्वानुमान" : "Forecast today"}: <b>{result.district.item.total24hRain} mm</b>
                </>,
                np ? "जिल्ला केन्द्रसम्मको दूरी " + km(result.district.km) : `${km(result.district.km)} to district centre`,
                [result.district.item.lat, result.district.item.lon]
              )}
          </div>
        </div>
      )}
    </div>
  );
}
