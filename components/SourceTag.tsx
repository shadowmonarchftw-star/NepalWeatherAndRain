"use client";

import React, { useSyncExternalStore } from "react";
import { Language } from "@/lib/translations";

// What kind of data a section shows, so measured readings are never mistaken for forecasts.
//  measured – instrument readings (DHM gauges, DoE air quality)
//  official – issued by a government body (DHM bulletin, NDRRMA alerts, DoR road status, verified incidents)
//  model    – computer model forecast (Open-Meteo), not an official product
export type SourceKind = "measured" | "official" | "model";

const KIND_STYLE: Record<SourceKind, { dot: string; pill: string; en: string; np: string }> = {
  measured: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40",
    en: "Measured",
    np: "मापन",
  },
  official: {
    dot: "bg-blue-600 dark:bg-blue-400",
    pill: "bg-blue-50 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/40",
    en: "Official",
    np: "आधिकारिक",
  },
  model: {
    dot: "bg-violet-500",
    pill: "bg-violet-50 dark:bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-500/40",
    en: "Model forecast",
    np: "मोडेल पूर्वानुमान",
  },
};

// Current time, re-read every 30 s so "12 min ago" keeps counting. null on the server
// (and during hydration) so server and client HTML match.
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
};
const nowRounded = () => Math.floor(Date.now() / 30_000) * 30_000;
function useNow(): number | null {
  return useSyncExternalStore(subscribe, nowRounded, () => null);
}

/** Newest valid ISO time in the list, or undefined */
export function latestTime(times: (string | null | undefined)[]): string | undefined {
  let best: string | undefined;
  for (const x of times) {
    if (x && Number.isFinite(Date.parse(x)) && (!best || Date.parse(x) > Date.parse(best))) best = x;
  }
  return best;
}

export function formatAge(iso: string, now: number, lang: Language): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const np = lang === "np";
  const mins = Math.max(0, Math.round((now - t) / 60_000));
  if (mins < 1) return np ? "भर्खरै" : "just now";
  if (mins < 60) return np ? `${mins} मिनेट अघि` : `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return np ? `${hours} घण्टा अघि` : `${hours} h ago`;
  return new Date(t).toLocaleDateString(np ? "ne-NP" : "en-US", {
    timeZone: "Asia/Kathmandu",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  kind: SourceKind;
  /** Who publishes it, e.g. "DHM", "NDRRMA", "Open-Meteo" */
  source?: string;
  /** Time of the newest reading / issue time (ISO). Omitted → no age shown. */
  time?: string | null;
  /** Word before the age: "updated" (default) or "issued" */
  timeVerb?: "updated" | "issued";
  /** Overrides the kind label, e.g. "Official forecast" */
  label?: string;
  lang: Language;
  className?: string;
}

export default function SourceTag({ kind, source, time, timeVerb = "updated", label, lang, className = "" }: Props) {
  const now = useNow();
  const style = KIND_STYLE[kind];
  const np = lang === "np";
  const age = time && now !== null ? formatAge(time, now, lang) : "";
  const verb = timeVerb === "issued" ? (np ? "जारी" : "issued") : np ? "अद्यावधिक" : "updated";

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-1 max-w-full px-1.5 py-0.5 rounded-lg border text-[10px] font-semibold leading-tight ${style.pill} ${className}`}
      title={time ? new Date(time).toLocaleString(np ? "ne-NP" : "en-US", { timeZone: "Asia/Kathmandu" }) + " NPT" : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      <span className="font-extrabold uppercase tracking-wide whitespace-nowrap">{label ?? (np ? style.np : style.en)}</span>
      {source && <span className="whitespace-nowrap">· {source}</span>}
      {age && (
        <span className="whitespace-nowrap">
          · {verb} {age}
        </span>
      )}
    </span>
  );
}
