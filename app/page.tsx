"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import NationalSituationBar from "@/components/NationalSituationBar";
import ProvinceQuickJumper from "@/components/ProvinceQuickJumper";
import BayOfBengalTracker from "@/components/BayOfBengalTracker";
import MapControls, { MapLayerType, ForecastTimeWindow, BasemapType } from "@/components/MapControls";
import FloodHazardIndex from "@/components/FloodHazardIndex";
import DistrictSelector from "@/components/DistrictSelector";
import DistrictDetailModal from "@/components/DistrictDetailModal";
import EmergencyModal from "@/components/EmergencyModal";
import LiveSatelliteModal from "@/components/LiveSatelliteModal";
import { NEPAL_DISTRICTS } from "@/data/nepalDistricts";
import { DistrictWeatherSummary, RainViewerData, NDRRMAAlert } from "@/lib/types";
import { generateSynopticFallbackForDistrict, getBayOfBengalTelemetry } from "@/lib/openMeteo";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { Language } from "@/lib/translations";

// Dynamically import Leaflet Map with SSR disabled
const NepalWeatherMap = dynamic(() => import("@/components/NepalWeatherMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl bg-[#080D16] border border-slate-800 flex flex-col items-center justify-center text-slate-300">
      <div className="w-10 h-10 border-4 border-[#C51D34] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-semibold tracking-wide">
        Loading Nepal Meteorological GIS Engine...
      </span>
      <span className="text-xs text-slate-500 mt-1">Free open-source vector basemap</span>
    </div>
  ),
});

export default function Home() {
  // Theme State: Default to Light Mode ("light"), toggleable to Dark Mode ("dark")
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Language State: Defaults to Nepali (np) for local relevance, toggleable to English (en)
  const [lang, setLang] = useState<Language>("np");

  // Telemetry & Districts
  const telemetry = useMemo(() => getBayOfBengalTelemetry(), []);
  const initialDistricts = useMemo(
    () => NEPAL_DISTRICTS.map((d) => generateSynopticFallbackForDistrict(d)),
    []
  );

  // Sync theme with document element & localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nepal_weather_theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      // Default to light mode explicitly
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("nepal_weather_theme", next);
      return next;
    });
  };

  const [districtsData, setDistrictsData] = useState<DistrictWeatherSummary[]>(initialDistricts);
  const [dhmRivers, setDhmRivers] = useState<DHMRiverStation[]>([]);
  const [ndrrmaAlerts, setNdrrmaAlerts] = useState<NDRRMAAlert[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);

  // Modals
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isSatelliteViewerOpen, setIsSatelliteViewerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map Controls State
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("precipitation");
  const [timeWindow, setTimeWindow] = useState<ForecastTimeWindow>("24h");
  const [basemap, setBasemap] = useState<BasemapType>("dark");
  const [mapCenterFocus, setMapCenterFocus] = useState<[number, number] | null>(null);

  // RainViewer Radar State
  const [radarData, setRadarData] = useState<RainViewerData | null>(null);
  const [radarFrameIndex, setRadarFrameIndex] = useState(0);
  const [isPlayingRadar, setIsPlayingRadar] = useState(true);

  // 1. Fetch live 77-district data from Open-Meteo on mount & auto-refresh every 5 minutes
  useEffect(() => {
    async function loadAllDistricts() {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) {
          const liveList: DistrictWeatherSummary[] = await res.json();
          if (Array.isArray(liveList) && liveList.length > 0) {
            setDistrictsData(liveList);
          }
        }
      } catch (err) {
        console.warn("Using offline synoptic cache", err);
      }
    }

    loadAllDistricts();
    const interval = setInterval(loadAllDistricts, 300000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch live DHM Nepal river stations on mount & auto-refresh every 5 minutes
  useEffect(() => {
    async function loadDHM() {
      try {
        const res = await fetch("/api/dhm");
        if (res.ok) {
          const data = await res.json();
          if (data.rivers?.length) {
            setDhmRivers(data.rivers);
          }
        }
      } catch (err) {
        console.warn("Using cached DHM station telemetry", err);
      }
    }

    loadDHM();
    const interval = setInterval(loadDHM, 300000);
    return () => clearInterval(interval);
  }, []);

  // 3. Fetch live NDRRMA BIPAD disaster alerts on mount & auto-refresh every 5 minutes
  useEffect(() => {
    async function loadNDRRMA() {
      try {
        const res = await fetch("/api/ndrrma");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.alerts)) {
            setNdrrmaAlerts(data.alerts);
          }
        }
      } catch (err) {
        console.warn("Using cached NDRRMA alerts", err);
      }
    }

    loadNDRRMA();
    const interval = setInterval(loadNDRRMA, 300000);
    return () => clearInterval(interval);
  }, []);

  // 3. Fetch live RainViewer radar timestamps on load & refresh every 5 minutes
  useEffect(() => {
    async function loadRadar() {
      try {
        const res = await fetch("/api/radar");
        if (res.ok) {
          const data = await res.json();
          setRadarData(data);
          if (data.radarPast?.length) {
            setRadarFrameIndex(data.radarPast.length - 1);
          }
        }
      } catch (err) {
        console.warn("Using offline radar configuration", err);
      }
    }

    loadRadar();
    const interval = setInterval(loadRadar, 300000);
    return () => clearInterval(interval);
  }, []);

  // 4. Radar playback loop
  useEffect(() => {
    if (!isPlayingRadar || activeLayer !== "radar" || !radarData?.radarPast?.length) return;

    const timer = setInterval(() => {
      setRadarFrameIndex((prev) => (prev + 1) % radarData.radarPast.length);
    }, 900);

    return () => clearInterval(timer);
  }, [isPlayingRadar, activeLayer, radarData]);

  // 5. On clicking a district, fetch detailed 72h hourly forecast if needed
  const handleSelectDistrict = async (districtId: string) => {
    setSelectedDistrictId(districtId);

    const existing = districtsData.find((d) => d.districtId === districtId);
    if (!existing || existing.hourly.time.length === 0) {
      try {
        const res = await fetch(`/api/weather?districtId=${districtId}`);
        if (res.ok) {
          const detailed: DistrictWeatherSummary = await res.json();
          setDistrictsData((prev) =>
            prev.map((d) => (d.districtId === districtId ? detailed : d))
          );
        }
      } catch (err) {
        console.warn("Could not load detailed district hourly data", err);
      }
    }
  };

  // 6. Handle Province Quick Jumper selection
  const handleSelectProvince = (provId: number, center?: [number, number]) => {
    setSelectedProvinceId(provId);
    if (center) {
      setMapCenterFocus(center);
    }
  };

  // Manual refresh on demand
  const refreshWeatherData = async () => {
    setIsRefreshing(true);
    try {
      const [weatherRes, dhmRes, ndrrmaRes] = await Promise.allSettled([
        fetch("/api/weather"),
        fetch("/api/dhm"),
        fetch("/api/ndrrma"),
      ]);

      if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
        const wData = await weatherRes.value.json();
        if (Array.isArray(wData) && wData.length > 0) setDistrictsData(wData);
      }

      if (dhmRes.status === "fulfilled" && dhmRes.value.ok) {
        const dData = await dhmRes.value.json();
        if (dData.rivers?.length) setDhmRivers(dData.rivers);
      }

      if (ndrrmaRes.status === "fulfilled" && ndrrmaRes.value.ok) {
        const nData = await ndrrmaRes.value.json();
        if (Array.isArray(nData.alerts)) setNdrrmaAlerts(nData.alerts);
      }
    } catch (err) {
      console.error("Refresh error", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Find currently selected district for modal
  const selectedDistrict = useMemo(() => {
    if (!selectedDistrictId) return null;
    return districtsData.find((d) => d.districtId === selectedDistrictId) || null;
  }, [selectedDistrictId, districtsData]);

  // Current radar frame path
  const currentRadarPath = radarData?.radarPast?.[radarFrameIndex]?.path;
  const currentRadarTime = radarData?.radarPast?.[radarFrameIndex]
    ? new Date(radarData.radarPast[radarFrameIndex].time * 1000).toLocaleTimeString(
        lang === "np" ? "ne-NP" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kathmandu",
        }
      ) + " NPT"
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0A0F1A] text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Header with Language Switcher & Authentic Flag Accents */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(lang === "en" ? "np" : "en")}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onRefreshData={refreshWeatherData}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* 2. Top At-A-Glance National Situation Bar */}
        <section>
          <NationalSituationBar
            districts={districtsData}
            dhmRivers={dhmRivers}
            telemetry={telemetry}
            lang={lang}
            onFocusPeakDistrict={(dId) => {
              const d = districtsData.find((x) => x.districtId === dId);
              if (d) setMapCenterFocus([d.lat, d.lon]);
            }}
          />
        </section>

        {/* 3. Bay of Bengal Synoptic Depression Tracker */}
        <section>
          <BayOfBengalTracker
            telemetry={telemetry}
            onFocusEasternNepal={() => setMapCenterFocus([26.9, 87.4])}
            lang={lang}
          />
        </section>

        {/* 4. Province Quick Jumper */}
        <section>
          <ProvinceQuickJumper
            districts={districtsData}
            selectedProvinceId={selectedProvinceId}
            onSelectProvince={handleSelectProvince}
            lang={lang}
          />
        </section>

        {/* 5. Interactive Map & Layer Controls */}
        <section className="space-y-2.5">
          <MapControls
            activeLayer={activeLayer}
            onChangeLayer={setActiveLayer}
            timeWindow={timeWindow}
            onChangeTimeWindow={setTimeWindow}
            basemap={basemap}
            onChangeBasemap={setBasemap}
            isPlayingRadar={isPlayingRadar}
            onToggleRadarPlay={() => setIsPlayingRadar(!isPlayingRadar)}
            radarFrameIndex={radarFrameIndex}
            totalRadarFrames={radarData?.radarPast?.length || 0}
            onChangeRadarFrame={setRadarFrameIndex}
            currentRadarTime={currentRadarTime}
            onOpenSatelliteViewer={() => setIsSatelliteViewerOpen(true)}
            lang={lang}
          />

          <NepalWeatherMap
            districtsData={districtsData}
            dhmRivers={dhmRivers}
            ndrrmaAlerts={ndrrmaAlerts}
            telemetry={telemetry}
            activeLayer={activeLayer}
            timeWindow={timeWindow}
            basemap={basemap}
            radarHost={radarData?.host}
            radarPath={currentRadarPath}
            selectedDistrictId={selectedDistrictId || undefined}
            onSelectDistrict={handleSelectDistrict}
            mapCenterFocus={mapCenterFocus}
            onOpenSatelliteViewer={() => setIsSatelliteViewerOpen(true)}
            lang={lang}
            theme={theme}
          />
        </section>

        {/* 6. River Basin Flood Hazard Index & Live DHM Gauges */}
        <section>
          <FloodHazardIndex
            dhmRivers={dhmRivers}
            ndrrmaAlerts={ndrrmaAlerts}
            onSelectAlertFocus={(coords) => setMapCenterFocus(coords)}
            onSelectBasinFocus={(basinId) => {
              if (basinId.includes("koshi")) setMapCenterFocus([27.0, 87.2]);
              else if (basinId.includes("bagmati")) setMapCenterFocus([27.7, 85.3]);
              else if (basinId.includes("gandaki")) setMapCenterFocus([28.1, 84.2]);
              else if (basinId.includes("karnali")) setMapCenterFocus([29.1, 81.8]);
            }}
            lang={lang}
          />
        </section>

        {/* 7. 77 Districts Rain & Forecast Explorer */}
        <section>
          <DistrictSelector
            districts={districtsData}
            selectedDistrictId={selectedDistrictId || undefined}
            onSelectDistrict={handleSelectDistrict}
            lang={lang}
          />
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080D16] text-slate-600 dark:text-slate-400 py-6 mt-8 transition-colors">
        <div className="h-1 w-full flex mb-4">
          <div className="h-full w-1/3 bg-[#C51D34]" />
          <div className="h-full w-1/3 bg-[#FFFFFF]" />
          <div className="h-full w-1/3 bg-[#003893]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {lang === "np" ? "नेपाल मौसम तथा वर्षा ट्रयाकर" : "Nepal Weather & Rain Tracker"}
            </span>
            <span>•</span>
            <span>{lang === "np" ? "बाढी पूर्वसूचना प्रणाली" : "Flood Early Warning System"}</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              {lang === "np" ? "प्रत्येक ५ मिनेटमा अपडेट" : "Live 5-min Auto-sync"}
            </span>
            <span>•</span>
            <span>DHM Nepal Live River Gauges</span>
            <span>•</span>
            <span>ISRO / IMD INSAT-3D Satellite</span>
            <span>•</span>
            <span>Open-Meteo ECMWF / GFS</span>
          </div>
        </div>
      </footer>

      {/* 9. District Detailed 72h Forecast Modal */}
      <DistrictDetailModal
        district={selectedDistrict}
        onClose={() => setSelectedDistrictId(null)}
        lang={lang}
      />

      {/* 10. Emergency Hotlines Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        lang={lang}
      />

      {/* 11. Live INSAT-3D Satellite Viewer Modal */}
      <LiveSatelliteModal
        isOpen={isSatelliteViewerOpen}
        onClose={() => setIsSatelliteViewerOpen(false)}
      />
    </div>
  );
}
