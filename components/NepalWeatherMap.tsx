"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DistrictWeatherSummary, BayOfBengalTelemetry } from "@/lib/types";
import { MapLayerType, ForecastTimeWindow, BasemapType } from "./MapControls";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { Language, TRANSLATIONS } from "@/lib/translations";
import { Maximize2, Minimize2, Crosshair, Satellite } from "lucide-react";

interface NepalWeatherMapProps {
  districtsData: DistrictWeatherSummary[];
  dhmRivers?: DHMRiverStation[];
  telemetry: BayOfBengalTelemetry;
  activeLayer: MapLayerType;
  timeWindow: ForecastTimeWindow;
  basemap: BasemapType;
  radarHost?: string;
  radarPath?: string;
  selectedDistrictId?: string;
  onSelectDistrict: (districtId: string) => void;
  mapCenterFocus?: [number, number] | null;
  onOpenSatelliteViewer?: () => void;
  lang?: Language;
}

// DHM Doppler Weather Radar Stations in Nepal
const DHM_DOPPLER_RADARS = [
  {
    name: "Ratananagar Doppler Radar (Surkhet)",
    nepaliName: "रत्ननगर डपलर रडार (सुर्खेत)",
    location: "Karnali Province",
    lat: 28.5833,
    lon: 81.6667,
    radiusM: 200000,
    description: "Monitors Western Nepal, Karnali basin & Bheri river systems.",
  },
  {
    name: "Ribdikot Doppler Radar (Palpa)",
    nepaliName: "रिब्दीकोट डपलर रडार (पाल्पा)",
    location: "Lumbini Province",
    lat: 27.8667,
    lon: 83.5167,
    radiusM: 200000,
    description: "Monitors Central Nepal, Gandaki basin, Pokhara valley & Narayani river.",
  },
  {
    name: "Rauta Doppler Radar (Udayapur)",
    nepaliName: "रौता डपलर रडार (उदयपुर)",
    location: "Koshi Province",
    lat: 26.9667,
    lon: 86.5833,
    radiusM: 200000,
    description: "Primary eastern early-warning radar tracking Bay of Bengal storm ingress.",
  },
];

// Simplified outline of Nepal International Boundary
const NEPAL_BORDER_COORDINATES: [number, number][] = [
  [28.96, 80.18],
  [29.7, 80.45],
  [30.2, 80.9],
  [30.45, 81.65],
  [29.9, 82.5],
  [29.8, 83.0],
  [29.3, 83.9],
  [28.8, 84.8],
  [28.35, 85.5],
  [28.0, 85.9],
  [27.98, 86.9],
  [27.9, 87.2],
  [27.85, 88.15],
  [26.5, 88.12],
  [26.4, 87.2],
  [26.55, 86.6],
  [26.8, 85.5],
  [27.0, 84.85],
  [27.45, 84.0],
  [27.5, 83.0],
  [27.95, 81.6],
  [28.4, 80.9],
  [28.96, 80.18],
];

export default function NepalWeatherMap({
  districtsData,
  dhmRivers = [],
  telemetry,
  activeLayer,
  timeWindow,
  basemap,
  radarHost = "https://tilecache.rainviewer.com",
  radarPath,
  selectedDistrictId,
  onSelectDistrict,
  mapCenterFocus,
  onOpenSatelliteViewer,
  lang = "en",
}: NepalWeatherMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riversLayerRef = useRef<L.LayerGroup | null>(null);
  const stormLayerRef = useRef<L.LayerGroup | null>(null);
  const dhmRadarLayerRef = useRef<L.LayerGroup | null>(null);
  const borderLayerRef = useRef<L.LayerGroup | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = TRANSLATIONS[lang];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.2, 84.4],
      zoom: 7,
      minZoom: 5,
      maxZoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Initial free basemap: ESRI World Dark Gray Base (watermark-free)
    const baseLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> contributors',
        maxZoom: 16,
      }
    ).addTo(map);

    baseTileLayerRef.current = baseLayer;

    // Create Layer Groups
    borderLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    riversLayerRef.current = L.layerGroup().addTo(map);
    stormLayerRef.current = L.layerGroup().addTo(map);
    dhmRadarLayerRef.current = L.layerGroup().addTo(map);

    // Render Nepal National Boundary Polygon
    const borderPolygon = L.polygon(NEPAL_BORDER_COORDINATES, {
      color: "#003893",
      weight: 2.5,
      fillColor: "#003893",
      fillOpacity: 0.04,
      dashArray: "4, 6",
    });
    borderLayerRef.current.addLayer(borderPolygon);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Basemap Switch (Dark, Satellite, OSM)
  useEffect(() => {
    if (!mapRef.current) return;

    if (baseTileLayerRef.current) {
      mapRef.current.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }

    let url = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
    let attribution = '&copy; <a href="https://www.esri.com/">Esri</a>';

    if (basemap === "satellite" || activeLayer === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics';
    } else if (basemap === "osm") {
      url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    }

    const newBase = L.tileLayer(url, { attribution, maxZoom: 18 });
    newBase.addTo(mapRef.current);
    baseTileLayerRef.current = newBase;
  }, [basemap, activeLayer]);

  // Handle programmatic camera focus
  useEffect(() => {
    if (mapRef.current && mapCenterFocus) {
      mapRef.current.flyTo(mapCenterFocus, 8, { duration: 1.2 });
    }
  }, [mapCenterFocus]);

  // Handle Radar Tile Layer changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (radarLayerRef.current) {
      mapRef.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (activeLayer === "radar" && radarPath) {
      const radarUrl = `${radarHost}${radarPath}/256/{z}/{x}/{y}/2/1_1.png`;
      const radarLayer = L.tileLayer(radarUrl, {
        opacity: 0.8,
        zIndex: 50,
      });
      radarLayer.addTo(mapRef.current);
      radarLayerRef.current = radarLayer;
    }
  }, [activeLayer, radarPath, radarHost]);

  // Render DHM Doppler Radars
  useEffect(() => {
    if (!dhmRadarLayerRef.current) return;
    const radarGroup = dhmRadarLayerRef.current;
    radarGroup.clearLayers();

    if (activeLayer === "radar") {
      DHM_DOPPLER_RADARS.forEach((radar) => {
        const circle = L.circle([radar.lat, radar.lon], {
          radius: radar.radiusM,
          color: "#00E5FF",
          fillColor: "#00E5FF",
          fillOpacity: 0.05,
          weight: 1.5,
          dashArray: "4, 6",
        });

        const stationIcon = L.divIcon({
          className: "custom-radar-icon",
          html: `
            <div class="relative flex items-center justify-center w-7 h-7 -ml-3.5 -mt-3.5">
              <div class="absolute inset-0 rounded-full bg-cyan-400 opacity-40 animate-ping"></div>
              <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-[#0F172A] border border-cyan-400 text-cyan-300 shadow-md text-xs font-bold">
                📡
              </div>
            </div>
          `,
        });

        const marker = L.marker([radar.lat, radar.lon], { icon: stationIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #f8fafc; padding: 2px;">
            <div style="font-weight: 800; color: #38bdf8; margin-bottom: 3px;">
              ${lang === "np" ? radar.nepaliName : radar.name}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${radar.location}</div>
            <div style="font-size: 11px; margin-bottom: 4px;"><strong>Range:</strong> 200 km</div>
            <div style="font-size: 10px; color: #cbd5e1; line-height: 1.4;">${radar.description}</div>
            <div style="margin-top: 6px; padding: 3px 6px; background: #003893; border-radius: 4px; font-size: 10px; font-weight: bold; text-align: center;">
              DHM Official Doppler Radar Station
            </div>
          </div>
        `);

        radarGroup.addLayer(circle);
        radarGroup.addLayer(marker);
      });
    }
  }, [activeLayer, lang]);

  // Render Bay of Bengal storm trajectory
  useEffect(() => {
    if (!stormLayerRef.current) return;
    const stormGroup = stormLayerRef.current;
    stormGroup.clearLayers();

    const stormIcon = L.divIcon({
      className: "custom-storm-marker",
      html: `
        <div class="relative flex items-center justify-center w-9 h-9 -ml-4.5 -mt-4.5">
          <div class="absolute inset-0 rounded-full bg-[#C51D34] opacity-60 animate-ping"></div>
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#C51D34] border border-white text-white font-bold text-xs shadow-lg">
            🌀
          </div>
        </div>
      `,
    });

    const stormMarker = L.marker([telemetry.coordinates.lat, telemetry.coordinates.lon], {
      icon: stormIcon,
    });

    stormMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; color: #fff;">
        <div style="font-weight: 800; color: #ff4d6d; margin-bottom: 4px; text-transform: uppercase;">
          🌀 Bay of Bengal ${telemetry.systemType}
        </div>
        <div><strong>Coordinates:</strong> ${telemetry.coordinates.lat}°N, ${telemetry.coordinates.lon}°E</div>
        <div><strong>Central Pressure:</strong> ${telemetry.centralPressureHpa} hPa</div>
        <div><strong>Max Winds:</strong> ${telemetry.maxSustainedWindsKmh} km/h</div>
        <div style="margin-top: 6px; padding: 4px; background: #003893; border-radius: 4px; font-weight: 600;">
          Distance to Nepal: ~${telemetry.distanceToNepalBorderKm} km
        </div>
      </div>
    `);

    stormGroup.addLayer(stormMarker);

    const trajectoryLine = L.polyline(
      [
        [telemetry.coordinates.lat, telemetry.coordinates.lon],
        [22.5, 88.0],
        [24.8, 87.5],
        [26.4525, 87.2718],
        [27.7172, 85.3240],
      ],
      {
        color: "#C51D34",
        weight: 3,
        dashArray: "6, 8",
        opacity: 0.85,
      }
    );
    stormGroup.addLayer(trajectoryLine);
  }, [telemetry]);

  // Render Rivers & Live DHM River Gauges
  useEffect(() => {
    if (!riversLayerRef.current) return;
    const riversGroup = riversLayerRef.current;
    riversGroup.clearLayers();

    if (activeLayer === "rivers") {
      const koshiLine = L.polyline(
        [
          [27.9, 86.8],
          [27.3, 87.1],
          [26.88, 87.15],
          [26.5, 86.95],
        ],
        { color: "#38BDF8", weight: 4, opacity: 0.85 }
      ).bindPopup("<strong>Koshi Basin</strong> (Chatara)");

      const bagmatiLine = L.polyline(
        [
          [27.8, 85.4],
          [27.68, 85.31],
          [27.4, 85.25],
          [27.0, 85.45],
          [26.7, 85.3],
        ],
        { color: "#003893", weight: 4, opacity: 0.85 }
      ).bindPopup("<strong>Bagmati River Basin</strong>");

      const narayaniLine = L.polyline(
        [
          [28.8, 83.8],
          [28.2, 84.4],
          [27.9, 84.5],
          [27.7, 84.42],
          [27.5, 84.3],
        ],
        { color: "#60A5FA", weight: 4, opacity: 0.85 }
      ).bindPopup("<strong>Narayani / Gandaki Basin</strong>");

      const karnaliLine = L.polyline(
        [
          [29.8, 81.8],
          [29.1, 81.6],
          [28.65, 81.28],
          [28.3, 81.1],
        ],
        { color: "#0284C7", weight: 4, opacity: 0.85 }
      ).bindPopup("<strong>Karnali River Basin</strong>");

      riversGroup.addLayer(koshiLine);
      riversGroup.addLayer(bagmatiLine);
      riversGroup.addLayer(narayaniLine);
      riversGroup.addLayer(karnaliLine);

      dhmRivers.forEach((station) => {
        const isDanger = station.status === "Danger";
        const isWarning = station.status === "Warning";
        const gaugeColor = isDanger ? "#C51D34" : isWarning ? "#F59E0B" : "#10B981";

        const gaugeIcon = L.divIcon({
          className: "custom-gauge-marker",
          html: `
            <div class="relative flex items-center justify-center w-7 h-7 -ml-3.5 -mt-3.5">
              <div class="absolute inset-0 rounded-full" style="background-color: ${gaugeColor}; opacity: 0.5; ${
            isDanger || isWarning ? "animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;" : ""
          }"></div>
              <div class="relative flex items-center justify-center w-6 h-6 rounded-full border border-white text-white font-black text-[10px]" style="background-color: ${gaugeColor};">
                🌊
              </div>
            </div>
          `,
        });

        const marker = L.marker(station.coordinates, { icon: gaugeIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; color: #fff; min-width: 170px;">
            <div style="font-weight: 800; font-size: 13px; color: #fff; border-bottom: 1px solid #334155; padding-bottom: 3px; margin-bottom: 5px;">
              ${station.name}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #94a3b8;">Current WL:</span>
              <span style="font-weight: 800; color: ${gaugeColor};">${station.waterLevelM} m</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #94a3b8;">Warning WR:</span>
              <span style="color: #f59e0b; font-weight: 600;">${station.warningLevelM} m</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #94a3b8;">Danger DL:</span>
              <span style="color: #ef4444; font-weight: 600;">${station.dangerLevelM} m</span>
            </div>
            <div style="background: ${gaugeColor}22; border: 1px solid ${gaugeColor}; color: #fff; padding: 4px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center;">
              DHM: ${station.status.toUpperCase()}
            </div>
          </div>
        `);

        riversGroup.addLayer(marker);
      });
    }
  }, [activeLayer, dhmRivers]);

  // Render District Risk Markers
  useEffect(() => {
    if (!markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    districtsData.forEach((district) => {
      const rainMm =
        timeWindow === "24h"
          ? district.total24hRain
          : timeWindow === "48h"
          ? district.total48hRain
          : district.total72hRain;

      let fillColor = "#10B981"; // Emerald
      let borderColor = "#059669";
      let pulseClass = "";

      if (rainMm >= 100) {
        fillColor = "#C51D34"; // Official Flag Crimson
        borderColor = "#FFFFFF";
        pulseClass = "beacon-pulse";
      } else if (rainMm >= 50) {
        fillColor = "#F59E0B"; // Amber
        borderColor = "#D97706";
      } else if (rainMm >= 25) {
        fillColor = "#FACC15"; // Yellow
        borderColor = "#CA8A04";
      }

      const isSelected = selectedDistrictId === district.districtId;
      const radius = isSelected ? 11 : district.elevation > 1500 ? 6.5 : 7.5;

      const circleMarker = L.circleMarker([district.lat, district.lon], {
        radius: radius,
        fillColor: fillColor,
        color: isSelected ? "#FFFFFF" : borderColor,
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: 0.9,
        className: rainMm >= 100 ? pulseClass : "",
      });

      const districtDisplayName = lang === "np" ? district.nepaliName : district.districtName;

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; color: #f8fafc; min-width: 170px;">
          <div style="font-weight: 800; font-size: 14px; color: #ffffff; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            ${districtDisplayName}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94a3b8;">${lang === "np" ? "प्रदेश:" : "Province:"}</span>
            <span style="font-weight: 600;">${district.provinceName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94a3b8;">${timeWindow} ${lang === "np" ? "वर्षा:" : "Rain:"}</span>
            <span style="font-weight: 800; color: ${fillColor}; font-size: 14px;">${rainMm} mm</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94a3b8;">${lang === "np" ? "तापक्रम:" : "Temp:"}</span>
            <span>${district.current.temperature}°C</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #94a3b8;">${lang === "np" ? "उचाइ:" : "Elevation:"}</span>
            <span>${district.elevation}m</span>
          </div>
          <div style="background: ${fillColor}22; border: 1px solid ${fillColor}; color: #fff; padding: 4px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center;">
            ${t.dhmAlert} ${district.alertLevel.toUpperCase()}
          </div>
          <div style="margin-top: 6px; text-align: center; color: #38bdf8; font-size: 11px; text-decoration: underline; cursor: pointer;">
            ${lang === "np" ? "७२ घण्टे विस्तृत विवरण हेर्नुहोस् →" : "View 72h detailed forecast →"}
          </div>
        </div>
      `;

      circleMarker.bindPopup(popupHtml);
      circleMarker.on("click", () => onSelectDistrict(district.districtId));
      markersGroup.addLayer(circleMarker);
    });
  }, [districtsData, timeWindow, selectedDistrictId, onSelectDistrict, lang, t.dhmAlert]);

  // Re-center on Nepal
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([28.2, 84.4], 7, { duration: 1.0 });
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#080D16] shadow-xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[470px] sm:h-[570px] lg:h-[640px]"
      }`}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-[#0F172A]/95 border border-slate-800 backdrop-blur-md shadow-lg text-xs text-white max-w-[210px]">
        <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{lang === "np" ? "वर्षा जोखिम" : "Rainfall Risk"} ({timeWindow})</span>
          <span className="text-[10px] text-blue-400 font-bold">DHM</span>
        </div>
        <div className="space-y-1.5 font-medium text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C51D34] border border-white flex-shrink-0 animate-pulse" />
            <span>&gt; 100 mm ({lang === "np" ? "खतरा" : "Danger"})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] border border-white/50 flex-shrink-0" />
            <span>50 - 100 mm ({lang === "np" ? "चेतावनी" : "Warning"})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] border border-white/50 flex-shrink-0" />
            <span>25 - 50 mm ({lang === "np" ? "सतर्कता" : "Watch"})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-white/50 flex-shrink-0" />
            <span>&lt; 25 mm ({lang === "np" ? "सामान्य" : "Normal"})</span>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons (Top Right) */}
      <div className="absolute top-4 right-14 z-20 flex items-center gap-2">
        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 text-xs font-semibold text-slate-200 shadow-md transition-all active:scale-95"
          title={t.recenterNepal}
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{t.recenterNepal}</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 text-slate-200 shadow-md transition-all active:scale-95"
          title={isFullscreen ? t.exitFullscreen : t.fullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* INSAT-3D Satellite Launcher */}
        {onOpenSatelliteViewer && (
          <button
            onClick={onOpenSatelliteViewer}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C51D34] hover:bg-[#A8152A] border border-white/20 text-xs font-bold text-white shadow-md transition-all active:scale-95"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>INSAT-3D</span>
          </button>
        )}
      </div>

      {/* Trajectory pill */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A]/95 border border-slate-800 text-[11px] text-white backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#C51D34] animate-pulse" />
        <span className="font-bold text-[#FF4D6D]">{lang === "np" ? "प्रवाह दिशा:" : "Trajectory:"}</span>
        <span className="text-slate-300">Bay of Bengal &rarr; Koshi & Bagmati</span>
      </div>
    </div>
  );
}
