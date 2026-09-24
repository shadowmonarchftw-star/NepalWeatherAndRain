"use client";

import React, { useState } from "react";
import { Waves, AlertTriangle, ShieldAlert, TrendingUp, Navigation, Car, CheckCircle2, Activity, Gauge } from "lucide-react";
import { INITIAL_RIVER_BASINS, RiverBasinRisk } from "@/data/nepalProvinces";
import { HIGHWAY_ADVISORIES } from "@/data/emergencyHotlines";
import { DHMRiverStation } from "@/app/api/dhm/route";

interface FloodHazardIndexProps {
  dhmRivers?: DHMRiverStation[];
  onSelectBasinFocus?: (basinId: string) => void;
}

export default function FloodHazardIndex({
  dhmRivers = [],
  onSelectBasinFocus,
}: FloodHazardIndexProps) {
  const [activeTab, setActiveTab] = useState<"rivers" | "dhm_gauges" | "highways">("dhm_gauges");

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0C1C36] to-[#071326] border-2 border-[#003893] p-5 shadow-2xl text-white">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#1A365D]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#003893]/40 border border-[#003893] text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                River Basin Flood & Live DHM Telemetry
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Official DHM Nepal
              </span>
            </div>
            <p className="text-xs text-blue-300">
              Department of Hydrology & Meteorology (जल तथा मौसम विज्ञान विभाग) Real-Time Data
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#061021] p-1 rounded-xl border border-[#1A365D] self-start sm:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("dhm_gauges")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "dhm_gauges"
                ? "bg-[#DC143C] text-white shadow-sm"
                : "text-blue-300 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>Live DHM Gauges ({dhmRivers.length || 5})</span>
          </button>

          <button
            onClick={() => setActiveTab("rivers")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "rivers"
                ? "bg-[#DC143C] text-white shadow-sm"
                : "text-blue-300 hover:text-white"
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Basin Models ({INITIAL_RIVER_BASINS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("highways")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "highways"
                ? "bg-[#DC143C] text-white shadow-sm"
                : "text-blue-300 hover:text-white"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Highways & Passes</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live DHM Gauges */}
      {activeTab === "dhm_gauges" && (
        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-xl bg-[#07152B] border border-[#16335C] text-xs text-blue-200 flex items-center justify-between flex-wrap gap-2">
            <span>
              Direct telemetry from DHM flood monitoring stations. Water Level (WL), Warning Level (WR), Danger Level (DL).
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live DHM Telemetry Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dhmRivers.map((station) => {
              const isDanger = station.status === "Danger";
              const isWarning = station.status === "Warning";

              const badgeBg = isDanger
                ? "bg-[#DC143C] text-white border-white/30 animate-pulse"
                : isWarning
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";

              const percent = Math.min(100, Math.round((station.waterLevelM / station.warningLevelM) * 100));

              return (
                <div
                  key={station.name}
                  className="p-4 rounded-xl bg-[#07152B] border border-[#16335C] flex flex-col justify-between"
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
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-lg bg-[#050D1A] border border-[#122A4E] text-center">
                      <div>
                        <div className="text-[10px] text-blue-300 font-semibold">WL (Current)</div>
                        <div className="text-base font-black text-white mt-0.5">
                          {station.waterLevelM} <span className="text-[10px] font-normal">m</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-amber-300 font-semibold">WR (Warning)</div>
                        <div className="text-sm font-bold text-amber-300 mt-0.5">
                          {station.warningLevelM} <span className="text-[10px] font-normal">m</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-red-400 font-semibold">DL (Danger)</div>
                        <div className="text-sm font-bold text-red-400 mt-0.5">
                          {station.dangerLevelM} <span className="text-[10px] font-normal">m</span>
                        </div>
                      </div>
                    </div>

                    {/* Gauge Capacity Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-blue-300/80">Capacity to Warning:</span>
                        <span className="font-bold text-white">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0D2140] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDanger
                              ? "bg-[#DC143C]"
                              : isWarning
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#122A4E] text-[10px] text-blue-300 flex items-center justify-between">
                    <span>Source: DHM Real-Time Sensor</span>
                    <span className="text-cyan-400 font-semibold">Live Hydrology Feed</span>
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
            const isWatch = basin.alertLevel === "Watch";

            const badgeBg = isDanger
              ? "bg-[#DC143C] text-white border-white/20 animate-pulse"
              : isWarning
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : isWatch
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";

            return (
              <div
                key={basin.id}
                className="p-4 rounded-xl bg-[#07152B] border border-[#16335C] hover:border-[#1E427B] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">{basin.name}</h4>
                      <p className="text-[11px] text-blue-300">{basin.nepaliName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeBg}`}
                    >
                      {basin.alertLevel}
                    </span>
                  </div>

                  {/* Score & Discharge Trend */}
                  <div className="my-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-300">Hazard Score:</span>
                      <span
                        className={`font-black ${
                          isDanger
                            ? "text-[#FF4D6D]"
                            : isWarning
                            ? "text-amber-400"
                            : "text-blue-200"
                        }`}
                      >
                        {basin.floodRiskScore}/100
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#0D2140] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDanger
                            ? "bg-[#DC143C]"
                            : isWarning
                            ? "bg-amber-400"
                            : "bg-blue-400"
                        }`}
                        style={{ width: `${basin.floodRiskScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-blue-300/80">Discharge Trend:</span>
                      <span className="text-cyan-300 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-cyan-400" />
                        {basin.estimatedDischargeTrend}
                      </span>
                    </div>
                  </div>

                  {/* Monitored Rivers */}
                  <div className="pt-2 border-t border-[#122A4E] text-[11px]">
                    <span className="text-blue-400 font-semibold block mb-1">
                      Monitored Tributaries:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {basin.monitoredRivers.map((r) => (
                        <span
                          key={r}
                          className="px-1.5 py-0.5 rounded bg-[#0A1D39] text-blue-200 text-[10px]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vulnerable points */}
                <div className="mt-3 pt-2 border-t border-[#122A4E] text-[10px] text-amber-300/90">
                  <span className="font-semibold text-white">High Inundation Watch: </span>
                  {basin.criticalVulnerableLocations.join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Highways & Mountain Passes */}
      {activeTab === "highways" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {HIGHWAY_ADVISORIES.map((hwy) => {
            const isSlideDanger =
              hwy.status === "High Landslide Risk" || hwy.status === "Blocked / Danger";

            return (
              <div
                key={hwy.highwayName}
                className="p-4 rounded-xl bg-[#07152B] border border-[#16335C] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">{hwy.highwayName}</h4>
                      <p className="text-[11px] text-blue-300">{hwy.nepaliName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        isSlideDanger
                          ? "bg-[#DC143C]/20 text-[#FF4D6D] border-[#DC143C]"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      }`}
                    >
                      {hwy.status}
                    </span>
                  </div>

                  <p className="text-xs text-blue-100 leading-relaxed my-2">
                    {hwy.currentRiskSummary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#122A4E] text-[11px]">
                  <span className="text-amber-400 font-semibold block mb-1">
                    Critical Chokepoints:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hwy.keyChokepoints.map((pt) => (
                      <span
                        key={pt}
                        className="px-2 py-0.5 rounded bg-[#0A1D39] text-blue-200 text-[10px] border border-[#1E3A8A]"
                      >
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
