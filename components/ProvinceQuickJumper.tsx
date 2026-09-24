"use client";

import React from "react";
import { NEPAL_PROVINCES } from "@/data/nepalProvinces";
import { DistrictWeatherSummary } from "@/lib/types";
import { Language, TRANSLATIONS } from "@/lib/translations";

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
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none py-1">
      {/* All Nepal Button */}
      <button
        onClick={() => onSelectProvince(0, [28.2, 84.4])}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 ${
          selectedProvinceId === 0
            ? "bg-[#C51D34] text-white border-white/20 shadow-md shadow-[#C51D34]/30"
            : "bg-[#0F172A] text-slate-300 hover:text-white border-slate-800 hover:bg-[#1E293B]"
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
          ? "bg-amber-500/20 text-amber-300"
          : "bg-slate-800 text-slate-300";

        return (
          <button
            key={prov.id}
            onClick={() => onSelectProvince(prov.id, prov.center)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border flex-shrink-0 ${
              isSelected
                ? "bg-[#003893] text-white border-cyan-400 shadow-md"
                : "bg-[#0F172A] text-slate-300 hover:text-white border-slate-800 hover:bg-[#1E293B]"
            }`}
          >
            <span>{lang === "np" ? prov.nepaliName : prov.name.split(" ")[0]}</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold tabular-nums ${badgeColor}`}
            >
              {maxRain} mm
            </span>
          </button>
        );
      })}
    </div>
  );
}
