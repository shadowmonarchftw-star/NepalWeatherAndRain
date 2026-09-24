"use client";

import React, { useState, useEffect } from "react";
import { Clock, PhoneCall, RefreshCw, Waves, ShieldAlert, Globe, Sun, Moon } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenEmergency: () => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export default function Header({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onOpenEmergency,
  onRefreshData,
  isRefreshing = false,
}: HeaderProps) {
  const [nepalTime, setNepalTime] = useState<string>("");
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
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
      setNepalTime(new Intl.DateTimeFormat(lang === "np" ? "ne-NP" : "en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <header className="relative w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1A] text-slate-900 dark:text-slate-100 shadow-sm z-30 transition-colors">
      {/* Top Authentic Nepal Flag Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#C51D34]" />
        <div className="h-full w-1/3 bg-[#003893] dark:bg-white" />
        <div className="h-full w-1/3 bg-[#003893]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & National Title */}
          <div className="flex items-center gap-3">
            {/* Dual-Pennant Nepal Insignia */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#C51D34] border border-[#003893] text-white shadow-sm flex-shrink-0">
              <div className="text-white text-center leading-none select-none">
                <div className="text-xs font-bold">☾</div>
                <div className="text-sm font-black -mt-0.5">☼</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  {t.appTitle}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-[#003893] text-white">
                  DHM & SATELLITE SYNC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <span>{t.appSubtitle}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.liveSync}
                </span>
              </p>
            </div>
          </div>

          {/* Time, Theme, Language & Actions */}
          <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end">
            {/* Nepal Standard Time */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-mono text-[11px] font-medium">{t.npt}: {nepalTime || "..."}</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>{lang === "np" ? "गाढा (Dark)" : "Dark"}</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === "np" ? "उज्यालो (Light)" : "Light"}</span>
                </>
              )}
            </button>

            {/* Language Switcher (EN / NP) */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-all active:scale-95"
              title="Switch language between English and Nepali"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{lang === "en" ? "🇳🇵 नेपाली" : "🇬🇧 English"}</span>
            </button>

            {/* Refresh Data */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50"
              title="Refresh meteorological feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>

            {/* Emergency Hotline Button */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C51D34] hover:bg-[#A8152A] text-xs font-bold text-white shadow-sm transition-all active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t.emergencyBtn}</span>
            </button>
          </div>
        </div>

        {/* Live Bay of Bengal Alert Ribbon */}
        <div className="mt-3 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-[#0F172A] border-l-4 border-[#C51D34] border-t border-r border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 flex-wrap gap-2 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C51D34] animate-pulse flex-shrink-0" />
            <span className="font-bold text-[#C51D34] dark:text-[#FF4D6D] uppercase tracking-wide">
              {t.bayAlertTitle}
            </span>
            <span className="text-slate-800 dark:text-slate-300 font-medium">
              {t.bayAlertDesc}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-blue-700 dark:text-cyan-400 font-medium">
              <Waves className="w-3 h-3" />
              {t.koshiBagmatiAlert}
            </span>
            <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden md:flex items-center gap-1 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="w-3 h-3" />
              {t.dhmActive}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
