"use client";

import React, { useState } from "react";
import { X, Satellite, Eye, RefreshCw, ZoomIn, Info, ShieldCheck, Flame, Droplets, Sun } from "lucide-react";

interface LiveSatelliteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SatelliteProduct = "ir1" | "wv" | "ctbt" | "vis";

export default function LiveSatelliteModal({ isOpen, onClose }: LiveSatelliteModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<SatelliteProduct>("ir1");
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const SATELLITE_PRODUCTS: Record<
    SatelliteProduct,
    { title: string; nepali: string; url: string; description: string; icon: any; color: string }
  > = {
    ir1: {
      title: "INSAT-3D Infrared (IR1 - 10.8 µm)",
      nepali: "इन्फ्रारेड बादल तथा चक्रवात",
      url: `https://mausam.imd.gov.in/Satellite/3Dasiasec_ir1.jpg?t=${timestamp}`,
      description:
        "Displays real-time thermal radiation from clouds across South Asia and the Bay of Bengal. Bright white signatures indicate deep, high convective storm clouds threatening Nepal.",
      icon: Satellite,
      color: "text-cyan-400",
    },
    wv: {
      title: "INSAT-3D Water Vapor (WV - 6.8 µm)",
      nepali: "जलवाष्प तथा ओसिलो हावाको प्रवाह",
      url: `https://mausam.imd.gov.in/Satellite/3Dasiasec_wv.jpg?t=${timestamp}`,
      description:
        "Visualizes upper- and mid-tropospheric moisture plumes. Shows the exact atmospheric moisture river feeding into Nepal from the Bay of Bengal depression.",
      icon: Droplets,
      color: "text-blue-400",
    },
    ctbt: {
      title: "Cloud Top Brightness Temperature (CTBT)",
      nepali: "बादलको तापक्रम तथा भीषण वर्षा क्षेत्र",
      url: `https://mausam.imd.gov.in/Satellite/3Dasiasec_ctbt.jpg?t=${timestamp}`,
      description:
        "Color-coded thermal map of storm cloud summits. Temperatures below -60°C (colored in red/purple) mark severe cloudbursts, intense lightning, and extreme rainfall.",
      icon: Flame,
      color: "text-[#FF4D6D]",
    },
    vis: {
      title: "INSAT-3D Visible Daylight Spectrum",
      nepali: "दृश्य स्पेक्ट्रम (दिनको बादल)",
      url: `https://mausam.imd.gov.in/Satellite/3Dasiasec_vis.jpg?t=${timestamp}`,
      description:
        "High-definition natural optical view showing cloud texture, Himalayan snow cover, and cyclonic spiral bands over the Indian subcontinent.",
      icon: Sun,
      color: "text-amber-400",
    },
  };

  const currentProduct = SATELLITE_PRODUCTS[selectedProduct];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimestamp(Date.now());
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[96vh] rounded-3xl bg-[#071326] border-2 border-[#003893] text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Flag Bar */}
        <div className="h-1.5 w-full flex flex-shrink-0">
          <div className="h-full w-1/3 bg-[#DC143C]" />
          <div className="h-full w-1/3 bg-[#FFFFFF]" />
          <div className="h-full w-1/3 bg-[#003893]" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1A365D] bg-gradient-to-r from-[#0C1C36] to-[#071326] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#003893] text-white border border-cyan-400 shadow-md">
              <Satellite className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Live Geostationary Satellite Imagery (INSAT-3D / 3DS)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  100% Free Public Feed
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Direct imagery covering Nepal Himalayas & the Bay of Bengal (updated every 15-30 min)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-[#0C1C36] hover:bg-[#152D54] border border-[#1A365D] text-xs font-semibold text-blue-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Force reload latest satellite capture"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#122442] hover:bg-[#DC143C] text-blue-200 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Selector Tabs */}
        <div className="px-4 py-2.5 bg-[#050D1A] border-b border-[#16335C] flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {(Object.keys(SATELLITE_PRODUCTS) as SatelliteProduct[]).map((key) => {
            const prod = SATELLITE_PRODUCTS[key];
            const Icon = prod.icon;
            const isSelected = selectedProduct === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedProduct(key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? "bg-[#DC143C] text-white border-white/30 shadow-md shadow-[#DC143C]/40"
                    : "bg-[#091529] text-blue-200 hover:bg-[#112648] border-[#16335C]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : prod.color}`} />
                <span>{prod.title.split(" (")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Satellite Image Viewer & Description */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#030812]">
          {/* Info Banner */}
          <div className="p-3 rounded-xl bg-[#0A162B] border border-[#1A365D] text-xs text-blue-100 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">{currentProduct.title}: </strong>
              <span>{currentProduct.description}</span>
            </div>
          </div>

          {/* Image Container with high contrast border */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#1E427B] bg-black flex items-center justify-center min-h-[380px] sm:min-h-[480px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentProduct.url}
              alt={currentProduct.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl select-none"
              loading="eager"
            />

            {/* Attribution Watermark */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 border border-white/20 text-[10px] text-white backdrop-blur-sm">
              Source: ISRO / IMD INSAT-3D Open Meteorological Data
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#1A365D] bg-[#071326] flex items-center justify-between text-xs text-blue-300 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Public domain satellite data for South Asia & the Bay of Bengal</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#DC143C] hover:bg-[#B50F31] font-bold text-white text-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
