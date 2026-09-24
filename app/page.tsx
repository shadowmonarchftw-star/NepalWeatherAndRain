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

  // 1. Fetch live DHM Nepal river stations on load
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
  }, []);

  // 2. Fetch live RainViewer radar timestamps on load
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
  }, []);

  // 3. Radar playback loop
  useEffect(() => {
    if (!isPlayingRadar || activeLayer !== "radar" || !radarData?.radarPast?.length) return;

    const timer = setInterval(() => {
      setRadarFrameIndex((prev) => (prev + 1) % radarData.radarPast.length);
    }, 900);

    return () => clearInterval(timer);
  }, [isPlayingRadar, activeLayer, radarData]);

  // Refresh weather and DHM data on demand
  const refreshWeatherData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Refresh DHM Rivers
      try {
        const dhmRes = await fetch("/api/dhm");
        if (dhmRes.ok) {
          const dhmData = await dhmRes.json();
          if (dhmData.rivers?.length) setDhmRivers(dhmData.rivers);
        }
      } catch {}

      // 2. Refresh key cities from Open-Meteo
      const keyCityIds = ["kathmandu", "morang", "kaski", "chitwan", "jhapa", "dhanusha"];
      const updatedList = [...districtsData];

      for (const cityId of keyCityIds) {
        try {
          const res = await fetch(`/api/weather?districtId=${cityId}`);
          if (res.ok) {
            const data: DistrictWeatherSummary = await res.json();
            const idx = updatedList.findIndex((d) => d.districtId === cityId);
            if (idx !== -1) {
              updatedList[idx] = data;
            }
          }
        } catch {}
      }
      setDistrictsData(updatedList);
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
            onSelectDistrict={(id) => setSelectedDistrictId(id)}
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
            onSelectDistrict={(id) => setSelectedDistrictId(id)}
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
            <span>DHM Nepal Live River Gauges</span>
            <span>•</span>
            <span>ISRO / IMD INSAT-3D Satellite</span>
            <span>•</span>
            <span>Open-Meteo ECMWF / GFS</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">100% Free & Open Data</span>
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
