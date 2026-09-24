"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, PhoneCall, RefreshCw, Waves, ShieldAlert, Sparkles } from "lucide-react";

interface HeaderProps {
  onOpenEmergency: () => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export default function Header({
  onOpenEmergency,
  onRefreshData,
  isRefreshing = false,
}: HeaderProps) {
  const [nepalTime, setNepalTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Nepal Standard Time (UTC +5:45)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        weekday: "short",
        month: "short",
        day: "numeric",
      };
      setNepalTime(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative w-full border-b border-[#003893] bg-gradient-to-r from-[#050D1A] via-[#0A1A35] to-[#050D1A] text-white shadow-xl z-30">
      {/* Top Nepal Flag Color Accent Line: Crimson Red (#DC143C) with Blue (#003893) and White */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#DC143C]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#003893]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {/* Stylized Nepal Dual-Pennant Flag Badge */}
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC143C] to-[#990D28] border-2 border-[#003893] shadow-md shadow-[#DC143C]/20 flex-shrink-0">
              {/* Crescent Moon & Sun Motif */}
              <div className="text-white text-center leading-none select-none">
                <div className="text-xs font-bold">☾</div>
                <div className="text-sm font-black -mt-0.5">☼</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  NEPAL WEATHER & RAIN TRACKER
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-[#DC143C] text-white border border-white/20">
                  MONSOON RADAR
                </span>
              </div>
              <p className="text-xs font-medium text-blue-200/90 flex items-center gap-1.5">
                <span>नेपाल मौसम तथा बाढी पूर्वसूचना प्रणाली</span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </p>
            </div>
          </div>

          {/* Time, Emergency & Actions */}
          <div className="flex items-center flex-wrap gap-2.5 justify-between md:justify-end">
            {/* Nepal Standard Time */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C1C36] border border-[#1A365D] text-xs text-blue-100">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-[11px] font-semibold">NPT: {nepalTime || "Loading..."}</span>
            </div>

            {/* Refresh Data */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C1C36] hover:bg-[#152D54] border border-[#1A365D] text-xs font-medium text-white transition-all active:scale-95 disabled:opacity-50"
              title="Refresh live weather & radar data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-300 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Emergency Hotline Button (Nepal Red Flag Alert) */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#DC143C] hover:bg-[#B50F31] border border-white/30 text-xs font-bold text-white shadow-lg shadow-[#DC143C]/30 transition-all hover:scale-105 active:scale-95 animate-pulse"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency (1155 / 100)</span>
            </button>
          </div>
        </div>

        {/* Live Bay of Bengal Alert Ribbon */}
        <div className="mt-3 py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#DC143C]/20 via-[#003893]/30 to-[#DC143C]/20 border border-[#DC143C]/40 flex items-center justify-between text-xs text-blue-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC143C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC143C]"></span>
            </span>
            <span className="font-bold text-[#FF4D6D] uppercase tracking-wide">
              Bay of Bengal Synoptic Alert:
            </span>
            <span className="text-white font-medium">
              Deep Depression in NW Bay pumping heavy maritime moisture into Koshi, Madhesh & Bagmati.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-blue-300">
            <span className="flex items-center gap-1">
              <Waves className="w-3 h-3 text-cyan-400" />
              Koshi & Bagmati: High Alert
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              DHM Flood Hotline 1155 Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
