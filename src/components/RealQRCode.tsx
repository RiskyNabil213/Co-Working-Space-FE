"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface RealQRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
}

export default function RealQRCode({
  value,
  size = 120,
  fgColor = "#111111",
  bgColor = "#FFFFFF",
  className = "",
  level = "M",
  includeMargin = false,
}: RealQRCodeProps) {
  // If empty value, use fallback verification string
  const qrContent = value && value.trim() ? value : "UHUB-SMART-PASS-VERIFIED-2026";

  return (
    <div
      className={`inline-flex items-center justify-center p-2 rounded-[12px] bg-white border border-[#E5E7EB] shadow-xs ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      <QRCodeSVG
        value={qrContent}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level={level}
        includeMargin={includeMargin}
      />
    </div>
  );
}
