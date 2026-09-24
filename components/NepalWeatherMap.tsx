"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DistrictWeatherSummary, BayOfBengalTelemetry } from "@/lib/types";
import { MapLayerType, ForecastTimeWindow } from "./MapControls";

interface NepalWeatherMapProps {
  districtsData: DistrictWeatherSummary[];
  telemetry: BayOfBengalTelemetry;
  activeLayer: MapLayerType;
  timeWindow: ForecastTimeWindow;
  radarHost?: string;
  radarPath?: string;
  satellitePath?: string;
  selectedDistrictId?: string;
  onSelectDistrict: (districtId: string) => void;
  mapCenterFocus?: [number, number] | null;
}

export default function NepalWeatherMap({
  districtsData,
  telemetry,
  activeLayer,
  timeWindow,
  radarHost = "https://tilecache.rainviewer.com",
  radarPath,
  satellitePath,
  selectedDistrictId,
  onSelectDistrict,
  mapCenterFocus,
}: NepalWeatherMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riversLayerRef = useRef<L.LayerGroup | null>(null);
  const stormLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Nepal geographical center: ~28.2°N, 84.4°E
    const map = L.map(mapContainerRef.current, {
      center: [27.7, 85.5],
      zoom: 7,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: false,
    });

    // Custom Top-Right Zoom Control
    L.control.zoom({ position: "topright" }).addTo(map);

    // Dark Matter basemap (CartoDB) - high performance & free
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Create Layer Groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    riversLayerRef.current = L.layerGroup().addTo(map);
    stormLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
        opacity: 0.75,
        zIndex: 50,
      });
      radarLayer.addTo(mapRef.current);
      radarLayerRef.current = radarLayer;
    }
  }, [activeLayer, radarPath, radarHost]);

  // Handle Satellite Cloud Layer changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (satelliteLayerRef.current) {
      mapRef.current.removeLayer(satelliteLayerRef.current);
      satelliteLayerRef.current = null;
    }

    if (activeLayer === "satellite" && satellitePath) {
      const satUrl = `${radarHost}${satellitePath}/256/{z}/{x}/{y}/0/0_0.png`;
      const satLayer = L.tileLayer(satUrl, {
        opacity: 0.65,
        zIndex: 45,
      });
      satLayer.addTo(mapRef.current);
      satelliteLayerRef.current = satLayer;
    }
  }, [activeLayer, satellitePath, radarHost]);

  // Render Bay of Bengal storm center & moisture trajectory vector
  useEffect(() => {
    if (!stormLayerRef.current) return;
    stormLayerRef.current.clearLayers();

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

    stormLayerRef.current.addLayer(stormMarker);

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
        weight: 3,
        dashArray: "6, 8",
        opacity: 0.8,
      }
    );
    stormLayerRef.current.addLayer(trajectoryLine);
  }, [telemetry]);

  // Render Major River Basins (Koshi, Bagmati, Narayani, Karnali)
  useEffect(() => {
    if (!riversLayerRef.current) return;
    riversLayerRef.current.clearLayers();

    if (activeLayer === "rivers") {
      // Approximate river paths across Nepal
      const koshiLine = L.polyline(
        [
          [27.9, 86.8], // Everest/Dudhkoshi
          [27.3, 87.1], // Arun junction
          [26.88, 87.15], // Chatara
          [26.5, 86.95], // Saptakoshi Barrage
        ],
        { color: "#38BDF8", weight: 4, opacity: 0.85 }
      ).bindPopup("<strong>Koshi Basin</strong> (Saptakoshi / Chatara) - High Discharge Alert");

      const bagmatiLine = L.polyline(
        [
          [27.8, 85.4], // Shivapuri / Bagdwar
          [27.68, 85.31], // Kathmandu Valley
          [27.4, 85.25], // Sisneri / Kulekhani
          [27.0, 85.45], // Karmaiya Barrage
          [26.7, 85.3], // Rautahat Plains
        ],
        { color: "#003893", weight: 4, opacity: 0.85 }
      ).bindPopup("<strong>Bagmati River Basin</strong> - Flash flood risk in valley and Terai plains");

      const narayaniLine = L.polyline(
        [
          [28.8, 83.8], // Kali Gandaki
          [28.2, 84.4], // Marshyangdi
          [27.9, 84.5], // Trishuli
          [27.7, 84.42], // Devghat confluence
          [27.5, 84.3], // Narayanghat / Chitwan
        ],
        { color: "#60A5FA", weight: 4, opacity: 0.85 }
      ).bindPopup("<strong>Narayani / Gandaki Basin</strong> - Major inflow from Annapurna/Trishuli");

      const karnaliLine = L.polyline(
        [
          [29.8, 81.8], // Humla Karnali
          [29.1, 81.6], // Kalikot
          [28.65, 81.28], // Chisapani Gorge
          [28.3, 81.1], // Bardiya Plains
        ],
        { color: "#0284C7", weight: 4, opacity: 0.85 }
      ).bindPopup("<strong>Karnali River Basin</strong> - Western flow");

      riversLayerRef.current.addLayer(koshiLine);
      riversLayerRef.current.addLayer(bagmatiLine);
      riversLayerRef.current.addLayer(narayaniLine);
      riversLayerRef.current.addLayer(karnaliLine);
    }
  }, [activeLayer]);

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
    <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[620px] rounded-2xl overflow-hidden border-2 border-[#003893] shadow-2xl bg-[#060E1D]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Legend (Nepal Flag Theme) */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-[#071326]/90 border border-[#1A365D] backdrop-blur-md shadow-xl text-xs text-white max-w-[200px]">
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
    </div>
  );
}
