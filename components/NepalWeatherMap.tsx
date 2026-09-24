"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DistrictWeatherSummary, BayOfBengalTelemetry } from "@/lib/types";
import { MapLayerType, ForecastTimeWindow, BasemapType } from "./MapControls";
import { DHMRiverStation } from "@/app/api/dhm/route";

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
}

// DHM Doppler Weather Radar Stations in Nepal
const DHM_DOPPLER_RADARS = [
  {
    name: "Ratananagar Doppler Radar (Surkhet)",
    location: "Karnali Province",
    lat: 28.5833,
    lon: 81.6667,
    radiusM: 200000, // 200 km scan radius
    description: "Monitors Western Nepal, Karnali basin & Bheri river systems.",
  },
  {
    name: "Ribdikot Doppler Radar (Palpa)",
    location: "Lumbini Province",
    lat: 27.8667,
    lon: 83.5167,
    radiusM: 200000, // 200 km scan radius
    description: "Monitors Central Nepal, Gandaki basin, Pokhara valley & Narayani river.",
  },
  {
    name: "Rauta Doppler Radar (Udayapur)",
    location: "Koshi Province",
    lat: 26.9667,
    lon: 86.5833,
    radiusM: 200000, // 200 km scan radius
    description: "Primary eastern early-warning radar facing moisture ingress from the Bay of Bengal.",
  },
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
}: NepalWeatherMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riversLayerRef = useRef<L.LayerGroup | null>(null);
  const stormLayerRef = useRef<L.LayerGroup | null>(null);
  const dhmRadarLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Nepal geographical center: ~27.7°N, 85.5°E
    const map = L.map(mapContainerRef.current, {
      center: [27.7, 85.5],
      zoom: 7,
      minZoom: 5,
      maxZoom: 13,
      zoomControl: false,
    });

    // Custom Top-Right Zoom Control
    L.control.zoom({ position: "topright" }).addTo(map);

    // Initial free basemap: ESRI World Dark Gray Base (NO API KEY REQUIRED)
    const baseLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          '&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap contributors',
        maxZoom: 16,
      }
    ).addTo(map);

    baseTileLayerRef.current = baseLayer;

    // Create Layer Groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    riversLayerRef.current = L.layerGroup().addTo(map);
    stormLayerRef.current = L.layerGroup().addTo(map);
    dhmRadarLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Basemap Switch (Dark Canvas, Satellite Imagery, OpenStreetMap)
  useEffect(() => {
    if (!mapRef.current) return;

    if (baseTileLayerRef.current) {
      mapRef.current.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }

    let url = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
    let attribution = '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ';

    if (basemap === "satellite" || activeLayer === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics, USDA, USGS';
    } else if (basemap === "osm") {
      url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }

    const newBase = L.tileLayer(url, {
      attribution,
      maxZoom: 18,
    });
    newBase.addTo(mapRef.current);
    baseTileLayerRef.current = newBase;
  }, [basemap, activeLayer]);

  // Handle programmatic focus (e.g. clicking "Focus on Eastern Nepal")
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

  // Render DHM Doppler Weather Radars (Scan ranges)
  useEffect(() => {
    if (!dhmRadarLayerRef.current) return;
    const radarGroup = dhmRadarLayerRef.current;
    radarGroup.clearLayers();

    if (activeLayer === "radar") {
      DHM_DOPPLER_RADARS.forEach((radar) => {
        // Scan radius circle (200km)
        const circle = L.circle([radar.lat, radar.lon], {
          radius: radar.radiusM,
          color: "#00E5FF",
          fillColor: "#00E5FF",
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: "5, 8",
        });

        // Station Center Marker
        const stationIcon = L.divIcon({
          className: "custom-radar-icon",
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4">
              <div class="absolute inset-0 rounded-full bg-[#00E5FF] opacity-50 animate-ping"></div>
              <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#003893] border-2 border-[#00E5FF] text-white shadow-lg text-xs font-bold">
                📡
              </div>
            </div>
          `,
        });

        const marker = L.marker([radar.lat, radar.lon], { icon: stationIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #fff;">
            <div style="font-weight: 800; color: #00E5FF; margin-bottom: 4px;">
              ${radar.name}
            </div>
            <div style="color: #93c5fd; margin-bottom: 4px;">${radar.location}</div>
            <div style="font-size: 11px; margin-bottom: 4px;"><strong>Radar Range:</strong> 200 km</div>
            <div style="font-size: 11px; color: #e2e8f0; line-height: 1.4;">${radar.description}</div>
            <div style="margin-top: 6px; padding: 3px 6px; background: #003893; border-radius: 4px; font-size: 10px; font-weight: bold; text-align: center;">
              DHM Official Doppler Radar Station
            </div>
          </div>
        `);

        radarGroup.addLayer(circle);
        radarGroup.addLayer(marker);
      });
    }
  }, [activeLayer]);

  // Render Bay of Bengal storm center & moisture trajectory vector
  useEffect(() => {
    if (!stormLayerRef.current) return;
    const stormGroup = stormLayerRef.current;
    stormGroup.clearLayers();

    // 1. Storm center icon in Bay of Bengal
    const stormIcon = L.divIcon({
      className: "custom-storm-marker",
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5">
          <div class="absolute inset-0 rounded-full bg-[#DC143C] opacity-75 animate-ping"></div>
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#DC143C] border-2 border-white shadow-xl shadow-red-600/50 text-white font-bold text-xs">
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
        <div style="font-weight: 800; color: #ff3358; margin-bottom: 4px; text-transform: uppercase;">
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

    // 2. Trajectory flow arrow from Bay of Bengal into Eastern Nepal (Biratnagar / Koshi)
    const trajectoryLine = L.polyline(
      [
        [telemetry.coordinates.lat, telemetry.coordinates.lon],
        [22.5, 88.0], // West Bengal Gangetic Delta
        [24.8, 87.5], // Northern Bengal / Bihar Border
        [26.4525, 87.2718], // Biratnagar / Koshi Basin
        [27.7172, 85.3240], // Kathmandu Valley
      ],
      {
        color: "#DC143C",
        weight: 3.5,
        dashArray: "6, 8",
        opacity: 0.85,
      }
    );
    stormGroup.addLayer(trajectoryLine);
  }, [telemetry]);

  // Render Major River Basins & Live DHM River Station Gauges
  useEffect(() => {
    if (!riversLayerRef.current) return;
    const riversGroup = riversLayerRef.current;
    riversGroup.clearLayers();

    if (activeLayer === "rivers") {
      // 1. River network lines
      const koshiLine = L.polyline(
        [
          [27.9, 86.8],
          [27.3, 87.1],
          [26.88, 87.15],
          [26.5, 86.95],
        ],
        { color: "#38BDF8", weight: 4.5, opacity: 0.85 }
      ).bindPopup("<strong>Koshi Basin</strong> (Saptakoshi / Chatara) - High Discharge Alert");

      const bagmatiLine = L.polyline(
        [
          [27.8, 85.4],
          [27.68, 85.31],
          [27.4, 85.25],
          [27.0, 85.45],
          [26.7, 85.3],
        ],
        { color: "#003893", weight: 4.5, opacity: 0.85 }
      ).bindPopup("<strong>Bagmati River Basin</strong> - Flash flood risk in valley and Terai plains");

      const narayaniLine = L.polyline(
        [
          [28.8, 83.8],
          [28.2, 84.4],
          [27.9, 84.5],
          [27.7, 84.42],
          [27.5, 84.3],
        ],
        { color: "#60A5FA", weight: 4.5, opacity: 0.85 }
      ).bindPopup("<strong>Narayani / Gandaki Basin</strong> - Major inflow from Annapurna/Trishuli");

      const karnaliLine = L.polyline(
        [
          [29.8, 81.8],
          [29.1, 81.6],
          [28.65, 81.28],
          [28.3, 81.1],
        ],
        { color: "#0284C7", weight: 4.5, opacity: 0.85 }
      ).bindPopup("<strong>Karnali River Basin</strong> - Western flow");

      riversGroup.addLayer(koshiLine);
      riversGroup.addLayer(bagmatiLine);
      riversGroup.addLayer(narayaniLine);
      riversGroup.addLayer(karnaliLine);

      // 2. Plot Real DHM River Station Gauges
      dhmRivers.forEach((station) => {
        const isDanger = station.status === "Danger";
        const isWarning = station.status === "Warning";
        const gaugeColor = isDanger ? "#DC143C" : isWarning ? "#F59E0B" : "#10B981";

        const gaugeIcon = L.divIcon({
          className: "custom-gauge-marker",
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4">
              <div class="absolute inset-0 rounded-full" style="background-color: ${gaugeColor}; opacity: 0.6; ${
            isDanger || isWarning ? "animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;" : ""
          }"></div>
              <div class="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-xl text-white font-black text-[10px]" style="background-color: ${gaugeColor};">
                🌊
              </div>
            </div>
          `,
        });

        const marker = L.marker(station.coordinates, { icon: gaugeIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; color: #fff; min-width: 180px;">
            <div style="font-weight: 800; font-size: 13px; color: #fff; border-bottom: 1px solid #1E427B; padding-bottom: 3px; margin-bottom: 6px;">
              ${station.name}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #93c5fd;">Current Water Level (WL):</span>
              <span style="font-weight: 800; color: ${gaugeColor};">${station.waterLevelM} m</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #93c5fd;">Warning Level (WR):</span>
              <span style="color: #f59e0b; font-weight: 600;">${station.warningLevelM} m</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #93c5fd;">Danger Level (DL):</span>
              <span style="color: #ef4444; font-weight: 600;">${station.dangerLevelM} m</span>
            </div>
            <div style="background: ${gaugeColor}22; border: 1px solid ${gaugeColor}; color: #fff; padding: 4px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center;">
              DHM Status: ${station.status.toUpperCase()} (${station.percentOfWarning}% of Warning)
            </div>
          </div>
        `);

        riversGroup.addLayer(marker);
      });
    }
  }, [activeLayer, dhmRivers]);

  // Render District Risk Markers (Color-coded circle markers for all 77 districts)
  useEffect(() => {
    if (!markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    districtsData.forEach((district) => {
      // Determine rainfall metric based on active time window
      const rainMm =
        timeWindow === "24h"
          ? district.total24hRain
          : timeWindow === "48h"
          ? district.total48hRain
          : district.total72hRain;

      // Color coding (Nepal Flag Crimson for Danger, Amber for Warning, Yellow for Watch, Emerald for Normal)
      let fillColor = "#10B981"; // Emerald (<25mm)
      let borderColor = "#059669";
      let pulseClass = "";

      if (rainMm >= 100) {
        fillColor = "#DC143C"; // Crimson Red (Danger)
        borderColor = "#FFFFFF";
        pulseClass = "beacon-danger";
      } else if (rainMm >= 50) {
        fillColor = "#F59E0B"; // Amber Orange (Warning)
        borderColor = "#D97706";
      } else if (rainMm >= 25) {
        fillColor = "#FACC15"; // Yellow (Watch)
        borderColor = "#CA8A04";
      }

      const isSelected = selectedDistrictId === district.districtId;
      const radius = isSelected ? 12 : district.elevation > 1500 ? 7 : 8;

      const circleMarker = L.circleMarker([district.lat, district.lon], {
        radius: radius,
        fillColor: fillColor,
        color: isSelected ? "#FFFFFF" : borderColor,
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: 0.85,
        className: rainMm >= 100 ? pulseClass : "",
      });

      // Interactive popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; color: #fff; min-width: 170px;">
          <div style="font-weight: 800; font-size: 14px; color: #ffffff; border-bottom: 1px solid #1E427B; padding-bottom: 4px; margin-bottom: 6px;">
            ${district.districtName}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #93c5fd;">Province:</span>
            <span style="font-weight: 600;">${district.provinceName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #93c5fd;">${timeWindow} Rain:</span>
            <span style="font-weight: 800; color: ${fillColor}; font-size: 14px;">${rainMm} mm</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #93c5fd;">Current Temp:</span>
            <span>${district.current.temperature}°C</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #93c5fd;">Wind Gusts:</span>
            <span>${district.current.windGusts} km/h</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #93c5fd;">Elevation:</span>
            <span>${district.elevation} m</span>
          </div>
          <div style="background: ${fillColor}22; border: 1px solid ${fillColor}; color: #fff; padding: 4px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center;">
            DHM Alert: ${district.alertLevel.toUpperCase()}
          </div>
          <div style="margin-top: 6px; text-align: center; color: #38bdf8; font-size: 11px; text-decoration: underline; cursor: pointer;">
            Click to view 72h hourly forecast &rarr;
          </div>
        </div>
      `;

      circleMarker.bindPopup(popupHtml);

      circleMarker.on("click", () => {
        onSelectDistrict(district.districtId);
      });

      markersGroup.addLayer(circleMarker);
    });
  }, [districtsData, timeWindow, selectedDistrictId, onSelectDistrict]);

  return (
    <div className="relative w-full h-[460px] sm:h-[560px] lg:h-[630px] rounded-2xl overflow-hidden border-2 border-[#003893] shadow-2xl bg-[#060E1D]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Legend (Nepal Flag Theme) */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-[#071326]/95 border border-[#1A365D] backdrop-blur-md shadow-xl text-xs text-white max-w-[210px]">
        <div className="font-bold text-[11px] uppercase tracking-wider text-blue-200 mb-2 border-b border-[#1A365D] pb-1 flex items-center justify-between">
          <span>Rainfall Risk ({timeWindow})</span>
          <span className="text-[10px] text-blue-400">DHM</span>
        </div>
        <div className="space-y-1.5 font-medium text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#DC143C] border border-white flex-shrink-0 animate-pulse" />
            <span>&gt; 100 mm (Danger)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white/50 flex-shrink-0" />
            <span>50 - 100 mm (Warning)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FACC15] border border-white/50 flex-shrink-0" />
            <span>25 - 50 mm (Watch)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10B981] border border-white/50 flex-shrink-0" />
            <span>&lt; 25 mm (Normal)</span>
          </div>
        </div>
      </div>

      {/* Floating System Vector Indicator (Top Left) */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#071326]/90 border border-[#DC143C]/50 text-[11px] text-white backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#DC143C] animate-ping" />
        <span className="font-bold text-[#FF4D6D]">Trajectory:</span>
        <span className="text-blue-200">Bay of Bengal &rarr; Koshi & Bagmati</span>
      </div>

      {/* Floating Satellite Viewer Launcher Button (Top Right next to zoom) */}
      {onOpenSatelliteViewer && (
        <button
          onClick={onOpenSatelliteViewer}
          className="absolute top-4 right-14 z-20 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DC143C] hover:bg-[#B50F31] border border-white/30 text-xs font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <span>🛰️ Live INSAT-3D Satellite</span>
        </button>
      )}
    </div>
  );
}
