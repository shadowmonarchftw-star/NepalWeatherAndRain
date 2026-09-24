"use client";

import React, { useState } from "react";
import { Waves, AlertTriangle, ShieldAlert, TrendingUp, Navigation, Car, CheckCircle2 } from "lucide-react";
import { INITIAL_RIVER_BASINS, RiverBasinRisk } from "@/data/nepalProvinces";
import { HIGHWAY_ADVISORIES } from "@/data/emergencyHotlines";

interface FloodHazardIndexProps {
  onSelectBasinFocus?: (basinId: string) => void;
}

export default function FloodHazardIndex({ onSelectBasinFocus }: FloodHazardIndexProps) {
  const [activeTab, setActiveTab] = useState<"rivers" | "highways">("rivers");

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0C1C36] to-[#071326] border-2 border-[#003893] p-5 shadow-2xl text-white">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#1A365D]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#003893]/40 border border-[#003893] text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              River Basin Flood & Landslide Risk Index
            </h3>
            <p className="text-xs text-blue-300">
              Department of Hydrology & Meteorology (DHM) alignment
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#061021] p-1 rounded-xl border border-[#1A365D] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("rivers")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "rivers"
                ? "bg-[#DC143C] text-white shadow-sm"
                : "text-blue-300 hover:text-white"
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>River Basins ({INITIAL_RIVER_BASINS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("highways")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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

      {/* Tab 1: River Basins */}
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

      {/* Tab 2: Highways & Mountain Passes */}
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
