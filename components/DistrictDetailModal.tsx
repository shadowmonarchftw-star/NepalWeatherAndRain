"use client";

import React from "react";
import {
  X,
  CloudRain,
  Wind,
  Thermometer,
  Gauge,
  Waves,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DistrictWeatherSummary } from "@/lib/types";
import { interpretWmoCode } from "@/lib/alertCalculator";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface DistrictDetailModalProps {
  district: DistrictWeatherSummary | null;
  onClose: () => void;
  lang?: Language;
}

export default function DistrictDetailModal({
  district,
  onClose,
  lang = "en",
}: DistrictDetailModalProps) {
  if (!district) return null;

  const t = TRANSLATIONS[lang];

  let cumulativeRain = 0;
  const chartData = district.hourly.time.slice(0, 48).map((timeStr, idx) => {
    const rain = district.hourly.precipitation[idx] || 0;
    cumulativeRain = Math.round((cumulativeRain + rain) * 10) / 10;
    const dateObj = new Date(timeStr);
    const hourLabel = dateObj.toLocaleTimeString(lang === "np" ? "ne-NP" : "en-US", {
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

  const districtDisplayName = lang === "np" ? district.nepaliName : district.districtName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0F172A] border border-slate-700 text-white shadow-2xl flex flex-col">
        {/* Top Flag Stripe */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#C51D34]" />
          <div className="h-full w-1/3 bg-[#FFFFFF]" />
          <div className="h-full w-1/3 bg-[#003893]" />
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-[#0A0F1A]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {district.provinceName}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                <Waves className="w-3 h-3" />
                {district.basin} {lang === "np" ? "जलाधार" : "Basin"}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {districtDisplayName}
              </h2>
              <span className="text-base font-bold text-slate-400">
                {lang === "np" ? district.districtName : district.nepaliName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                isDanger
                  ? "bg-[#C51D34] text-white border-white animate-pulse"
                  : isWarning
                  ? "bg-amber-500/20 text-amber-300 border-amber-500"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              DHM: {district.alertLevel}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-[#C51D34] text-slate-300 hover:text-white transition-all"
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
                ? "bg-[#C51D34]/15 border-[#C51D34] text-white"
                : isWarning
                ? "bg-amber-500/10 border-amber-500/50 text-amber-100"
                : "bg-slate-800/60 border-slate-700 text-slate-200"
            }`}
          >
            <ShieldAlert
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isDanger ? "text-[#FF4D6D]" : isWarning ? "text-amber-400" : "text-blue-400"
              }`}
            />
            <div className="text-xs space-y-1">
              <div className="font-bold text-sm">
                {t.threatAssessment} {district.primaryThreat}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isDanger
                  ? lang === "np"
                    ? "मनसुनी न्यूनचापीय प्रणालीका कारण भारी वर्षाको प्रक्षेपण छ। नदी किनार तथा पहिरोको जोखिम भएका पहाडी भिरालो क्षेत्रबाट तत्काल सतर्क रहन अनुरोध गरिन्छ।"
                    : "Extreme rainfall forecast due to maritime moisture convergence against mid-hill terrain. Immediate evacuation from riverbanks and landslide-prone steep slopes advised."
                  : isWarning
                  ? lang === "np"
                    ? "मध्यम तथा भारी वर्षाको सम्भावना। खोला-नालामा पानीको बहाव आकस्मिक रूपमा बढ्न सक्ने भएकाले यात्रा गर्दा सतर्कता अपनाउनुहोस्।"
                    : "Heavy downpours expected. Stream levels will rise rapidly. Avoid unpaved steep roads and night travel."
                  : lang === "np"
                  ? "वर्षा सामान्य सीमाभित्र रहने अनुमान छ।"
                  : "Precipitation within typical monsoon thresholds. General vigilance advised near local streams."}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#0A0F1A] border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{lang === "np" ? "२४ घण्टे वर्षा" : "24h Rainfall"}</span>
                <CloudRain className="w-4 h-4 text-[#FF4D6D]" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums">{district.total24hRain} mm</div>
              <span className="text-[10px] text-slate-400">48h: {district.total48hRain} mm</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0A0F1A] border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{t.temperature}</span>
                <Thermometer className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {district.current.temperature}°C
              </div>
              <span className="text-[10px] text-cyan-300">
                {lang === "np" ? weatherState.nepaliDescription : weatherState.description}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0A0F1A] border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{t.windGusts}</span>
                <Wind className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {district.current.windGusts} <span className="text-xs font-normal">km/h</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Speed: {district.current.windSpeed} km/h
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0A0F1A] border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{t.pressure}</span>
                <Gauge className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {district.current.surfacePressure} <span className="text-xs font-normal">hPa</span>
              </div>
              <span className="text-[10px] text-slate-400">{t.elevation}: {district.elevation}m</span>
            </div>
          </div>

          {/* Interactive Recharts Rainfall Profile */}
          <div className="p-4 rounded-2xl bg-[#0A0F1A] border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>
                    {lang === "np"
                      ? "४८-घण्टे प्रतिघण्टा वर्षा दर तथा संचित वर्षा"
                      : "48-Hour Hourly Precipitation & Cumulative Accumulation"}
                  </span>
                </h4>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-400" />
                  <span className="text-slate-300">{t.hourlyRainRate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#C51D34]" />
                  <span className="text-slate-300">{t.cumulativeRain}</span>
                </div>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cumulGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C51D34" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#C51D34" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} interval={3} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#C51D34"
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
              <span>{t.sevenDayTrend}</span>
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
                    className="p-2.5 rounded-xl bg-[#0A0F1A] border border-slate-800 text-center flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-bold text-slate-400">
                      {lang === "np" ? `दिन ${idx + 1}` : `Day ${idx + 1}`}
                    </span>
                    <div className="my-1.5">
                      <CloudRain className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                      <div className="font-bold text-xs text-white tabular-nums">
                        {tempMax}° <span className="text-slate-500 font-normal">{tempMin}°</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#FF4D6D] font-bold tabular-nums">{rainSum} mm</div>
                    <div className="text-[9px] text-slate-400 tabular-nums">{prob}% prob</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0A0F1A] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Open-Meteo ECMWF / GFS ensemble models
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#C51D34] hover:bg-[#A8152A] text-xs font-bold text-white transition-all"
          >
            {t.closeForecast}
          </button>
        </div>
      </div>
    </div>
  );
}
