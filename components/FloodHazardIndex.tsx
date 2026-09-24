"use client";

import React, { useState, useMemo } from "react";
import {
  Waves,
  TrendingUp,
  Car,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Users,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { INITIAL_RIVER_BASINS } from "@/data/nepalProvinces";
import { HIGHWAY_ADVISORIES } from "@/data/emergencyHotlines";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { NDRRMAAlert } from "@/lib/types";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface FloodHazardIndexProps {
  dhmRivers?: DHMRiverStation[];
  ndrrmaAlerts?: NDRRMAAlert[];
  onSelectBasinFocus?: (basinId: string) => void;
  onSelectAlertFocus?: (coords: [number, number]) => void;
  lang?: Language;
}

export default function FloodHazardIndex({
  dhmRivers = [],
  ndrrmaAlerts = [],
  onSelectBasinFocus,
  onSelectAlertFocus,
  lang = "en",
}: FloodHazardIndexProps) {
  const [activeTab, setActiveTab] = useState<"dhm_gauges" | "ndrrma_alerts" | "rivers" | "highways">("dhm_gauges");
  const [gaugeSearch, setGaugeSearch] = useState("");
  const [gaugeFilter, setGaugeFilter] = useState<"all" | "elevated">("all");
  const [visibleGaugeCount, setVisibleGaugeCount] = useState<number>(9);

  const t = TRANSLATIONS[lang];

  // Filter and prioritize DHM river stations
  const filteredGauges = useMemo(() => {
    let list = [...dhmRivers];
    if (gaugeFilter === "elevated") {
      list = list.filter((r) => r.status === "Danger" || r.status === "Warning" || r.percentOfWarning >= 70);
    }
    if (gaugeSearch.trim()) {
      const q = gaugeSearch.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.river.toLowerCase().includes(q));
    }
    // Sort: Danger first, Warning second, then by warning percentage descending
    return list.sort((a, b) => {
      const score = (s: DHMRiverStation) =>
        s.status === "Danger" ? 1000 : s.status === "Warning" ? 500 : s.percentOfWarning;
      return score(b) - score(a);
    });
  }, [dhmRivers, gaugeFilter, gaugeSearch]);

  const displayedGauges = filteredGauges.slice(0, visibleGaugeCount);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm dark:shadow-lg text-slate-900 dark:text-white transition-colors">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-50 dark:bg-[#162035] border border-cyan-200 dark:border-slate-700 text-blue-600 dark:text-cyan-400 flex-shrink-0">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {t.dhmTelemetryTitle}
              </h3>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                DHM & NDRRMA
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              {t.dhmGovNepal}
            </p>
          </div>
        </div>

        {/* Tab Switcher - Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0A0F1A] p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto overflow-x-auto scrollbar-none max-w-full">
          {/* Tab 1: DHM Gauges */}
          <button
            onClick={() => setActiveTab("dhm_gauges")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === "dhm_gauges"
                ? "bg-[#C51D34] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-300" />
            <span>{t.tabDhmGauges} ({dhmRivers.length || 5})</span>
          </button>

          {/* Tab 2: NDRRMA Live Alerts */}
          <button
            onClick={() => setActiveTab("ndrrma_alerts")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === "ndrrma_alerts"
                ? "bg-[#C51D34] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>{t.tabNdrrmaAlerts} ({ndrrmaAlerts.length || 5})</span>
            {ndrrmaAlerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
            )}
          </button>

          {/* Tab 3: Basin Models */}
          <button
            onClick={() => setActiveTab("rivers")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === "rivers"
                ? "bg-[#C51D34] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{t.tabBasinModels} ({INITIAL_RIVER_BASINS.length})</span>
          </button>

          {/* Tab 4: Highways */}
          <button
            onClick={() => setActiveTab("highways")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === "highways"
                ? "bg-[#C51D34] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>{t.tabHighways}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live DHM Gauges */}
      {activeTab === "dhm_gauges" && (
        <div className="mt-3.5 space-y-3">
          {/* Status info bar */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
            <span>{t.dhmGaugeSub}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.liveDhmConnected}
            </span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={gaugeSearch}
                onChange={(e) => setGaugeSearch(e.target.value)}
                placeholder={lang === "np" ? "नदी वा स्टेसन खोज्नुहोस् (उदा. कोशी, वाग्मती)..." : "Search river or station (e.g. Koshi, Chatara)..."}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#003893]"
              />
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => setGaugeFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all touch-manipulation ${
                  gaugeFilter === "all"
                    ? "bg-[#003893] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#0A0F1A] text-slate-600 dark:text-slate-400"
                }`}
              >
                {lang === "np" ? "सबै स्टेसन" : "All Gauges"} ({dhmRivers.length})
              </button>
              <button
                onClick={() => setGaugeFilter("elevated")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all touch-manipulation ${
                  gaugeFilter === "elevated"
                    ? "bg-[#C51D34] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#0A0F1A] text-slate-600 dark:text-slate-400"
                }`}
              >
                {lang === "np" ? "सतर्कता / उच्च" : "Elevated Only"}
              </button>
            </div>
          </div>

          {/* Gauges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedGauges.map((station) => {
              const isDanger = station.status === "Danger";
              const isWarning = station.status === "Warning";

              const badgeBg = isDanger
                ? "bg-[#C51D34] text-white animate-pulse"
                : isWarning
                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

              const percent = Math.min(100, Math.round((station.waterLevelM / station.warningLevelM) * 100));

              return (
                <div
                  key={station.name}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{station.name}</h4>
                        <span className="text-[11px] text-blue-600 dark:text-cyan-300 font-semibold truncate block">{station.river}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex-shrink-0 ${badgeBg}`}>
                        {station.status}
                      </span>
                    </div>

                    {/* Gauges Level Grid */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-2.5 p-2 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center">
                      <div>
                        <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{t.waterLevel}</div>
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                          {station.waterLevelM} <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">m</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{t.warningLevel}</div>
                        <div className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 mt-0.5 tabular-nums">
                          {station.warningLevelM} <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">m</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] sm:text-[10px] text-red-600 dark:text-red-400 font-semibold">{t.dangerLevel}</div>
                        <div className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 tabular-nums">
                          {station.dangerLevelM} <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">m</span>
                        </div>
                      </div>
                    </div>

                    {/* Gauge Capacity Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">{t.capacityToWarning}</span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDanger
                              ? "bg-[#C51D34]"
                              : isWarning
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>{t.sensorSource}</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-semibold">{t.liveHydrologyFeed}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination / Expand More Stations on mobile */}
          {filteredGauges.length > visibleGaugeCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleGaugeCount((prev) => prev + 12)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0A0F1A] dark:hover:bg-[#162035] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-xs flex items-center gap-1.5 mx-auto active:scale-95 touch-manipulation"
              >
                <ChevronDown className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>
                  {lang === "np"
                    ? `थप १२ स्टेसनहरू देखाउनुहोस् (${filteredGauges.length - visibleGaugeCount} बाँकी)`
                    : `Show 12 More Stations (${filteredGauges.length - visibleGaugeCount} remaining)`}
                </span>
              </button>
            </div>
          )}

          {visibleGaugeCount > 9 && (
            <div className="text-center pt-1">
              <button
                onClick={() => setVisibleGaugeCount(9)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium"
              >
                {lang === "np" ? "कम देखाउनुहोस्" : "Show Fewer Stations"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: NDRRMA Live Alerts */}
      {activeTab === "ndrrma_alerts" && (
        <div className="mt-3.5 space-y-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
            <span>{t.ndrrmaSub}</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t.ndrrmaConnected}
            </span>
          </div>

          {ndrrmaAlerts.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {lang === "np" ? "हाल कुनै सक्रिय विपद् संकट चेतावनी छैन" : "No Critical NDRRMA Disaster Alerts Active"}
              </p>
              <p className="text-xs mt-1 text-slate-500">
                {lang === "np" ? "सबै जिल्लाहरूमा स्थिति सामान्य छ वा अनुगमनमा छ।" : "All districts monitored by BIPAD portal are currently within normal baseline thresholds."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ndrrmaAlerts.map((alert) => {
                const titleText = (lang === "np" && alert.titleNe) ? alert.titleNe : alert.title;
                const formattedDate = new Date(alert.startedOn).toLocaleDateString(
                  lang === "np" ? "ne-NP" : "en-US",
                  { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                );

                return (
                  <div
                    key={alert.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-amber-200 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-600 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                          {alert.referenceType || "Hazard Alert"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          ID: #{alert.id}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {titleText}
                      </h4>

                      {alert.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                          {alert.description}
                        </p>
                      )}

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.ndrrmaStarted}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">{formattedDate}</span>
                        </div>
                        {alert.householdCount !== undefined && alert.householdCount > 0 ? (
                          <div className="p-2 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.ndrrmaHouseholds}</span>
                            <span className="font-bold text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {alert.householdCount}
                            </span>
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.ndrrmaType}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">
                              {alert.source || "NDRRMA / DHM"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        <span>{alert.lat.toFixed(2)}°N, {alert.lon.toFixed(2)}°E</span>
                      </span>
                      {onSelectAlertFocus && (
                        <button
                          onClick={() => onSelectAlertFocus([alert.lat, alert.lon])}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 touch-manipulation"
                        >
                          {t.ndrrmaFocusMap}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: River Basin Models */}
      {activeTab === "rivers" && (
        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {INITIAL_RIVER_BASINS.map((basin) => {
            const isDanger = basin.alertLevel === "Danger";
            const isWarning = basin.alertLevel === "Warning";

            const badgeBg = isDanger
              ? "bg-[#C51D34] text-white animate-pulse"
              : isWarning
              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

            return (
              <div
                key={basin.id}
                className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang === "np" ? basin.nepaliName : basin.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === "np" ? basin.name : basin.nepaliName}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex-shrink-0 ${badgeBg}`}>
                      {basin.alertLevel}
                    </span>
                  </div>

                  <div className="my-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{lang === "np" ? "जोखिम अङ्क:" : "Hazard Score:"}</span>
                      <span className="font-black text-slate-900 dark:text-white tabular-nums">
                        {basin.floodRiskScore}/100
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDanger ? "bg-[#C51D34]" : isWarning ? "bg-amber-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${basin.floodRiskScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 dark:text-slate-400">{lang === "np" ? "बहाव प्रवृत्ति:" : "Discharge Trend:"}</span>
                      <span className="text-blue-700 dark:text-cyan-300 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                        {basin.estimatedDischargeTrend}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      {lang === "np" ? "अनुगमन गरिएका सहायक नदीहरू:" : "Monitored Tributaries:"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {basin.monitoredRivers.map((r) => (
                        <span key={r} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
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

      {/* Tab 4: Highways */}
      {activeTab === "highways" && (
        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {HIGHWAY_ADVISORIES.map((hwy) => {
            const isSlideDanger = hwy.status === "High Landslide Risk" || hwy.status === "Blocked / Danger";

            return (
              <div
                key={hwy.highwayName}
                className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang === "np" ? hwy.nepaliName : hwy.highwayName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === "np" ? hwy.highwayName : hwy.nepaliName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex-shrink-0 ${
                        isSlideDanger
                          ? "bg-red-100 dark:bg-[#C51D34]/20 text-red-700 dark:text-[#FF4D6D] border-red-300 dark:border-[#C51D34]"
                          : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40"
                      }`}
                    >
                      {hwy.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed my-2">
                    {hwy.currentRiskSummary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <span className="text-amber-700 dark:text-amber-400 font-semibold block mb-1">
                    {lang === "np" ? "मुख्य पहिरो सम्भावित बिन्दुहरू:" : "Critical Chokepoints:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hwy.keyChokepoints.map((pt) => (
                      <span key={pt} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
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
