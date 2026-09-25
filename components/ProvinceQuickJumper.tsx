"use client";

import React from "react";
import { NEPAL_PROVINCES } from "@/data/nepalProvinces";
import { DistrictWeatherSummary } from "@/lib/types";
import { Language, TRANSLATIONS } from "@/lib/translations";
import SourceTag from "@/components/SourceTag";

interface ProvinceQuickJumperProps {
  districts: DistrictWeatherSummary[];
  selectedProvinceId: number;
  onSelectProvince: (provId: number, center?: [number, number]) => void;
  lang: Language;
}

export default function ProvinceQuickJumper({
  districts,
  selectedProvinceId,
  onSelectProvince,
  lang,
}: ProvinceQuickJumperProps) {
  const t = TRANSLATIONS[lang];

  // Calculate highest rainfall per province
  const provinceMaxRains: Record<number, number> = {};
  districts.forEach((d) => {
    if (!provinceMaxRains[d.provinceId] || d.total24hRain > provinceMaxRains[d.provinceId]) {
      provinceMaxRains[d.provinceId] = d.total24hRain;
    }
  });

  return (
    <div>
      <SourceTag kind="model" source="Open-Meteo" lang={lang} />
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {/* All Nepal Button */}
      <button
        onClick={() => onSelectProvince(0, [28.2, 84.4])}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 ${
          selectedProvinceId === 0
            ? "bg-[#C51D34] text-white border-white/20 shadow-xs"
            : "bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#1E293B] shadow-xs"
        }`}
      >
        <span>{t.allNepal}</span>
      </button>

      {/* 7 Provinces Pills */}
      {NEPAL_PROVINCES.map((prov) => {
        const isSelected = selectedProvinceId === prov.id;
        const maxRain = provinceMaxRains[prov.id] ?? 0;
        const isDanger = maxRain >= 100;
        const isWarning = maxRain >= 50 && maxRain < 100;

        const badgeColor = isDanger
          ? "bg-[#C51D34] text-white"
          : isWarning
          ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";

        return (
          <button
            key={prov.id}
            onClick={() => onSelectProvince(prov.id, prov.center)}
            title={
              lang === "np"
                ? "प्रदेशको कुनै जिल्लामा आजको अधिकतम पूर्वानुमानित वर्षा (Open-Meteo)"
                : "Highest forecast rain today in any district of this province (Open-Meteo)"
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border flex-shrink-0 ${
              isSelected
                ? "bg-[#003893] text-white border-blue-400 shadow-xs"
                : "bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#1E293B] shadow-xs"
            }`}
          >
            <span>{lang === "np" ? prov.nepaliName : prov.name.split(" ")[0]}</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold tabular-nums ${badgeColor}`}
            >
              {lang === "np" ? "पूर्वानुमान" : "fcst"} {maxRain} mm
            </span>
          </button>
        );
      })}
    </div>
    </div>
  );
}
