"use client";

import React, { useState, useMemo } from "react";
import { Search, MapPin, Filter, CloudRain, AlertCircle, Mountain } from "lucide-react";
import { DistrictWeatherSummary } from "@/lib/types";

interface DistrictSelectorProps {
  districts: DistrictWeatherSummary[];
  selectedDistrictId?: string;
  onSelectDistrict: (districtId: string) => void;
}

const PROVINCE_TABS = [
  { id: 0, name: "All 77 Districts" },
  { id: 1, name: "Koshi" },
  { id: 2, name: "Madhesh" },
  { id: 3, name: "Bagmati" },
  { id: 4, name: "Gandaki" },
  { id: 5, name: "Lumbini" },
  { id: 6, name: "Karnali" },
  { id: 7, name: "Sudurpashchim" },
];

export default function DistrictSelector({
  districts,
  selectedDistrictId,
  onSelectDistrict,
}: DistrictSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProvinceId, setActiveProvinceId] = useState(0);
  const [alertFilter, setAlertFilter] = useState<string>("all");

  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      // Province match
      if (activeProvinceId !== 0 && d.provinceId !== activeProvinceId) {
        return false;
      }
      // Alert level match
      if (alertFilter !== "all" && d.alertLevel.toLowerCase() !== alertFilter.toLowerCase()) {
        return false;
      }
      // Search term match
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
    <div className="rounded-2xl bg-gradient-to-b from-[#0C1C36] to-[#071326] border-2 border-[#003893] p-5 shadow-2xl text-white">
      {/* Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-[#1A365D]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#DC143C]" />
            <span>77 Districts Rain & Forecast Explorer</span>
          </h3>
          <p className="text-xs text-blue-300">
            Click any district to view 72h hourly rain curves and flood assessments
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-blue-400" />
          <input
            type="text"
            placeholder="Search district, city, or river..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#061021] border border-[#1A365D] text-xs text-white placeholder-blue-300/60 focus:outline-none focus:border-[#003893] focus:ring-1 focus:ring-[#003893]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-xs text-blue-400 hover:text-white"
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
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeProvinceId === tab.id
                  ? "bg-[#DC143C] text-white shadow-md shadow-[#DC143C]/30 border border-white/20"
                  : "bg-[#07152B] text-blue-300 hover:bg-[#112648] border border-[#16335C]"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Alert Level Pill Filters */}
        <div className="flex items-center gap-1 self-start sm:self-auto">
          {["all", "danger", "warning", "watch"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setAlertFilter(lvl)}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                alertFilter === lvl
                  ? lvl === "danger"
                    ? "bg-[#DC143C] text-white"
                    : lvl === "warning"
                    ? "bg-amber-500 text-black"
                    : lvl === "watch"
                    ? "bg-yellow-500 text-black"
                    : "bg-blue-600 text-white"
                  : "bg-[#061021] text-blue-300 hover:text-white border border-[#16335C]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* District Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredDistricts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-blue-300 text-xs">
            No districts found matching &ldquo;{searchTerm}&rdquo;
          </div>
        ) : (
          filteredDistricts.map((d) => {
            const isSelected = selectedDistrictId === d.districtId;
            const isDanger = d.alertLevel === "Danger";
            const isWarning = d.alertLevel === "Warning";
            const isWatch = d.alertLevel === "Watch";

            const badgeBg = isDanger
              ? "bg-[#DC143C] text-white border-white/30 animate-pulse"
              : isWarning
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : isWatch
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";

            return (
              <button
                key={d.districtId}
                onClick={() => onSelectDistrict(d.districtId)}
                className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#0F2850] border-cyan-400 ring-2 ring-cyan-400 shadow-xl"
                    : isDanger
                    ? "bg-[#09152B] border-[#DC143C]/60 hover:bg-[#0F2242] shadow-md shadow-red-950/40"
                    : "bg-[#07152B] border-[#16335C] hover:border-[#1E427B] hover:bg-[#0B1E3D]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-white line-clamp-1">
                      {d.districtName}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase border flex-shrink-0 ${badgeBg}`}
                    >
                      {d.alertLevel}
                    </span>
                  </div>

                  <div className="text-[10px] text-blue-300 flex items-center justify-between mb-2">
                    <span>{d.nepaliName}</span>
                    <span className="text-blue-400 font-medium">{d.provinceName.split(" ")[0]}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#122A4E] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#FF4D6D] font-bold text-xs">
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                    <span>{d.total24hRain} mm/24h</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-blue-300">
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
