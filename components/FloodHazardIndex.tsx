"use client";

import React, { useState, useMemo } from "react";
import {
  Waves,
  Car,
  Activity,
  ShieldAlert,
  Users,
  MapPin,
  Search,
  ChevronDown,
} from "lucide-react";
import { HIGHWAY_ADVISORIES } from "@/data/emergencyHotlines";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { NDRRMAAlert, DHMRainStation } from "@/lib/types";
import { basinRainNear, BASIN_RAIN_RADIUS_KM } from "@/lib/observedRain";
import { HistoryTarget } from "@/components/StationHistoryModal";
import { RoadStatus } from "@/app/api/roads/route";
import { Language, TRANSLATIONS } from "@/lib/translations";

const RISING_WATCH_MARGIN_M = 1.0;

interface FloodHazardIndexProps {
  dhmRivers?: DHMRiverStation[];
  ndrrmaAlerts?: NDRRMAAlert[];
  rainStations?: DHMRainStation[];
  onSelectAlertFocus?: (coords: [number, number]) => void;
  onOpenHistory?: (target: HistoryTarget) => void;
  roads?: RoadStatus[];
  lang?: Language;
}

export default function FloodHazardIndex({
  dhmRivers = [],
  ndrrmaAlerts = [],
  rainStations = [],
  onSelectAlertFocus,
  onOpenHistory,
  roads = [],
  lang = "en",
}: FloodHazardIndexProps) {
  const [showPartialRoads, setShowPartialRoads] = useState(false);
  const [activeTab, setActiveTab] = useState<"dhm_gauges" | "ndrrma_alerts" | "rivers" | "highways">("dhm_gauges");
  const [gaugeSearch, setGaugeSearch] = useState("");
  const [gaugeFilter, setGaugeFilter] = useState<"all" | "elevated" | "rising">("all");
  const [visibleGaugeCount, setVisibleGaugeCount] = useState<number>(9);

  const t = TRANSLATIONS[lang];

  // Rising watch: DHM marks the gauge RISING and it is already above warning, or within RISING_WATCH_MARGIN_M of it
  const risingWatch = useMemo(
    () =>
      dhmRivers
        .filter(
          (r) =>
            r.steady === "RISING" &&
            (r.status !== "Normal" ||
              (r.warningLevelM !== null && r.warningLevelM - r.waterLevelM <= RISING_WATCH_MARGIN_M))
        )
        .sort(
          (a, b) =>
            (a.warningLevelM !== null ? a.warningLevelM - a.waterLevelM : -Infinity) -
            (b.warningLevelM !== null ? b.warningLevelM - b.waterLevelM : -Infinity)
        ),
    [dhmRivers]
  );

  // Filter and prioritize DHM river stations
  const filteredGauges = useMemo(() => {
    // Stale readings and sensor faults are already excluded server-side in /api/dhm
    let list = [...dhmRivers];

    if (gaugeFilter === "elevated") {
      list = list.filter((r) => r.status === "Danger" || r.status === "Warning");
    }
    if (gaugeFilter === "rising") {
      list = [...risingWatch];
    }
    if (gaugeSearch.trim()) {
      const q = gaugeSearch.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.river.toLowerCase().includes(q));
    }
    if (gaugeFilter === "rising") return list;
    // Danger, then Warning, then closest to the DHM warning level; gauges with no DHM threshold last
    const rank = (s: DHMRiverStation) => (s.status === "Danger" ? 2 : s.status === "Warning" ? 1 : 0);
    const margin = (s: DHMRiverStation) => (s.warningLevelM !== null ? s.warningLevelM - s.waterLevelM : Infinity);
    return list.sort((a, b) => rank(b) - rank(a) || margin(a) - margin(b));
  }, [dhmRivers, gaugeFilter, gaugeSearch, risingWatch]);

  const displayedGauges = filteredGauges.slice(0, visibleGaugeCount);

  // Per-basin roll-up of live DHM gauges (basin names as published by DHM/BIPAD)
  const basinSummaries = useMemo(() => {
    const groups = new Map<string, DHMRiverStation[]>();
    for (const r of dhmRivers) {
      const key = r.basin || (lang === "np" ? "अन्य" : "Other");
      groups.set(key, [...(groups.get(key) || []), r]);
    }
    return [...groups.entries()]
      .map(([basin, stations]) => ({
        basin,
        stations,
        danger: stations.filter((s) => s.status === "Danger"),
        warning: stations.filter((s) => s.status === "Warning"),
        rising: stations.filter((s) => s.steady === "RISING").length,
      }))
      .sort(
        (a, b) =>
          b.danger.length - a.danger.length ||
          b.warning.length - a.warning.length ||
          b.stations.length - a.stations.length
      );
  }, [dhmRivers, lang]);

  const roadAlerts = ndrrmaAlerts.filter((a) => a.referenceType === "road");

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
            <span>{t.tabDhmGauges} ({filteredGauges.length})</span>
          </button>

          {/* Tab 3: NDRRMA Live Alerts */}
          <button
            onClick={() => setActiveTab("ndrrma_alerts")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === "ndrrma_alerts"
                ? "bg-[#C51D34] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>{t.tabNdrrmaAlerts} ({ndrrmaAlerts.length})</span>
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
            <span>{t.tabBasinModels} ({basinSummaries.length})</span>
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
            <span>
              {t.tabHighways}
              {roads.length > 0 ? ` (${roads.filter((r) => r.status === "CLOSED").length} ${lang === "np" ? "बन्द" : "closed"})` : ""}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live DHM Gauges */}
      {activeTab === "dhm_gauges" && (
        <div className="mt-3.5 space-y-3">
          {/* Status info bar */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
            <span>{t.dhmGaugeSub}</span>
            {dhmRivers.length > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.liveDhmConnected}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
                {lang === "np" ? "DHM फिड उपलब्ध छैन" : "DHM feed unavailable"}
              </span>
            )}
          </div>

          {risingWatch.length > 0 && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">
                {lang === "np" ? "बढ्दो निगरानी:" : "Rising watch:"}
              </span>{" "}
              {risingWatch
                .slice(0, 4)
                .map((r) =>
                  r.warningLevelM === null
                    ? r.name
                    : r.warningLevelM - r.waterLevelM > 0
                    ? `${r.name} (${(r.warningLevelM - r.waterLevelM).toFixed(2)} m ${lang === "np" ? "तल" : "below warning"})`
                    : `${r.name} (${lang === "np" ? "चेतावनीभन्दा माथि" : "above warning"})`
                )
                .join(" · ")}
              {risingWatch.length > 4 && ` +${risingWatch.length - 4}`}
            </div>
          )}

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
              <button
                onClick={() => setGaugeFilter("rising")}
                title={
                  lang === "np"
                    ? "बढ्दो र चेतावनी तहभन्दा १ मिटरभित्र वा माथि"
                    : "Rising and within 1 m of (or above) the DHM warning level"
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all touch-manipulation ${
                  gaugeFilter === "rising"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#0A0F1A] text-slate-600 dark:text-slate-400"
                }`}
              >
                {lang === "np" ? "बढ्दो निगरानी" : "Rising Watch"} ({risingWatch.length})
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

              // Distance to DHM warning level in metres; valid for both local-gauge and sea-level datums
              const marginM =
                station.warningLevelM !== null ? Number((station.warningLevelM - station.waterLevelM).toFixed(2)) : null;
              const readingTime = new Date(station.waterLevelOn).toLocaleString(lang === "np" ? "ne-NP" : "en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={station.id}
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
                          {station.warningLevelM ?? "—"} {station.warningLevelM !== null && <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">m</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] sm:text-[10px] text-red-600 dark:text-red-400 font-semibold">{t.dangerLevel}</div>
                        <div className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 tabular-nums">
                          {station.dangerLevelM ?? "—"} {station.dangerLevelM !== null && <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">m</span>}
                        </div>
                      </div>
                    </div>

                    {/* Margin to DHM warning level */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        {lang === "np" ? "चेतावनी तहसम्मको दूरी:" : "Margin to warning:"}
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          marginM !== null && marginM <= 0 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {marginM === null
                          ? lang === "np" ? "DHM ले तोकेको छैन" : "Not set by DHM"
                          : marginM > 0
                          ? `${marginM} m ${lang === "np" ? "तल" : "below"}`
                          : `${Math.abs(marginM)} m ${lang === "np" ? "माथि" : "above"}`}
                      </span>
                    </div>
                    {(() => {
                      const br = basinRainNear(station, rainStations);
                      return (
                        <div
                          className="flex items-center justify-between text-[11px] mt-1"
                          title={
                            lang === "np"
                              ? `एउटै जलाधार र ${BASIN_RAIN_RADIUS_KM} km भित्रका DHM वर्षा मापन केन्द्र`
                              : `DHM rain gauges in the same basin within ${BASIN_RAIN_RADIUS_KM} km`
                          }
                        >
                          <span className="text-slate-500 dark:text-slate-400">
                            {lang === "np" ? "नजिकको जलाधार वर्षा (२४ घ):" : "Basin rain nearby (24h):"}
                          </span>
                          <span
                            className={`font-semibold tabular-nums ${
                              br && br.max24hMm >= 100
                                ? "text-red-600 dark:text-red-400"
                                : br && br.max24hMm >= 50
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {br
                              ? `${lang === "np" ? "अधिकतम" : "max"} ${br.max24hMm} mm · ${br.gaugeCount} ${lang === "np" ? "केन्द्र" : br.gaugeCount === 1 ? "gauge" : "gauges"}`
                              : lang === "np"
                              ? "नजिक मापन छैन"
                              : "no gauge nearby"}
                          </span>
                        </div>
                      );
                    })()}
                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="text-slate-500 dark:text-slate-400">{lang === "np" ? "मापन समय:" : "Reading at:"}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {readingTime}
                        {station.steady ? ` · ${station.steady}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>{t.sensorSource}</span>
                    <button
                      onClick={() =>
                        onOpenHistory?.({
                          kind: "river",
                          id: station.id,
                          name: station.name,
                          warningLevelM: station.warningLevelM,
                          dangerLevelM: station.dangerLevelM,
                        })
                      }
                      className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline"
                    >
                      {lang === "np" ? "२४ घण्टा चार्ट →" : "24h chart →"}
                    </button>
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

      {/* Tab 3: NDRRMA Live Alerts */}
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

      {/* Tab: Basin roll-up of live DHM gauges */}
      {activeTab === "rivers" && (
        <div className="mt-3.5 space-y-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            {lang === "np"
              ? "जलाधार अनुसार DHM का प्रत्यक्ष नदी मापन स्टेसनहरूको सारांश (पछिल्लो २४ घण्टाभित्रको मापन मात्र)।"
              : "Live DHM river gauges grouped by basin (only readings from the last 24 hours)."}
          </div>
          {basinSummaries.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
              {lang === "np" ? "DHM फिड उपलब्ध छैन" : "DHM feed unavailable"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {basinSummaries.map((b) => {
                const isDanger = b.danger.length > 0;
                const isWarning = !isDanger && b.warning.length > 0;
                const flagged = [...b.danger, ...b.warning];

                return (
                  <div
                    key={b.basin}
                    className={`p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border flex flex-col justify-between ${
                      isDanger
                        ? "border-[#C51D34]"
                        : isWarning
                        ? "border-amber-400"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{b.basin}</h4>
                      <div className="grid grid-cols-4 gap-1.5 text-center p-2 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                        <div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">{lang === "np" ? "स्टेसन" : "Gauges"}</div>
                          <div className="text-sm font-black tabular-nums">{b.stations.length}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-red-600 dark:text-red-400 font-semibold">{lang === "np" ? "खतरा" : "Danger"}</div>
                          <div className="text-sm font-black tabular-nums text-red-600 dark:text-red-400">{b.danger.length}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">{lang === "np" ? "चेतावनी" : "Warning"}</div>
                          <div className="text-sm font-black tabular-nums text-amber-600 dark:text-amber-400">{b.warning.length}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">{lang === "np" ? "बढ्दो" : "Rising"}</div>
                          <div className="text-sm font-black tabular-nums">{b.rising}</div>
                        </div>
                      </div>

                      {flagged.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          {flagged.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => onSelectAlertFocus?.(st.coordinates)}
                              className="w-full flex items-center justify-between gap-2 text-[11px] text-left hover:underline"
                            >
                              <span className="truncate text-slate-700 dark:text-slate-300">{st.name}</span>
                              <span
                                className={`font-bold tabular-nums flex-shrink-0 ${
                                  st.status === "Danger" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {st.waterLevelM} m
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                      {t.sensorSource}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Highways — live DoR road status, NDRRMA road alerts, static reference corridors */}
      {activeTab === "highways" && (
        <div className="mt-3.5 space-y-3">
          {(() => {
            const np = lang === "np";
            const fmt = (iso?: string) =>
              iso
                ? new Date(iso).toLocaleString(np ? "ne-NP" : "en-US", {
                    timeZone: "Asia/Kathmandu",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";
            const closed = roads.filter((r) => r.status === "CLOSED");
            const partial = roads.filter((r) => r.status === "PARTIAL_OPEN");
            const reopened = roads.filter((r) => r.status === "OPEN");
            const card = (r: RoadStatus) => (
              <div
                key={r.id}
                className={`p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border ${
                  r.status === "CLOSED"
                    ? "border-red-300 dark:border-[#C51D34]/60"
                    : r.status === "PARTIAL_OPEN"
                    ? "border-amber-300 dark:border-amber-500/40"
                    : "border-emerald-300 dark:border-emerald-500/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {r.road}
                    {r.roadRef ? <span className="font-normal text-slate-500"> · {r.roadRef}</span> : null}
                  </h4>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase flex-shrink-0 ${
                      r.status === "CLOSED"
                        ? "bg-[#C51D34] text-white"
                        : r.status === "PARTIAL_OPEN"
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    {r.status === "CLOSED"
                      ? np ? "बन्द" : "Closed"
                      : r.status === "PARTIAL_OPEN"
                      ? np ? "आंशिक खुला" : "Partly open"
                      : np ? "खुला" : "Reopened"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {r.location}
                  {r.reason ? ` · ${r.reason}` : ""}
                </p>
                <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  {r.blockedSince && (
                    <div>
                      {np ? "अवरोध सुरु" : "Blocked since"}: {fmt(r.blockedSince)}
                    </div>
                  )}
                  {r.status !== "OPEN" && (r.expectedReopen || r.repairEta) && (
                    <div>
                      {np ? "अनुमानित खुल्ने" : "Expected to reopen"}: {r.expectedReopen ? fmt(r.expectedReopen) : ""}
                      {r.repairEta ? ` (${np ? "मर्मत समय" : "repair time"} ${r.repairEta})` : ""}
                    </div>
                  )}
                  {r.reopenedAt && (
                    <div>
                      {r.status === "OPEN" ? (np ? "खुलेको" : "Reopened") : np ? "DoR अनुसार खुलेको समय" : "DoR reports reopening at"}: {fmt(r.reopenedAt)}
                    </div>
                  )}
                </div>
                {r.coordinates && onSelectAlertFocus && (
                  <button
                    onClick={() => onSelectAlertFocus(r.coordinates as [number, number])}
                    className="mt-1 text-[10px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    {np ? "नक्सामा हेर्नुहोस्" : "Show on map"}
                  </button>
                )}
              </div>
            );
            return (
              <>
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {np ? "सडक स्थिति (सडक विभाग)" : "Road status (Department of Roads)"} —{" "}
                  <span className="text-red-600 dark:text-red-400">
                    {closed.length} {np ? "बन्द" : "closed"}
                  </span>{" "}
                  ·{" "}
                  <span className="text-amber-600 dark:text-amber-400">
                    {partial.length} {np ? "आंशिक खुला" : "partly open"}
                  </span>{" "}
                  · {reopened.length} {np ? "पछिल्लो २४ घण्टामा खुलेको" : "reopened in last 24h"}
                </h5>
                {roads.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                    {np ? "सडक विभागको फिड उपलब्ध छैन।" : "Department of Roads feed unavailable."}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {closed.map(card)}
                      {reopened.map(card)}
                    </div>
                    {partial.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowPartialRoads((v) => !v)}
                          className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          {showPartialRoads
                            ? np ? "आंशिक खुला सडक लुकाउनुहोस्" : "Hide partly open roads"
                            : np
                            ? `${partial.length} आंशिक खुला सडक हेर्नुहोस्`
                            : `Show ${partial.length} partly open roads (one-lane / restricted)`}
                        </button>
                        {showPartialRoads && (
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">{partial.map(card)}</div>
                        )}
                      </div>
                    )}
                  </>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {np
                    ? "स्रोत: सडक विभाग, bipadportal.gov.np मार्फत। सम्पर्क व्यक्तिको नाम तथा फोन नम्बर जानाजानी देखाइएको छैन।"
                    : "Source: Department of Roads via bipadportal.gov.np. Contact names and phone numbers are intentionally not shown."}
                </p>
              </>
            );
          })()}

          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {lang === "np" ? "NDRRMA सडक पूर्वसूचना" : "NDRRMA road alerts"}
          </h5>
          {roadAlerts.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
              {lang === "np"
                ? "हाल BIPAD पोर्टलमा कुनै सक्रिय सडक अवरोध सूचना छैन।"
                : "No active road alerts on the BIPAD portal right now."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roadAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-red-300 dark:border-[#C51D34]/60"
                >
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang === "np" && alert.titleNe ? alert.titleNe : alert.title}
                  </h4>
                  {alert.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{alert.description}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>
                      {new Date(alert.startedOn).toLocaleString(lang === "np" ? "ne-NP" : "en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {onSelectAlertFocus && (
                      <button
                        onClick={() => onSelectAlertFocus([alert.lat, alert.lon])}
                        className="font-bold text-amber-700 dark:text-amber-300 hover:underline"
                      >
                        {t.ndrrmaFocusMap}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 pt-2">
            {lang === "np"
              ? "सन्दर्भ: पहिरो-सम्भावित प्रमुख राजमार्ग खण्डहरू (प्रत्यक्ष स्थिति होइन)"
              : "Reference: landslide-prone highway sections (not live status)"}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HIGHWAY_ADVISORIES.map((hwy) => (
              <div
                key={hwy.highwayName}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800"
              >
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {lang === "np" ? hwy.nepaliName : hwy.highwayName}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {hwy.keyChokepoints.map((pt) => (
                    <span key={pt} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                      {pt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
