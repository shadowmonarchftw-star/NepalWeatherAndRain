"use client";

import React, { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Language } from "@/lib/translations";

export interface HistoryTarget {
  kind: "river" | "rain";
  id: number;
  name: string;
  warningLevelM?: number | null;
  dangerLevelM?: number | null;
}

interface HistoryResponse {
  success: boolean;
  points: { t: string; v: number }[];
  jumps: { t: string; from: number; to: number }[];
  jumpFlagM?: number;
}

const fmtTime = (iso: string, lang: Language) =>
  new Date(iso).toLocaleTimeString(lang === "np" ? "ne-NP" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kathmandu",
  });

export default function StationHistoryModal({
  target,
  onClose,
  lang = "en",
}: {
  target: HistoryTarget | null;
  onClose: () => void;
  lang?: Language;
}) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const np = lang === "np";

  useEffect(() => {
    if (!target) return;
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when a new station is opened
    setData(null);
    setFailed(false);
    fetch(`/api/station-history?kind=${target.kind}&id=${target.id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!mounted) return;
        if (r.ok && d.success) setData(d);
        else setFailed(true);
      })
      .catch(() => mounted && setFailed(true));
    return () => {
      mounted = false;
    };
  }, [target]);

  if (!target) return null;

  const isRiver = target.kind === "river";
  const chartData = (data?.points || []).map((p) => ({ time: fmtTime(p.t, lang), value: p.v }));
  const values = chartData.map((p) => p.value);
  const refs = isRiver ? [target.warningLevelM, target.dangerLevelM].filter((v): v is number => typeof v === "number") : [];
  const lo = values.length ? Math.min(...values, ...refs) : 0;
  const hi = values.length ? Math.max(...values, ...refs) : 1;
  const pad = Math.max(0.2, (hi - lo) * 0.1);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-[#0F172A] rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold">{target.name}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isRiver
                ? np ? "पछिल्लो २४ घण्टाको जलसतह (m)" : "Water level, last 24 hours (m)"
                : np ? "पछिल्लो २४ घण्टाको प्रतिघण्टा वर्षा (mm)" : "Hourly rainfall, last 24 hours (mm)"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#C51D34] hover:text-white" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {data && data.jumps.length > 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 flex gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              {np
                ? `एक घण्टाभित्र ${data.jumpFlagM} m भन्दा बढीको अचानक परिवर्तन (${data.jumps
                    .map((j) => `${fmtTime(j.t, lang)}: ${j.from} → ${j.to} m`)
                    .join(", ")})। यो सेन्सर त्रुटि हुन सक्छ — DHM ले पुष्टि नगरेसम्म सावधानीपूर्वक हेर्नुहोस्।`
                : `Sudden change of more than ${data.jumpFlagM} m within an hour (${data.jumps
                    .map((j) => `${fmtTime(j.t, lang)}: ${j.from} → ${j.to} m`)
                    .join(", ")}). This may be a sensor error — treat with caution until DHM confirms.`}
            </span>
          </div>
        )}

        {failed && <p className="text-xs text-slate-500 py-10 text-center">{np ? "इतिहास उपलब्ध छैन।" : "History unavailable."}</p>}
        {!data && !failed && <p className="text-xs text-slate-500 py-10 text-center">{np ? "लोड हुँदैछ…" : "Loading…"}</p>}
        {data && chartData.length === 0 && (
          <p className="text-xs text-slate-500 py-10 text-center">
            {np ? "पछिल्लो २४ घण्टामा कुनै मापन छैन।" : "No readings in the last 24 hours."}
          </p>
        )}

        {data && chartData.length > 0 && (
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              {isRiver ? (
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} minTickGap={30} />
                  <YAxis domain={[Number((lo - pad).toFixed(2)), Number((hi + pad).toFixed(2))]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v} m`, np ? "जलसतह" : "Water level"]} />
                  {typeof target.warningLevelM === "number" && (
                    <ReferenceLine y={target.warningLevelM} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: "WR", fontSize: 10, fill: "#F59E0B" }} />
                  )}
                  {typeof target.dangerLevelM === "number" && (
                    <ReferenceLine y={target.dangerLevelM} stroke="#C51D34" strokeDasharray="4 4" label={{ value: "DL", fontSize: 10, fill: "#C51D34" }} />
                  )}
                  <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} minTickGap={30} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v} mm`, np ? "१ घण्टाको वर्षा" : "Rain in the hour"]} />
                  <Bar dataKey="value" fill="#0284c7" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
          {data ? `${chartData.length} ${np ? "मापन" : "readings"} · ` : ""}Source: DHM / hydrology.gov.np via bipadportal.gov.np
        </p>
      </div>
    </div>
  );
}
