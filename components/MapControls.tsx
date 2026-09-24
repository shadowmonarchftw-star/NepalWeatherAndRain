"use client";

import React from "react";
import { CloudRain, Radio, Cloud, Waves, Play, Pause, RotateCcw, Calendar, Layers } from "lucide-react";

export type MapLayerType = "precipitation" | "radar" | "satellite" | "rivers";
export type ForecastTimeWindow = "24h" | "48h" | "72h";

interface MapControlsProps {
  activeLayer: MapLayerType;
  onChangeLayer: (layer: MapLayerType) => void;
  timeWindow: ForecastTimeWindow;
  onChangeTimeWindow: (window: ForecastTimeWindow) => void;
  // Radar playback props
  isPlayingRadar: boolean;
  onToggleRadarPlay: () => void;
  radarFrameIndex: number;
  totalRadarFrames: number;
  onChangeRadarFrame: (idx: number) => void;
  currentRadarTime?: string;
}

export default function MapControls({
  activeLayer,
  onChangeLayer,
  timeWindow,
  onChangeTimeWindow,
  isPlayingRadar,
  onToggleRadarPlay,
  radarFrameIndex,
  totalRadarFrames,
  onChangeRadarFrame,
  currentRadarTime,
}: MapControlsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3.5 rounded-2xl bg-[#091529]/95 border border-[#1A365D] backdrop-blur-md shadow-xl text-white">
      {/* Layer Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Map Layers:</span>
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
          <span>Live Rain Radar</span>
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
          <Cloud className="w-3.5 h-3.5 text-amber-300" />
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
          <span>River Basins</span>
        </button>
      </div>

      {/* Right Controls: Duration Filter or Radar Player */}
      <div className="flex items-center gap-2.5 justify-between md:justify-end">
        {activeLayer === "precipitation" ? (
          /* Time Window Selector (24h / 48h / 72h accumulation) */
          <div className="flex items-center gap-1 bg-[#061021] p-1 rounded-xl border border-[#1A365D]">
            <Calendar className="w-3.5 h-3.5 text-blue-400 ml-1.5 mr-0.5" />
            <span className="text-[11px] text-blue-300 mr-1 hidden sm:inline">Accumulation:</span>
            {(["24h", "48h", "72h"] as ForecastTimeWindow[]).map((win) => (
              <button
                key={win}
                onClick={() => onChangeTimeWindow(win)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeWindow === win
                    ? "bg-[#DC143C] text-white shadow-sm"
                    : "text-blue-300 hover:text-white"
                }`}
              >
                {win}
              </button>
            ))}
          </div>
        ) : activeLayer === "radar" && totalRadarFrames > 0 ? (
          /* Radar Playback Loop Controller */
          <div className="flex items-center gap-2 bg-[#061021] px-2.5 py-1.5 rounded-xl border border-[#1A365D] w-full md:w-auto justify-between">
            <button
              onClick={onToggleRadarPlay}
              className="p-1 rounded-lg bg-[#DC143C] text-white hover:bg-[#B50F31] transition-all"
              title={isPlayingRadar ? "Pause Radar Animation" : "Play Radar Loop"}
            >
              {isPlayingRadar ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={Math.max(0, totalRadarFrames - 1)}
              value={radarFrameIndex}
              onChange={(e) => onChangeRadarFrame(parseInt(e.target.value, 10))}
              className="w-24 sm:w-32 h-1.5 bg-[#16335C] rounded-lg appearance-none cursor-pointer accent-[#DC143C]"
            />

            <span className="font-mono text-[10px] text-cyan-300 font-semibold truncate max-w-[90px]">
              {currentRadarTime || "Live Loop"}
            </span>
          </div>
        ) : (
          <div className="text-xs text-blue-300/80 italic px-2">
            South Asia Synoptic View
          </div>
        )}
      </div>
    </div>
  );
}
