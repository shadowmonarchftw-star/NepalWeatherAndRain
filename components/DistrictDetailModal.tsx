"use client";

import React from "react";
import {
  X,
  CloudRain,
  Wind,
  Thermometer,
  Gauge,
  Droplets,
  AlertTriangle,
  Waves,
  Mountain,
  ShieldAlert,
  Calendar,
  CloudLightning,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { DistrictWeatherSummary } from "@/lib/types";
import { interpretWmoCode } from "@/lib/alertCalculator";

interface DistrictDetailModalProps {
  district: DistrictWeatherSummary | null;
  onClose: () => void;
}

export default function DistrictDetailModal({
  district,
  onClose,
}: DistrictDetailModalProps) {
  if (!district) return null;

  // Prepare hourly data for Recharts (next 48 hours for clear view)
  let cumulativeRain = 0;
  const chartData = district.hourly.time.slice(0, 48).map((timeStr, idx) => {
    const rain = district.hourly.precipitation[idx] || 0;
    cumulativeRain = Math.round((cumulativeRain + rain) * 10) / 10;
    const dateObj = new Date(timeStr);
    const hourLabel = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: "Asia/Kathmandu",
    });

    return {
      hour: hourLabel,
      rainRate: rain,
      cumulative: cumulativeRain,
      prob: district.hourly.precipitationProbability[idx] || 0,
      temp: district.hourly.temperature[idx] || 20,
    };
  });

  const weatherState = interpretWmoCode(district.current.weatherCode);
  const isDanger = district.alertLevel === "Danger";
  const isWarning = district.alertLevel === "Warning";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#071326] border-2 border-[#003893] text-white shadow-2xl shadow-black/80 flex flex-col">
        {/* Top Flag Stripe Header */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#DC143C]" />
          <div className="h-full w-1/3 bg-[#FFFFFF]" />
          <div className="h-full w-1/3 bg-[#003893]" />
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#1A365D] flex items-start justify-between gap-4 bg-gradient-to-r from-[#0C1C36] to-[#071326]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                {district.provinceName}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                <Waves className="w-3 h-3" />
                {district.basin} Basin
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {district.districtName}
              </h2>
              <span className="text-base font-bold text-blue-200">{district.nepaliName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                isDanger
                  ? "bg-[#DC143C] text-white border-white animate-pulse"
                  : isWarning
                  ? "bg-amber-500/20 text-amber-300 border-amber-500"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500"
              }`}
            >
              DHM: {district.alertLevel}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#122442] hover:bg-[#DC143C] text-blue-200 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* DHM Alert Notification Callout */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isDanger
                ? "bg-[#DC143C]/15 border-[#DC143C] text-white"
                : isWarning
                ? "bg-amber-500/10 border-amber-500/50 text-amber-100"
                : "bg-blue-600/10 border-[#1E427B] text-blue-100"
            }`}
          >
            <ShieldAlert
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isDanger ? "text-[#FF4D6D]" : isWarning ? "text-amber-400" : "text-blue-400"
              }`}
            />
            <div className="text-xs space-y-1">
              <div className="font-bold text-sm">
                Threat Assessment: {district.primaryThreat}
              </div>
              <p className="text-blue-200/90 leading-relaxed">
                {isDanger
                  ? "Extreme rainfall forecast due to maritime moisture convergence against mid-hill terrain. Immediate evacuation from riverbanks and landslide-prone steep slopes advised."
                  : isWarning
                  ? "Heavy downpours expected. Stream levels will rise rapidly. Avoid unpaved steep roads and night travel."
                  : "Precipitation within typical monsoon thresholds. General vigilance advised near local streams."}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 24h Rain */}
            <div className="p-3.5 rounded-2xl bg-[#091529] border border-[#16335C]">
              <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
                <span>24h Rainfall</span>
                <CloudRain className="w-4 h-4 text-[#FF4D6D]" />
              </div>
              <div className="text-2xl font-black text-white">{district.total24hRain} mm</div>
              <span className="text-[10px] text-blue-300">48h: {district.total48hRain} mm</span>
            </div>

            {/* Current Temp & Condition */}
            <div className="p-3.5 rounded-2xl bg-[#091529] border border-[#16335C]">
              <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
                <span>Temperature</span>
                <Thermometer className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {district.current.temperature}°C
              </div>
              <span className="text-[10px] text-cyan-300">{weatherState.description}</span>
            </div>

            {/* Wind Gusts */}
            <div className="p-3.5 rounded-2xl bg-[#091529] border border-[#16335C]">
              <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
                <span>Wind Gusts</span>
                <Wind className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {district.current.windGusts} <span className="text-xs font-normal">km/h</span>
              </div>
              <span className="text-[10px] text-blue-300">
                Speed: {district.current.windSpeed} km/h
              </span>
            </div>

            {/* Surface Pressure */}
            <div className="p-3.5 rounded-2xl bg-[#091529] border border-[#16335C]">
              <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
                <span>Pressure</span>
                <Gauge className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {district.current.surfacePressure}{" "}
                <span className="text-xs font-normal">hPa</span>
              </div>
              <span className="text-[10px] text-blue-300">Elevation: {district.elevation}m</span>
            </div>
          </div>

          {/* Interactive Recharts 48-Hour Rainfall Profile */}
          <div className="p-4 rounded-2xl bg-[#091529] border border-[#16335C]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>48-Hour Hourly Precipitation & Cumulative Accumulation</span>
                </h4>
                <p className="text-[11px] text-blue-300">
                  Peak hourly downpours highlight cloudburst and flash flood triggers
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-400" />
                  <span className="text-blue-200">Rain Rate (mm/h)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#DC143C]" />
                  <span className="text-blue-200">Accumulation (mm)</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cumulGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC143C" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#DC143C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16335C" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} interval={3} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C1C36",
                      borderColor: "#1E427B",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#DC143C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cumulGradient)"
                    name="Cumulative (mm)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rainRate"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#rainGradient)"
                    name="Rate (mm/hr)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7-Day Forecast Row */}
          <div>
            <h4 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>7-Day Synoptic Trend</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {district.daily.time.slice(0, 7).map((dTime, idx) => {
                const rainSum = district.daily.precipitationSum[idx] ?? 0;
                const tempMax = Math.round(district.daily.temperatureMax[idx] ?? 24);
                const tempMin = Math.round(district.daily.temperatureMin[idx] ?? 18);
                const prob = district.daily.precipitationProbabilityMax[idx] ?? 0;

                return (
                  <div
                    key={dTime + idx}
                    className="p-2.5 rounded-xl bg-[#091529] border border-[#16335C] text-center flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-bold text-blue-300">Day {idx + 1}</span>
                    <div className="my-1.5">
                      <CloudRain className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                      <div className="font-bold text-xs text-white">
                        {tempMax}° <span className="text-blue-300/80 font-normal">{tempMin}°</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#FF4D6D] font-bold">{rainSum} mm</div>
                    <div className="text-[9px] text-blue-300">{prob}% prob</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#1A365D] bg-[#071326] flex items-center justify-between">
          <span className="text-xs text-blue-300">
            Data sourced via Open-Meteo ECMWF / GFS ensemble models
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#DC143C] hover:bg-[#B50F31] text-xs font-bold text-white transition-all"
          >
            Close Forecast
          </button>
        </div>
      </div>
    </div>
  );
}
