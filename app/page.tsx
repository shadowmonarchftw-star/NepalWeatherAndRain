"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import NationalSituationBar from "@/components/NationalSituationBar";
import ProvinceQuickJumper from "@/components/ProvinceQuickJumper";
import MapControls, { MapLayerType, ForecastTimeWindow, BasemapType } from "@/components/MapControls";
import FloodHazardIndex from "@/components/FloodHazardIndex";
import ObservedConditions from "@/components/ObservedConditions";
import DhmForecastCard from "@/components/DhmForecastCard";
import NearMe from "@/components/NearMe";
import DhmCityWeather from "@/components/DhmCityWeather";
import StationHistoryModal, { HistoryTarget } from "@/components/StationHistoryModal";
import { RoadStatus } from "@/app/api/roads/route";
import { DhmCityWeather as DhmCity } from "@/app/api/dhm-cities/route";
import DistrictSelector from "@/components/DistrictSelector";
import DistrictDetailModal from "@/components/DistrictDetailModal";
import EmergencyModal from "@/components/EmergencyModal";
import LiveSatelliteModal from "@/components/LiveSatelliteModal";
import Footer from "@/components/Footer";
import {
  DistrictWeatherSummary,
  RainViewerData,
  NDRRMAAlert,
  DHMRainStation,
  AirQualityStation,
  BipadIncident,
} from "@/lib/types";
import { summarizeObservedRainByDistrict } from "@/lib/observedRain";
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

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function Home() {
  // Theme State: Default to Light Mode ("light"), toggleable to Dark Mode ("dark")
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Language State: Defaults to Nepali (np) for local relevance, toggleable to English (en)
  const [lang, setLang] = useState<Language>("np");

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

  const [districtsData, setDistrictsData] = useState<DistrictWeatherSummary[]>([]);
  const [dhmRivers, setDhmRivers] = useState<DHMRiverStation[]>([]);
  const [ndrrmaAlerts, setNdrrmaAlerts] = useState<NDRRMAAlert[]>([]);
  const [rainStations, setRainStations] = useState<DHMRainStation[]>([]);
  const [aqiStations, setAqiStations] = useState<AirQualityStation[]>([]);
  const [incidents, setIncidents] = useState<BipadIncident[]>([]);
  const [roads, setRoads] = useState<RoadStatus[]>([]);
  const [dhmCities, setDhmCities] = useState<{ cities: DhmCity[]; forecastIssuedAt: string | null; observedIssuedAt: string | null }>({
    cities: [],
    forecastIssuedAt: null,
    observedIssuedAt: null,
  });
  const [historyTarget, setHistoryTarget] = useState<HistoryTarget | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);

  // Modals & Timers
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isSatelliteViewerOpen, setIsSatelliteViewerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Map Controls State
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("precipitation");
  const [timeWindow, setTimeWindow] = useState<ForecastTimeWindow>("24h");
  const [basemap, setBasemap] = useState<BasemapType>("osm");
  const [mapCenterFocus, setMapCenterFocus] = useState<[number, number] | null>(null);

  // RainViewer Radar State
  const [radarData, setRadarData] = useState<RainViewerData | null>(null);
  const [radarFrameIndex, setRadarFrameIndex] = useState(0);
  const [isPlayingRadar, setIsPlayingRadar] = useState(true);

  // All live feeds are loaded through one function so the 5-minute timer, returning to the tab
  // and the Refresh button always reload the same set of data.
  const [forecastRefreshKey, setForecastRefreshKey] = useState(0);
  const lastRefreshRef = useRef(0);

  const refreshAll = useCallback(async () => {
    lastRefreshRef.current = Date.now();
    const json = (url: string) =>
      fetch(url).then(async (r) => {
        if (!r.ok) throw new Error(`${url} returned ${r.status}`);
        return r.json();
      });

    const [weather, dhm, ndrrma, rain, aqi, inc, radar, roadRes, cityRes] = await Promise.allSettled([
      json("/api/weather"),
      json("/api/dhm"),
      json("/api/ndrrma"),
      json("/api/rain"),
      json("/api/aqi"),
      json("/api/incidents"),
      json("/api/radar"),
      json("/api/roads"),
      json("/api/dhm-cities"),
    ]);

    // Open-Meteo forecast: keep the last good forecast if a refresh fails
    if (weather.status === "fulfilled" && Array.isArray(weather.value) && weather.value.length > 0) {
      setDistrictsData(weather.value);
    }
    // Measured feeds: a failed feed shows as empty ("unavailable") rather than keeping readings of unknown age
    setDhmRivers(dhm.status === "fulfilled" && Array.isArray(dhm.value.rivers) ? dhm.value.rivers : []);
    setNdrrmaAlerts(ndrrma.status === "fulfilled" && Array.isArray(ndrrma.value.alerts) ? ndrrma.value.alerts : []);
    setRainStations(rain.status === "fulfilled" && Array.isArray(rain.value.stations) ? rain.value.stations : []);
    setAqiStations(aqi.status === "fulfilled" && Array.isArray(aqi.value.stations) ? aqi.value.stations : []);
    setIncidents(inc.status === "fulfilled" && Array.isArray(inc.value.incidents) ? inc.value.incidents : []);
    setRoads(roadRes.status === "fulfilled" && Array.isArray(roadRes.value.roads) ? roadRes.value.roads : []);
    setDhmCities(
      cityRes.status === "fulfilled" && Array.isArray(cityRes.value.cities)
        ? cityRes.value
        : { cities: [], forecastIssuedAt: null, observedIssuedAt: null }
    );
    if (radar.status === "fulfilled" && radar.value?.radarPast) {
      setRadarData(radar.value);
      if (radar.value.radarPast.length) setRadarFrameIndex(radar.value.radarPast.length - 1);
    }

    setForecastRefreshKey((k) => k + 1);
    setLastRefreshedAt(new Date());
  }, []);

  // Load on mount, every 5 minutes, and when the user comes back to the tab
  // (mobile browsers pause timers in background tabs)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    refreshAll();
    const interval = setInterval(refreshAll, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefreshRef.current > 60_000) {
        refreshAll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshAll]);

  const observedRainByDistrict = useMemo(() => summarizeObservedRainByDistrict(rainStations), [rainStations]);

  // Latest reading per feed, for the footer's source list
  const sourceTimes = useMemo(() => {
    const latest = (times: (string | undefined)[]) =>
      times.filter((x): x is string => !!x).sort((x, y) => Date.parse(y) - Date.parse(x))[0];
    return {
      river: latest(dhmRivers.map((r) => r.waterLevelOn)),
      rain: latest(rainStations.map((r) => r.measuredOn)),
      alerts: latest(ndrrmaAlerts.map((x) => x.startedOn)),
      aqi: latest(aqiStations.map((x) => x.measuredOn)),
    };
  }, [dhmRivers, rainStations, ndrrmaAlerts, aqiStations]);

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
      await refreshAll();
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
        latestAlert={ndrrmaAlerts[0]}
        activeAlertCount={ndrrmaAlerts.length}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-3.5 sm:space-y-5">
        {/* 2. Top At-A-Glance National Situation Bar */}
        <section>
          <NationalSituationBar
            districts={districtsData}
            dhmRivers={dhmRivers}
            ndrrmaAlerts={ndrrmaAlerts}
            lang={lang}
            onFocusPeakDistrict={(dId) => {
              const d = districtsData.find((x) => x.districtId === dId);
              if (d) setMapCenterFocus([d.lat, d.lon]);
            }}
          />
        </section>

        {/* Near me: nearest gauges and alerts (location stays on device) */}
        <section>
          <NearMe
            rivers={dhmRivers}
            rainStations={rainStations}
            aqiStations={aqiStations}
            alerts={ndrrmaAlerts}
            roads={roads}
            districts={districtsData}
            onFocus={(coords) => setMapCenterFocus(coords)}
            lang={lang}
          />
        </section>

        {/* Official DHM forecast bulletin */}
        <section>
          <DhmForecastCard lang={lang} refreshKey={forecastRefreshKey} />
        </section>

        {/* DHM official city forecasts and observed daily weather */}
        <section>
          <DhmCityWeather
            cities={dhmCities.cities}
            forecastIssuedAt={dhmCities.forecastIssuedAt}
            observedIssuedAt={dhmCities.observedIssuedAt}
            onFocus={(coords) => setMapCenterFocus(coords)}
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
            rainStations={rainStations}
            aqiStations={aqiStations}
            roads={roads}
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

        {/* Measured rainfall, air quality and incidents */}
        <section>
          <ObservedConditions
            rainStations={rainStations}
            aqiStations={aqiStations}
            incidents={incidents}
            onFocus={(coords) => setMapCenterFocus(coords)}
            onOpenHistory={setHistoryTarget}
            lang={lang}
          />
        </section>

        {/* 6. River Basin Flood Hazard Index & Live DHM Gauges */}
        <section>
          <FloodHazardIndex
            dhmRivers={dhmRivers}
            ndrrmaAlerts={ndrrmaAlerts}
            rainStations={rainStations}
            roads={roads}
            onOpenHistory={setHistoryTarget}
            onSelectAlertFocus={(coords) => setMapCenterFocus(coords)}
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
            observedRain={observedRainByDistrict}
          />
        </section>
      </main>

      {/* 8. Comprehensive Footer with Live Visitors, Telemetry Sync & Attribution */}
      <Footer
        lang={lang}
        lastRefreshedAt={lastRefreshedAt}
        onRefreshData={refreshWeatherData}
        isRefreshing={isRefreshing}
        sourceTimes={sourceTimes}
      />

      {/* 9. District Detailed 72h Forecast Modal */}
      <DistrictDetailModal
        district={selectedDistrict}
        onClose={() => setSelectedDistrictId(null)}
        lang={lang}
        rainStations={selectedDistrictId ? rainStations.filter((st) => st.districtId === selectedDistrictId) : []}
      />

      {/* 24h river / rain history */}
      <StationHistoryModal target={historyTarget} onClose={() => setHistoryTarget(null)} lang={lang} />

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
        lang={lang}
      />
    </div>
  );
}
