"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DistrictWeatherSummary, NDRRMAAlert, DHMRainStation, AirQualityStation } from "@/lib/types";
import { MapLayerType, ForecastTimeWindow, BasemapType } from "./MapControls";
import { DHMRiverStation } from "@/app/api/dhm/route";
import { Language, TRANSLATIONS } from "@/lib/translations";
import { NEPAL_RIVER_SYSTEMS } from "@/data/nepalRivers";
import { Maximize2, Minimize2, Crosshair, Satellite, ChevronUp, ChevronDown } from "lucide-react";

interface NepalWeatherMapProps {
  districtsData: DistrictWeatherSummary[];
  dhmRivers?: DHMRiverStation[];
  ndrrmaAlerts?: NDRRMAAlert[];
  rainStations?: DHMRainStation[];
  aqiStations?: AirQualityStation[];
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
  theme?: "light" | "dark";
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
    description: "Monitors Eastern Nepal, Koshi basin & eastern Terai.",
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
  ndrrmaAlerts = [],
  rainStations = [],
  aqiStations = [],
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
  theme = "light",
}: NepalWeatherMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riversLayerRef = useRef<L.LayerGroup | null>(null);
  const dhmRadarLayerRef = useRef<L.LayerGroup | null>(null);
  const ndrrmaLayerRef = useRef<L.LayerGroup | null>(null);
  const observedLayerRef = useRef<L.LayerGroup | null>(null);
  const borderLayerRef = useRef<L.LayerGroup | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  const t = TRANSLATIONS[lang];

  const isDark = theme === "dark";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const textMuted = isDark ? "#64748b" : "#64748b";
  const borderLight = isDark ? "#334155" : "#e2e8f0";
  const boxBg = isDark ? "#1e293b" : "#f1f5f9";

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const map = L.map(mapContainerRef.current, {
      center: isMobile ? [28.1, 84.1] : [28.2, 84.4],
      zoom: isMobile ? 6 : 7,
      minZoom: 5,
      maxZoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Initial free basemap: ESRI World Light Gray Base (or Dark Gray Base if dark)
    const initialUrl =
      theme === "dark"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";

    const baseLayer = L.tileLayer(initialUrl, {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> contributors',
      maxZoom: 16,
    }).addTo(map);

    baseTileLayerRef.current = baseLayer;

    // Create Layer Groups
    borderLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    riversLayerRef.current = L.layerGroup().addTo(map);
    dhmRadarLayerRef.current = L.layerGroup().addTo(map);
    ndrrmaLayerRef.current = L.layerGroup().addTo(map);
    observedLayerRef.current = L.layerGroup().addTo(map);

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

  // Handle Basemap Switch (Dark/Light Canvas, Satellite, OSM)
  useEffect(() => {
    if (!mapRef.current) return;

    if (baseTileLayerRef.current) {
      mapRef.current.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }

    let url =
      theme === "dark"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
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
  }, [basemap, activeLayer, theme]);

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
          <div style="font-family: inherit; font-size: 12px; color: ${textPrimary}; padding: 2px; min-width: 190px;">
            <div style="font-weight: 800; color: #0284c7; margin-bottom: 3px; font-size: 13px;">
              ${lang === "np" ? radar.nepaliName : radar.name}
            </div>
            <div style="font-size: 11px; color: ${textSecondary}; margin-bottom: 4px;">${radar.location}</div>
            <div style="font-size: 11px; color: ${textPrimary}; margin-bottom: 4px;"><strong>Range:</strong> 200 km</div>
            <div style="font-size: 11px; color: ${textSecondary}; line-height: 1.4;">${radar.description}</div>
            <div style="margin-top: 6px; padding: 4px 6px; background: ${isDark ? "#003893" : "#dbeafe"}; color: ${isDark ? "#ffffff" : "#1e40af"}; border: 1px solid ${isDark ? "#1e427b" : "#bfdbfe"}; border-radius: 6px; font-size: 10px; font-weight: bold; text-align: center;">
              DHM Official Doppler Radar Station
            </div>
          </div>
        `);

        radarGroup.addLayer(circle);
        radarGroup.addLayer(marker);
      });
    }
  }, [activeLayer, lang, theme]);

  // Render Rivers & Live DHM River Gauges
  useEffect(() => {
    if (!riversLayerRef.current) return;
    const riversGroup = riversLayerRef.current;
    riversGroup.clearLayers();

    if (activeLayer === "rivers") {
      // 1. Render all 30+ major river systems and tributaries across Nepal
      NEPAL_RIVER_SYSTEMS.forEach((river) => {
        const polyline = L.polyline(river.coordinates, {
          color: river.color,
          weight: river.weight,
          opacity: isDark ? 0.85 : 0.9,
          lineJoin: "round",
          lineCap: "round",
        });

        const riverTitle = lang === "np" ? river.nepaliName : river.name;
        const basinTitle = lang === "np" ? `${river.basinNepali} जलाधार` : `${river.basin} River Basin`;

        polyline.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; color: ${textPrimary}; min-width: 210px; max-width: 270px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="background: ${river.color}22; color: ${river.color}; font-weight: 800; font-size: 9px; padding: 2px 6px; border-radius: 4px; border: 1px solid ${river.color}55; text-transform: uppercase;">
                ${basinTitle}
              </span>
            </div>
            <div style="font-weight: 800; font-size: 14px; color: ${textPrimary}; border-bottom: 1px solid ${borderLight}; padding-bottom: 4px; margin-bottom: 6px;">
              ${riverTitle}
            </div>
            <div style="font-size: 11px; color: ${textSecondary}; margin-bottom: 4px;">
              <strong style="color: ${textPrimary};">${lang === "np" ? "मुहान / उद्गम:" : "Origin:"}</strong> ${river.origin}
            </div>
            <div style="font-size: 11px; color: ${textSecondary}; line-height: 1.4; margin-bottom: 6px;">
              ${river.description}
            </div>
            <div style="font-size: 10px; color: ${textMuted}; border-top: 1px solid ${borderLight}; padding-top: 4px;">
              DHM / NDRRMA Nepal Hydrographic Network
            </div>
          </div>
        `);

        polyline.bindTooltip(riverTitle, {
          sticky: true,
          className: "river-tooltip",
        });

        riversGroup.addLayer(polyline);
      });

      // 2. Render all 100+ DHM / NDRRMA River Monitoring Stations
      dhmRivers.forEach((station) => {
        const isDanger = station.status === "Danger";
        const isWarning = station.status === "Warning";
        const gaugeColor = isDanger ? "#C51D34" : isWarning ? "#F59E0B" : "#10B981";

        const badgeBg = isDanger
          ? (isDark ? "#7f1d1d" : "#fee2e2")
          : isWarning
          ? (isDark ? "#78350f" : "#fef3c7")
          : (isDark ? "#064e3b" : "#d1fae5");

        const badgeText = isDanger
          ? (isDark ? "#fca5a5" : "#991b1b")
          : isWarning
          ? (isDark ? "#fcd34d" : "#92400e")
          : (isDark ? "#6ee7b7" : "#065f46");

        const badgeBorder = isDanger
          ? (isDark ? "#dc2626" : "#f87171")
          : isWarning
          ? (isDark ? "#d97706" : "#f59e0b")
          : (isDark ? "#059669" : "#10b981");

        const gaugeIcon = L.divIcon({
          className: "custom-gauge-marker",
          html: `
            <div class="relative flex items-center justify-center w-7 h-7 -ml-3.5 -mt-3.5">
              <div class="absolute inset-0 rounded-full" style="background-color: ${gaugeColor}; opacity: 0.5; ${
            isDanger || isWarning ? "animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;" : ""
          }"></div>
              <div class="relative flex items-center justify-center w-6 h-6 rounded-full border border-white text-white font-black text-[10px]" style="background-color: ${gaugeColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🌊
              </div>
            </div>
          `,
        });

        const marker = L.marker(station.coordinates, { icon: gaugeIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; color: ${textPrimary}; min-width: 190px; max-width: 250px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase;">
                ${station.basin || station.river}
              </span>
              ${station.steady ? `<span style="font-size: 9px; font-weight: 700; color: ${textMuted}; background: ${boxBg}; padding: 1px 5px; border-radius: 4px;">${station.steady}</span>` : ""}
            </div>
            <div style="font-weight: 800; font-size: 14px; color: ${textPrimary}; border-bottom: 1px solid ${borderLight}; padding-bottom: 4px; margin-bottom: 6px;">
              ${station.name}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px;">
              <span style="color: ${textSecondary};">${lang === "np" ? "हालको जलसतह (WL):" : "Current WL:"}</span>
              <span style="font-weight: 800; color: ${gaugeColor}; font-size: 13px;">${station.waterLevelM} m</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px;">
              <span style="color: ${textSecondary};">${lang === "np" ? "चेतावनी तह (WR):" : "Warning WR:"}</span>
              <span style="color: ${isDark ? "#fcd34d" : "#b45309"}; font-weight: 700;">${station.warningLevelM !== null ? `${station.warningLevelM} m` : "—"}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
              <span style="color: ${textSecondary};">${lang === "np" ? "खतरा तह (DL):" : "Danger DL:"}</span>
              <span style="color: #dc2626; font-weight: 700;">${station.dangerLevelM !== null ? `${station.dangerLevelM} m` : "—"}</span>
            </div>
            <div style="background: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeText}; padding: 4px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center; margin-bottom: 4px;">
              DHM: ${station.status.toUpperCase()}
            </div>
            <div style="font-size: 9px; color: ${textMuted}; text-align: right;">
              ${new Date(station.waterLevelOn).toLocaleString(lang === "np" ? "ne-NP" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · Source: DHM / hydrology.gov.np
            </div>
          </div>
        `);

        riversGroup.addLayer(marker);
      });
    }
  }, [activeLayer, dhmRivers, theme, lang]);

  // Render District Risk Markers
  useEffect(() => {
    if (!markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();
    // Station layers replace the forecast district markers so the two are never mixed up
    if (activeLayer === "observed" || activeLayer === "aqi") return;

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

      const alertBadge =
        district.alertLevel === "Danger"
          ? {
              bg: isDark ? "#7f1d1d" : "#fee2e2",
              text: isDark ? "#fca5a5" : "#991b1b",
              border: isDark ? "#dc2626" : "#f87171",
            }
          : district.alertLevel === "Warning"
          ? {
              bg: isDark ? "#78350f" : "#fef3c7",
              text: isDark ? "#fcd34d" : "#92400e",
              border: isDark ? "#d97706" : "#f59e0b",
            }
          : {
              bg: isDark ? "#064e3b" : "#d1fae5",
              text: isDark ? "#6ee7b7" : "#065f46",
              border: isDark ? "#059669" : "#10b981",
            };

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; color: ${textPrimary}; min-width: 180px;">
          <div style="font-weight: 800; font-size: 14px; color: ${textPrimary}; border-bottom: 1px solid ${borderLight}; padding-bottom: 4px; margin-bottom: 6px;">
            ${districtDisplayName}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: ${textSecondary};">${lang === "np" ? "प्रदेश:" : "Province:"}</span>
            <span style="font-weight: 600; color: ${textPrimary};">${district.provinceName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: ${textSecondary};">${timeWindow} ${lang === "np" ? "वर्षा:" : "Rain:"}</span>
            <span style="font-weight: 800; color: ${fillColor}; font-size: 14px;">${rainMm} mm</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: ${textSecondary};">${lang === "np" ? "तापक्रम:" : "Temp:"}</span>
            <span style="color: ${textPrimary}; font-weight: 600;">${district.current.temperature}°C</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: ${textSecondary};">${lang === "np" ? "उचाइ:" : "Elevation:"}</span>
            <span style="color: ${textPrimary}; font-weight: 600;">${district.elevation}m</span>
          </div>
          <div style="background: ${alertBadge.bg}; border: 1px solid ${alertBadge.border}; color: ${alertBadge.text}; padding: 4px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center;">
            ${t.dhmAlert} ${district.alertLevel.toUpperCase()}
          </div>
          <div style="margin-top: 6px; text-align: center; color: #0284c7; font-size: 11px; font-weight: 600; text-decoration: underline; cursor: pointer;">
            ${lang === "np" ? "७२ घण्टे विस्तृत विवरण हेर्नुहोस् →" : "View 72h detailed forecast →"}
          </div>
        </div>
      `;

      circleMarker.bindPopup(popupHtml);
      circleMarker.on("click", () => onSelectDistrict(district.districtId));
      markersGroup.addLayer(circleMarker);
    });
  }, [districtsData, timeWindow, selectedDistrictId, onSelectDistrict, lang, t.dhmAlert, theme, activeLayer]);

  // Render measured-rain gauges or air-quality stations
  useEffect(() => {
    if (!observedLayerRef.current) return;
    const group = observedLayerRef.current;
    group.clearLayers();
    const fmt = (iso: string) =>
      new Date(iso).toLocaleString(lang === "np" ? "ne-NP" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    if (activeLayer === "observed") {
      // Draw light values first so heavy-rain gauges sit on top
      [...rainStations].reverse().forEach((st) => {
        const mm = st.rain24h;
        const fill = mm === null ? "#94a3b8" : mm >= 100 ? "#C51D34" : mm >= 50 ? "#F59E0B" : mm >= 25 ? "#FACC15" : mm > 0 ? "#38BDF8" : "#CBD5E1";
        const marker = L.circleMarker(st.coordinates, {
          radius: mm !== null && mm >= 50 ? 8 : 5.5,
          fillColor: fill,
          color: isDark ? "#0f172a" : "#ffffff",
          weight: 1,
          fillOpacity: 0.95,
        });
        const row = (label: string, v: number | null) =>
          `<div style="display:flex;justify-content:space-between;font-size:11px;"><span style="color:${textSecondary};">${label}</span><b>${v ?? "—"} mm</b></div>`;
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: ${textPrimary}; min-width: 170px;">
            <div style="font-weight: 800; font-size: 13px; border-bottom: 1px solid ${borderLight}; padding-bottom: 4px; margin-bottom: 4px;">${st.name}</div>
            ${row("1h", st.rain1h)}${row("3h", st.rain3h)}${row("6h", st.rain6h)}${row("12h", st.rain12h)}${row("24h", st.rain24h)}
            ${st.status !== "Normal" ? `<div style="margin-top:4px;font-weight:700;color:#b45309;">DHM: ${st.status.toUpperCase()}</div>` : ""}
            <div style="font-size: 9px; color: ${textMuted}; margin-top: 4px;">${fmt(st.measuredOn)} · Source: DHM / hydrology.gov.np</div>
          </div>
        `);
        group.addLayer(marker);
      });
    } else if (activeLayer === "aqi") {
      aqiStations.forEach((st) => {
        const icon = L.divIcon({
          className: "custom-aqi-marker",
          html: `<div style="transform: translate(-50%, -50%); min-width: 30px; padding: 2px 5px; border-radius: 9999px; background: ${st.aqiColor || "#94a3b8"}; color: #0f172a; font-weight: 800; font-size: 11px; text-align: center; border: 1px solid #0f172a33; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${st.aqi}</div>`,
        });
        const marker = L.marker(st.coordinates, { icon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: ${textPrimary}; min-width: 160px;">
            <div style="font-weight: 800; font-size: 13px;">${lang === "np" && st.nepaliName ? st.nepaliName : st.name}</div>
            <div style="margin-top: 4px;">AQI <b>${st.aqi}</b>${st.pm25 !== null ? ` · PM2.5 <b>${st.pm25}</b> µg/m³` : ""}</div>
            <div style="font-size: 9px; color: ${textMuted}; margin-top: 4px;">${fmt(st.measuredOn)} · Source: pollution.gov.np</div>
          </div>
        `);
        group.addLayer(marker);
      });
    }
  }, [activeLayer, rainStations, aqiStations, lang, theme]);

  // Render NDRRMA Disaster Alerts
  useEffect(() => {
    if (!ndrrmaLayerRef.current) return;
    const alertGroup = ndrrmaLayerRef.current;
    alertGroup.clearLayers();

    ndrrmaAlerts.forEach((alert) => {
      if (!alert.lat || !alert.lon) return;

      const title = lang === "np" && alert.titleNe ? alert.titleNe : alert.title;
      const formattedDate = new Date(alert.startedOn).toLocaleDateString(
        lang === "np" ? "ne-NP" : "en-US",
        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
      );

      const alertIcon = L.divIcon({
        className: "custom-ndrrma-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-left: -14px; margin-top: -14px; cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #f59e0b; opacity: 0.6; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 9999px; background-color: #d97706; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); color: white; font-size: 11px;">
              ⚠️
            </div>
          </div>
        `,
      });

      const marker = L.marker([alert.lat, alert.lon], { icon: alertIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; color: ${textPrimary}; min-width: 190px; max-width: 250px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: ${isDark ? "#78350f" : "#fef3c7"}; color: ${isDark ? "#fcd34d" : "#92400e"}; border: 1px solid ${isDark ? "#d97706" : "#f59e0b"}; font-weight: 800; font-size: 9px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${alert.referenceType || "NDRRMA"}
            </span>
            <span style="font-size: 10px; color: ${textMuted}; font-family: monospace;">#${alert.id}</span>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: ${textPrimary}; line-height: 1.3; margin-bottom: 6px;">
            ${title}
          </div>
          <div style="font-size: 11px; color: ${textSecondary}; margin-bottom: 4px;">
            <strong style="color: ${textPrimary};">${lang === "np" ? "जारी समय:" : "Issued:"}</strong> ${formattedDate}
          </div>
          ${
            alert.householdCount
              ? `<div style="font-size: 11px; color: #dc2626; font-weight: 700; margin-bottom: 4px;">
                  ⚠️ ${lang === "np" ? "प्रभावित घरधुरी:" : "Affected Households:"} ${alert.householdCount}
                </div>`
              : ""
          }
          <div style="font-size: 10px; color: ${textMuted}; border-top: 1px solid ${borderLight}; padding-top: 4px; margin-top: 4px;">
            Source: ${alert.source || "NDRRMA BIPAD Portal"}
          </div>
        </div>
      `);

      alertGroup.addLayer(marker);
    });
  }, [ndrrmaAlerts, lang, theme]);

  // Re-center on Nepal
  const handleRecenter = () => {
    if (mapRef.current) {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      mapRef.current.flyTo(isMobile ? [28.1, 84.1] : [28.2, 84.4], isMobile ? 6 : 7, { duration: 1.0 });
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#080D16] shadow-sm dark:shadow-xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[390px] sm:h-[530px] lg:h-[630px]"
      }`}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Legend (Collapsible on mobile) */}
      <div className="absolute bottom-3 left-3 z-20">
        {/* Mobile Toggle Pill */}
        <button
          onClick={() => setIsLegendExpanded(!isLegendExpanded)}
          className="sm:hidden px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-100 shadow-md flex items-center gap-1.5 backdrop-blur-md active:scale-95 touch-manipulation"
        >
          <span className="w-2 h-2 rounded-full bg-[#C51D34] animate-pulse" />
          <span>{lang === "np" ? "वर्षा संकेत" : "Rain Legend"}</span>
          {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {/* Legend Content */}
        <div
          className={`${
            isLegendExpanded ? "block mt-1.5" : "hidden"
          } sm:block p-3 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-md text-xs text-slate-800 dark:text-white max-w-[210px] transition-colors`}
        >
          <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
            <span>
              {activeLayer === "aqi"
                ? "AQI"
                : activeLayer === "observed"
                ? lang === "np" ? "मापन वर्षा (२४ घण्टा)" : "Measured rain (24h)"
                : `${lang === "np" ? "पूर्वानुमान वर्षा" : "Forecast rain"} (${timeWindow})`}
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
              {activeLayer === "aqi" ? "DoE" : activeLayer === "observed" ? "DHM" : "Open-Meteo"}
            </span>
          </div>
          <div className="space-y-1.5 font-medium text-[11px]">
            {(activeLayer === "aqi"
              ? [
                  ["#FF0000", "151 – 200+", lang === "np" ? "अस्वस्थ" : "Unhealthy"],
                  ["#FF7300", "101 – 150", lang === "np" ? "संवेदनशीलका लागि अस्वस्थ" : "Sensitive groups"],
                  ["#FFFF00", "51 – 100", lang === "np" ? "मध्यम" : "Moderate"],
                  ["#00E400", "0 – 50", lang === "np" ? "राम्रो" : "Good"],
                ]
              : [
                  ["#C51D34", "> 100 mm", lang === "np" ? "धेरै भारी" : "Very heavy"],
                  ["#F59E0B", "50 – 100 mm", lang === "np" ? "भारी" : "Heavy"],
                  ["#FACC15", "25 – 50 mm", lang === "np" ? "मध्यम" : "Moderate"],
                  [activeLayer === "observed" ? "#38BDF8" : "#10B981", "< 25 mm", lang === "np" ? "हल्का" : "Light"],
                ]
            ).map(([color, range, label]) => (
              <div key={range} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-white/50 flex-shrink-0" style={{ backgroundColor: color }} />
                <span>
                  {range} ({label})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons (Top Right) */}
      <div className="absolute top-3 right-12 sm:top-4 sm:right-14 z-20 flex items-center gap-1.5 sm:gap-2">
        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all active:scale-95 touch-manipulation"
          title={t.recenterNepal}
        >
          <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span className="hidden sm:inline">{t.recenterNepal}</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all active:scale-95 touch-manipulation flex items-center gap-1"
          title={isFullscreen ? t.exitFullscreen : t.fullscreen}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span className="hidden sm:inline text-xs">{t.exitFullscreen}</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">{t.fullscreen}</span>
            </>
          )}
        </button>

        {/* INSAT-3D Satellite Launcher */}
        {onOpenSatelliteViewer && (
          <button
            onClick={onOpenSatelliteViewer}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C51D34] hover:bg-[#A8152A] border border-white/20 text-xs font-bold text-white shadow-xs transition-all active:scale-95 touch-manipulation"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>INSAT-3D</span>
          </button>
        )}
      </div>

    </div>
  );
}
