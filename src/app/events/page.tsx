"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Users,
  CheckCircle2,
  X,
  Share2,
  Ticket,
  ChevronRight,
  Download,
  Building,
  Radio,
} from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  category: "TECH & DEV" | "CREATIVE WORKSHOPS" | "STARTUP PITCH" | "NETWORKING" | "MASTERCLASS" | "ROUNDTABLE";
  categoryBadge: string;
  dateBadge: string;
  fullDate: string;
  time: string;
  location: string;
  image: string;
  summary: string;
  speaker: {
    name: string;
    role: string;
    avatar: string;
  };
  price: string;
  isFree?: boolean;
  isInviteOnly?: boolean;
  isFlagship?: boolean;
}

const UPCOMING_EVENTS: EventItem[] = [
  {
    id: "event-01",
    title: "Design Systems in Production: Scaling Figma to Code",
    category: "TECH & DEV",
    categoryBadge: "Tech & Dev",
    dateBadge: "SAT, 20 SEP",
    fullDate: "Saturday, 20 September 2026",
    time: "13:00 - 16:00 WIB",
    location: "UHUB Malang • Creative Lab 02",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    summary: "Hands-on architectural workshop standardizing design tokens, mythic animations, and reusable Tailwind core.",
    speaker: {
      name: "Aditya Rama",
      role: "Design Lead • Indigo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    price: "Free for Members",
    isFree: true,
  },
  {
    id: "event-02",
    title: "AI & Fullstack Product Sprint: Ship in 8 Hours",
    category: "CREATIVE WORKSHOPS",
    categoryBadge: "Workshop",
    dateBadge: "SUN, 21 SEP",
    fullDate: "Sunday, 21 September 2026",
    time: "09:00 - 17:00 WIB",
    location: "UHUB Malang • Auditorium Level 3",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
    summary: "Intensive builder hackday leveraging Next.js 15, Gemini API, and serverless edge databases to launch functional MVPs.",
    speaker: {
      name: "Kevin Hendra",
      role: "AI Engineer • VC Fellow",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    price: "Rp 150.000",
  },
  {
    id: "event-03",
    title: "Startup Open Mic & Pitch Night: Early Feedback",
    category: "STARTUP PITCH",
    categoryBadge: "Networking",
    dateBadge: "FRI, 26 SEP",
    fullDate: "Friday, 26 September 2026",
    time: "18:30 - 21:00 WIB",
    location: "UHUB Malang • Social Lounge & Bar",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    summary: "Casual 3-minute pitch sessions over artisanal pour-over coffee. Receive unfiltered feedback from seasoned VCs.",
    speaker: {
      name: "Maya Lestari",
      role: "Managing Partner • SeedHub",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    price: "Free RSVP",
    isFree: true,
  },
  {
    id: "event-04",
    title: "Spatial Psychology: Acoustic Design in Modern Offices",
    category: "CREATIVE WORKSHOPS",
    categoryBadge: "Masterclass",
    dateBadge: "WED, 01 OCT",
    fullDate: "Wednesday, 01 October 2026",
    time: "15:00 - 17:30 WIB",
    location: "UHUB Malang • Studio Focus Hub",
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80",
    summary: "Exploring cognitive resonance, soundbox furniture hygiene, and spatial boundary management for peak cognition.",
    speaker: {
      name: "Rian Santoso",
      role: "Lead Spatial Architect",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    price: "Rp 75.000",
  },
  {
    id: "event-05",
    title: "Fundraising Playbook: Navigating Series A in SEA",
    category: "STARTUP PITCH",
    categoryBadge: "Roundtable",
    dateBadge: "THU, 02 OCT",
    fullDate: "Thursday, 02 October 2026",
    time: "19:00 - 21:30 WIB",
    location: "UHUB Malang • Boardroom Suite",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    summary: "Closed-door round table for tech founders covering term sheet evaluation, valuation metrics, and cap-table defense.",
    speaker: {
      name: "Darmawan K.",
      role: "General Partner • Nexus",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    },
    price: "Invite Only",
    isInviteOnly: true,
  },
  {
    id: "event-06",
    title: "Brand Identity That Converts: From Zero to Market",
    category: "CREATIVE WORKSHOPS",
    categoryBadge: "Workshop",
    dateBadge: "SAT, 04 OCT",
    fullDate: "Saturday, 04 October 2026",
    time: "10:00 - 13:00 WIB",
    location: "UHUB Malang • Main Amphitheater",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    summary: "Practical brand asset workshop for early teams: typography, voice, and visual storytelling for digital-first enterprises.",
    speaker: {
      name: "Siti Nurhaliza",
      role: "Creative Director",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
    price: "Rp 95.000",
  },
];

const CATEGORIES = [
  { id: "ALL", label: "ALL EVENTS (21)" },
  { id: "TECH & DEV", label: "TECH & DEV" },
  { id: "CREATIVE WORKSHOPS", label: "CREATIVE WORKSHOPS" },
  { id: "STARTUP PITCH", label: "STARTUP PITCH" },
  { id: "NETWORKING", label: "NETWORKING" },
];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal States
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState<EventItem | null>(null);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Host Event Form States
  const [hostName, setHostName] = useState("");
  const [hostTopic, setHostTopic] = useState("");
  const [hostSubmitted, setHostSubmitted] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Flagship event data
  const flagshipEvent: EventItem = {
    id: "flagship-2026",
    title: "Tech Founder Mixer & Demo Day 2026",
    category: "STARTUP PITCH",
    categoryBadge: "FEATURED FLAGSHIP",
    dateBadge: "SAT, 19 SEP",
    fullDate: "Saturday, 19 September 2026",
    time: "14:00 WIB",
    location: "MAIN AUDITORIUM • LEVEL 3",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Showcasing 12 high-growth startups within Indigo Ventures, accompanied by speed mentoring with leading venture capitalists and angel networks.",
    speaker: {
      name: "Indigo Ventures",
      role: "Keynote & Demo Curator",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    price: "Free RSVP",
    isFree: true,
    isFlagship: true,
  };

  const filteredEvents = useMemo(() => {
    return UPCOMING_EVENTS.filter((item) => {
      const matchCat =
        activeCategory === "ALL" ||
        item.category === activeCategory ||
        (activeCategory === "NETWORKING" && item.categoryBadge === "Networking");

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.speaker.name.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpSuccess(true);
  };

  const handleHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHostSubmitted(true);
    setTimeout(() => {
      setHostSubmitted(false);
      setHostModalOpen(false);
      setHostName("");
      setHostTopic("");
      showToast("Host application received! Event coordinator will reach out in 24h.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0E0F12] flex flex-col justify-between selection:bg-[#D5F066] selection:text-[#0E0F12]">
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* Main Container */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* ================= 2. HEADER SECTION ================= */}
        <section className="mb-8 sm:mb-12">
          {/* Sub-label Tag */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#E2E2DF] px-3.5 py-1 rounded-full text-[11px] font-bold text-[#707175] shadow-xs mb-3 uppercase tracking-[0.06em]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>UKK COMMUNITY & ECOSYSTEM</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-[clamp(2.5rem,5vw,4.2rem)] font-black tracking-[-0.035em] leading-[1.08] text-[#0E0F12]">
                Connect, Learn
                <br />
                &amp; Build<span className="text-[#D5F066]">.</span>
              </h1>
            </div>

            <div className="max-w-[480px]">
              <p className="text-[14px] sm:text-[15px] text-[#707175] leading-relaxed">
                Curated workshops, keynote sessions, and networking spaces designed to spark collaboration across creators, founders, and tech pioneers.
              </p>
            </div>
          </div>
        </section>

        {/* ================= 3. FEATURED EVENT CARD (FLAGSHIP HERO) ================= */}
        <section className="mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#0A0A0A] text-white rounded-[28px] p-6 sm:p-10 border border-white/10 relative overflow-hidden shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Content (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full">
                <div>
                  {/* Top Badge Row */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-5">
                    <span className="bg-[#D5F066] text-[#0E0F12] text-[10px] font-black tracking-[0.06em] uppercase px-3.5 py-1 rounded-full">
                      FEATURED FLAGSHIP
                    </span>
                    <span className="bg-white/10 text-white/90 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                      <Calendar size={12} className="text-[#D5F066]" />
                      <span>SAT, 19 SEP • 14:00 WIB</span>
                    </span>
                    <span className="bg-white/10 text-white/80 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10 hidden sm:inline-flex">
                      MAIN AUDITORIUM • LEVEL 3
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-[28px] sm:text-[38px] lg:text-[42px] font-black text-white tracking-[-0.02em] leading-[1.12]">
                    Tech Founder Mixer &amp;
                    <br />
                    Demo Day 2026
                  </h2>

                  {/* Description */}
                  <p className="text-white/70 text-[14px] sm:text-[15px] leading-relaxed mt-4 max-w-[540px]">
                    Showcasing 12 high-growth startups within Indigo Ventures, accompanied by speed mentoring with leading venture capitalists and angel networks.
                  </p>
                </div>

                {/* Bottom Meta & Action Row */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  {/* Attendee Avatar Stack */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 overflow-hidden">
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0A0A0A] object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        alt="Attendee 1"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0A0A0A] object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                        alt="Attendee 2"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0A0A0A] object-cover"
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                        alt="Attendee 3"
                      />
                      <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-[#0A0A0A] bg-[#1C1D21] text-white text-[10px] font-bold items-center justify-center">
                        +150
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-white">
                        150 Founders &amp; Builders
                      </span>
                      <span className="text-[10px] text-white/50">
                        Confirmed attending
                      </span>
                    </div>
                  </div>

                  {/* Price & CTA Button */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-white/50">
                        INVESTMENT
                      </span>
                      <span className="text-[16px] font-extrabold text-[#D5F066]">
                        Free RSVP
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setSelectedEventForRsvp(flagshipEvent);
                        setRsvpSuccess(false);
                      }}
                      className="px-6 py-3 rounded-full bg-[#D5F066] hover:bg-[#c6e44b] text-[#0E0F12] text-[13px] font-bold inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <span>Register Now</span>
                      <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Right Image (5 Cols) */}
              <div className="lg:col-span-5 h-full">
                <div className="relative w-full h-[260px] sm:h-[340px] rounded-2xl overflow-hidden border border-white/10 bg-[#1C1D21]">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                    alt="Flagship Event"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-[11px] font-medium text-white flex items-center gap-1.5">
                    <Radio size={12} className="text-red-500 animate-pulse" />
                    <span>Live Stage &amp; Hybrid Stream</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ================= 4. FILTER & SEARCH BAR ================= */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold tracking-[0.02em] uppercase transition-all cursor-pointer shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-[#0E0F12] text-white shadow-xs"
                      : "bg-white border border-[#E2E2DF] text-[#707175] hover:border-[#0E0F12] hover:text-[#0E0F12]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Inline Search Input */}
            <div className="relative w-full lg:w-[320px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search upcoming events..."
                className="w-full h-[42px] bg-white border border-[#E2E2DF] rounded-full pl-10 pr-9 text-[13px] text-[#0E0F12] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0E0F12] focus:ring-1 focus:ring-[#0E0F12] transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0E0F12]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ================= 5. UPCOMING CALENDAR (6-CARD GRID) ================= */}
        <section className="mb-20">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E2DF] mb-6">
            <div>
              <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#0E0F12] tracking-tight">
                Upcoming Calendar
              </h2>
              <span className="block text-[11px] font-bold tracking-[0.06em] uppercase text-[#707175] mt-0.5">
                SEPTEMBER — OCTOBER 2026
              </span>
            </div>

            <span className="text-[12px] font-semibold text-[#707175] flex items-center gap-1.5">
              <span>Showing {filteredEvents.length} Curated Sessions</span>
              <Sparkles size={14} className="text-[#0E0F12]" />
            </span>
          </div>

          {/* Cards Grid */}
          {filteredEvents.length === 0 ? (
            <div className="bg-white border border-[#E2E2DF] rounded-2xl p-12 text-center my-6">
              <div className="w-12 h-12 rounded-full bg-[#F6F6F4] flex items-center justify-center text-[#707175] mx-auto mb-3">
                <Search size={20} />
              </div>
              <h3 className="text-[17px] font-bold text-[#0E0F12]">No Events Match Your Query</h3>
              <p className="text-[13px] text-[#707175] mt-1">
                Try resetting your category filter or search keywords.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("ALL");
                  setSearchQuery("");
                }}
                className="mt-4 px-5 py-2 bg-[#0E0F12] text-white text-[12px] font-bold rounded-full hover:bg-black"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white border border-[#E2E2DF] hover:border-[#0E0F12]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Card Thumbnail with Overlays */}
                  <div>
                    <div className="relative w-full h-[190px] overflow-hidden bg-[#1C1D21]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {/* Top-Left Date Chip */}
                      <span className="absolute top-3 left-3 bg-white text-[#0E0F12] text-[11px] font-black px-3 py-1 rounded-full shadow-xs tracking-tight">
                        {item.dateBadge}
                      </span>
                      {/* Top-Right Category Pill */}
                      <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-white/10">
                        {item.categoryBadge}
                      </span>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5">
                      {/* Time & Venue Strip */}
                      <div className="flex items-center gap-2 text-[12px] text-[#707175] mb-2 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#0E0F12]" />
                          <strong className="text-[#0E0F12]">{item.time}</strong>
                        </span>
                        <span>•</span>
                        <span className="truncate flex items-center gap-1">
                          <MapPin size={12} />
                          <span className="truncate">{item.location}</span>
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-[17px] font-bold text-[#0E0F12] leading-snug hover:text-black transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-[13px] text-[#707175] leading-relaxed mt-2 line-clamp-2">
                        {item.summary}
                      </p>

                      {/* Speaker Badge */}
                      <div className="mt-4 pt-3.5 border-t border-[#E2E2DF]/70 flex items-center gap-2.5">
                        <img
                          src={item.speaker.avatar}
                          alt={item.speaker.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#E2E2DF]"
                        />
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-[#0E0F12] leading-tight">
                            {item.speaker.name}
                          </span>
                          <span className="text-[10px] text-[#707175] leading-tight">
                            {item.speaker.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-[#E2E2DF]/70">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.06em] text-[#707175]">
                          TICKET
                        </span>
                        {item.isInviteOnly ? (
                          <span className="inline-block text-[11px] font-extrabold bg-[#D5F066] text-[#0E0F12] px-2.5 py-0.5 rounded-full mt-0.5">
                            Invite Only
                          </span>
                        ) : (
                          <span className="text-[13px] font-extrabold text-[#0E0F12]">
                            {item.price}
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setSelectedEventForRsvp(item);
                          setRsvpSuccess(false);
                        }}
                        className={`px-4 py-2 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          item.isInviteOnly
                            ? "bg-[#0E0F12] hover:bg-black text-white"
                            : "bg-[#0E0F12] hover:bg-black text-white"
                        }`}
                      >
                        <span>{item.isInviteOnly ? "Request Invitation" : "Join Event"}</span>
                        <ChevronRight size={13} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ================= 6. "WHY HOST WITH US" SHOWCASE BLOCK ================= */}
        <section className="mb-20">
          <div className="bg-white rounded-[28px] border border-[#E2E2DF] p-6 sm:p-10 shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Photo (5 Cols) */}
              <div className="lg:col-span-5">
                <div className="relative w-full h-[280px] sm:h-[380px] rounded-2xl overflow-hidden bg-[#1C1D21] border border-[#E2E2DF]">
                  <img
                    src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80"
                    alt="UHUB Entrance and Turnstile Hall"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[#0E0F12] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                    📍 Moklet Hub Malang • Lobby Wing
                  </span>
                </div>
              </div>

              {/* Right Content & Stats (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#F6F6F4] border border-[#E2E2DF] px-3.5 py-1 rounded-full text-[11px] font-bold text-[#707175] uppercase tracking-[0.06em] mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D5F066]" />
                    <span>WHY HOST WITH US</span>
                  </div>

                  <h2 className="text-[26px] sm:text-[34px] font-extrabold text-[#0E0F12] tracking-tight leading-[1.18]">
                    Turn Your Ideas Into City-Scale Gatherings<span className="text-[#D5F066]">.</span>
                  </h2>

                  <p className="text-[14px] sm:text-[15px] text-[#707175] leading-relaxed mt-3 max-w-[620px]">
                    Whether you are organizing a closed technical sprint, an investor demo day, or an open creative symposium, UHUB provides turnkey acoustic architecture, 1 Gbps symmetric fiber optics, and direct access to our premier innovation network.
                  </p>
                </div>

                {/* 3-Column Metric Stats Row */}
                <div className="grid grid-cols-3 gap-4 my-8 pt-6 border-t border-[#E2E2DF]">
                  <div>
                    <div className="text-[28px] sm:text-[36px] font-black text-[#0E0F12] tracking-tight tabular-nums">
                      50+
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-medium text-[#707175] block mt-0.5">
                      Annual Curated Events
                    </span>
                  </div>

                  <div>
                    <div className="text-[28px] sm:text-[36px] font-black text-[#0E0F12] tracking-tight tabular-nums">
                      1,200+
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-medium text-[#707175] block mt-0.5">
                      Active Hub Members
                    </span>
                  </div>

                  <div>
                    <div className="text-[28px] sm:text-[36px] font-black text-[#0E0F12] tracking-tight tabular-nums">
                      98.4%
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-medium text-[#707175] block mt-0.5">
                      Participant CSAT Score
                    </span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setHostModalOpen(true)}
                    className="px-8 py-3.5 rounded-full bg-[#D5F066] hover:bg-[#c6e44b] text-[#0E0F12] text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Apply to Host an Event</span>
                    <ArrowRight size={15} />
                  </motion.button>

                  <span className="text-[12px] text-[#707175] max-w-[300px]">
                    Turnkey event management, live streaming &amp; catering support included.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= MODALS ================= */}

      {/* 1. EVENT RSVP / REGISTRATION MODAL */}
      <AnimatePresence>
        {selectedEventForRsvp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] max-w-[500px] w-full p-6 sm:p-8 shadow-2xl border border-[#E2E2DF] relative max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedEventForRsvp(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F6F4] flex items-center justify-center text-[#707175] hover:text-[#0E0F12] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {rsvpSuccess ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full">
                    REGISTRATION CONFIRMED
                  </span>
                  <h3 className="text-[22px] font-extrabold text-[#0E0F12] mt-3">
                    You&apos;re On the Guest List!
                  </h3>
                  <p className="text-[13px] text-[#707175] mt-1.5 max-w-[380px] mx-auto">
                    Your digital pass for <strong>{selectedEventForRsvp.title}</strong> has been issued. An entry QR Code was sent to <strong>{rsvpEmail || "your email"}</strong>.
                  </p>

                  <div className="mt-6 p-4 bg-[#F6F6F4] rounded-xl border border-[#E2E2DF] text-left text-[12px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#707175]">Schedule:</span>
                      <span className="font-bold text-[#0E0F12]">{selectedEventForRsvp.fullDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#707175]">Time:</span>
                      <span className="font-bold text-[#0E0F12]">{selectedEventForRsvp.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#707175]">Location:</span>
                      <span className="font-bold text-[#0E0F12]">{selectedEventForRsvp.location}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => {
                        showToast("Event added to calendar!");
                        setSelectedEventForRsvp(null);
                      }}
                      className="flex-1 py-3 rounded-full bg-[#0E0F12] text-white text-[13px] font-bold hover:bg-black transition-all"
                    >
                      Add to Calendar
                    </button>
                    <button
                      onClick={() => setSelectedEventForRsvp(null)}
                      className="px-5 py-3 rounded-full border border-[#E2E2DF] text-[13px] font-semibold text-[#0E0F12] hover:bg-[#F6F6F4]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#D5F066] text-[#0E0F12] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                      {selectedEventForRsvp.categoryBadge}
                    </span>
                    <span className="text-[12px] font-semibold text-[#707175]">
                      {selectedEventForRsvp.dateBadge}
                    </span>
                  </div>

                  <h3 className="text-[20px] font-extrabold text-[#0E0F12] leading-snug">
                    {selectedEventForRsvp.title}
                  </h3>

                  <div className="mt-3 p-3 bg-[#F6F6F4] rounded-xl border border-[#E2E2DF] text-[12px] text-[#707175] flex items-center justify-between">
                    <span>Ticket Admission:</span>
                    <strong className="text-[14px] text-[#0E0F12] font-black">{selectedEventForRsvp.price}</strong>
                  </div>

                  <form onSubmit={handleRsvpSubmit} className="mt-5 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#0E0F12] mb-1">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full h-[44px] px-3.5 bg-[#F6F6F4] border border-[#E2E2DF] rounded-xl text-[13px] text-[#0E0F12] focus:outline-none focus:border-[#0E0F12] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#0E0F12] mb-1">
                        WORK EMAIL
                      </label>
                      <input
                        type="email"
                        required
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full h-[44px] px-3.5 bg-[#F6F6F4] border border-[#E2E2DF] rounded-xl text-[13px] text-[#0E0F12] focus:outline-none focus:border-[#0E0F12] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#0E0F12] mb-1">
                        PHONE / WHATSAPP
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0812-3456-7890"
                        className="w-full h-[44px] px-3.5 bg-[#F6F6F4] border border-[#E2E2DF] rounded-xl text-[13px] text-[#0E0F12] focus:outline-none focus:border-[#0E0F12] focus:bg-white"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full h-[48px] rounded-full bg-[#D5F066] hover:bg-[#c6e44b] text-[#0E0F12] text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <span>Confirm RSVP Registration</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. APPLY TO HOST EVENT MODAL */}
      <AnimatePresence>
        {hostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] max-w-[500px] w-full p-6 sm:p-8 shadow-2xl border border-[#E2E2DF] relative max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setHostModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F6F4] flex items-center justify-center text-[#707175] hover:text-[#0E0F12] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="inline-flex items-center gap-2 bg-[#F6F6F4] border border-[#E2E2DF] px-3 py-1 rounded-full text-[10px] font-bold text-[#707175] uppercase tracking-[0.06em] mb-2">
                <span>COMMUNITY HOSTING PROGRAM</span>
              </div>

              <h3 className="text-[22px] font-extrabold text-[#0E0F12]">
                Host Your Event at UHUB
              </h3>
              <p className="text-[13px] text-[#707175] mt-1 mb-5">
                We provide our auditorium, live streaming equipment, acoustic stages, and promotion across 1,200+ members.
              </p>

              <form onSubmit={handleHostSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#0E0F12] mb-1">
                    ORGANIZER / COMMUNITY NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="e.g. Jakarta AI Builders"
                    className="w-full h-[44px] px-3.5 bg-[#F6F6F4] border border-[#E2E2DF] rounded-xl text-[13px] text-[#0E0F12] focus:outline-none focus:border-[#0E0F12] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#0E0F12] mb-1">
                    EVENT TOPIC &amp; FORMAT
                  </label>
                  <input
                    type="text"
                    required
                    value={hostTopic}
                    onChange={(e) => setHostTopic(e.target.value)}
                    placeholder="e.g. Next.js 15 Deep Dive Workshop (50 Pax)"
                    className="w-full h-[44px] px-3.5 bg-[#F6F6F4] border border-[#E2E2DF] rounded-xl text-[13px] text-[#0E0F12] focus:outline-none focus:border-[#0E0F12] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#0E0F12] mb-1">
                      TARGET DATE
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full h-[44px] px-3 bg-[#F6F6F4] border border-[#E2E2DF] rounded-xl text-[13px] text-[#0E0F12] focus:outline-none focus:border-[#0E0F12] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[#0E0F12] mb-1">
                      EXPECTED ATTENDEES
                    </label>
                    <select className="w-full h-[44px] px-3 bg-[#F6F6F4] border border-[#E2E2DF] rounded-xl text-[13px] text-[#0E0F12] focus:outline-none focus:border-[#0E0F12] focus:bg-white">
                      <option>20 - 50 Persons</option>
                      <option>50 - 100 Persons</option>
                      <option>100 - 250 Persons</option>
                      <option>250+ (Full Hub Takeover)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={hostSubmitted}
                    className="w-full h-[48px] rounded-full bg-[#0E0F12] hover:bg-black text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-75"
                  >
                    {hostSubmitted ? (
                      <span>Submitting Proposal...</span>
                    ) : (
                      <>
                        <span>Submit Hosting Request</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0E0F12] text-white px-5 py-3 rounded-full text-[13px] font-semibold shadow-xl flex items-center gap-2 border border-white/10"
          >
            <CheckCircle2 size={16} className="text-[#D5F066]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 7. CINEMATIC CURTAIN-REVEAL FOOTER ================= */}
      <Footer />
    </div>
  );
}
