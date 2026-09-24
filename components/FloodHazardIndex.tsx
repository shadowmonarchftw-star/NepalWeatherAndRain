"use client";

import React, { useState } from "react";
import { Waves, TrendingUp, Car, Activity } from "lucide-react";
import { INITIAL_RIVER_BASINS } from "@/data/nepalProvinces";
import { HIGHWAY_ADVISORIES } from "@/data/emergencyHotlines";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface FloodHazardIndexProps {
  dhmRivers?: DHMRiverStation[];
  onSelectBasinFocus?: (basinId: string) => void;
  lang?: Language;
}

export default function FloodHazardIndex({
  dhmRivers = [],
  onSelectBasinFocus,
  lang = "en",
}: FloodHazardIndexProps) {
  const [activeTab, setActiveTab] = useState<"dhm_gauges" | "rivers" | "highways">("dhm_gauges");
  const t = TRANSLATIONS[lang];

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 shadow-lg text-white">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#162035] border border-slate-700 text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.dhmTelemetryTitle}
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                DHM NEPAL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t.dhmGovNepal}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0A0F1A] p-1 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("dhm_gauges")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "dhm_gauges"
                ? "bg-[#C51D34] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>{t.tabDhmGauges} ({dhmRivers.length || 5})</span>
          </button>

          <button
            onClick={() => setActiveTab("rivers")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "rivers"
                ? "bg-[#C51D34] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{t.tabBasinModels} ({INITIAL_RIVER_BASINS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("highways")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "highways"
                ? "bg-[#C51D34] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>{t.tabHighways}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live DHM Gauges */}
      {activeTab === "dhm_gauges" && (
        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-xl bg-[#0A0F1A] border border-slate-800 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
            <span>{t.dhmGaugeSub}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t.liveDhmConnected}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dhmRivers.map((station) => {
              const isDanger = station.status === "Danger";
              const isWarning = station.status === "Warning";

              const badgeBg = isDanger
                ? "bg-[#C51D34] text-white animate-pulse"
                : isWarning
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 text-slate-300";

              const percent = Math.min(100, Math.round((station.waterLevelM / station.warningLevelM) * 100));

              return (
                <div
                  key={station.name}
                  className="p-4 rounded-xl bg-[#0A0F1A] border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{station.name}</h4>
                        <span className="text-[11px] text-cyan-300">{station.river}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeBg}`}>
                        {station.status}
                      </span>
                    </div>

                    {/* Gauges Level Grid */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">{t.waterLevel}</div>
                        <div className="text-base font-black text-white mt-0.5 tabular-nums">
                          {station.waterLevelM} <span className="text-[10px] font-normal text-slate-400">m</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-amber-400 font-semibold">{t.warningLevel}</div>
                        <div className="text-sm font-bold text-amber-300 mt-0.5 tabular-nums">
                          {station.warningLevelM} <span className="text-[10px] font-normal text-slate-400">m</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-red-400 font-semibold">{t.dangerLevel}</div>
                        <div className="text-sm font-bold text-red-400 mt-0.5 tabular-nums">
                          {station.dangerLevelM} <span className="text-[10px] font-normal text-slate-400">m</span>
                        </div>
                      </div>
                    </div>

                    {/* Gauge Capacity Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{t.capacityToWarning}</span>
                        <span className="font-bold text-white tabular-nums">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDanger
                              ? "bg-[#C51D34]"
                              : isWarning
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{t.sensorSource}</span>
                    <span className="text-cyan-400 font-semibold">{t.liveHydrologyFeed}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: River Basin Models */}
      {activeTab === "rivers" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {INITIAL_RIVER_BASINS.map((basin) => {
            const isDanger = basin.alertLevel === "Danger";
            const isWarning = basin.alertLevel === "Warning";

            const badgeBg = isDanger
              ? "bg-[#C51D34] text-white animate-pulse"
              : isWarning
              ? "bg-amber-500/20 text-amber-300"
              : "bg-slate-800 text-slate-300";

            return (
              <div
                key={basin.id}
                className="p-4 rounded-xl bg-[#0A0F1A] border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {lang === "np" ? basin.nepaliName : basin.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {lang === "np" ? basin.name : basin.nepaliName}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeBg}`}>
                      {basin.alertLevel}
                    </span>
                  </div>

                  <div className="my-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{lang === "np" ? "जोखिम अङ्क:" : "Hazard Score:"}</span>
                      <span className="font-black text-white tabular-nums">
                        {basin.floodRiskScore}/100
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDanger ? "bg-[#C51D34]" : isWarning ? "bg-amber-400" : "bg-blue-400"
                        }`}
                        style={{ width: `${basin.floodRiskScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">{lang === "np" ? "बहाव प्रवृत्ति:" : "Discharge Trend:"}</span>
                      <span className="text-cyan-300 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-cyan-400" />
                        {basin.estimatedDischargeTrend}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400 font-semibold block mb-1">
                      {lang === "np" ? "अनुगमन गरिएका सहायक नदीहरू:" : "Monitored Tributaries:"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {basin.monitoredRivers.map((r) => (
                        <span key={r} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Highways */}
      {activeTab === "highways" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {HIGHWAY_ADVISORIES.map((hwy) => {
            const isSlideDanger = hwy.status === "High Landslide Risk" || hwy.status === "Blocked / Danger";

            return (
              <div
                key={hwy.highwayName}
                className="p-4 rounded-xl bg-[#0A0F1A] border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {lang === "np" ? hwy.nepaliName : hwy.highwayName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {lang === "np" ? hwy.highwayName : hwy.nepaliName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        isSlideDanger
                          ? "bg-[#C51D34]/20 text-[#FF4D6D] border-[#C51D34]"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      }`}
                    >
                      {hwy.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed my-2">
                    {hwy.currentRiskSummary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-amber-400 font-semibold block mb-1">
                    {lang === "np" ? "मुख्य पहिरो सम्भावित बिन्दुहरू:" : "Critical Chokepoints:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hwy.keyChokepoints.map((pt) => (
                      <span key={pt} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {pt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
