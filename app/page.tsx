"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import BayOfBengalTracker from "@/components/BayOfBengalTracker";
import MapControls, { MapLayerType, ForecastTimeWindow, BasemapType } from "@/components/MapControls";
import FloodHazardIndex from "@/components/FloodHazardIndex";
import DistrictSelector from "@/components/DistrictSelector";
import DistrictDetailModal from "@/components/DistrictDetailModal";
import EmergencyModal from "@/components/EmergencyModal";
import LiveSatelliteModal from "@/components/LiveSatelliteModal";
import { NEPAL_DISTRICTS } from "@/data/nepalDistricts";
import { DistrictWeatherSummary, RainViewerData } from "@/lib/types";
import { generateSynopticFallbackForDistrict, getBayOfBengalTelemetry } from "@/lib/openMeteo";
import { DHMRiverStation } from "@/app/api/dhm/route";

// Dynamically import Leaflet Map with SSR disabled
const NepalWeatherMap = dynamic(() => import("@/components/NepalWeatherMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl bg-[#060E1D] border-2 border-[#003893] flex flex-col items-center justify-center text-blue-200">
      <div className="w-10 h-10 border-4 border-[#DC143C] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-semibold tracking-wide">
        Loading Free Nepal Meteorological Map & Radar...
      </span>
      <span className="text-xs text-blue-400/80 mt-1">Watermark-free open GIS engine</span>
    </div>
  ),
});

export default function Home() {
  // Telemetry & Districts
  const telemetry = useMemo(() => getBayOfBengalTelemetry(), []);
  const initialDistricts = useMemo(
    () => NEPAL_DISTRICTS.map((d) => generateSynopticFallbackForDistrict(d)),
    []
  );

  const [districtsData, setDistrictsData] = useState<DistrictWeatherSummary[]>(initialDistricts);
  const [dhmRivers, setDhmRivers] = useState<DHMRiverStation[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
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
    // Auto-update every 5 minutes (300,000 ms)
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

  // 5. On clicking a district, fetch its detailed 72h hourly forecast if not already loaded
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

  // Manual refresh on demand
  const refreshWeatherData = async () => {
    setIsRefreshing(true);
    try {
      const [weatherRes, dhmRes] = await Promise.allSettled([
        fetch("/api/weather"),
        fetch("/api/dhm"),
      ]);

      if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
        const wData = await weatherRes.value.json();
        if (Array.isArray(wData) && wData.length > 0) setDistrictsData(wData);
      }

      if (dhmRes.status === "fulfilled" && dhmRes.value.ok) {
        const dData = await dhmRes.value.json();
        if (dData.rivers?.length) setDhmRivers(dData.rivers);
      }
    } catch (err) {
      console.error("Refresh error", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Focus map onto Eastern Nepal (first impact point of Bay of Bengal)
  const handleFocusEasternNepal = () => {
    setMapCenterFocus([26.9, 87.4]);
  };

  // Find currently selected district for modal
  const selectedDistrict = useMemo(() => {
    if (!selectedDistrictId) return null;
    return districtsData.find((d) => d.districtId === selectedDistrictId) || null;
  }, [selectedDistrictId, districtsData]);

  // Current radar frame path
  const currentRadarPath = radarData?.radarPast?.[radarFrameIndex]?.path;
  const currentRadarTime = radarData?.radarPast?.[radarFrameIndex]
    ? new Date(radarData.radarPast[radarFrameIndex].time * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kathmandu",
      }) + " NPT"
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#050D1A] text-white">
      {/* 1. Header with Flag Theme & Live Ticker */}
      <Header
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onRefreshData={refreshWeatherData}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 2. Bay of Bengal Synoptic Depression Tracker */}
        <section>
          <BayOfBengalTracker
            telemetry={telemetry}
            onFocusEasternNepal={handleFocusEasternNepal}
          />
        </section>

        {/* 3. Interactive Map & Layer Controls */}
        <section className="space-y-3">
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
          />

          <NepalWeatherMap
            districtsData={districtsData}
            dhmRivers={dhmRivers}
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
          />
        </section>

        {/* 4. River Basin Flood Hazard Index & Live DHM Gauges */}
        <section>
          <FloodHazardIndex
            dhmRivers={dhmRivers}
            onSelectBasinFocus={(basinId) => {
              if (basinId.includes("koshi")) setMapCenterFocus([27.0, 87.2]);
              else if (basinId.includes("bagmati")) setMapCenterFocus([27.7, 85.3]);
              else if (basinId.includes("gandaki")) setMapCenterFocus([28.1, 84.2]);
              else if (basinId.includes("karnali")) setMapCenterFocus([29.1, 81.8]);
            }}
          />
        </section>

        {/* 5. 77 Districts Rain & Forecast Explorer */}
        <section>
          <DistrictSelector
            districts={districtsData}
            selectedDistrictId={selectedDistrictId || undefined}
            onSelectDistrict={handleSelectDistrict}
          />
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-[#003893] bg-[#030914] text-white py-8 mt-12">
        {/* Flag Color Stripe */}
        <div className="h-1 w-full flex mb-6">
          <div className="h-full w-1/3 bg-[#DC143C]" />
          <div className="h-full w-1/3 bg-[#FFFFFF]" />
          <div className="h-full w-1/3 bg-[#003893]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Nepal Weather & Rain Tracker</span>
            <span>•</span>
            <span>नेपाल मौसम तथा बाढी पूर्वसूचना प्रणाली</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live 5-min Auto-sync
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

      {/* 7. District Detailed 72h Forecast Modal */}
      <DistrictDetailModal
        district={selectedDistrict}
        onClose={() => setSelectedDistrictId(null)}
      />

      {/* 8. Emergency Hotlines Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* 9. Live INSAT-3D Satellite Viewer Modal */}
      <LiveSatelliteModal
        isOpen={isSatelliteViewerOpen}
        onClose={() => setIsSatelliteViewerOpen(false)}
      />
    </div>
  );
}
