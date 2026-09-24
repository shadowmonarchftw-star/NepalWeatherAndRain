"use client";

import React, { useState } from "react";
import { Compass, Wind, Gauge, Navigation, AlertOctagon, Info, ArrowUpRight, CloudRain, ShieldCheck } from "lucide-react";
import { BayOfBengalTelemetry } from "@/lib/types";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface BayOfBengalTrackerProps {
  telemetry: BayOfBengalTelemetry;
  onFocusEasternNepal: () => void;
  lang?: Language;
}

export default function BayOfBengalTracker({
  telemetry,
  onFocusEasternNepal,
  lang = "en",
}: BayOfBengalTrackerProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const t = TRANSLATIONS[lang];

  return (
    <div className="relative rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm dark:shadow-lg overflow-hidden transition-colors">
      {/* Subtle national accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C51D34] via-[#003893] to-transparent opacity-80" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-red-50 dark:bg-[#162035] border border-red-200 dark:border-slate-700 text-[#C51D34] dark:text-[#FF4D6D] flex-shrink-0">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C51D34] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.synopticSystem}
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase bg-[#C51D34] text-white">
                {telemetry.systemType}
              </span>
            </div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t.depressionTracker}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#162035] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all touch-manipulation"
        >
          <Info className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>{showExplanation ? t.hideGuide : t.whyItAffectsNepal}</span>
        </button>
      </div>

      {/* Meteorological Guide Drawer */}
      {showExplanation && (
        <div className="my-3 sm:my-4 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
            <CloudRain className="w-4 h-4 text-[#C51D34] dark:text-[#FF4D6D]" />
            <span>{t.orographicTitle}</span>
          </div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">
            {t.orographicText1}
          </p>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">
            {t.orographicText2}
          </p>
        </div>
      )}

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-3 sm:mt-4">
        {/* Central Pressure */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
            <span className="truncate">{t.centralPressure}</span>
            <Gauge className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
            {telemetry.centralPressureHpa}{" "}
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">hPa</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 truncate">
            {t.deepLow}
          </span>
        </div>

        {/* Sustained Winds */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
            <span className="truncate">{t.maxWinds}</span>
            <Wind className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
            {telemetry.maxSustainedWindsKmh}{" "}
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">km/h</span>
          </div>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-300 font-semibold mt-1 truncate">
            {t.galeInBay}
          </span>
        </div>

        {/* Movement Direction */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
            <span className="truncate">{t.trackVector}</span>
            <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
            {lang === "np" ? "उत्तर-उत्तरपश्चिम" : telemetry.movementDirection}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 truncate">
            {t.movingAt} {telemetry.speedKmh} km/h
          </span>
        </div>

        {/* Distance to Nepal */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-red-50/50 dark:bg-[#0A0F1A] border border-red-200 dark:border-[#C51D34]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-600 dark:text-red-200 text-[11px] mb-1">
            <span className="truncate">{t.distToNepal}</span>
            <AlertOctagon className="w-3.5 h-3.5 text-[#C51D34] dark:text-[#FF4D6D] flex-shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-black text-[#C51D34] dark:text-[#FF4D6D] tracking-tight tabular-nums">
            ~{telemetry.distanceToNepalBorderKm}{" "}
            <span className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-white">km</span>
          </div>
          <span className="text-[10px] text-red-600 dark:text-red-300 font-semibold mt-1 truncate">
            {t.toKoshiBorder}
          </span>
        </div>

        {/* Moisture Inflow */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
            <span className="truncate">{t.moistureInflow}</span>
            <CloudRain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </div>
          <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
            {lang === "np" ? "अत्यधिक तीव्र" : telemetry.moistureInflowIntensity}
          </div>
          <span className="text-[10px] text-[#C51D34] dark:text-[#FF4D6D] font-bold mt-1 uppercase truncate">
            {t.heavyPlume}
          </span>
        </div>

        {/* Primary Impact Region */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
            <span className="truncate">{t.impactFront}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">
            {lang === "np" ? "कोशी र बागमती" : "Koshi & Bagmati"}
          </div>
          <button
            onClick={onFocusEasternNepal}
            className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold hover:underline text-left mt-1 touch-manipulation"
          >
            {t.focusMap}
          </button>
        </div>
      </div>

      {/* Synoptic Summary Callout */}
      <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-blue-50/60 dark:bg-[#0A0F1A] border border-blue-200 dark:border-slate-800 flex items-start gap-2.5 sm:gap-3">
        <div className="p-1.5 rounded-lg bg-[#003893] text-white flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
        </div>
        <p className="text-[11px] sm:text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-white">{lang === "np" ? "मौसम वैज्ञानिक विश्लेषण: " : "Meteorological Outlook: "}</strong>
          {lang === "np"
            ? "उत्तर-पश्चिमी बंगालको खाडीमा विकसित भएको न्यूनचापीय प्रणालीले गहिरो डिप्रेसनको रूप लिएको छ। निरन्तरको दक्षिण-पूर्वी मनसुनी वायुले बाक्लो जलवाष्प नेपालको हिमालयतर्फ धकेलिरहेको छ, जसले चुरे तथा महाभारत क्षेत्रमा भीषण वर्षा र पहिरोको जोखिम बढाएको छ।"
            : telemetry.synopticSummary}
        </p>
      </div>
    </div>
  );
}
