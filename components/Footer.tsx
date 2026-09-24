"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, RefreshCw, Radio, ShieldCheck } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface FooterProps {
  lang: Language;
  lastRefreshedAt: Date | null;
  onRefreshData: () => void;
  isRefreshing?: boolean;
  // Latest reading timestamp per feed (ISO), shown next to each source
  sourceTimes?: Partial<Record<"river" | "rain" | "alerts" | "aqi", string>>;
}

export default function Footer({
  lang,
  lastRefreshedAt,
  onRefreshData,
  isRefreshing = false,
  sourceTimes = {},
}: FooterProps) {
  const t = TRANSLATIONS[lang];
  const [totalVisitors, setTotalVisitors] = useState<number>(1);
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
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D18] text-slate-700 dark:text-slate-300 mt-8 sm:mt-10 transition-colors">
      {/* Authentic Nepal National Flag Colors Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#C51D34]" />
        <div className="h-full w-1/3 bg-slate-300 dark:bg-white" />
        <div className="h-full w-1/3 bg-[#003893]" />
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Main Telemetry & Visitors Metric Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Visitors & Live Citizen Monitoring */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t.visitorsTotal}
                  </h4>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tabular-nums">
                    {totalVisitors.toLocaleString()}
                  </div>
                </div>
              </div>

            </div>

            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              {lang === "np" ? "कुल भ्रमण (प्रति ब्राउजर सत्र एक पटक गनिएको)" : "Total visits (counted once per browser session)"}
            </div>
          </div>

          {/* Card 2: Last Telemetry Refresh & Auto-Sync Countdown */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-crimson-50 dark:bg-[#C51D34]/20 border border-red-200 dark:border-[#C51D34]/40 flex items-center justify-center text-[#C51D34] dark:text-[#FF4D6D] flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 touch-manipulation"
                title={t.refreshNowBtn}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C51D34]" : "text-slate-500"}`} />
                <span className="hidden sm:inline">{t.refreshNowBtn}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{relativeTimeText}</span>
                <span>•</span>
                <span className="hidden xs:inline">{t.autoSyncEvery5Min}</span>
              </div>
              <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                {t.nextSyncIn}: {countdownDisplay}
              </div>
            </div>
          </div>

          {/* Card 3: Data sources with latest reading time */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs md:col-span-2 lg:col-span-1">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                <Radio className="w-3.5 h-3.5 text-[#C51D34]" />
                {lang === "np" ? "तथ्याङ्क स्रोत" : "Data Sources"}
              </span>

              <ul className="space-y-1 text-[10px] sm:text-[11px]">
                {(
                  [
                    [lang === "np" ? "DHM नदी मापन केन्द्र" : "DHM river gauges", "hydrology.gov.np via BIPAD", sourceTimes.river],
                    [lang === "np" ? "DHM वर्षा मापन केन्द्र" : "DHM rain gauges", "hydrology.gov.np via BIPAD", sourceTimes.rain],
                    [lang === "np" ? "NDRRMA पूर्वसूचना तथा घटना" : "NDRRMA alerts & incidents", "bipadportal.gov.np", sourceTimes.alerts],
                    [lang === "np" ? "वायु गुणस्तर" : "Air quality", "pollution.gov.np via BIPAD", sourceTimes.aqi],
                    [lang === "np" ? "INSAT-3D उपग्रह तस्बिर" : "INSAT-3D satellite imagery", "mausam.imd.gov.in", undefined],
                    [lang === "np" ? "रडार" : "Radar", "RainViewer", undefined],
                    [lang === "np" ? "मौसम पूर्वानुमान (मोडेल)" : "Weather forecast (model)", "Open-Meteo", undefined],
                  ] as [string, string, string | undefined][]
                ).map(([name, origin, time]) => (
                  <li key={name} className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate">
                      <span className="font-semibold text-slate-900 dark:text-white">{name}</span>
                      <span className="text-slate-500 dark:text-slate-400"> · {origin}</span>
                    </span>
                    {time && (
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums flex-shrink-0">
                        {new Date(time).toLocaleTimeString(lang === "np" ? "ne-NP" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Kathmandu",
                        })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-2 mt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-start gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span>
                {lang === "np"
                  ? "समय = प्रत्येक स्रोतको पछिल्लो मापन (NPT)। जिल्ला जोखिम तह मोडेल पूर्वानुमान हो, DHM को आधिकारिक चेतावनी होइन।"
                  : "Time = latest reading from each feed (NPT). District risk levels are model forecasts, not official DHM warnings."}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Attribution & National Emblem Accent */}
        <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white">
              {t.nepalTrackerFooter}
            </span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-400">{t.footerSubtitle}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center text-[10px] sm:text-[11px]">
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
