"use client";

import React, { useState } from "react";
import { Compass, Wind, Gauge, Navigation, AlertOctagon, Info, ArrowUpRight, CloudRain, ShieldCheck } from "lucide-react";
import { BayOfBengalTelemetry } from "@/lib/types";

interface BayOfBengalTrackerProps {
  telemetry: BayOfBengalTelemetry;
  onFocusEasternNepal: () => void;
}

export default function BayOfBengalTracker({
  telemetry,
  onFocusEasternNepal,
}: BayOfBengalTrackerProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#0C1C36] to-[#071326] border-2 border-[#003893] p-5 shadow-2xl shadow-black/60 overflow-hidden">
      {/* Background Nepal Flag Crimson Corner Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-[#DC143C]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-[#003893]/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#1A365D]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#DC143C]/20 border border-[#DC143C] text-[#FF4D6D] flex-shrink-0">
            <Compass className="w-6 h-6 animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#DC143C] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Synoptic Meteorology System
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#DC143C] text-white">
                {telemetry.systemType}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Bay of Bengal Depression & Moisture Inflow Tracker
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#003893]/40 hover:bg-[#003893]/70 border border-[#003893] text-xs font-semibold text-blue-200 transition-all"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showExplanation ? "Hide Meteorological Guide" : "Why it affects Nepal"}</span>
        </button>
      </div>

      {/* Meteorological Guide Drawer */}
      {showExplanation && (
        <div className="my-4 p-4 rounded-xl bg-[#061021] border border-[#1E427B] text-xs text-blue-100 space-y-2.5 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <CloudRain className="w-4 h-4 text-[#FF4D6D]" />
            <span>The Himalayan Orographic Lift Effect:</span>
          </div>
          <p className="leading-relaxed text-blue-200/90">
            When low-pressure systems or depressions form in the <strong>Bay of Bengal</strong>, their counter-clockwise cyclonic circulation sucks vast amounts of warm, humid tropical moisture into northern India and Bangladesh.
          </p>
          <p className="leading-relaxed text-blue-200/90">
            As this moisture plume strikes Nepal’s foothills (Siwaliks and Mahabharat range), the air is abruptly forced to ascend from <strong>80m elevation to over 3,000m - 8,000m</strong>. This rapid cooling triggers intense <strong>orographic precipitation</strong>, causing sudden cloudbursts, severe flash floods in the <em>Koshi, Bagmati, and Narayani basins</em>, and deadly landslides in the mid-hills.
          </p>
        </div>
      )}

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {/* Central Pressure */}
        <div className="p-3 rounded-xl bg-[#07152B] border border-[#16335C] flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
            <span>Central Pressure</span>
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white tracking-tight">
            {telemetry.centralPressureHpa}{" "}
            <span className="text-xs font-semibold text-blue-300">hPa</span>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold mt-1">
            Deep Low Gradient
          </span>
        </div>

        {/* Sustained Winds */}
        <div className="p-3 rounded-xl bg-[#07152B] border border-[#16335C] flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
            <span>Max Winds</span>
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white tracking-tight">
            {telemetry.maxSustainedWindsKmh}{" "}
            <span className="text-xs font-semibold text-blue-300">km/h</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-semibold mt-1">
            Gale force in Bay
          </span>
        </div>

        {/* Movement Direction */}
        <div className="p-3 rounded-xl bg-[#07152B] border border-[#16335C] flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
            <span>Track Vector</span>
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-black text-white tracking-tight truncate">
            {telemetry.movementDirection}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1">
            Moving @ {telemetry.speedKmh} km/h
          </span>
        </div>

        {/* Distance to Nepal */}
        <div className="p-3 rounded-xl bg-[#07152B] border border-[#DC143C]/40 bg-gradient-to-br from-[#07152B] to-[#DC143C]/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-200 text-xs mb-1">
            <span>Distance to Nepal</span>
            <AlertOctagon className="w-3.5 h-3.5 text-[#FF4D6D]" />
          </div>
          <div className="text-xl font-black text-[#FF4D6D] tracking-tight">
            ~{telemetry.distanceToNepalBorderKm}{" "}
            <span className="text-xs font-semibold text-white">km</span>
          </div>
          <span className="text-[10px] text-red-300 font-semibold mt-1">
            To Koshi/Jhapa Border
          </span>
        </div>

        {/* Moisture Inflow */}
        <div className="p-3 rounded-xl bg-[#07152B] border border-[#16335C] flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
            <span>Moisture Inflow</span>
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base font-black text-white tracking-tight">
            {telemetry.moistureInflowIntensity}
          </div>
          <span className="text-[10px] text-[#FF4D6D] font-bold mt-1 uppercase">
            Heavy Plume
          </span>
        </div>

        {/* Primary Impact Region */}
        <div className="p-3 rounded-xl bg-[#07152B] border border-[#16335C] flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
            <span>Impact Front</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xs font-bold text-white tracking-tight line-clamp-1">
            Koshi & Bagmati
          </div>
          <button
            onClick={onFocusEasternNepal}
            className="text-[10px] text-cyan-400 font-bold hover:underline text-left mt-1"
          >
            Focus on Map &rarr;
          </button>
        </div>
      </div>

      {/* Synoptic Summary Callout */}
      <div className="mt-4 p-3.5 rounded-xl bg-[#050D1A]/90 border border-[#1E3A8A] flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-[#003893] text-white flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-cyan-300" />
        </div>
        <p className="text-xs leading-relaxed text-blue-100">
          <strong className="text-white">Meteorological Outlook: </strong>
          {telemetry.synopticSummary}
        </p>
      </div>
    </div>
  );
}
