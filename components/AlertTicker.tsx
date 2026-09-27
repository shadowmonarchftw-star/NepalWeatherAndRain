"use client";

import React, { useEffect, useRef, useState } from "react";
import { NDRRMAAlert } from "@/lib/types";
import { Language } from "@/lib/translations";

const SPEED_PX_PER_S = 40;
const RESUME_AFTER_TOUCH_MS = 3000;

// All active NDRRMA alerts in one row that scrolls by itself. It is a normal scrollable
// row, so people can also swipe it; touching or hovering pauses it. No auto-scroll for
// users who ask for reduced motion.
export default function AlertTicker({ alerts, lang }: { alerts: NDRRMAAlert[]; lang: Language }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Second copy of the list only when it is wider than the row, so the loop is seamless
  const [loop, setLoop] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    const first = firstCopyRef.current;
    if (!row || !first) return;
    const ro = new ResizeObserver(() => setLoop(first.scrollWidth > row.clientWidth));
    ro.observe(row);
    ro.observe(first);
    return () => ro.disconnect();
  }, [alerts]);

  useEffect(() => {
    const row = rowRef.current;
    const first = firstCopyRef.current;
    if (!loop || !row || !first) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pos = row.scrollLeft;
    let last = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const dt = Math.min(now - last, 100);
      last = now;
      if (pausedRef.current) {
        pos = row.scrollLeft; // pick up where the user left it
      } else {
        pos += (SPEED_PX_PER_S * dt) / 1000;
        const copyWidth = first.offsetWidth;
        if (pos >= copyWidth) pos -= copyWidth;
        row.scrollLeft = Math.round(pos);
      }
      frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [loop]);

  const pause = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    pausedRef.current = true;
  };
  const resumeLater = (ms: number) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => (pausedRef.current = false), ms);
  };

  const list = (copy: number) => (
    <div ref={copy === 0 ? firstCopyRef : undefined} aria-hidden={copy === 1} className="flex items-center flex-shrink-0">
      {alerts.map((a) => (
        <span key={`${copy}-${a.id}`} className="flex items-center whitespace-nowrap pr-4">
          <span className="w-1 h-1 rounded-full bg-[#C51D34] mr-2 flex-shrink-0" />
          {lang === "np" && a.titleNe ? a.titleNe : a.title}
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={rowRef}
      className="flex min-w-0 overflow-x-auto scrollbar-none text-slate-800 dark:text-slate-300 font-medium text-[11px] sm:text-xs touch-pan-x"
      onPointerEnter={(e) => e.pointerType === "mouse" && pause()}
      onPointerLeave={(e) => e.pointerType === "mouse" && resumeLater(0)}
      onTouchStart={pause}
      onTouchEnd={() => resumeLater(RESUME_AFTER_TOUCH_MS)}
    >
      {list(0)}
      {loop && list(1)}
    </div>
  );
}
