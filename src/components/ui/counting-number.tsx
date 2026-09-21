"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export interface CountingNumberProps {
  from?: number;
  target: number;
  duration?: number;
  transition?: {
    duration?: number;
    ease?: string | number[] | ((t: number) => number);
  };
  className?: string;
  autoStart?: boolean;
  format?: (n: number) => string;
}

export function CountingNumber({
  from = 0,
  target,
  duration = 2.5,
  transition,
  className = "",
  autoStart = true,
  format,
}: CountingNumberProps) {
  const [displayValue, setDisplayValue] = useState<number>(from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const animDuration = transition?.duration ?? duration;
  const animEase = transition?.ease ?? "easeOut";

  useEffect(() => {
    if (!autoStart) return;
    if (!isInView) return;

    const controls = (animate as any)(from, target, {
      duration: animDuration,
      ease: animEase,
      onUpdate: (latest: number) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [isInView, from, target, animDuration, animEase, autoStart]);

  const formattedText = format
    ? format(displayValue)
    : displayValue.toLocaleString("en-US");

  return (
    <span ref={ref} className={`tabular-nums font-extrabold inline-block ${className}`}>
      {formattedText}
    </span>
  );
}

export default CountingNumber;
