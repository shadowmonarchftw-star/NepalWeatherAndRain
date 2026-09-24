"use client";

import React, { useMemo, useState } from "react";
import { Gauge, Wind, Siren, MapPin, ChevronDown } from "lucide-react";
import { DHMRainStation, AirQualityStation, BipadIncident } from "@/lib/types";
import { Language } from "@/lib/translations";

interface ObservedConditionsProps {
  rainStations: DHMRainStation[];
  aqiStations: AirQualityStation[];
  incidents: BipadIncident[];
  onFocus?: (coords: [number, number]) => void;
  lang?: Language;
}

type Tab = "rain" | "aqi" | "incidents";

const fmtTime = (iso: string, lang: Language) =>
  new Date(iso).toLocaleString(lang === "np" ? "ne-NP" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// US EPA AQI breakpoints; the source colours in the feed follow the same bands
function aqiCategory(aqi: number, lang: Language): string {
  const np = lang === "np";
  if (aqi <= 50) return np ? "राम्रो" : "Good";
  if (aqi <= 100) return np ? "मध्यम" : "Moderate";
  if (aqi <= 150) return np ? "संवेदनशीलका लागि अस्वस्थ" : "Unhealthy for sensitive groups";
  if (aqi <= 200) return np ? "अस्वस्थ" : "Unhealthy";
  if (aqi <= 300) return np ? "अत्यन्त अस्वस्थ" : "Very unhealthy";
  return np ? "खतरनाक" : "Hazardous";
}

function rainColor(mm: number | null): string {
  if (mm === null) return "text-slate-400";
  if (mm >= 100) return "text-[#C51D34] dark:text-[#FF4D6D]";
  if (mm >= 50) return "text-amber-600 dark:text-amber-400";
  if (mm >= 25) return "text-yellow-600 dark:text-yellow-400";
  return "text-slate-900 dark:text-white";
}

export default function ObservedConditions({
  rainStations,
  aqiStations,
  incidents,
  onFocus,
  lang = "en",
}: ObservedConditionsProps) {
  const [tab, setTab] = useState<Tab>("rain");
  const [visibleRain, setVisibleRain] = useState(12);
  const [hazardFilter, setHazardFilter] = useState<string>("all");
  const np = lang === "np";

  const rainingNow = rainStations.filter((s) => (s.rain1h ?? 0) > 0).length;

  const hazardCounts = useMemo(() => {
    const m = new Map<string, number>();
    incidents.forEach((i) => m.set(i.hazard, (m.get(i.hazard) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [incidents]);

  const shownIncidents = hazardFilter === "all" ? incidents : incidents.filter((i) => i.hazard === hazardFilter);
  const totals = incidents.reduce(
    (acc, i) => ({ deaths: acc.deaths + i.deaths, missing: acc.missing + i.missing, injured: acc.injured + i.injured }),
    { deaths: 0, missing: 0, injured: 0 }
  );

  const tabBtn = (id: Tab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
        tab === id ? "bg-[#003893] text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm dark:shadow-lg text-slate-900 dark:text-white transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight">
            {np ? "मापन गरिएको अवस्था" : "Measured Conditions"}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {np
              ? "पूर्वानुमान होइन — सरकारी मापन केन्द्र तथा रिपोर्टहरू (NDRRMA BIPAD)"
              : "Not a forecast — government sensor readings and reports (NDRRMA BIPAD)"}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0A0F1A] p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto overflow-x-auto scrollbar-none max-w-full">
          {tabBtn("rain", <Gauge className="w-3.5 h-3.5" />, `${np ? "वर्षा" : "Rainfall"} (${rainStations.length})`)}
          {tabBtn("aqi", <Wind className="w-3.5 h-3.5" />, `${np ? "वायु गुणस्तर" : "Air Quality"} (${aqiStations.length})`)}
          {tabBtn("incidents", <Siren className="w-3.5 h-3.5" />, `${np ? "घटना" : "Incidents"} (${incidents.length})`)}
        </div>
      </div>

      {/* Rainfall */}
      {tab === "rain" && (
        <div className="mt-3.5 space-y-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            {rainStations.length === 0
              ? np
                ? "DHM वर्षा मापन फिड उपलब्ध छैन।"
                : "DHM rain gauge feed unavailable."
              : np
              ? `${rainStations.length} सक्रिय DHM वर्षा मापन केन्द्र · ${rainingNow} मा पछिल्लो १ घण्टामा वर्षा। पछिल्लो २४ घण्टाको कुल वर्षा अनुसार क्रमबद्ध।`
              : `${rainStations.length} DHM rain gauges reporting · ${rainingNow} recorded rain in the last hour. Sorted by past-24h total.`}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs tabular-nums">
              <thead className="bg-slate-50 dark:bg-[#0A0F1A] text-slate-500 dark:text-slate-400">
                <tr className="text-left">
                  <th className="font-semibold py-2 px-2.5">{np ? "केन्द्र" : "Gauge"}</th>
                  <th className="font-semibold py-2 px-2 text-right">1h</th>
                  <th className="font-semibold py-2 px-2 text-right hidden sm:table-cell">3h</th>
                  <th className="font-semibold py-2 px-2 text-right hidden sm:table-cell">6h</th>
                  <th className="font-semibold py-2 px-2 text-right">12h</th>
                  <th className="font-semibold py-2 px-2.5 text-right">24h (mm)</th>
                </tr>
              </thead>
              <tbody>
                {rainStations.slice(0, visibleRain).map((s) => (
                  <tr key={s.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-1.5 px-2.5">
                      <button onClick={() => onFocus?.(s.coordinates)} className="text-left hover:underline">
                        <span className="font-semibold text-slate-900 dark:text-white">{s.name}</span>
                        {s.status !== "Normal" && (
                          <span className="ml-1.5 px-1 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
                            DHM {s.status.toUpperCase()}
                          </span>
                        )}
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                          {s.basin ? `${s.basin} · ` : ""}
                          {fmtTime(s.measuredOn, lang)}
                        </span>
                      </button>
                    </td>
                    <td className="py-1.5 px-2 text-right text-slate-600 dark:text-slate-300">{s.rain1h ?? "—"}</td>
                    <td className="py-1.5 px-2 text-right text-slate-600 dark:text-slate-300 hidden sm:table-cell">{s.rain3h ?? "—"}</td>
                    <td className="py-1.5 px-2 text-right text-slate-600 dark:text-slate-300 hidden sm:table-cell">{s.rain6h ?? "—"}</td>
                    <td className="py-1.5 px-2 text-right text-slate-600 dark:text-slate-300">{s.rain12h ?? "—"}</td>
                    <td className={`py-1.5 px-2.5 text-right font-black ${rainColor(s.rain24h)}`}>{s.rain24h ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rainStations.length > visibleRain && (
            <button
              onClick={() => setVisibleRain((v) => v + 20)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0A0F1A] dark:hover:bg-[#162035] border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1.5 mx-auto touch-manipulation"
            >
              <ChevronDown className="w-4 h-4" />
              {np ? `थप देखाउनुहोस् (${rainStations.length - visibleRain} बाँकी)` : `Show more (${rainStations.length - visibleRain} remaining)`}
            </button>
          )}
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Source: DHM / hydrology.gov.np via bipadportal.gov.np</p>
        </div>
      )}

      {/* Air quality */}
      {tab === "aqi" && (
        <div className="mt-3.5 space-y-3">
          {aqiStations.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              {np ? "वायु गुणस्तर फिड उपलब्ध छैन।" : "Air quality feed unavailable."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {aqiStations.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onFocus?.(s.coordinates)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-left hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold truncate">{np && s.nepaliName ? s.nepaliName : s.name}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-slate-300 dark:border-slate-600"
                      style={{ backgroundColor: s.aqiColor || "#94a3b8" }}
                    />
                  </div>
                  <div className="text-2xl font-black tabular-nums mt-1">{s.aqi}</div>
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{aqiCategory(s.aqi, lang)}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                    {s.pm25 !== null ? `PM2.5 ${s.pm25} µg/m³ · ` : ""}
                    {fmtTime(s.measuredOn, lang)}
                  </div>
                </button>
              ))}
            </div>
          )}
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {np ? "श्रेणी: US EPA AQI सीमा अनुसार" : "Categories: US EPA AQI breakpoints"} · Source: Department of Environment, pollution.gov.np via bipadportal.gov.np
          </p>
        </div>
      )}

      {/* Incidents */}
      {tab === "incidents" && (
        <div className="mt-3.5 space-y-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            {np
              ? `पछिल्लो ७ दिनमा प्रमाणित ${incidents.length} घटना · मृत्यु ${totals.deaths} · बेपत्ता ${totals.missing} · घाइते ${totals.injured}`
              : `${incidents.length} verified incidents in the last 7 days · ${totals.deaths} dead · ${totals.missing} missing · ${totals.injured} injured`}
          </div>

          {hazardCounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setHazardFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  hazardFilter === "all" ? "bg-[#003893] text-white" : "bg-slate-100 dark:bg-[#0A0F1A] text-slate-600 dark:text-slate-400"
                }`}
              >
                {np ? "सबै" : "All"}
              </button>
              {hazardCounts.map(([h, c]) => (
                <button
                  key={h}
                  onClick={() => setHazardFilter(h)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    hazardFilter === h ? "bg-[#003893] text-white" : "bg-slate-100 dark:bg-[#0A0F1A] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {np ? incidents.find((i) => i.hazard === h)?.hazardNe || h : h} ({c})
                </button>
              ))}
            </div>
          )}

          {shownIncidents.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              {np ? "कुनै घटना रिपोर्ट छैन।" : "No incidents reported."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {shownIncidents.slice(0, 30).map((i) => (
                <div key={i.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: i.hazardColor || "#64748b" }}
                    >
                      {np && i.hazardNe ? i.hazardNe : i.hazard}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {new Date(i.incidentOn).toLocaleDateString(lang === "np" ? "ne-NP" : "en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {np && i.titleNe ? i.titleNe : i.title}
                  </p>
                  {(i.deaths > 0 || i.missing > 0 || i.injured > 0 || i.housesDestroyed > 0) && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">
                      {[
                        i.deaths > 0 && `${i.deaths} ${np ? "मृत्यु" : "dead"}`,
                        i.missing > 0 && `${i.missing} ${np ? "बेपत्ता" : "missing"}`,
                        i.injured > 0 && `${i.injured} ${np ? "घाइते" : "injured"}`,
                        i.housesDestroyed > 0 && `${i.housesDestroyed} ${np ? "घर ध्वस्त" : "houses destroyed"}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {i.coordinates && onFocus && (
                    <button
                      onClick={() => onFocus(i.coordinates as [number, number])}
                      className="mt-1.5 text-[10px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      {np ? "नक्सामा हेर्नुहोस्" : "Show on map"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {shownIncidents.length > 30 && (
            <p className="text-[10px] text-slate-500 text-center">
              {np ? `पहिलो ३० देखाइएको (${shownIncidents.length} मध्ये)` : `Showing latest 30 of ${shownIncidents.length}`}
            </p>
          )}
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {np
              ? "स्रोत: NDRRMA BIPAD पोर्टल — प्रमाणित तथा स्वीकृत रिपोर्ट मात्र"
              : "Source: NDRRMA BIPAD portal — verified and approved reports only"}
          </p>
        </div>
      )}
    </div>
  );
}
