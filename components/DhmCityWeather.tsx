"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { DhmCityWeather as City } from "@/app/api/dhm-cities/route";
import { Language } from "@/lib/translations";

interface Props {
  cities: City[];
  forecastIssuedAt: string | null;
  observedIssuedAt: string | null;
  onFocus?: (coords: [number, number]) => void;
  lang?: Language;
}

const PERIOD = {
  today: { en: "Today", np: "आज" },
  tonight: { en: "Tonight", np: "आज राति" },
  tomorrow: { en: "Tomorrow", np: "भोलि" },
};

const fmt = (iso: string | null, lang: Language) =>
  iso
    ? new Date(iso).toLocaleString(lang === "np" ? "ne-NP" : "en-US", {
        timeZone: "Asia/Kathmandu",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function DhmCityWeather({ cities, forecastIssuedAt, observedIssuedAt, onFocus, lang = "en" }: Props) {
  const np = lang === "np";
  const periods = cities.find((c) => c.forecast.length > 0)?.forecast.map((p) => p.period) || [];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm text-slate-900 dark:text-white transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm sm:text-base font-bold tracking-tight">
          {np ? "DHM सहर पूर्वानुमान तथा मापन" : "DHM City Forecasts & Observations"}
        </h3>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {np ? "पूर्वानुमान जारी" : "Forecast issued"} {fmt(forecastIssuedAt, lang)} · {np ? "मापन" : "Observed"} {fmt(observedIssuedAt, lang)} NPT
        </span>
      </div>

      {cities.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {np ? "DHM सहर मौसम हाल उपलब्ध छैन।" : "DHM city weather is currently unavailable."}
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs tabular-nums">
            <thead className="bg-slate-50 dark:bg-[#0A0F1A] text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="font-semibold py-2 px-2.5">{np ? "सहर" : "City"}</th>
                {periods.map((p) => (
                  <th key={p} className="font-semibold py-2 px-2">
                    {np ? PERIOD[p].np : PERIOD[p].en}
                  </th>
                ))}
                <th className="font-semibold py-2 px-2 text-right">{np ? "अधिकतम / न्यूनतम" : "Max / Min"}</th>
                <th className="font-semibold py-2 px-2.5 text-right">{np ? "वर्षा" : "Rainfall"}</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c) => (
                <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800 align-top">
                  <td className="py-1.5 px-2.5">
                    <button onClick={() => onFocus?.(c.coordinates)} className="font-semibold hover:underline flex items-center gap-1 text-left">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {np && c.nepaliName ? c.nepaliName.trim() : c.name}
                    </button>
                  </td>
                  {periods.map((p) => {
                    const f = c.forecast.find((x) => x.period === p);
                    return (
                      <td key={p} className="py-1.5 px-2 min-w-[140px]">
                        {f ? (
                          <>
                            <div className="text-slate-700 dark:text-slate-300">{np ? f.weatherNe || f.weather : f.weather || f.weatherNe}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              {f.tempFrom !== null && f.tempTo !== null ? `${f.tempFrom}–${f.tempTo} °C` : ""}
                              {f.rainChance !== null ? ` · ${np ? "वर्षा सम्भावना" : "rain"} ${f.rainChance}%` : ""}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    );
                  })}
                  <td className="py-1.5 px-2 text-right whitespace-nowrap">
                    {c.observed ? `${c.observed.maxTemp ?? "—"} / ${c.observed.minTemp ?? "—"} °C` : "—"}
                  </td>
                  <td className="py-1.5 px-2.5 text-right whitespace-nowrap font-semibold">
                    {c.observed ? (c.observed.trace ? (np ? "नगण्य" : "Trace") : c.observed.rainfallMm !== null ? `${c.observed.rainfallMm} mm` : "—") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
        {np
          ? "पूर्वानुमान: DHM को आधिकारिक सहर पूर्वानुमान। अधिकतम/न्यूनतम तापक्रम र वर्षा: DHM मौसम केन्द्रको मापन (माथि उल्लेखित समयमा जारी)। स्रोत: dhm.gov.np/mfd"
          : "Forecast: DHM's official city forecast. Max/Min and rainfall: measured at DHM weather stations, as issued at the time above. Source: dhm.gov.np/mfd"}
      </p>
    </div>
  );
}
