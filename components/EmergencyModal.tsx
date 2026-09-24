"use client";

import React from "react";
import { X, PhoneCall, ShieldAlert, AlertTriangle, LifeBuoy, HeartPulse, CheckCircle2 } from "lucide-react";
import { EMERGENCY_HOTLINES } from "@/data/emergencyHotlines";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#071326] border-2 border-[#DC143C] text-white shadow-2xl shadow-red-950/60 flex flex-col">
        {/* Top Flag Stripe */}
        <div className="h-2 w-full flex">
          <div className="h-full w-1/3 bg-[#DC143C]" />
          <div className="h-full w-1/3 bg-[#FFFFFF]" />
          <div className="h-full w-1/3 bg-[#003893]" />
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#1A365D] flex items-start justify-between gap-4 bg-gradient-to-r from-[#DC143C]/20 via-[#071326] to-[#003893]/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#DC143C] text-white shadow-lg shadow-[#DC143C]/40 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Emergency Hotlines & Disaster Guidelines
              </h2>
              <p className="text-xs text-blue-200">
                नेपाल सरकार आपत्कालीन सम्पर्क तथा बाढी / पहिरो पूर्वतयारी
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#122442] hover:bg-[#DC143C] text-blue-200 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Dial Emergency Numbers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3">
              Direct Emergency Helplines (24/7 Nationwide)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMERGENCY_HOTLINES.map((h) => (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="p-3.5 rounded-2xl bg-[#0B1A33] border border-[#1E427B] hover:border-[#DC143C] hover:bg-[#102447] transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-xl bg-[#DC143C] text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">{h.service}</span>
                      <span className="font-mono text-sm font-black text-[#FF4D6D] bg-[#162E52] px-2 py-0.5 rounded-lg">
                        {h.number}
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-300 line-clamp-2 mt-1">
                      {h.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Flash Flood & Landslide Safety Checklist */}
          <div className="p-4 rounded-2xl bg-[#0A162B] border border-[#16335C] space-y-2.5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Safety Advice during Bay of Bengal Rain Events</span>
            </h4>
            <ul className="text-xs text-blue-100 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Avoid Riverbeds & Low-lying Plains:</strong> River discharges can double within 30 minutes during orographic cloudbursts. Do not attempt to cross flooded rivers or ford swollen streams.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Landslide Vigilance in Mid-Hills:</strong> If sudden muddy runoff or unusual cracking sounds appear on hillsides, evacuate immediately to open, elevated ridges.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Highway Travel Restrictions:</strong> Avoid night driving through Prithvi Highway, BP Highway, and Narayanghat-Mugling road sections when red alerts are active.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>DHM SMS Alerts:</strong> Keep phones charged and monitor cell broadcast alerts sent to residents in Koshi and Bagmati basins.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1A365D] bg-[#050D1A] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#DC143C] hover:bg-[#B50F31] text-xs font-bold text-white transition-all shadow-lg shadow-[#DC143C]/30"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
