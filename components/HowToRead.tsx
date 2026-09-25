"use client";

import React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Language } from "@/lib/translations";
import SourceTag from "@/components/SourceTag";
import { RAIN_BAND_LABEL } from "@/lib/alertCalculator";

const Item = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-1">
    <div className="font-bold text-slate-900 dark:text-white">{title}</div>
    <div className="text-slate-600 dark:text-slate-300 leading-relaxed">{children}</div>
  </div>
);

const link = (href: string, text: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-[#003893] dark:text-blue-400">
    {text}
  </a>
);

// Explains what the labels on this page mean. Only describes what the official feeds publish
// and what this site does with them — no definitions of our own presented as official.
export default function HowToRead({ lang }: { lang: Language }) {
  const np = lang === "np";

  return (
    <details className="group rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white transition-colors">
      <summary className="flex items-center justify-between gap-2 p-3.5 sm:px-5 cursor-pointer list-none touch-manipulation">
        <span className="flex items-center gap-2 text-sm sm:text-base font-bold tracking-tight">
          <HelpCircle className="w-4 h-4 text-[#003893] dark:text-blue-400" />
          {np ? "यो पृष्ठ कसरी पढ्ने" : "How to read this page"}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" />
      </summary>

      <div className="px-3.5 sm:px-5 pb-4 grid gap-4 sm:grid-cols-2 text-xs">
        <Item title={np ? "रङ्गीन चिन्ह" : "The coloured tags"}>
          <div className="space-y-1.5">
            <div>
              <SourceTag kind="measured" lang={lang} />{" "}
              {np ? "सरकारी मापन यन्त्रको रिडिङ (DHM, DoE)।" : "Readings from government instruments (DHM, DoE)."}
            </div>
            <div>
              <SourceTag kind="official" lang={lang} />{" "}
              {np
                ? "सरकारी निकायले जारी गरेको (DHM पूर्वानुमान, NDRRMA पूर्वसूचना, सडक विभागको सडक अवस्था, प्रमाणित घटना)।"
                : "Issued by a government office (DHM forecast, NDRRMA alerts, Department of Roads status, verified incidents)."}
            </div>
            <div>
              <SourceTag kind="model" lang={lang} />{" "}
              {np
                ? "Open-Meteo को कम्प्युटर पूर्वानुमान। आधिकारिक चेतावनी होइन।"
                : "Computer forecast from Open-Meteo. Not an official warning."}
            </div>
          </div>
        </Item>

        <Item title={np ? "“१२ मिनेट अघि” को अर्थ" : "What “12 min ago” means"}>
          {np
            ? "त्यस फिडको सबैभन्दा नयाँ रिडिङ कहिले लिइयो। पुराना रिडिङ देखाइँदैन: नदी मापन २४ घण्टाभन्दा पुरानो, वर्षा र वायु गुणस्तर ३ घण्टाभन्दा पुरानो। फिड बन्द भए “उपलब्ध छैन” देखिन्छ — अनुमानित अङ्क कहिल्यै भरिँदैन।"
            : "When the newest reading in that feed was taken. Old readings are hidden: river gauges older than 24 h, rain gauges and air quality older than 3 h. If a feed is down the section says “unavailable” — numbers are never filled in."}
        </Item>

        <Item title={np ? "नदी मापन: सामान्य / चेतावनी / खतरा" : "River gauges: Normal / Warning / Danger"}>
          {np
            ? "DHM ले हरेक मापन केन्द्रका लागि चेतावनी तह र खतरा तह (पानीको उचाइ, मिटर) तोक्छ। स्थिति DHM कै हो, जस्ताको तस्तै: सामान्य = चेतावनी तहभन्दा तल, चेतावनी = चेतावनी तहभन्दा माथि, खतरा = खतरा तहभन्दा माथि। साथै पानी बढ्दै, स्थिर वा घट्दै छ भन्ने पनि DHM कै हो। “—” = DHM ले तह प्रकाशित गरेको छैन। "
            : "DHM sets a warning level and a danger level (water height in metres) for each gauge. The status is DHM's own, shown unchanged: Normal = below warning level, Warning = above warning level, Danger = above danger level. Rising / steady / falling is also DHM's. “—” = DHM has not published a level for that gauge. "}
          {link("https://dhm.gov.np/hydrology/river-watch", "dhm.gov.np")}
        </Item>

        <Item title={np ? "वर्षा मापन केन्द्र" : "Rain gauges"}>
          {np
            ? "मिलिमिटर (mm) मा पछिल्लो १, ३, ६, १२ र २४ घण्टाको कुल वर्षा। चेतावनी/खतरा संकेत DHM को फिडमा जस्तो आयो त्यस्तै देखाइन्छ।"
            : "Total rain in millimetres (mm) over the past 1, 3, 6, 12 and 24 hours. Warning / Danger flags are shown exactly as DHM's feed publishes them."}
        </Item>

        <Item title={np ? "जिल्ला वर्षा पूर्वानुमान (मोडेल)" : "District rain forecast (model)"}>
          {np
            ? "आज (नेपाल समय) मोडेलले देखाएको कुल वर्षा, मात्रा अनुसार: "
            : "Total rain the model forecasts for today (Nepal time), grouped by amount: "}
          {(["light", "moderate", "heavy", "veryHeavy"] as const)
            .map((b) => `${np ? RAIN_BAND_LABEL[b].np : RAIN_BAND_LABEL[b].en} ${RAIN_BAND_LABEL[b].range}`)
            .join(" · ")}
          {np
            ? "। यी समूह यस साइटले मात्रा बुझाउन राखेको हो, DHM को चेतावनी तह होइन।"
            : ". These groups are this site's way of describing amounts, not DHM warning levels."}
        </Item>

        <Item title={np ? "वायु गुणस्तर (AQI)" : "Air quality (AQI)"}>
          {np
            ? "AQI अङ्क र रङ वातावरण विभाग (DoE) ले प्रकाशित गरेजस्तै। अङ्क जति ठूलो, हावा उति खराब। "
            : "AQI number and colour as published by the Department of Environment (DoE). Higher number = worse air. "}
          {link("https://pollution.gov.np/portal/", "pollution.gov.np")}
        </Item>
      </div>
    </details>
  );
}
