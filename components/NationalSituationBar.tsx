"use client";

import React from "react";
import { CloudRain, AlertTriangle, Waves, Compass, ArrowUpRight } from "lucide-react";
import { DistrictWeatherSummary, BayOfBengalTelemetry } from "@/lib/types";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface NationalSituationBarProps {
  districts: DistrictWeatherSummary[];
  dhmRivers: DHMRiverStation[];
  telemetry: BayOfBengalTelemetry;
  lang: Language;
  onFocusPeakDistrict?: (districtId: string) => void;
}

export default function NationalSituationBar({
  districts,
  dhmRivers,
  telemetry,
  lang,
  onFocusPeakDistrict,
}: NationalSituationBarProps) {
  const t = TRANSLATIONS[lang];

  // 1. Find Peak Rain District
  const peakDistrict = districts.reduce<DistrictWeatherSummary | null>((max, curr) => {
    if (!max || curr.total24hRain > max.total24hRain) return curr;
    return max;
  }, null);

  // 2. Count alert districts
  const dangerCount = districts.filter((d) => d.alertLevel === "Danger").length;
  const warningCount = districts.filter((d) => d.alertLevel === "Warning").length;

  // 3. Count rivers with elevated level
  const elevatedRivers = dhmRivers.filter(
    (r) => r.status === "Warning" || r.status === "Danger" || r.percentOfWarning >= 75
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* KPI 1: Peak Rainfall */}
      <div
        onClick={() => peakDistrict && onFocusPeakDistrict?.(peakDistrict.districtId)}
        className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-[#C51D34] transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold">{t.kpiPeakRain}</span>
          <CloudRain className="w-4 h-4 text-[#FF4D6D] group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tabular-nums">
            {peakDistrict?.total24hRain ?? 0}
          </span>
          <span className="text-xs font-bold text-slate-400">mm / 24h</span>
        </div>
        <div className="text-[11px] text-[#FF4D6D] font-semibold truncate flex items-center justify-between mt-1">
          <span>{lang === "np" ? peakDistrict?.nepaliName : peakDistrict?.districtName}</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
        </div>
      </div>

      {/* KPI 2: Districts Under Warning */}
      <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold">{t.kpiHighAlertDistricts}</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-400 tabular-nums">
            {dangerCount + warningCount}
          </span>
          <span className="text-xs font-semibold text-slate-400">/ 77 {lang === "np" ? "जिल्ला" : "Districts"}</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium mt-1">
          <span className="text-[#FF4D6D] font-bold">{dangerCount} {lang === "np" ? "खतरा" : "Danger"}</span>
          {" • "}
          <span className="text-amber-400 font-bold">{warningCount} {lang === "np" ? "चेतावनी" : "Warning"}</span>
        </div>
      </div>

      {/* KPI 3: DHM River Status */}
      <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold">{t.kpiRiverStatus}</span>
          <Waves className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-cyan-300 tabular-nums">
            {dhmRivers.length || 5}
          </span>
          <span className="text-xs font-semibold text-slate-400">{lang === "np" ? "नदी सेन्सर" : "Active Gauges"}</span>
        </div>
        <div className="text-[11px] text-cyan-400 font-semibold mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            {elevatedRivers > 0
              ? `${elevatedRivers} ${lang === "np" ? "नदीमा सतर्कता" : "Elevated Discharges"}`
              : lang === "np" ? "सतर्कता सीमाभित्र" : "Within Normal Limits"}
          </span>
        </div>
      </div>

      {/* KPI 4: Bay of Bengal Proximity */}
      <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold">{t.kpiStormDistance}</span>
          <Compass className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tabular-nums">
            ~{telemetry.distanceToNepalBorderKm}
          </span>
          <span className="text-xs font-semibold text-slate-400">km</span>
        </div>
        <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center justify-between">
          <span>{telemetry.systemType.split(" (")[0]}</span>
          <span className="text-blue-300 text-[10px]">{t.inflowActive}</span>
        </div>
      </div>
    </div>
  );
}
