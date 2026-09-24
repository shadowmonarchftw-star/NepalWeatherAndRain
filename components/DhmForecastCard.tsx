"use client";

import React, { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Language } from "@/lib/translations";

interface DhmForecast {
  issuedAt: string;
  periods: { key: "today" | "tonight" | "tomorrow"; en: string; np: string }[];
  analysis: { en: string; np: string };
  special: string;
}

const PERIOD_LABEL: Record<string, { en: string; np: string }> = {
  today: { en: "Today", np: "आज" },
  tonight: { en: "Tonight", np: "आज राति" },
  tomorrow: { en: "Tomorrow", np: "भोलि" },
};

export default function DhmForecastCard({ lang = "en" }: { lang?: Language }) {
  const [forecast, setForecast] = useState<DhmForecast | null>(null);
  const [failed, setFailed] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const np = lang === "np";

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/dhm-forecast");
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data.success) {
          setForecast(data);
          setFailed(false);
        } else {
          setForecast(null);
          setFailed(true);
        }
      } catch {
        if (mounted) {
          setForecast(null);
          setFailed(true);
        }
      }
    }
    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const issued = forecast
    ? new Date(forecast.issuedAt).toLocaleString(np ? "ne-NP" : "en-US", {
        timeZone: "Asia/Kathmandu",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm text-slate-900 dark:text-white transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#003893] dark:text-blue-400" />
          <h3 className="text-sm sm:text-base font-bold tracking-tight">
            {np ? "DHM आधिकारिक मौसम पूर्वानुमान" : "Official DHM Weather Forecast"}
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {forecast ? `${np ? "जारी" : "Issued"} ${issued} NPT` : ""}
        </span>
      </div>

      {failed && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {np ? "DHM पूर्वानुमान हाल उपलब्ध छैन।" : "DHM forecast is currently unavailable."}{" "}
          <a href="https://dhm.gov.np/mfd/" target="_blank" rel="noopener noreferrer" className="underline">
            dhm.gov.np/mfd
          </a>
        </p>
      )}

      {!forecast && !failed && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{np ? "लोड हुँदैछ…" : "Loading…"}</p>
      )}

      {forecast && (
        <div className="mt-3 space-y-3">
          {forecast.special && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-[#C51D34]/15 border border-red-300 dark:border-[#C51D34] text-xs text-red-900 dark:text-red-100">
              <span className="font-bold">{np ? "विशेष सूचना: " : "Special bulletin: "}</span>
              {forecast.special}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {forecast.periods
              .filter((p) => (np ? p.np : p.en))
              .map((p) => (
                <div key={p.key} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#003893] dark:text-blue-400 mb-1">
                    {np ? PERIOD_LABEL[p.key].np : PERIOD_LABEL[p.key].en}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{np ? p.np || p.en : p.en || p.np}</p>
                </div>
              ))}
          </div>

          {(forecast.analysis.en || forecast.analysis.np) && (
            <div>
              <button
                onClick={() => setShowAnalysis((v) => !v)}
                className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                {showAnalysis
                  ? np ? "मौसम विश्लेषण लुकाउनुहोस्" : "Hide meteorological analysis"
                  : np ? "मौसम विश्लेषण हेर्नुहोस्" : "Show meteorological analysis"}
              </button>
              {showAnalysis && (
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {np ? forecast.analysis.np || forecast.analysis.en : forecast.analysis.en || forecast.analysis.np}
                </p>
              )}
            </div>
          )}

          <a
            href="https://dhm.gov.np/mfd/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 hover:underline"
          >
            Source: DHM Meteorological Forecasting Division · dhm.gov.np/mfd
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
