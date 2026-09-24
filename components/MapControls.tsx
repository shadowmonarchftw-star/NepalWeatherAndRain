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
    <div className="flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md text-white">
      {/* Top Row: Layer Tabs & Basemap Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Layer Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.mapLayers}</span>
          </span>

          {/* 1. Precipitation Risk Layer */}
          <button
            onClick={() => onChangeLayer("precipitation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeLayer === "precipitation"
                ? "bg-[#C51D34] text-white border-white/20 shadow-sm"
                : "bg-[#162035] text-slate-300 hover:text-white border-slate-800 hover:bg-[#1E293B]"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{t.layerRain}</span>
          </button>

          {/* 2. Live RainViewer Radar */}
          <button
            onClick={() => onChangeLayer("radar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeLayer === "radar"
                ? "bg-[#003893] text-white border-cyan-400 shadow-sm"
                : "bg-[#162035] text-slate-300 hover:text-white border-slate-800 hover:bg-[#1E293B]"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300" />
            <span>{t.layerRadar}</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
          </button>

          {/* 3. Bay of Bengal Satellite Cloud Deck */}
          <button
            onClick={() => onChangeLayer("satellite")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeLayer === "satellite"
                ? "bg-[#003893] text-white border-cyan-400 shadow-sm"
                : "bg-[#162035] text-slate-300 hover:text-white border-slate-800 hover:bg-[#1E293B]"
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.layerSatellite}</span>
          </button>

          {/* 4. River Basins */}
          <button
            onClick={() => onChangeLayer("rivers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeLayer === "rivers"
                ? "bg-[#003893] text-white border-cyan-400 shadow-sm"
                : "bg-[#162035] text-slate-300 hover:text-white border-slate-800 hover:bg-[#1E293B]"
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.layerRivers}</span>
          </button>
        </div>

        {/* Basemap Switcher */}
        <div className="flex items-center gap-1 bg-[#0A0F1A] p-1 rounded-xl border border-slate-800 self-start lg:self-auto">
          <MapIcon className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden sm:inline">{t.basemap}</span>
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
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                basemap === b.id
                  ? "bg-[#003893] text-white border border-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Row Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-800/80">
        {activeLayer === "precipitation" ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">{t.period}</span>
            <div className="flex items-center gap-1 bg-[#0A0F1A] p-0.5 rounded-lg border border-slate-800">
              {(["24h", "48h", "72h"] as ForecastTimeWindow[]).map((win) => (
                <button
                  key={win}
                  onClick={() => onChangeTimeWindow(win)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all ${
                    timeWindow === win
                      ? "bg-[#C51D34] text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>
        ) : activeLayer === "radar" ? (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={onToggleRadarPlay}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C51D34] text-white hover:bg-[#A8152A] transition-all text-xs font-bold shadow-sm"
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
                  className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C51D34]"
                />
                <span className="font-mono text-[11px] text-cyan-300 font-semibold tabular-nums">
                  {currentRadarTime || t.liveRadarLoop}
                </span>
              </>
            )}
          </div>
        ) : activeLayer === "satellite" ? (
          <div className="flex items-center gap-3 w-full justify-between">
            <span className="text-xs text-slate-300">
              {lang === "np" ? "नेपाल तथा बंगालको खाडी उपग्रह दृश्य" : "Regional high-resolution satellite imagery"}
            </span>
            <button
              onClick={onOpenSatelliteViewer}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C51D34] hover:bg-[#A8152A] text-xs font-bold text-white shadow-sm transition-all"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>{t.openSatelliteModal}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-1" />
            <span>{t.sensorSource}</span>
          </div>
        )}

        <div className="text-[11px] text-emerald-400 font-semibold hidden sm:flex items-center gap-1">
          <span>✓ {t.freeBasemaps}</span>
        </div>
      </div>
    </div>
  );
}
