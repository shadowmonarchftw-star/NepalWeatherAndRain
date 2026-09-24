"use client";

import React from "react";
import { CloudRain, Radio, Cloud, Waves, Play, Pause, RotateCcw, Calendar, Layers, Satellite, Map as MapIcon } from "lucide-react";

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
  // Radar playback props
  isPlayingRadar: boolean;
  onToggleRadarPlay: () => void;
  radarFrameIndex: number;
  totalRadarFrames: number;
  onChangeRadarFrame: (idx: number) => void;
  currentRadarTime?: string;
  onOpenSatelliteViewer: () => void;
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
}: MapControlsProps) {
  return (
    <div className="flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl bg-[#091529]/95 border-2 border-[#003893] backdrop-blur-md shadow-xl text-white">
      {/* Top Row: Layer Tabs & Basemap Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Layer Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mr-1 flex items-center gap-1 flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map Layers:</span>
          </span>

          {/* 1. Precipitation Risk Layer */}
          <button
            onClick={() => onChangeLayer("precipitation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeLayer === "precipitation"
                ? "bg-[#DC143C] text-white shadow-md shadow-[#DC143C]/40 border border-white/30"
                : "bg-[#0C1C36] text-blue-200 hover:bg-[#152D54] border border-[#1A365D]"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rainfall & Hazard</span>
          </button>

          {/* 2. Live RainViewer Radar */}
          <button
            onClick={() => onChangeLayer("radar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeLayer === "radar"
                ? "bg-[#003893] text-white shadow-md shadow-[#003893]/40 border border-cyan-400"
                : "bg-[#0C1C36] text-blue-200 hover:bg-[#152D54] border border-[#1A365D]"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300" />
            <span>Live Radar</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
          </button>

          {/* 3. Bay of Bengal Satellite Cloud Deck */}
          <button
            onClick={() => onChangeLayer("satellite")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeLayer === "satellite"
                ? "bg-[#003893] text-white shadow-md shadow-[#003893]/40 border border-cyan-400"
                : "bg-[#0C1C36] text-blue-200 hover:bg-[#152D54] border border-[#1A365D]"
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-amber-300" />
            <span>Satellite Clouds</span>
          </button>

          {/* 4. River Basins */}
          <button
            onClick={() => onChangeLayer("rivers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeLayer === "rivers"
                ? "bg-[#003893] text-white shadow-md shadow-[#003893]/40 border border-cyan-400"
                : "bg-[#0C1C36] text-blue-200 hover:bg-[#152D54] border border-[#1A365D]"
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>DHM Rivers</span>
          </button>
        </div>

        {/* Basemap Switcher (Dark, Satellite, OSM) */}
        <div className="flex items-center gap-1 bg-[#061021] p-1 rounded-xl border border-[#1A365D] self-start lg:self-auto">
          <MapIcon className="w-3.5 h-3.5 text-blue-400 ml-1.5 mr-0.5" />
          <span className="text-[10px] uppercase font-bold text-blue-300 mr-1 hidden sm:inline">Basemap:</span>
          {(
            [
              { id: "dark", label: "Dark Canvas" },
              { id: "satellite", label: "Satellite" },
              { id: "osm", label: "Street" },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => onChangeBasemap(b.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                basemap === b.id
                  ? "bg-[#003893] text-white border border-cyan-400 shadow-sm"
                  : "text-blue-300 hover:text-white"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sub-Row: Dynamic Controls (Accumulation or Radar player or INSAT launcher) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-[#16335C]">
        {activeLayer === "precipitation" ? (
          /* Time Window Selector (24h / 48h / 72h accumulation) */
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200 font-medium">Accumulated Rainfall Period:</span>
            <div className="flex items-center gap-1 bg-[#061021] p-0.5 rounded-lg border border-[#1A365D]">
              {(["24h", "48h", "72h"] as ForecastTimeWindow[]).map((win) => (
                <button
                  key={win}
                  onClick={() => onChangeTimeWindow(win)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all ${
                    timeWindow === win
                      ? "bg-[#DC143C] text-white shadow-sm"
                      : "text-blue-300 hover:text-white"
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>
        ) : activeLayer === "radar" ? (
          /* Radar Playback Loop Controller */
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={onToggleRadarPlay}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#DC143C] text-white hover:bg-[#B50F31] transition-all text-xs font-bold shadow-md shadow-[#DC143C]/30"
              title={isPlayingRadar ? "Pause Radar Animation" : "Play Radar Loop"}
            >
              {isPlayingRadar ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingRadar ? "Pause" : "Play"}</span>
            </button>

            {totalRadarFrames > 0 && (
              <>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, totalRadarFrames - 1)}
                  value={radarFrameIndex}
                  onChange={(e) => onChangeRadarFrame(parseInt(e.target.value, 10))}
                  className="w-28 sm:w-40 h-1.5 bg-[#16335C] rounded-lg appearance-none cursor-pointer accent-[#DC143C]"
                />
                <span className="font-mono text-[11px] text-cyan-300 font-semibold">
                  {currentRadarTime || "Live"}
                </span>
              </>
            )}

            <span className="text-[11px] text-blue-300 hidden md:inline">
              Scan: 3 DHM Doppler Radars (Surkhet, Palpa, Udayapur) + Global Feed
            </span>
          </div>
        ) : activeLayer === "satellite" ? (
          /* Satellite View Controls */
          <div className="flex items-center gap-3 w-full justify-between">
            <span className="text-xs text-blue-200">
              Showing high-resolution satellite imagery covering Nepal & Bay of Bengal.
            </span>
            <button
              onClick={onOpenSatelliteViewer}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-[#DC143C] hover:bg-[#B50F31] text-xs font-bold text-white shadow-lg shadow-[#DC143C]/40 transition-all hover:scale-105 active:scale-95"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Open Live INSAT-3D Viewer (IR & Water Vapor) &rarr;</span>
            </button>
          </div>
        ) : (
          /* River Basin Controls */
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-1" />
            <span>Live DHM Station Gauges: Devghat, Chisapani, Mainachuli, Chepang, Parigaon</span>
          </div>
        )}

        {/* Free Data Badge */}
        <div className="text-[11px] text-emerald-400 font-semibold hidden sm:flex items-center gap-1">
          <span>✓ 100% Free Open Basemaps</span>
        </div>
      </div>
    </div>
  );
}
