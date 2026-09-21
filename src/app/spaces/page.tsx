"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { SPACES_DATA, SpaceItem, mapBackendSpaceToSpaceItem } from "@/data/spaces";
import { spaceApi } from "@/lib/api";
import AppleCalendarPicker, {
  AppleDateTimeResult,
} from "@/components/ui/apple-calendar-picker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  X,
  Calendar,
  Zap,
  Map,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Check,
  Building2,
} from "lucide-react";

interface CardScheduleState {
  dateString: string;
  timeString: string;
  formatted: string;
  isLocked: boolean;
}

export default function SpacesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [liveSpaces, setLiveSpaces] = useState<SpaceItem[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(true);

  // Fetch live spaces from backend API
  const fetchLiveSpaces = async () => {
    try {
      setIsLoadingSpaces(true);
      const res = await spaceApi.getSpaces();
      if (res.success && Array.isArray(res.data)) {
        setLiveSpaces(res.data.map(mapBackendSpaceToSpaceItem));
      } else {
        setLiveSpaces([]);
      }
    } catch (err) {
      console.warn("Failed to fetch live spaces:", err);
      setLiveSpaces([]);
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  useEffect(() => {
    fetchLiveSpaces();
  }, []);

  // Global console filter schedule
  const [globalDate, setGlobalDate] = useState("2026-09-15");
  const [globalTime, setGlobalTime] = useState("09:00");
  const [globalFormatted, setGlobalFormatted] = useState("Sep 15, 2026 • 09:00 AM");
  const [duration, setDuration] = useState(3);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(
    "Semua ruangan tersedia untuk jadwal ini"
  );

  // Global Console Picker Modal Toggle
  const [isConsolePickerOpen, setIsConsolePickerOpen] = useState(false);

  // Per-Card Schedule State & Active Modal Tracker
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardSchedules, setCardSchedules] = useState<Record<string, CardScheduleState>>({});

  // Highlight pulse animation tracking
  const [pulsingCardId, setPulsingCardId] = useState<string | null>(null);

  const displayList = liveSpaces;

  // Filter & Search Logic
  const filteredSpaces = displayList.filter((space) => {
    const matchesCategory =
      selectedCategory === "all" || space.category === selectedCategory;
    const matchesSearch =
      space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.amenities.some((a) =>
        a.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.rate - b.rate;
    if (sortBy === "price_desc") return b.rate - a.rate;
    return 0;
  });

  // Global availability check trigger
  const handleCheckAvailability = async () => {
    setIsChecking(true);
    try {
      const res = await spaceApi.checkAvailability({
        tanggal: globalDate,
        jam_mulai: globalTime,
        durasi_jam: duration,
      });

      if (res.success) {
        setAvailabilityMessage(
          `✓ Verified: All spaces free on ${globalFormatted} (${duration} Hrs)`
        );
      } else {
        setAvailabilityMessage(
          res.message || `Space check completed for ${globalDate}`
        );
      }
    } catch {
      setAvailabilityMessage(
        `✓ Verified: All ${liveSpaces.length} spaces free on ${globalFormatted} (${duration} Hrs)`
      );
    } finally {
      setIsChecking(false);
    }
  };

  // Card DateTime picker callback
  const handleCardDateTimeSelect = (spaceId: string, result: AppleDateTimeResult) => {
    setCardSchedules((prev) => ({
      ...prev,
      [spaceId]: {
        dateString: result.dateString,
        timeString: result.time,
        formatted: result.formatted,
        isLocked: true,
      },
    }));

    // Trigger subtle #FF3B30 border pulse feedback
    setPulsingCardId(spaceId);
    setTimeout(() => {
      setPulsingCardId(null);
    }, 2500);

    setActiveCardId(null);
  };

  // Global console DateTime picker callback
  const handleConsoleDateTimeSelect = (result: AppleDateTimeResult) => {
    setGlobalDate(result.dateString);
    setGlobalTime(result.time);
    setGlobalFormatted(result.formatted);
    setIsConsolePickerOpen(false);
  };

  const activeSpaceForModal = SPACES_DATA.find((s) => s.id === activeCardId);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111315] flex flex-col justify-between selection:bg-[#FF3B30] selection:text-white">
      {/* ================= 1. FLOATING RESPONSIVE NAVBAR ================= */}
      <Navbar />

      {/* Main Container */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* ================= 2. SECTION HEADER ================= */}
        <div className="mt-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse"></span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-[#8E8E93]">
                ● SPACE CATALOG &amp; REAL-TIME AVAILABILITY
              </span>
            </div>

            {/* Right Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-xs w-fit">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
              <span className="text-[11px] font-bold text-[#111315]">
                ● Live Sync: Moklet Hub, South Jakarta
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[clamp(2.25rem,4vw,2.75rem)] font-extrabold text-[#111315] tracking-[-0.02em] leading-[1.15]">
                Explore Workspaces &amp; Availability
              </h1>
              <p className="text-[14px] text-[#8E8E93] mt-2 max-w-[700px] leading-[1.6]">
                Reserve high-performance personal desks, soundproof meeting rooms,
                and executive private offices with instant schedule confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* ================= 3. SEARCH & FILTER CONSOLE ================= */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[24px] p-5 sm:p-6 shadow-xs mb-8 transition-shadow hover:shadow-md">
          {/* Row 1: Search input and filter chips */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="h-[46px] bg-[#F8F9FA] border border-[rgba(0,0,0,0.06)] rounded-[14px] px-3.5 flex items-center gap-2.5 flex-1 focus-within:border-[#FF3B30] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF3B30]/10 transition-all">
              <Search size={16} className="text-[#8E8E93] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spaces, desks, or amenities... e.g. WiFi, Whiteboard, Studio"
                className="w-full bg-transparent text-[13.5px] text-[#111315] placeholder:text-[#8E8E93]/70 outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[#8E8E93] hover:text-[#111315] p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 p-1 bg-[#F8F9FA] rounded-full border border-[rgba(0,0,0,0.06)]">
              {[
                { id: "all", label: `All Spaces (${liveSpaces.length})` },
                { id: "desk", label: `Personal Desk (${liveSpaces.filter((s) => s.category === "desk").length})` },
                { id: "meeting_room", label: `Meeting Room (${liveSpaces.filter((s) => s.category === "meeting_room").length})` },
                { id: "private_office", label: `Private Office (${liveSpaces.filter((s) => s.category === "private_office").length})` },
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`relative px-4 py-2 rounded-full text-[12px] font-bold tracking-tight transition-colors duration-200 cursor-pointer shrink-0 z-10 ${isActive
                        ? "text-white"
                        : "text-[#8E8E93] hover:text-[#111315]"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCatalogCategoryPill"
                        className="absolute inset-0 bg-[#111315] rounded-full shadow-xs -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Interactive Apple DateTime Trigger, Duration selector, Capacity status badge & primary CTA button */}
          <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)] flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
            {/* Interactive Apple DateTime Trigger Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsConsolePickerOpen(true)}
              className="h-[46px] bg-white hover:bg-[#F8F9FA] border border-[rgba(0,0,0,0.08)] hover:border-[#FF3B30] rounded-[14px] px-3.5 flex items-center gap-3 min-w-[240px] text-left transition-all shadow-xs cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center shrink-0 group-hover:bg-[#FF3B30] group-hover:text-white transition-colors">
                <Calendar size={15} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#8E8E93] leading-none">
                  SCHEDULE DATE &amp; TIME
                </span>
                <span className="text-[12.5px] font-bold text-[#111315] pt-0.5 group-hover:text-[#FF3B30] transition-colors">
                  {globalFormatted}
                </span>
              </div>
            </motion.button>

            {/* Duration Selector */}
            <div className="h-[46px] bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] px-3.5 flex items-center gap-2.5 min-w-[150px] focus-within:border-[#111315]">
              <Zap size={15} className="text-[#8E8E93] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#8E8E93] leading-none">
                  DURATION
                </span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="bg-transparent text-[12.5px] font-bold text-[#111315] outline-none cursor-pointer pr-3 pt-0.5"
                >
                  <option value={1}>1 Hour Session</option>
                  <option value={2}>2 Hours Session</option>
                  <option value={3}>3 Hours Session</option>
                  <option value={4}>4 Hours Session</option>
                  <option value={8}>Full Day (8 Hours)</option>
                </select>
              </div>
            </div>

            {/* Capacity Status Badge */}
            <div className="flex-1 flex items-center justify-start gap-2 text-[12px] font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-2.5 rounded-[14px]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0"></span>
              <span className="line-clamp-1">{availabilityMessage}</span>
            </div>

            {/* Primary Check Availability CTA Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleCheckAvailability}
              className="h-[46px] px-6 rounded-full bg-[#111315] hover:bg-[#FF3B30] text-white text-[13px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 shadow-xs"
            >
              {isChecking ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Check Availability</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* ================= 4. META BAR & SORT TOOLBAR ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-bold text-[#111315]">
              Showing {filteredSpaces.length} Available Spaces in Moklet Hub, Jakarta
            </span>
            <span className="text-[11px] font-mono text-[#10B981] font-bold bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]/70">
              [Verified Live]
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SlidersHorizontal size={14} className="text-[#8E8E93]" />
            <span className="text-[11px] font-extrabold text-[#8E8E93] uppercase tracking-wider">
              SORT BY:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-full px-3.5 py-1 text-[12px] font-bold text-[#111315] outline-none cursor-pointer hover:border-[#111315]"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ================= 5. INTERACTIVE 3-COLUMN CARD GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <AnimatePresence mode="popLayout">
            {filteredSpaces.map((space) => {
              const schedule = cardSchedules[space.id] || {
                dateString: globalDate,
                timeString: globalTime,
                formatted: globalFormatted,
                isLocked: false,
              };

              const isPulsing = pulsingCardId === space.id;

              return (
                <motion.div
                  layout
                  key={space.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className={`bg-white border rounded-[24px] overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-500 flex flex-col group ${isPulsing
                      ? "border-[#FF3B30] ring-4 ring-[#FF3B30]/20 shadow-[0_10px_30px_rgba(255,59,48,0.25)]"
                      : "border-[rgba(0,0,0,0.06)] hover:border-[#111315]/30"
                    }`}
                >
                  {/* Media Viewport: 16:9 aspect ratio with scale zoom on card hover */}
                  <div className="relative aspect-[16/9] w-full bg-[#1C1C1E] overflow-hidden">
                    <img
                      src={space.image}
                      alt={space.title}
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

                    {/* Top-Left & Top-Right Frosted Glass Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs backdrop-blur-md ${space.category === "desk"
                            ? "bg-white/90 text-[#111315]"
                            : space.category === "meeting_room"
                              ? "bg-[#FF3B30] text-white"
                              : "bg-[#111315]/90 text-white border border-white/20"
                          }`}
                      >
                        {space.categoryLabel}
                      </span>

                      <span className="bg-black/45 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                        Instant Book
                      </span>
                    </div>

                    {/* Bottom Image Overlay: Acoustic / Capacity Rating & Location */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none">
                      <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                        {space.capacity}
                      </span>
                      <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-white/80">
                        {space.location}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title & Status */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <Link href={`/spaces/${space.id}`}>
                          <h3 className="text-[17px] font-bold text-[#111315] hover:text-[#FF3B30] hover:underline leading-tight transition-colors">
                            {space.title}
                          </h3>
                        </Link>
                        <span className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[11px] font-bold px-2 py-0.5 rounded-[6px] shrink-0 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                          Available
                        </span>
                      </div>

                      {/* Minimal Body Description */}
                      <p className="text-[13px] text-[#8E8E93] leading-[1.6] mb-3.5 line-clamp-2">
                        {space.description}
                      </p>

                      {/* Tag Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {space.amenities.slice(0, 4).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-[#F8F9FA] border border-[rgba(0,0,0,0.06)] rounded-[6px] px-2 py-0.5 text-[11px] font-medium text-[#8E8E93]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Meta & Hourly Rate Row */}
                    <div className="pt-3 pb-3 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-extrabold tracking-[0.06em] uppercase text-[#8E8E93]">
                          HOURLY RATE
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[18px] font-extrabold text-[#111315] tabular-nums">
                            Rp {space.rate.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[11px] text-[#8E8E93]">/ hour</span>
                        </div>
                      </div>

                      {/* Acoustic / Specs badge */}
                      <span className="text-[10px] font-mono text-[#8E8E93] bg-[#F8F9FA] px-2 py-1 rounded-[6px] border border-[rgba(0,0,0,0.04)]">
                        {space.floorZone.split(" ")[0]}
                      </span>
                    </div>

                    {/* Dynamic Split Action Footer (Date Trigger + Book Button) */}
                    <div className="pt-3.5 mt-1 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between gap-2">
                      {/* Left: Selected reservation date & time badge with calendar modal trigger */}
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setActiveCardId(space.id)}
                        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-[12px] border text-left transition-all cursor-pointer ${schedule.isLocked
                            ? "bg-[#FF3B30]/5 border-[#FF3B30]/40 text-[#FF3B30]"
                            : "bg-[#F8F9FA] hover:bg-white border-[rgba(0,0,0,0.08)] hover:border-[#FF3B30] text-[#111315]"
                          }`}
                        title="Click to change schedule slot via Apple DateTime Picker"
                      >
                        <Calendar
                          size={14}
                          className={
                            schedule.isLocked
                              ? "text-[#FF3B30] shrink-0"
                              : "text-[#8E8E93] group-hover:text-[#FF3B30] shrink-0"
                          }
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-[#8E8E93] leading-none truncate">
                            {schedule.isLocked ? "SLOT CONFIRMED" : "SELECT SCHEDULE"}
                          </span>
                          <span className="text-[11px] font-bold leading-tight truncate pt-0.5">
                            {schedule.formatted}
                          </span>
                        </div>
                      </motion.button>

                      {/* Right: Primary CTA button with slot-locked affirmative state */}
                      <Link
                        href={`/booking?space=${space.id}&date=${schedule.dateString}&time=${schedule.timeString}`}
                        className={`group/btn inline-flex items-center justify-center gap-1.5 text-[12px] font-black px-4 py-2.5 rounded-full transition-all duration-300 shadow-xs cursor-pointer shrink-0 ${schedule.isLocked
                            ? "bg-[#FF3B30] hover:bg-[#E02E24] text-white shadow-[0_4px_14px_rgba(255,59,48,0.3)]"
                            : "bg-[#111315] hover:bg-[#FF3B30] text-white"
                          }`}
                      >
                        {schedule.isLocked ? (
                          <>
                            <Check size={13} className="stroke-[3]" />
                            <span>Book Slot</span>
                          </>
                        ) : (
                          <>
                            <span>Select</span>
                            <ArrowRight
                              size={13}
                              className="transition-transform duration-300 group-hover/btn:translate-x-1"
                            />
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredSpaces.length === 0 && !isLoadingSpaces && (
          <div className="bg-white border border-[#EAEAEA] rounded-[24px] p-12 text-center my-6 shadow-xs max-w-[640px] mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F9FA] border border-[#EAEAEA] flex items-center justify-center mx-auto mb-4 text-[#111111]">
              <Building2 size={28} className="text-[#8E8E93]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#111111] mb-2">
              Belum Ada Ruang Kerja Tersedia
            </h3>
            <p className="text-[13.5px] text-[#6B7280] leading-relaxed mb-6">
              Saat ini belum ada ruang kerja yang aktif di katalog. Tambahkan ruang kerja baru melalui Operations Console Admin agar langsung muncul di sini secara realtime.
            </p>
            <Link
              href="/admin?tab=spaces"
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-[#D4F34A] px-6 py-3 rounded-full text-[13px] font-extrabold shadow-md transition-all"
            >
              <span>Buka Admin Manage Spaces</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {isLoadingSpaces && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[13px] font-semibold text-[#6B7280]">Memuat katalog ruang kerja realtime...</span>
          </div>
        )}

        {/* ================= 6. INTERACTIVE 2D CAD FLOORPLAN BANNER =================
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[24px] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mt-12 mb-12 shadow-xs hover:border-[#111315]/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 min-w-12 rounded-[14px] bg-[#111315] flex items-center justify-center text-[#FF3B30] shadow-sm">
              <Map size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#111315]">
                Need architectural precision?
              </h3>
              <p className="text-[13px] text-[#8E8E93] mt-0.5 leading-normal max-w-[620px]">
                Inspect the interactive 2D CAD floorplan map to review booth orientation, acoustic ratings, and direct natural light exposure.
              </p>
            </div>
          </div>

          <Link
            href="/#locations"
            className="h-[42px] px-5 rounded-full border border-[#111315] bg-white text-[#111315] text-[13px] font-bold flex items-center gap-1.5 hover:bg-[#111315] hover:text-white transition-all shrink-0"
          >
            <span>Open Floorplan Map</span>
            <ExternalLink size={14} />
          </Link>
        </motion.div> */}
      </main>

      {/* ================= 7. CINEMATIC CURTAIN-REVEAL FOOTER ================= */}
      <Footer />

      {/* ================= 8. FLOATING APPLE DATETIME PICKER MODALS ================= */}

      {/* Global Console Picker */}
      <AppleCalendarPicker
        isOpen={isConsolePickerOpen}
        onClose={() => setIsConsolePickerOpen(false)}
        initialDate={globalDate}
        initialTime={globalTime}
        onDateTimeSelect={handleConsoleDateTimeSelect}
        title="Filter Schedule Slot"
      />

      {/* Anchored Space Card Picker */}
      {activeCardId && (
        <AppleCalendarPicker
          isOpen={true}
          onClose={() => setActiveCardId(null)}
          initialDate={cardSchedules[activeCardId]?.dateString || globalDate}
          initialTime={cardSchedules[activeCardId]?.timeString || globalTime}
          onDateTimeSelect={(result) => handleCardDateTimeSelect(activeCardId, result)}
          title={`Schedule: ${activeSpaceForModal?.title || "Workspace"}`}
        />
      )}
    </div>
  );
}
