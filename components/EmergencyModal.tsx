"use client";

import React from "react";
import { X, PhoneCall, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { EMERGENCY_HOTLINES } from "@/data/emergencyHotlines";
import { Language } from "@/lib/translations";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export default function EmergencyModal({ isOpen, onClose, lang = "en" }: EmergencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-2xl flex flex-col transition-colors">
        {/* Top Flag Stripe */}
        <div className="h-1.5 w-full flex flex-shrink-0">
          <div className="h-full w-1/3 bg-[#C51D34]" />
          <div className="h-full w-1/3 bg-[#FFFFFF]" />
          <div className="h-full w-1/3 bg-[#003893]" />
        </div>

        {/* Modal Header */}
        <div className="p-3.5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50 dark:bg-[#0A0F1A] flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-[#C51D34] text-white shadow-sm flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {lang === "np"
                  ? "आपत्कालीन सम्पर्क तथा विपद् पूर्वतयारी"
                  : "Emergency Hotlines & Guidelines"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Department of Hydrology and Meteorology & NDRRMA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#C51D34] text-slate-600 dark:text-slate-300 hover:text-white transition-all flex-shrink-0 touch-manipulation"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Quick Dial Emergency Numbers */}
          <div>
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              {lang === "np" ? "प्रत्यक्ष २४/७ आपत्कालीन फोन नम्बरहरू (कल गर्न ट्याप गर्नुहोस्)" : "Direct Emergency Helplines (Tap to Call 24/7)"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {EMERGENCY_HOTLINES.map((h) => (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 hover:border-[#C51D34] active:scale-[0.98] transition-all flex items-start gap-3 group shadow-xs touch-manipulation"
                >
                  <div className="p-2 rounded-xl bg-[#C51D34] text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {lang === "np" ? h.nepaliService : h.service.split(" (")[0]}
                      </span>
                      <span className="font-mono text-sm font-black text-[#C51D34] dark:text-[#FF4D6D] bg-red-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg tabular-nums flex-shrink-0">
                        {h.number}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {h.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Flash Flood & Landslide Safety Checklist */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                {lang === "np"
                  ? "बंगालको खाडी वर्षाको समयमा सुरक्षा सतर्कता"
                  : "Safety Advice during Bay of Bengal Rain Events"}
              </span>
            </h4>
            <ul className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">{lang === "np" ? "नदी किनार र तराई:" : "Avoid Riverbeds & Low-lying Plains:"}</strong>{" "}
                  {lang === "np"
                    ? "ओरोग्राफिक क्लाउडबर्स्टका कारण ३० मिनेटभित्रै खोलाको जलसतह २ देखि ३ गुणा बढ्न सक्छ। बाढी आएको खोला तर्ने प्रयास नगर्नुहोस्।"
                    : "River discharges can double within 30 minutes during orographic cloudbursts. Do not attempt to cross flooded rivers or ford swollen streams."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">{lang === "np" ? "पहाडी क्षेत्रमा पहिरो:" : "Landslide Vigilance in Mid-Hills:"}</strong>{" "}
                  {lang === "np"
                    ? "भिरालो जमिनमा लेदो बग्न थालेमा वा अनौठो आवाज सुनिएमा तत्कालै सुरक्षित अग्लो ठाउँमा जानुहोस्।"
                    : "If sudden muddy runoff or unusual cracking sounds appear on hillsides, evacuate immediately to open, elevated ridges."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white">{lang === "np" ? "राजमार्ग यात्रा सतर्कता:" : "Highway Travel Restrictions:"}</strong>{" "}
                  {lang === "np"
                    ? "पृथ्वी राजमार्ग, बीपी राजमार्ग, र नारायणगढ-मुग्लिन सडक खण्डमा रात्रिकालीन यात्रा सकेसम्म स्थगित गर्नुहोस्।"
                    : "Avoid night driving through Prithvi Highway, BP Highway, and Narayanghat-Mugling road sections when red alerts are active."}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0F1A] flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#C51D34] hover:bg-[#A8152A] text-xs font-bold text-white transition-all shadow-xs touch-manipulation"
          >
            {lang === "np" ? "बुझेँ, बन्द गर्नुहोस्" : "Acknowledge & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
