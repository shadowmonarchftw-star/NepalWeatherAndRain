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

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
          {/* Top Row on mobile: Logo + Title + Emergency Call Button */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Dual-Pennant Nepal Insignia */}
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#C51D34] border border-[#003893] text-white shadow-sm flex-shrink-0">
                <div className="text-white text-center leading-none select-none">
                  <div className="text-[10px] sm:text-xs font-bold">☾</div>
                  <div className="text-xs sm:text-sm font-black -mt-0.5">☼</div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase truncate">
                    {t.appTitle}
                  </h1>
                  <span className="hidden lg:inline-block px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-[#003893] text-white flex-shrink-0">
                    DHM & SATELLITE SYNC
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 truncate">
                  <span className="truncate">{t.appSubtitle}</span>
                  <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:flex items-center gap-1 flex-shrink-0">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.liveSync}
                  </span>
                </p>
              </div>
            </div>

            {/* Emergency Hotline Button - visible on top row for mobile */}
            <div className="md:hidden flex-shrink-0">
              <button
                onClick={onOpenEmergency}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C51D34] active:bg-[#A8152A] text-xs font-bold text-white shadow-sm transition-all active:scale-95 touch-manipulation"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                <span>{lang === "np" ? "आपात ११५५" : "1155 Alert"}</span>
              </button>
            </div>
          </div>

          {/* Action Toolbar: Fits cleanly in 1 row on mobile, right-aligned on desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-between md:justify-end w-full md:w-auto pt-1 md:pt-0 border-t border-slate-100 dark:border-slate-800/80 md:border-t-0">
            {/* Nepal Standard Time */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
              <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="font-mono text-[10px] sm:text-[11px] font-medium whitespace-nowrap">
                {nepalTime || "..."}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Light / Dark Mode Toggle */}
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 touch-manipulation"
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span className="text-[11px] hidden sm:inline">{lang === "np" ? "Dark" : "Dark"}</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] hidden sm:inline">{lang === "np" ? "Light" : "Light"}</span>
                  </>
                )}
              </button>

              {/* Language Switcher (EN / NP) */}
              <button
                onClick={onToggleLang}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-all active:scale-95 touch-manipulation"
                title="Switch language between English and Nepali"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-[11px]">{lang === "en" ? "🇳🇵 ने" : "🇬🇧 EN"}</span>
              </button>

              {/* Refresh Data */}
              <button
                onClick={onRefreshData}
                disabled={isRefreshing}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all active:scale-95 disabled:opacity-50 touch-manipulation"
                title="Refresh meteorological feeds"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isRefreshing ? "animate-spin text-[#C51D34]" : ""}`} />
                <span className="hidden sm:inline text-[11px]">{t.refresh}</span>
              </button>

              {/* Desktop Emergency Hotline Button */}
              <button
                onClick={onOpenEmergency}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C51D34] hover:bg-[#A8152A] text-xs font-bold text-white shadow-sm transition-all active:scale-95 touch-manipulation"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t.emergencyBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Bay of Bengal Alert Ribbon */}
        <div className="mt-2.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border-l-4 border-[#C51D34] border-t border-r border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 gap-2 transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#C51D34] animate-pulse flex-shrink-0" />
            <span className="font-bold text-[#C51D34] dark:text-[#FF4D6D] uppercase tracking-wide text-[11px] sm:text-xs flex-shrink-0">
              {t.bayAlertTitle}
            </span>
            <span className="text-slate-800 dark:text-slate-300 font-medium text-[11px] sm:text-xs truncate">
              {t.bayAlertDesc}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
            <span className="flex items-center gap-1 text-blue-700 dark:text-cyan-400 font-medium">
              <Waves className="w-3 h-3" />
              <span className="hidden sm:inline">{t.koshiBagmatiAlert}</span>
              <span className="sm:hidden">कोशी/बागमती</span>
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
