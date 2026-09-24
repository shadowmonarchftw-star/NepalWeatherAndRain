"use client";

import React, { useState, useMemo } from "react";
import { Search, MapPin, CloudRain, Mountain } from "lucide-react";
import { DistrictWeatherSummary } from "@/lib/types";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface DistrictSelectorProps {
  districts: DistrictWeatherSummary[];
  selectedDistrictId?: string;
  onSelectDistrict: (districtId: string) => void;
  lang?: Language;
}

export default function DistrictSelector({
  districts,
  selectedDistrictId,
  onSelectDistrict,
  lang = "en",
}: DistrictSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProvinceId, setActiveProvinceId] = useState(0);
  const [alertFilter, setAlertFilter] = useState<string>("all");
  const t = TRANSLATIONS[lang];

  const PROVINCE_TABS = [
    { id: 0, name: t.allDistricts },
    { id: 1, name: lang === "np" ? "कोशी" : "Koshi" },
    { id: 2, name: lang === "np" ? "मधेश" : "Madhesh" },
    { id: 3, name: lang === "np" ? "बागमती" : "Bagmati" },
    { id: 4, name: lang === "np" ? "गण्डकी" : "Gandaki" },
    { id: 5, name: lang === "np" ? "लुम्बिनी" : "Lumbini" },
    { id: 6, name: lang === "np" ? "कर्णाली" : "Karnali" },
    { id: 7, name: lang === "np" ? "सुदूरपश्चिम" : "Sudurpashchim" },
  ];

  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      if (activeProvinceId !== 0 && d.provinceId !== activeProvinceId) return false;
      if (alertFilter !== "all" && d.alertLevel.toLowerCase() !== alertFilter.toLowerCase()) return false;
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        return (
          d.districtName.toLowerCase().includes(query) ||
          d.nepaliName.includes(query) ||
          d.provinceName.toLowerCase().includes(query) ||
          d.basin.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [districts, activeProvinceId, alertFilter, searchTerm]);

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 shadow-lg text-white">
      {/* Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C51D34]" />
            <span>{t.explorerTitle}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {t.explorerSubtitle}
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0F1A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#003893]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-3">
        {/* Province Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PROVINCE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveProvinceId(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                activeProvinceId === tab.id
                  ? "bg-[#C51D34] text-white border-white/20 shadow-sm"
                  : "bg-[#0A0F1A] text-slate-400 hover:text-white border-slate-800 hover:bg-[#1E293B]"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Alert Filters */}
        <div className="flex items-center gap-1 self-start sm:self-auto">
          {[
            { id: "all", label: t.filterAll },
            { id: "danger", label: t.filterDanger },
            { id: "warning", label: t.filterWarning },
            { id: "watch", label: t.filterWatch },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setAlertFilter(f.id)}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                alertFilter === f.id
                  ? f.id === "danger"
                    ? "bg-[#C51D34] text-white"
                    : f.id === "warning"
                    ? "bg-amber-500 text-black"
                    : f.id === "watch"
                    ? "bg-yellow-500 text-black"
                    : "bg-[#003893] text-white"
                  : "bg-[#0A0F1A] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* District Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredDistricts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            {t.noDistrictsFound} &ldquo;{searchTerm}&rdquo;
          </div>
        ) : (
          filteredDistricts.map((d) => {
            const isSelected = selectedDistrictId === d.districtId;
            const isDanger = d.alertLevel === "Danger";
            const isWarning = d.alertLevel === "Warning";

            const badgeBg = isDanger
              ? "bg-[#C51D34] text-white border-white/20 animate-pulse"
              : isWarning
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-slate-800 text-slate-300 border-slate-700";

            const name = lang === "np" ? d.nepaliName : d.districtName;

            return (
              <button
                key={d.districtId}
                onClick={() => onSelectDistrict(d.districtId)}
                className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#1E293B] border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg"
                    : isDanger
                    ? "bg-[#0A0F1A] border-[#C51D34]/50 hover:bg-[#162035]"
                    : "bg-[#0A0F1A] border-slate-800 hover:border-slate-700 hover:bg-[#162035]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-white line-clamp-1">
                      {name}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase border flex-shrink-0 ${badgeBg}`}>
                      {d.alertLevel}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between mb-2">
                    <span>{lang === "np" ? d.districtName : d.nepaliName}</span>
                    <span className="text-slate-400 font-medium">{d.provinceName.split(" ")[0]}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#FF4D6D] font-bold text-xs tabular-nums">
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                    <span>{d.total24hRain} mm</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 tabular-nums">
                    <Mountain className="w-3 h-3 text-cyan-400" />
                    <span>{d.elevation}m</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
