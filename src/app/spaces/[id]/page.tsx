"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSpaceById, SpaceItem, mapBackendSpaceToSpaceItem } from "@/data/spaces";
import { spaceApi } from "@/lib/api";
import { AppleCalendarPicker } from "@/components/ui/apple-calendar-picker";
import {
  ArrowLeft,
  Share2,
  Heart,
  Check,
  Calendar,
  Minus,
  Plus,
  Zap,
  ShieldCheck,
  Wifi,
  Sparkles,
  Layers,
  Maximize2,
  X,
  CheckCircle2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WorkspaceDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const spaceId = resolvedParams?.id || "personal-desk-flexi-01";
  const [liveSpace, setLiveSpace] = useState<SpaceItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await spaceApi.getSpaceById(spaceId);
        if (res.success && res.data) {
          setLiveSpace(mapBackendSpaceToSpaceItem(res.data));
        }
      } catch (err) {
        console.warn("Space detail fetch note:", err);
      }
    };
    fetchDetail();
  }, [spaceId]);

  const space = liveSpace || getSpaceById(spaceId);

  // Booking Workbench State
  const [selectedDate, setSelectedDate] = useState("2026-08-30");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(3);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Price calculations
  const pricePerHour = space.rate;
  const subtotal = pricePerHour * duration;

  // Calculate End Time (e.g. 09:00 + 3 hours -> 12:00)
  const calculateEndTime = (start: string, dur: number) => {
    const [h, m] = start.split(":").map(Number);
    const endH = (h + dur) % 24;
    return `${endH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} WIB`;
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleReserveNow = () => {
    const query = new URLSearchParams({
      spaceId: space.id,
      spaceName: space.title,
      rate: space.rate.toString(),
      tanggal: selectedDate,
      jam: startTime,
      durasi: duration.toString(),
    });
    router.push(`/reservasi?${query.toString()}`);
  };

  const allPhotos = space.allPhotos || [space.image, space.secondaryImage1, space.secondaryImage2];

  return (
    <div className="min-h-screen bg-[#F6F6F4] text-[#0E0F12] flex flex-col justify-between selection:bg-[#D5F066] selection:text-[#0E0F12]">
      {/* ================= 1. TOP FLOATING NAVIGATION BAR ================= */}
      <Navbar />

      {/* Main Content Area */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-4">
        {/* ================= 2. BREADCRUMB & ACTION TOOLBAR ================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/spaces"
                className="inline-flex items-center gap-2 bg-white border border-[#E2E2DF] hover:border-[#0E0F12] text-[#0E0F12] text-[13px] font-semibold px-4 py-2 rounded-full transition-all shadow-xs"
              >
                <ArrowLeft size={15} />
                <span>Back to All Spaces</span>
              </Link>
            </motion.div>

            <nav className="flex items-center gap-2 text-[13px] text-[#707175] ml-1">
              <span>Spaces</span>
              <span className="text-[#E2E2DF]">/</span>
              <span>{space.categoryLabel}</span>
              <span className="text-[#E2E2DF]">/</span>
              <span className="font-semibold text-[#0E0F12]">
                {space.title} (ID: #{space.id.toUpperCase()})
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-white border border-[#E2E2DF] hover:border-[#0E0F12] text-[#0E0F12] text-[12px] font-semibold px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer"
            >
              <Share2 size={14} className="text-[#707175]" />
              <span>{shareCopied ? "Link Copied! ✓" : "Share Space ↗"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`inline-flex items-center gap-1.5 border text-[12px] font-semibold px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-[#E2E2DF] text-[#0E0F12] hover:border-[#0E0F12]"
              }`}
            >
              <Heart
                size={14}
                className={isWishlisted ? "fill-red-600 text-red-600" : "text-[#707175]"}
              />
              <span>{isWishlisted ? "Saved in Wishlist" : "Save to Wishlist ♡"}</span>
            </motion.button>
          </div>
        </div>

        {/* ================= 3. TWO-COLUMN PRODUCT GRID (64% / 36%) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* ================= LEFT COLUMN: MEDIA & DOSSIER (64% - Col 8) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3.1 Bento Media Gallery (3-Image Asymmetric Cluster) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[480px]">
              {/* Primary Main Photo (Left ~62%) */}
              <div className="md:col-span-8 relative h-[320px] md:h-full rounded-[24px] overflow-hidden bg-[#1A1A1A] group">
                <img
                  src={space.image}
                  alt={space.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Overlay Top-Left */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${space.badgeColor}`}>
                    {space.badgeTag}
                  </span>
                  <span className="bg-white/95 backdrop-blur-md text-[#0E0F12] text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                    {space.categoryLabel}
                  </span>
                </div>

                {/* Overlay Bottom-Left */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 bg-[#0E0F12]/80 backdrop-blur-[12px] border border-white/15 px-3.5 py-1.5 rounded-full text-white text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                    <span>{space.specs.acoustic}</span>
                  </div>
                </div>
              </div>

              {/* Secondary Photo Column (Right ~38%, 2 Stacked Images) */}
              <div className="md:col-span-4 flex flex-col gap-4 h-full">
                {/* Top Image */}
                <div className="relative h-[150px] md:h-[232px] rounded-[20px] overflow-hidden bg-[#1A1A1A] group">
                  <img
                    src={space.secondaryImage1}
                    alt={`${space.title} Perspective`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                </div>

                {/* Bottom Image with View All Photos Overlay */}
                <div className="relative h-[150px] md:h-[232px] rounded-[20px] overflow-hidden bg-[#1A1A1A] group">
                  <img
                    src={space.secondaryImage2}
                    alt={`${space.title} Detail`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 pointer-events-none" />

                  <button
                    onClick={() => setGalleryModalOpen(true)}
                    className="absolute bottom-3 right-3 bg-[#0E0F12]/85 hover:bg-black backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Maximize2 size={12} />
                    <span>View All Photos ⊞</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3.2 Metadata Badges Row & Title Block */}
            <div className="bg-white border border-[#E2E2DF] rounded-[24px] p-6 sm:p-8 shadow-xs">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-3.5">
                <span className="bg-[#FFFFFF] border border-[#E2E2DF] px-2.5 py-1 rounded-[6px] text-[11px] font-semibold text-[#0E0F12]">
                  {space.categoryLabel}
                </span>
                <span className="bg-[#FFFFFF] border border-[#E2E2DF] px-2.5 py-1 rounded-[6px] text-[11px] font-medium text-[#707175]">
                  {space.capacity}
                </span>
                <span className="bg-[#FFFFFF] border border-[#E2E2DF] px-2.5 py-1 rounded-[6px] text-[11px] font-medium text-[#707175]">
                  🏢 {space.location}
                </span>
                <span className="bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-[6px] text-[11px] font-bold text-[#059669]">
                  🟢 Status: Open & Bookable
                </span>
              </div>

              {/* H1 Title */}
              <h1 className="text-[clamp(1.85rem,3.2vw,2.5rem)] font-extrabold text-[#0E0F12] tracking-[-0.03em] leading-[1.15] mb-2.5">
                {space.title}
              </h1>

              {/* Lead Paragraph */}
              <p className="text-[14px] text-[#707175] leading-[1.65] max-w-[760px]">
                {space.fullDescription}
              </p>

              {/* 3.3 Key Performance Indicators (4-Column Metric Strip) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#E2E2DF]">
                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[12px] p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#707175]">
                    CAPACITY
                  </span>
                  <span className="block text-[13px] font-bold text-[#0E0F12] mt-0.5">
                    {space.capacity}
                  </span>
                </div>

                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[12px] p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#707175]">
                    POWER SPEC
                  </span>
                  <span className="block text-[13px] font-bold text-[#0E0F12] mt-0.5">
                    230V + 65W PD
                  </span>
                </div>

                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[12px] p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#707175]">
                    INTERNET BANDWIDTH
                  </span>
                  <span className="block text-[13px] font-bold text-[#0E0F12] mt-0.5">
                    {space.specs.internet.split(" ")[0]} Dedicated
                  </span>
                </div>

                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[12px] p-3.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#707175]">
                    ACOUSTIC SHIELD
                  </span>
                  <span className="block text-[13px] font-bold text-[#0E0F12] mt-0.5">
                    {space.specs.acoustic.split(" ")[0]} Rating
                  </span>
                </div>
              </div>
            </div>

            {/* 3.4 Technical & Spatial Specifications Card */}
            <div className="bg-white border border-[#E2E2DF] rounded-[24px] p-6 sm:p-8 shadow-xs">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#707175]">
                    01 • HARDWARE & ENVIRONMENT
                  </span>
                  <h3 className="text-[18px] font-extrabold text-[#0E0F12] mt-1">
                    Technical & Spatial Specifications
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cell 1 */}
                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[14px] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-[8px] bg-white border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] shrink-0 mt-0.5">
                    <Layers size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#707175]">
                      Space Dimensions
                    </span>
                    <p className="text-[13px] font-bold text-[#0E0F12] mt-0.5 leading-snug">
                      {space.specs.dimensions}
                    </p>
                  </div>
                </div>

                {/* Cell 2 */}
                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[14px] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-[8px] bg-white border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#707175]">
                      Seating Standard
                    </span>
                    <p className="text-[13px] font-bold text-[#0E0F12] mt-0.5 leading-snug">
                      {space.specs.seating}
                    </p>
                  </div>
                </div>

                {/* Cell 3 */}
                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[14px] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-[8px] bg-white border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] shrink-0 mt-0.5">
                    <Wifi size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#707175]">
                      Connectivity
                    </span>
                    <p className="text-[13px] font-bold text-[#0E0F12] mt-0.5 leading-snug">
                      {space.specs.internet}
                    </p>
                  </div>
                </div>

                {/* Cell 4 */}
                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[14px] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-[8px] bg-white border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] shrink-0 mt-0.5">
                    <Zap size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#707175]">
                      Power & Charging Ports
                    </span>
                    <p className="text-[13px] font-bold text-[#0E0F12] mt-0.5 leading-snug">
                      {space.specs.power}
                    </p>
                  </div>
                </div>

                {/* Cell 5 */}
                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[14px] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-[8px] bg-white border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#707175]">
                      Acoustics & Isolation
                    </span>
                    <p className="text-[13px] font-bold text-[#0E0F12] mt-0.5 leading-snug">
                      {space.specs.acoustic}
                    </p>
                  </div>
                </div>

                {/* Cell 6 */}
                <div className="bg-[#F6F6F4] border border-[#E2E2DF] rounded-[14px] p-4 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-[8px] bg-white border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#707175]">
                      Climate & Air Quality
                    </span>
                    <p className="text-[13px] font-bold text-[#0E0F12] mt-0.5 leading-snug">
                      {space.specs.climate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3.5 Included Facility Amenities Card */}
            <div className="bg-white border border-[#E2E2DF] rounded-[24px] p-6 sm:p-8 shadow-xs">
              <h3 className="text-[18px] font-extrabold text-[#0E0F12] mb-5">
                Included Facility Amenities
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {space.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E2E2DF] px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-[#0E0F12] shadow-xs"
                  >
                    <Check size={13} className="text-[#10B981]" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 3.6 Floorplan CAD Viewer Card */}
            <div className="bg-white border border-[#E2E2DF] rounded-[24px] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-[18px] font-extrabold text-[#0E0F12]">
                    Booth Location on Floorplan
                  </h3>
                  <p className="text-[12px] text-[#707175] mt-0.5">
                    {space.location} • {space.floorZone}
                  </p>
                </div>
                <span className="inline-flex items-center self-start bg-[#D5F066] text-[#0E0F12] font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  ZONE: {space.floorZone.split(" ")[0]}
                </span>
              </div>

              {/* Floorplan CAD Viewer */}
              <div className="relative w-full h-[260px] bg-[#14161B] border border-[#23262F] rounded-[16px] p-6 overflow-hidden flex items-center justify-center font-mono select-none">
                <svg
                  className="w-full h-full max-w-[620px]"
                  viewBox="0 0 600 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <pattern
                    id="cad_grid_detail"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />
                  </pattern>
                  <rect width="600" height="240" fill="url(#cad_grid_detail)" />

                  <rect
                    x="20"
                    y="20"
                    width="560"
                    height="200"
                    stroke="#2E333D"
                    strokeWidth="2"
                    fill="none"
                    rx="6"
                  />

                  <text
                    x="240"
                    y="40"
                    fill="#4E5564"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="0.08em"
                  >
                    {space.floorZone}
                  </text>

                  {/* Active Selected Space Highlight */}
                  <rect
                    x="220"
                    y="75"
                    width="160"
                    height="100"
                    stroke="#D5F066"
                    strokeWidth="2"
                    fill="rgba(213,240,102,0.12)"
                    rx="6"
                  />
                  <text
                    x="235"
                    y="125"
                    fill="#D5F066"
                    fontSize="11"
                    fontWeight="800"
                  >
                    ✦ {space.title}
                  </text>
                  <text
                    x="235"
                    y="142"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {space.capacity} • ACTIVE BOOTH
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY BOOKING WORKBENCH (36% - Col 4) ================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-[#E2E2DF] rounded-[24px] p-6 shadow-xs">
              <div className="flex items-baseline justify-between pb-4 border-b border-[#E2E2DF]">
                <div>
                  <span className="text-[10px] font-bold text-[#707175] uppercase">
                    HOURLY RATE
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[28px] font-extrabold text-[#0E0F12] tracking-tight">
                      Rp {space.rate.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[13px] text-[#707175] font-semibold">
                      / hour
                    </span>
                  </div>
                </div>
                <span className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Available Now
                </span>
              </div>

              {/* Booking Workbench Inputs */}
              <div className="space-y-4 pt-4">
                {/* Date & Time Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-[#707175] uppercase">
                      RESERVATION DATE & TIME
                    </label>
                    <span className="text-[10px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 rounded-full">
                      Apple iOS Style
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(true)}
                    className="w-full h-[48px] border border-[#E2E2DF] hover:border-[#FF3B30] rounded-[14px] px-3.5 flex items-center justify-between bg-[#F6F6F4] hover:bg-white transition-all group cursor-pointer text-left shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center group-hover:bg-[#FF3B30] group-hover:text-white transition-colors">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-[#0E0F12]">
                          {selectedDate} • {startTime} WIB
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#FF3B30] group-hover:underline">
                      Change ↗
                    </span>
                  </button>

                  <AppleCalendarPicker
                    isOpen={calendarOpen}
                    initialDate={new Date(selectedDate)}
                    initialTime={startTime}
                    onClose={() => setCalendarOpen(false)}
                    onDateTimeSelect={({ date, time }) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      setSelectedDate(`${year}-${month}-${day}`);
                      setStartTime(time);
                      setCalendarOpen(false);
                    }}
                  />
                </div>

                {/* Start Time & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#707175] uppercase mb-1.5">
                      START TIME
                    </label>
                    <div className="h-[46px] border border-[#E2E2DF] rounded-[12px] px-3 flex items-center bg-[#F6F6F4] focus-within:border-[#0E0F12] focus-within:bg-white">
                      <select
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-transparent text-[13px] font-semibold text-[#0E0F12] outline-none cursor-pointer"
                      >
                        <option value="08:00">08:00 WIB</option>
                        <option value="09:00">09:00 WIB</option>
                        <option value="10:00">10:00 WIB</option>
                        <option value="11:00">11:00 WIB</option>
                        <option value="13:00">13:00 WIB</option>
                        <option value="14:00">14:00 WIB</option>
                        <option value="16:00">16:00 WIB</option>
                        <option value="18:00">18:00 WIB</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#707175] uppercase mb-1.5">
                      DURATION (HOURS)
                    </label>
                    <div className="h-[46px] border border-[#E2E2DF] rounded-[12px] px-2 flex items-center justify-between bg-[#F6F6F4]">
                      <button
                        type="button"
                        onClick={() => setDuration(Math.max(1, duration - 1))}
                        className="w-7 h-7 rounded-[8px] bg-white border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] hover:bg-[#E2E2DF] cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-[13px] font-bold text-[#0E0F12]">
                        {duration} Hours
                      </span>
                      <button
                        type="button"
                        onClick={() => setDuration(Math.min(12, duration + 1))}
                        className="w-7 h-7 rounded-[8px] bg-white border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] hover:bg-[#E2E2DF] cursor-pointer"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Session End Summary */}
                <div className="bg-[#F6F6F4] rounded-[12px] p-3 text-[12px] flex items-center justify-between text-[#707175]">
                  <span>Scheduled Session:</span>
                  <span className="font-bold text-[#0E0F12]">
                    {startTime} – {calculateEndTime(startTime, duration)}
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 space-y-1.5 text-[13px] border-t border-[#E2E2DF]">
                  <div className="flex justify-between text-[#707175]">
                    <span>Rate × Duration ({duration}h)</span>
                    <span className="font-semibold text-[#0E0F12]">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#707175]">
                    <span>High-Speed WiFi & Facilities</span>
                    <span className="font-semibold text-[#10B981]">FREE Included</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E2E2DF] text-[15px] font-extrabold text-[#0E0F12]">
                    <span>Total Estimated</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Reserve Now CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleReserveNow}
                  className="w-full h-[52px] rounded-full bg-[#0E0F12] text-white hover:bg-[#D5F066] hover:text-[#0E0F12] text-[15px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mt-2"
                >
                  <span>Book This Space Now</span>
                  <span>→</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= 4. FULL GALLERY MODAL ================= */}
      <AnimatePresence>
        {galleryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGalleryModalOpen(false)}
              className="absolute inset-0 bg-[#0E0F12]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[1100px] max-h-[88vh] bg-white rounded-[24px] p-6 overflow-y-auto z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E2DF]">
                <h3 className="text-[18px] font-bold text-[#0E0F12]">
                  {space.title} • Photo Dossier
                </h3>
                <button
                  onClick={() => setGalleryModalOpen(false)}
                  className="p-1 rounded-full hover:bg-[#F6F6F4] text-[#0E0F12] cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allPhotos.map((photo, i) => (
                  <div key={i} className="h-[200px] rounded-[16px] overflow-hidden bg-[#1A1A1A]">
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 5. GLOBAL FOOTER ================= */}
      <Footer />
    </div>
  );
}
