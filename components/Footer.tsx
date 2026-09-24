"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, RefreshCw, Radio, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface FooterProps {
  lang: Language;
  lastRefreshedAt: Date | null;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export default function Footer({
  lang,
  lastRefreshedAt,
  onRefreshData,
  isRefreshing = false,
}: FooterProps) {
  const t = TRANSLATIONS[lang];
  const [totalVisitors, setTotalVisitors] = useState<number>(1);
  const [activeVisitors, setActiveVisitors] = useState<number>(1);
  const [relativeTimeText, setRelativeTimeText] = useState<string>("");
  const [countdownSeconds, setCountdownSeconds] = useState<number>(300);

  // 1. Fetch & increment visitor count (deduplicated per browser session)
  useEffect(() => {
    let isMounted = true;

    async function trackVisit() {
      try {
        const localCached = typeof window !== "undefined" ? localStorage.getItem("nepal_weather_total_visits") : null;
        if (localCached && Number(localCached) >= 1) {
          setTotalVisitors(Number(localCached));
        }

        const hasCounted = typeof window !== "undefined" ? sessionStorage.getItem("nepal_weather_session_counted") : "true";
        let res: Response;

        if (!hasCounted) {
          res = await fetch("/api/visitors", { method: "POST" });
          sessionStorage.setItem("nepal_weather_session_counted", "true");
        } else {
          res = await fetch("/api/visitors");
        }

        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.totalVisitors !== undefined) {
            const count = Math.max(data.totalVisitors, Number(localCached || 1));
            setTotalVisitors(count);
            localStorage.setItem("nepal_weather_total_visits", String(count));
          }
          if (data.activeVisitors) setActiveVisitors(data.activeVisitors);
        }
      } catch (err) {
        console.warn("Could not sync visitor metrics", err);
      }
    }

    trackVisit();
    // Refresh visitor metrics every 60 seconds
    const interval = setInterval(trackVisit, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Relative time & 5-minute countdown loop
  useEffect(() => {
    const updateTimeMetrics = () => {
      if (!lastRefreshedAt) {
        setRelativeTimeText(t.justNow);
        return;
      }

      const now = Date.now();
      const elapsedMs = Math.max(0, now - lastRefreshedAt.getTime());
      const elapsedSec = Math.floor(elapsedMs / 1000);

      // Remaining countdown to 300s (5-minute sync)
      const remainingSec = Math.max(0, 300 - (elapsedSec % 300));
      setCountdownSeconds(remainingSec);

      // Relative text
      if (elapsedSec < 30) {
        setRelativeTimeText(t.justNow);
      } else if (elapsedSec < 60) {
        setRelativeTimeText(`${elapsedSec} ${t.secondsAgo}`);
      } else {
        const mins = Math.floor(elapsedSec / 60);
        setRelativeTimeText(`${mins} ${t.minsAgo}`);
      }
    };

    updateTimeMetrics();
    const timer = setInterval(updateTimeMetrics, 1000);
    return () => clearInterval(timer);
  }, [lastRefreshedAt, t]);

  // Formatted exact time in Nepal Time (NPT, UTC+5:45)
  const formattedNptTime = lastRefreshedAt
    ? new Intl.DateTimeFormat(lang === "np" ? "ne-NP" : "en-US", {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(lastRefreshedAt)
    : "--:--:--";

  const countdownMins = Math.floor(countdownSeconds / 60);
  const countdownSecs = countdownSeconds % 60;
  const countdownDisplay = `${countdownMins}m ${countdownSecs < 10 ? "0" : ""}${countdownSecs}s`;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D18] text-slate-700 dark:text-slate-300 mt-10 transition-colors">
      {/* Authentic Nepal National Flag Colors Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#C51D34]" />
        <div className="h-full w-1/3 bg-slate-300 dark:bg-white" />
        <div className="h-full w-1/3 bg-[#003893]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Main Telemetry & Visitors Metric Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Visitors & Live Citizen Monitoring */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t.visitorsTotal}
                  </h4>
                  <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                    {totalVisitors.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Active Online Beacon */}
              <div className="flex flex-col items-end">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="tabular-nums">{activeVisitors} Online</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {t.activeMonitoring}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <span>{lang === "np" ? "सार्वजनिक विपद् सतर्कता प्रयोग" : "Public Disaster Portal Traffic"}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {lang === "np" ? "प्रमाणित नागरिक पहुँच" : "Verified Live Feeds"}
              </span>
            </div>
          </div>

          {/* Card 2: Last Telemetry Refresh & Auto-Sync Countdown */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-crimson-50 dark:bg-[#C51D34]/20 border border-red-200 dark:border-[#C51D34]/40 flex items-center justify-center text-[#C51D34] dark:text-[#FF4D6D]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t.lastRefreshedTitle}
                  </h4>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tabular-nums flex items-baseline gap-1.5">
                    <span>{formattedNptTime}</span>
                    <span className="text-xs font-bold text-[#003893] dark:text-blue-400">NPT</span>
                  </div>
                </div>
              </div>

              {/* Manual Refresh Trigger */}
              <button
                onClick={onRefreshData}
                disabled={isRefreshing}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                title={t.refreshNowBtn}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C51D34]" : "text-slate-500"}`} />
                <span className="hidden sm:inline">{t.refreshNowBtn}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{relativeTimeText}</span>
                <span>•</span>
                <span>{t.autoSyncEvery5Min}</span>
              </div>
              <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                {t.nextSyncIn}: {countdownDisplay}
              </div>
            </div>
          </div>

          {/* Card 3: Free Open-Source Meteorological Network Sources */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#C51D34]" />
                  {lang === "np" ? "प्रत्यक्ष सरकारी तथा उपग्रह स्रोतहरू" : "Verified Open Data Sources"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50">
                  100% Free / Open
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="p-1.5 rounded-lg bg-white dark:bg-[#0A0F1A] border border-slate-200/80 dark:border-slate-800/80 font-medium">
                  🌊 <span className="text-slate-900 dark:text-white font-semibold">DHM Nepal</span>
                  <span className="text-[10px] text-slate-500 block truncate">100+ River Gauges</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-[#0A0F1A] border border-slate-200/80 dark:border-slate-800/80 font-medium">
                  ⚠️ <span className="text-slate-900 dark:text-white font-semibold">NDRRMA BIPAD</span>
                  <span className="text-[10px] text-slate-500 block truncate">Live Hazard Alerts</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-[#0A0F1A] border border-slate-200/80 dark:border-slate-800/80 font-medium">
                  🛰️ <span className="text-slate-900 dark:text-white font-semibold">ISRO INSAT-3D</span>
                  <span className="text-[10px] text-slate-500 block truncate">Thermal Cloud Feeds</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-[#0A0F1A] border border-slate-200/80 dark:border-slate-800/80 font-medium">
                  🌐 <span className="text-slate-900 dark:text-white font-semibold">Open-Meteo</span>
                  <span className="text-[10px] text-slate-500 block truncate">ECMWF / GFS Forecasts</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-2 mt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="truncate">{t.publicDataNotice}</span>
            </div>
          </div>
        </div>

        {/* Bottom Attribution & National Emblem Accent */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white">
              {t.nepalTrackerFooter}
            </span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-400">{t.footerSubtitle}</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center text-[11px]">
            <span>जल तथा मौसम विज्ञान विभाग (DHM)</span>
            <span>•</span>
            <span>राष्ट्रिय विपद् प्राधिकरण (NDRRMA)</span>
            <span>•</span>
            <span className="text-[#C51D34] font-bold">आपत्कालीन हटलाइन: ११५५ / १००</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
