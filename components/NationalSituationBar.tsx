"use client";

import React from "react";
import { CloudRain, AlertTriangle, Waves, ShieldAlert, ArrowUpRight } from "lucide-react";
import { DistrictWeatherSummary, NDRRMAAlert } from "@/lib/types";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { Language, TRANSLATIONS } from "@/lib/translations";
import SourceTag, { latestTime } from "@/components/SourceTag";

interface NationalSituationBarProps {
  districts: DistrictWeatherSummary[];
  dhmRivers: DHMRiverStation[];
  ndrrmaAlerts: NDRRMAAlert[];
  lang: Language;
  onFocusPeakDistrict?: (districtId: string) => void;
}

export default function NationalSituationBar({
  districts,
  dhmRivers,
  ndrrmaAlerts,
  lang,
  onFocusPeakDistrict,
}: NationalSituationBarProps) {
  const t = TRANSLATIONS[lang];

  const peakDistrict = districts.reduce<DistrictWeatherSummary | null>((max, curr) => {
    if (!max || curr.total24hRain > max.total24hRain) return curr;
    return max;
  }, null);

  const veryHeavyCount = districts.filter((d) => d.rainBand === "veryHeavy").length;
  const heavyCount = districts.filter((d) => d.rainBand === "heavy").length;

  const riverTime = latestTime(dhmRivers.map((r) => r.waterLevelOn));
  const alertTime = latestTime(ndrrmaAlerts.map((a) => a.startedOn));

  const elevatedRivers = dhmRivers.filter(
    (r) => r.status === "Warning" || r.status === "Danger"
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {/* KPI 1: Peak Rainfall */}
      <div
        onClick={() => peakDistrict && onFocusPeakDistrict?.(peakDistrict.districtId)}
        className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-[#C51D34] shadow-sm transition-all cursor-pointer group flex flex-col justify-between active:scale-[0.98] touch-manipulation"
      >
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold truncate">{t.kpiPeakRain}</span>
          <CloudRain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C51D34] dark:text-[#FF4D6D] group-hover:scale-110 transition-transform flex-shrink-0" />
        </div>
        <SourceTag kind="model" source="Open-Meteo" lang={lang} className="self-start mb-1" />
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {peakDistrict?.total24hRain ?? 0}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">mm</span>
        </div>
        <div className="text-[11px] text-[#C51D34] dark:text-[#FF4D6D] font-semibold truncate flex items-center justify-between mt-1">
          <span className="truncate">{lang === "np" ? peakDistrict?.nepaliName : peakDistrict?.districtName}</span>
          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 group-hover:opacity-100 flex-shrink-0" />
        </div>
      </div>

      {/* KPI 2: Districts Under Warning */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold truncate">{t.kpiHighAlertDistricts}</span>
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
        </div>
        <SourceTag kind="model" source="Open-Meteo" lang={lang} className="self-start mb-1" />
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {veryHeavyCount + heavyCount}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">/ 77 {lang === "np" ? "जिल्ला" : "Districts"}</span>
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
          <span className="text-[#C51D34] dark:text-[#FF4D6D] font-bold">{veryHeavyCount} {lang === "np" ? "धेरै भारी" : "very heavy"}</span>
          {" • "}
          <span className="text-amber-600 dark:text-amber-400 font-bold">{heavyCount} {lang === "np" ? "भारी" : "heavy"}</span>
        </div>
      </div>

      {/* KPI 3: DHM River Status */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold truncate">{t.kpiRiverStatus}</span>
          <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-cyan-400 flex-shrink-0" />
        </div>
        <SourceTag kind="measured" source="DHM" time={riverTime} lang={lang} className="self-start mb-1" />
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-black text-blue-700 dark:text-cyan-300 tabular-nums">
            {dhmRivers.length}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">{lang === "np" ? "सेन्सर" : "Gauges"}</span>
        </div>
        <div className="text-[10px] sm:text-[11px] text-blue-700 dark:text-cyan-400 font-semibold mt-1 flex items-center gap-1 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse flex-shrink-0" />
          <span className="truncate">
            {elevatedRivers > 0
              ? `${elevatedRivers} ${lang === "np" ? "सतर्कता" : "Elevated"}`
              : lang === "np" ? "सामान्य सीमा" : "Normal Limits"}
          </span>
        </div>
      </div>

      {/* KPI 4: Active NDRRMA alerts */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold truncate">{lang === "np" ? "सक्रिय NDRRMA पूर्वसूचना" : "Active NDRRMA Alerts"}</span>
          <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
        </div>
        <SourceTag kind="official" source="NDRRMA" time={alertTime} timeVerb="issued" lang={lang} className="self-start mb-1" />
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {ndrrmaAlerts.length}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
            {lang === "np" ? "सूचना" : "Alerts"}
          </span>
        </div>
        <div className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 truncate">
          {ndrrmaAlerts.filter((a) => a.referenceType === "river").length} {lang === "np" ? "बाढी" : "Flood"}
          {" • "}
          {ndrrmaAlerts.filter((a) => a.referenceType === "rain").length} {lang === "np" ? "भारी वर्षा" : "Heavy rain"}
        </div>
      </div>
    </div>
  );
}
