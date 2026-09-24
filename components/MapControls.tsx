"use client";

import React from "react";
import { CloudRain, Radio, Cloud, Waves, Play, Pause, Layers, Satellite, Map as MapIcon } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/translations";

export type MapLayerType = "precipitation" | "radar" | "satellite" | "rivers";
export type ForecastTimeWindow = "24h" | "48h" | "72h";
export type BasemapType = "dark" | "satellite" | "osm";

interface MapControlsProps {
  activeLayer: MapLayerType;
  onChangeLayer: (layer: MapLayerType) => void;
  timeWindow: ForecastTimeWindow;
  onChangeTimeWindow: (window: ForecastTimeWindow) => void;
  basemap: BasemapType;
  onChangeBasemap: (bm: BasemapType) => void;
  isPlayingRadar: boolean;
  onToggleRadarPlay: () => void;
  radarFrameIndex: number;
  totalRadarFrames: number;
  onChangeRadarFrame: (idx: number) => void;
  currentRadarTime?: string;
  onOpenSatelliteViewer: () => void;
  lang?: Language;
}

export default function MapControls({
  activeLayer,
  onChangeLayer,
  timeWindow,
  onChangeTimeWindow,
  basemap,
  onChangeBasemap,
  isPlayingRadar,
  onToggleRadarPlay,
  radarFrameIndex,
  totalRadarFrames,
  onChangeRadarFrame,
  currentRadarTime,
  onOpenSatelliteViewer,
  lang = "en",
}: MapControlsProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md text-slate-800 dark:text-white transition-colors">
      {/* Top Row: Layer Tabs & Basemap Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3">
        {/* Layer Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none -mx-1 px-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-0.5 sm:mr-1 flex items-center gap-1 flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden xs:inline">{t.mapLayers}</span>
          </span>

          {/* 1. Precipitation Risk Layer */}
          <button
            onClick={() => onChangeLayer("precipitation")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 touch-manipulation ${
              activeLayer === "precipitation"
                ? "bg-[#C51D34] text-white border-white/20 shadow-xs"
                : "bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-[#1E293B]"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{t.layerRain}</span>
          </button>

          {/* 2. Live RainViewer Radar */}
          <button
            onClick={() => onChangeLayer("radar")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 touch-manipulation ${
              activeLayer === "radar"
                ? "bg-[#003893] text-white border-blue-400 shadow-xs"
                : "bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-[#1E293B]"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300" />
            <span>{t.layerRadar}</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
          </button>

          {/* 3. Bay of Bengal Satellite Cloud Deck */}
          <button
            onClick={() => onChangeLayer("satellite")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 touch-manipulation ${
              activeLayer === "satellite"
                ? "bg-[#003893] text-white border-blue-400 shadow-xs"
                : "bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-[#1E293B]"
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.layerSatellite}</span>
          </button>

          {/* 4. River Basins */}
          <button
            onClick={() => onChangeLayer("rivers")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 touch-manipulation ${
              activeLayer === "rivers"
                ? "bg-[#003893] text-white border-blue-400 shadow-xs"
                : "bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-[#1E293B]"
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
            <span>{t.layerRivers}</span>
          </button>
        </div>

        {/* Basemap Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0A0F1A] p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start lg:self-auto flex-shrink-0">
          <MapIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1 mr-0.5 hidden xs:inline" />
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">{t.basemap}</span>
          {(
            [
              { id: "dark", label: t.bmDark },
              { id: "satellite", label: t.bmSat },
              { id: "osm", label: t.bmOsm },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => onChangeBasemap(b.id)}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all touch-manipulation ${
                basemap === b.id
                  ? "bg-[#003893] text-white border border-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Row Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        {activeLayer === "precipitation" ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t.period}</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0A0F1A] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
              {(["24h", "48h", "72h"] as ForecastTimeWindow[]).map((win) => (
                <button
                  key={win}
                  onClick={() => onChangeTimeWindow(win)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all touch-manipulation ${
                    timeWindow === win
                      ? "bg-[#C51D34] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>
        ) : activeLayer === "radar" ? (
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={onToggleRadarPlay}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C51D34] text-white hover:bg-[#A8152A] transition-all text-xs font-bold shadow-xs flex-shrink-0 touch-manipulation"
            >
              {isPlayingRadar ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingRadar ? t.pause : t.play}</span>
            </button>

            {totalRadarFrames > 0 && (
              <>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, totalRadarFrames - 1)}
                  value={radarFrameIndex}
                  onChange={(e) => onChangeRadarFrame(parseInt(e.target.value, 10))}
                  className="flex-1 sm:w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C51D34] touch-manipulation"
                />
                <span className="font-mono text-[10px] sm:text-[11px] text-blue-700 dark:text-cyan-300 font-semibold tabular-nums whitespace-nowrap">
                  {currentRadarTime || t.liveRadarLoop}
                </span>
              </>
            )}
          </div>
        ) : activeLayer === "satellite" ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
              {lang === "np" ? "नेपाल तथा उपग्रह दृश्य" : "Regional satellite imagery"}
            </span>
            <button
              onClick={onOpenSatelliteViewer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C51D34] hover:bg-[#A8152A] text-xs font-bold text-white shadow-xs transition-all flex-shrink-0 touch-manipulation"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>{t.openSatelliteModal}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse mr-1" />
            <span>{t.sensorSource}</span>
          </div>
        )}

        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:flex items-center gap-1">
          <span>✓ {t.freeBasemaps}</span>
        </div>
      </div>
    </div>
  );
}
