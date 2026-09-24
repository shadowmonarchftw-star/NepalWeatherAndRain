"use client";

import React, { useState } from "react";
import {
  X,
  Satellite,
  RefreshCw,
  ZoomIn,
  Info,
  ShieldCheck,
  Flame,
  Droplets,
  Sun,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface LiveSatelliteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "en" | "np";
}

type SatelliteProduct = "ir1" | "wv" | "ctbt" | "vis";

export default function LiveSatelliteModal({ isOpen, onClose, lang = "en" }: LiveSatelliteModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<SatelliteProduct>("ir1");
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!isOpen) return null;

  const SATELLITE_PRODUCTS: Record<
    SatelliteProduct,
    {
      title: string;
      nepali: string;
      band: string;
      dotColor: string;
      url: string;
      description: string;
      guidance: string;
      icon: any;
      color: string;
      badgeText: string;
    }
  > = {
    ir1: {
      title: "INSAT-3D Infrared (TIR1 - 10.8 µm)",
      nepali: "इन्फ्रारेड बादल तथा चक्रवात",
      band: "Band: 10.8 µm Thermal IR (Grayscale Cloud Tops)",
      dotColor: "bg-cyan-400",
      url: `https://mausam.imd.gov.in/Satellite/3Dasiasec_ir1.jpg?t=${timestamp}`,
      description:
        "Continuous 24-hour thermal radiometer imagery. Cold, tall thunderstorm summits appear as bright white patches over Nepal and the Bay of Bengal.",
      guidance:
        "Active 24/7. High-altitude storm clouds and cyclone spiral bands show up in crisp white contrast against darker land.",
      icon: Satellite,
      color: "text-cyan-400",
      badgeText: "Thermal IR (24h)",
    },
    wv: {
      title: "INSAT-3D Water Vapor (WV - 6.8 µm)",
      nepali: "जलवाष्प तथा ओसिलो हावाको प्रवाह",
      band: "Band: 6.8 µm Water Vapor (Atmospheric Moisture River)",
      dotColor: "bg-blue-400",
      url: `https://mausam.imd.gov.in/Satellite/3Dasiasec_wv.jpg?t=${timestamp}`,
      description:
        "Visualizes upper- and mid-tropospheric moisture plumes (500-200 hPa). Shows the continuous atmospheric moisture river feeding north from the Bay of Bengal into Nepal.",
      guidance:
        "Active 24/7. Tracks invisible moisture corridors. Milky white plumes show heavy humidity currents feeding Himalayan rain systems.",
      icon: Droplets,
      color: "text-blue-400",
      badgeText: "Water Vapor (6.8µm)",
    },
    ctbt: {
      title: "Cloud Top Brightness Temperature (CTBT)",
      nepali: "बादलको तापक्रम तथा भीषण वर्षा क्षेत्र",
      band: "Band: CTBT Rainbow Thermal Contours (-80°C to -40°C)",
      dotColor: "bg-[#FF4D6D]",
      url: `https://mausam.imd.gov.in/Satellite/3Dasiasec_ctbt.jpg?t=${timestamp}`,
      description:
        "Vivid color-coded thermal map of storm cloud summits. Temperatures below -60°C (colored in red, magenta, and blue) mark severe cloudbursts, intense lightning, and extreme rainfall.",
      guidance:
        "Active 24/7. Colored patches highlight violent convective storm cells. Check the temperature bar at the bottom (-80°C to -40°C).",
      icon: Flame,
      color: "text-[#FF4D6D]",
      badgeText: "Thermal Contours (Rainbow)",
    },
    vis: {
      title: "INSAT-3D Visible Daylight Spectrum",
      nepali: "दृश्य स्पेक्ट्रम (दिनको प्राकृतिक बादल)",
      band: "Band: 0.65 µm Optical Visible (Reflected Daylight)",
      dotColor: "bg-amber-400",
      url: `https://mausam.imd.gov.in/Satellite/3Dasiasec_vis.jpg?t=${timestamp}`,
      description:
        "High-definition natural optical photography capturing reflected solar radiation, revealing cloud textures, Himalayan snow cover, and cyclone geometry.",
      guidance:
        "Daylight Optical Channel: Optical visible sensors measure reflected sunlight during daytime. During nighttime or dawn across South Asia, IMD automatically transmits the Thermal IR1 channel on this feed so imagery remains available.",
      icon: Sun,
      color: "text-amber-400",
      badgeText: "Daylight Optical (Sunlight)",
    },
  };

  const currentProduct = SATELLITE_PRODUCTS[selectedProduct];

  const handleSelectProduct = (key: SatelliteProduct) => {
    if (key !== selectedProduct) {
      setSelectedProduct(key);
      setImgLoading(true);
      setHasError(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setImgLoading(true);
    setHasError(false);
    setTimestamp(Date.now());
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[96vh] rounded-3xl bg-white dark:bg-[#071326] border border-slate-200 dark:border-2 dark:border-[#003893] text-slate-900 dark:text-white shadow-2xl flex flex-col overflow-hidden transition-colors">
        {/* Nepal Flag Bar */}
        <div className="h-1.5 w-full flex flex-shrink-0">
          <div className="h-full w-1/3 bg-[#DC143C]" />
          <div className="h-full w-1/3 bg-[#FFFFFF]" />
          <div className="h-full w-1/3 bg-[#003893]" />
        </div>

        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-gradient-to-r dark:from-[#0C1C36] dark:to-[#071326] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-[#003893] text-white border border-blue-400 dark:border-cyan-400 shadow-md">
              <Satellite className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white">
                  {lang === "np" ? "प्रत्यक्ष भू-उपग्रह तस्बिर (INSAT-3D / 3DR)" : "Live Geostationary Satellite Imagery (INSAT-3D / 3DR)"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                  100% Free Public Feed
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-blue-200 mt-0.5">
                {lang === "np"
                  ? "नेपाल हिमालय र बंगालको खाडी क्षेत्रको प्रत्यक्ष मौसम तस्बिर (प्रत्येक १५-३० मिनेटमा अद्यावधिक)"
                  : "Direct imagery covering Nepal Himalayas & Bay of Bengal (updated every 15-30 min)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#0C1C36] hover:bg-slate-200 dark:hover:bg-[#152D54] border border-slate-200 dark:border-[#1A365D] text-xs font-semibold text-slate-700 dark:text-blue-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Force reload latest satellite capture"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#122442] hover:bg-[#DC143C] text-slate-600 dark:text-blue-200 hover:text-white transition-all"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Selector Tabs */}
        <div className="px-3 sm:px-4 py-2 bg-slate-100 dark:bg-[#050D1A] border-b border-slate-200 dark:border-[#16335C] flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {(Object.keys(SATELLITE_PRODUCTS) as SatelliteProduct[]).map((key) => {
            const prod = SATELLITE_PRODUCTS[key];
            const Icon = prod.icon;
            const isSelected = selectedProduct === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectProduct(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? "bg-[#DC143C] text-white border-white/30 shadow-md scale-[1.02]"
                    : "bg-white dark:bg-[#091529] text-slate-700 dark:text-blue-200 hover:bg-slate-200 dark:hover:bg-[#112648] border-slate-200 dark:border-[#16335C]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : prod.color}`} />
                <span>{prod.title.split(" (")[0]}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md hidden md:inline font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {prod.badgeText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Satellite Image Viewer & Description */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50 dark:bg-[#030812]">
          {/* Info Banner */}
          <div className="p-3 rounded-xl bg-white dark:bg-[#0A162B] border border-slate-200 dark:border-[#1A365D] text-xs text-slate-700 dark:text-blue-100 flex items-start gap-2.5 shadow-xs">
            <Info className="w-4 h-4 text-blue-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-slate-900 dark:text-white">{currentProduct.title}</strong>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="text-slate-600 dark:text-blue-300 font-medium">{currentProduct.band}</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">{currentProduct.description}</p>
            </div>
          </div>

          {/* Special Context Banner for Visible Channel */}
          {selectedProduct === "vis" && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2 animate-fadeIn">
              <Sun className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Daylight Optical Wavelength: </span>
                Optical visible cameras detect reflected sunlight. At night or twilight in South Asia, IMD automatically bridges this stream with the Thermal IR (TIR1) channel so monitoring remains continuous without a blackout.
              </div>
            </div>
          )}

          {/* Special Context Banner for CTBT Rainbow Channel */}
          {selectedProduct === "ctbt" && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2 animate-fadeIn">
              <Flame className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Severe Storm Detection: </span>
                Look for bright magenta, cyan, and red contours. The color scale at the bottom of the map shows cloud summit temperatures from -80°C to -40°C. Colder tops indicate severe vertical thunderstorm updrafts over Nepal.
              </div>
            </div>
          )}

          {/* Image Container with high contrast border */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-[#1E427B] bg-slate-950 flex items-center justify-center min-h-[360px] sm:min-h-[480px]">
            {/* Loading Overlay */}
            {imgLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xs text-white p-4 animate-fadeIn">
                <div className="p-3 rounded-2xl bg-[#003893] border border-cyan-400/40 shadow-xl mb-3">
                  <RefreshCw className="w-7 h-7 text-cyan-300 animate-spin" />
                </div>
                <p className="text-sm font-bold text-white tracking-wide">
                  Loading {currentProduct.title}
                </p>
                <p className="text-xs text-blue-200 mt-1 text-center max-w-sm">
                  Fetching latest geostationary imagery from ISRO / IMD meteorological server...
                </p>
              </div>
            )}

            {/* Error Fallback */}
            {hasError ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300 z-10">
                <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
                <p className="text-sm font-bold text-white mb-1">Satellite Feed Temporarily Unavailable</p>
                <p className="text-xs text-slate-400 mb-3 max-w-sm">
                  The IMD geostationary distribution server may be updating its frame or encountering high traffic.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl bg-[#003893] hover:bg-[#002870] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Feed</span>
                </button>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={`${selectedProduct}-${timestamp}`}
                src={currentProduct.url}
                alt={currentProduct.title}
                className={`w-full h-auto max-h-[70vh] object-contain rounded-xl select-none transition-opacity duration-300 ${
                  imgLoading ? "opacity-0" : "opacity-100"
                }`}
                loading="eager"
                onLoad={() => setImgLoading(false)}
                onError={() => {
                  setImgLoading(false);
                  setHasError(true);
                }}
              />
            )}

            {/* Live Floating Product Badge */}
            <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-black/80 border border-white/20 text-white backdrop-blur-md flex items-center gap-2 shadow-lg pointer-events-none">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${currentProduct.dotColor}`} />
              <span className="text-[11px] font-bold tracking-wide">
                {currentProduct.band}
              </span>
            </div>

            {/* External Zoom Button */}
            <a
              href={currentProduct.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 shadow-md"
              title="Open full resolution in a new tab"
            >
              <ZoomIn className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Full Res</span>
              <ExternalLink className="w-3 h-3 text-slate-300" />
            </a>

            {/* Attribution Watermark */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 border border-white/20 text-[10px] text-slate-300 backdrop-blur-sm pointer-events-none">
              Source: ISRO / IMD INSAT-3D Open Meteorological Data
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-3.5 border-t border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#071326] flex items-center justify-between text-xs text-slate-600 dark:text-blue-300 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] sm:text-xs">
              Public domain geostationary data for South Asia & the Bay of Bengal
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#DC143C] hover:bg-[#B50F31] font-bold text-white text-xs shadow-md transition-all"
          >
            {lang === "np" ? "बन्द गर्नुहोस्" : "Close Viewer"}
          </button>
        </div>
      </div>
    </div>
  );
}
