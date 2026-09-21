"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CountingNumber } from "@/components/ui/counting-number";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Building2,
  Users,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Mail,
  Send,
  X,
  Zap,
  Coffee,
  Mic,
  Monitor,
  Check,
  Compass,
} from "lucide-react";

// Clean inline vector brand icons for social links
const LinkedInIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GithubIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface LeaderProfile {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin: string;
  isDirector?: boolean;
}

const LEADERSHIP_DATA: LeaderProfile[] = [
  {
    name: "Bima Wicaksono",
    role: "Hub Director & Ecosystem Lead",
    bio: "Ex-Indigo Ventures partner specializing in institutional spatial strategy and incubation syndicates.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    linkedin: "https://linkedin.com",
    isDirector: true,
  },
  {
    name: "Aditya Danu",
    role: "Head of Product & Design Engineering",
    bio: "SMK Telkom alumnus turned design systems lead, mentoring student developers in scaled UI architectures.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Maya Larasati",
    role: "Community & Venture Partnerships",
    bio: "Curates investor roundtables and connects high-potential campus projects with national capital.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Kevin Novian",
    role: "Chief Technology Fellow",
    bio: "YC alum running our open-source sandbox, low-latency container clusters, and distributed server labs.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    linkedin: "https://linkedin.com",
  },
];

const FOUNDATIONS_DATA = [
  {
    index: "01",
    title: "Industry-Grade Ecosystem",
    body: "Enterprise-grade fiber backbone, dedicated server isolation racks, low-latency testing labs, and 100% cloud-native development environments ready on demand.",
    footerMeta: "INFRASTRUCTURE FIRST",
    icon: Cpu,
  },
  {
    index: "02",
    title: "Cross-Disciplinary Synergy",
    body: "Blending software engineering, product design, AI research, and digital business ventures under one unified architectural roof for frictionless cross-pollination.",
    footerMeta: "INTERDISCIPLINARY CULTURE",
    icon: Layers,
  },
  {
    index: "03",
    title: "Community-First Growth",
    body: "Open-door mentorship for student creators, indie hackers, and seed-stage startups through weekly code teardowns, investor pitch sandboxes, and office hours.",
    footerMeta: "HIGH-TRUST NETWORK",
    icon: Users,
  },
];

const STATS_DATA = [
  { value: "2,500+ m²", label: "Total Usable Workspace", meta: "Across 3 levels" },
  { value: "1,200+", label: "Active Tech Members & Creators", meta: "Weekly active density" },
  { value: "45+", label: "Industry & Academic Partners", meta: "Venture & enterprise tier" },
  { value: "99.9%", label: "Network Uptime & Redundant Fiber", meta: "Dual 1 Gbps ISP pipes" },
];

export default function AboutUsPage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerOrg, setPartnerOrg] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      triggerToast("Mohon masukkan alamat email yang valid.");
      return;
    }
    triggerToast("Terima kasih! Anda telah terdaftar dalam UHUB Spatial Ecosystem updates.");
    setNewsletterEmail("");
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerEmail || !partnerOrg) {
      triggerToast("Mohon lengkapi nama, organisasi, dan email Anda.");
      return;
    }
    setPartnerSubmitted(true);
    setTimeout(() => {
      setPartnerSubmitted(false);
      setPartnerModalOpen(false);
      setPartnerName("");
      setPartnerOrg("");
      setPartnerEmail("");
      setPartnerMessage("");
      triggerToast("Permintaan kemitraan terkirim! Tim Hub Director kami akan segera menghubungi Anda.");
    }, 1200);
  };

  const handleDownloadImpactReport = () => {
    triggerToast("Mengunduh UHUB Annual Spatial & Talent Impact Report 2026 (.PDF)...");
    const sampleContent = "UHUB ARCHITECTURAL ECOSYSTEM - ANNUAL IMPACT REPORT 2026\n\n- 2,500+ m² Usable Workspace\n- 1,200+ Active Creators\n- 45+ Enterprise & Academic Partners\n- 99.9% Redundant Fiber Uptime\n\nGenerated by UHUB Spatial Intelligence Platform.";
    const blob = new Blob([sampleContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "UHUB_Impact_Report_2026.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111315] font-sans selection:bg-[#D2F842] selection:text-black flex flex-col antialiased">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#111315] text-white shadow-2xl border border-white/10 text-sm font-medium"
          >
            <Sparkles size={16} className="text-[#D2F842] shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. GLOBAL FLOATING NAVIGATION */}
      <Navbar />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 flex flex-col gap-20 lg:gap-28">

        {/* 2. HERO EDITORIAL SECTION */}
        <section className="flex flex-col gap-10 lg:gap-14 pt-4 lg:pt-8">
          {/* Eyebrow Pill */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[11px] sm:text-[12px] font-bold tracking-[0.15em] uppercase text-[#111315] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#D2F842] ring-2 ring-[#D2F842]/30 animate-pulse" />
              ABOUT UHUB
            </span>
          </div>

          {/* Giant Display Headline */}
          <div className="max-w-[1100px]">
            <h1 className="text-[38px] sm:text-[54px] lg:text-[68px] font-black leading-[1.04] tracking-[-0.035em] text-[#111315]">
              Where Future Builders Meet Industry Standards<span className="text-[#D2F842] inline-block font-black ml-0.5">.</span>
            </h1>
          </div>

          {/* Two-Column Narrative Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pt-2 border-t border-[#E5E7EB]">
            <div className="lg:col-span-5 flex flex-col justify-start">
              <p className="text-[17px] sm:text-[20px] font-semibold leading-[1.45] text-[#111315] tracking-[-0.015em]">
                Built as an innovation sandbox, UHUB bridges the gap between vocational talent and global tech ecosystems by providing world-class infrastructure and collaborative spaces.
              </p>
            </div>
            <div className="lg:col-span-7 flex flex-col justify-start">
              <p className="text-[15px] sm:text-[16px] leading-[1.65] text-[#6C7278] font-normal">
                Rooted in the vibrant student community of Malang and backed by the robust infrastructure of Telkom, our campus creates an unhindered channel between young engineers, venture builders, and enterprise architects. From 1 Gbps symmetric fiber down to low-latency edge testing labs, every detail is engineered to foster high-velocity creation.
              </p>
            </div>
          </div>

          {/* Hero Photographic Showcase */}
          <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[580px] rounded-[28px] overflow-hidden border border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.06)] group">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=85"
              alt="UHUB Innovation Center Campus Workspace"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
            />
            {/* Ambient Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Floating Campus Badge (Bottom-Left) */}
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-10">
              <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-white/60 shadow-xl text-[12px] sm:text-[13px] font-bold text-[#111315] tracking-[-0.01em]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] -ml-4" />
                <span>UHUB Innovation Center</span>
              </div>
            </div>


          </div>
        </section>

        {/* 3. "OUR FOUNDATIONS" CORE PHILOSOPHY */}
        <section className="flex flex-col gap-10">
          {/* Section Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pb-6 border-b border-[#E5E7EB]">
            <div className="lg:col-span-6 flex flex-col gap-2">
              <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.15em] uppercase text-[#6C7278]">
                • CORE PHILOSOPHY
              </span>
              <h2 className="text-[32px] sm:text-[42px] font-extrabold tracking-[-0.03em] text-[#111315]">
                Our Foundations<span className="text-[#D2F842]">.</span>
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-[15px] sm:text-[16px] text-[#6C7278] leading-[1.6]">
                Architected not merely as a desk rental, but as an institutional catalyst for technical breakthroughs and sustainable tech careers.
              </p>
            </div>
          </div>

          {/* 3-Column Foundation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {FOUNDATIONS_DATA.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <motion.div
                  key={card.index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-[24px] p-8 sm:p-9 border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] hover:border-[#111315]/20 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-6">
                    {/* Top Tag & Icon */}
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center font-mono font-extrabold text-[14px] text-[#111315] group-hover:bg-[#D2F842] group-hover:border-[#D2F842] transition-colors">
                        {card.index}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#6C7278] group-hover:text-[#111315] transition-colors">
                        <IconComp size={18} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h3 className="text-[20px] sm:text-[22px] font-bold text-[#111315] tracking-[-0.02em] group-hover:text-black">
                        {card.title}
                      </h3>
                      <p className="text-[14px] sm:text-[15px] leading-[1.65] text-[#6C7278]">
                        {card.body}
                      </p>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-8 mt-6 border-t border-[#F0F1F3] flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.15em] uppercase text-[#111315]">
                      {card.footerMeta}
                    </span>
                    <ArrowUpRight size={16} className="text-[#6C7278] group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 4. QUANTITATIVE IMPACT / STATS STRIP */}
        <section>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-neutral-200 dark:border-white/10 py-8 px-6 md:px-12 shadow-[0_6px_30px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {/* Stat Item 01 */}
              <div className="flex flex-col">
                <div className="flex items-baseline text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-[#111315] dark:text-white leading-none min-h-[48px]">
                  <CountingNumber
                    from={0}
                    target={2500}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                  />
                  <span className=" ml-1 font-black text-2xl sm:text-3xl lg:text-4xl">
                    + m²
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#6C7278] dark:text-neutral-400 mt-2 tracking-normal">
                  Total Usable Workspace
                </p>
              </div>

              {/* Stat Item 02 */}
              <div className="flex flex-col lg:border-l lg:border-neutral-200 dark:lg:border-white/10 lg:pl-10">
                <div className="flex items-baseline text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-[#111315] dark:text-white leading-none min-h-[48px]">
                  <CountingNumber
                    from={0}
                    target={1200}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                  />
                  <span className="ml-1 font-black text-2xl sm:text-3xl lg:text-4xl">
                    +
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#6C7278] dark:text-neutral-400 mt-2 tracking-normal">
                  Active Tech Members & Creators
                </p>
              </div>

              {/* Stat Item 03 */}
              <div className="flex flex-col lg:border-l lg:border-neutral-200 dark:lg:border-white/10 lg:pl-10">
                <div className="flex items-baseline text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-[#111315] dark:text-white leading-none min-h-[48px]">
                  <CountingNumber
                    from={0}
                    target={45}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <span className="ml-1 font-black text-2xl sm:text-3xl lg:text-4xl">
                    +
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#6C7278] dark:text-neutral-400 mt-2 tracking-normal">
                  Industry & Academic Partners
                </p>
              </div>

              {/* Stat Item 04 */}
              <div className="flex flex-col lg:border-l lg:border-neutral-200 dark:lg:border-white/10 lg:pl-10">
                <div className="flex items-baseline text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-[#111315] dark:text-white leading-none min-h-[48px]">
                  <CountingNumber
                    from={0}
                    target={99}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <span className="text-[#111315] dark:text-white">.9</span>
                  <span className="ml-1 font-black text-2xl sm:text-3xl lg:text-4xl">
                    %
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#6C7278] dark:text-neutral-400 mt-2 tracking-normal">
                  Network Uptime & Redundant Fiber
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SPACES & AMENITIES SHOWCASE */}
        <section className="flex flex-col gap-10">
          {/* Section Header */}
          <div className="flex flex-col gap-2 max-w-[800px]">
            <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.15em] uppercase text-[#6C7278]">
              • CAMPUS ARCHITECTURE & AMENITIES
            </span>
            <h2 className="text-[32px] sm:text-[44px] font-extrabold tracking-[-0.03em] text-[#111315] leading-[1.12]">
              Spaces Engineered for Deep Focus & Fluid Collaboration<span className="text-[#D2F842]">.</span>
            </h2>
          </div>

          {/* Bento-style Media Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Card 1: Dedicated Coding & Hardware Labs */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative h-[420px] sm:h-[460px] rounded-[28px] overflow-hidden border border-[#E5E7EB] shadow-[0_12px_40px_rgba(0,0,0,0.06)] group flex flex-col justify-between p-8 sm:p-10"
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Dedicated Coding & Hardware Labs"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* Top Floating Chip */}
              <div className="relative z-10 self-start">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D2F842] text-[#111315] text-[11px] font-mono font-extrabold tracking-[0.1em] uppercase shadow-lg">
                  <Cpu size={13} className="text-black" />
                  HIGH-PERFORMANCE LAB
                </span>
              </div>

              {/* Bottom Overlay Copy */}
              <div className="relative z-10 flex flex-col gap-2.5 text-white">
                <h3 className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.02em] leading-tight">
                  Dedicated Coding & Hardware Labs
                </h3>
                <p className="text-[14px] sm:text-[15px] text-neutral-300 leading-[1.6] line-clamp-3 sm:line-clamp-none">
                  Ergonomic Herman Miller seating, dual 4K developer monitors, isolated electrical circuits, and warm acoustic timber wall paneling calibrated for deep state flow.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Acoustic Meeting Suites */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative h-[420px] sm:h-[460px] rounded-[28px] overflow-hidden border border-[#E5E7EB] shadow-[0_12px_40px_rgba(0,0,0,0.06)] group flex flex-col justify-between p-8 sm:p-10"
            >
              <img
                src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80"
                alt="Acoustic Meeting Suites"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* Top Floating Chip */}
              <div className="relative z-10 self-start">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-mono font-extrabold tracking-[0.1em] uppercase shadow-lg">
                  <Mic size={13} className="text-[#D2F842]" />
                  BOARDROOM TIER
                </span>
              </div>

              {/* Bottom Overlay Copy */}
              <div className="relative z-10 flex flex-col gap-2.5 text-white">
                <h3 className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.02em] leading-tight">
                  Acoustic Meeting Suites
                </h3>
                <p className="text-[14px] sm:text-[15px] text-neutral-300 leading-[1.6] line-clamp-3 sm:line-clamp-none">
                  4K intelligent video bars, studio microphones, and sound-dampened double glass partitions for pristine remote stakeholder pitches.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Full-Bleed Open Social Atrium & Specialty Espresso Bar */}
            <motion.div
              whileHover={{ y: -6 }}
              className="lg:col-span-2 relative h-[380px] sm:h-[440px] rounded-[28px] overflow-hidden border border-[#E5E7EB] shadow-[0_12px_40px_rgba(0,0,0,0.06)] group flex flex-col justify-between p-8 sm:p-10"
            >
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80"
                alt="Open Social Atrium & Specialty Espresso Bar"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

              {/* Top Floating Chip */}
              <div className="relative z-10 self-start">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-mono font-extrabold tracking-[0.1em] uppercase shadow-lg">
                  <Coffee size={13} className="text-[#D2F842]" />
                  SOCIAL DYNAMICS
                </span>
              </div>

              {/* Bottom Overlay Copy */}
              <div className="relative z-10 flex flex-col gap-2.5 text-white max-w-[900px]">
                <h3 className="text-[22px] sm:text-[28px] font-extrabold tracking-[-0.02em] leading-tight">
                  Open Social Atrium & Specialty Espresso Bar
                </h3>
                <p className="text-[14px] sm:text-[15px] text-neutral-300 leading-[1.6]">
                  Engineered for serendipitous encounters, community lunch-and-learns, and casual mentor check-ins over single-origin pour-overs pulled by student baristas.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 6. LEADERSHIP BRIDGING INDUSTRY & CAMPUS */}
        <section className="flex flex-col gap-10">
          {/* Section Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pb-6 border-b border-[#E5E7EB]">
            <div className="lg:col-span-6 flex flex-col gap-2">
              <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.15em] uppercase text-[#6C7278]">
                • STEWARDS & MENTORS
              </span>
              <h2 className="text-[32px] sm:text-[42px] font-extrabold tracking-[-0.03em] text-[#111315]">
                Leadership Bridging Industry & Campus<span className="text-[#D2F842]">.</span>
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-[15px] sm:text-[16px] text-[#6C7278] leading-[1.6]">
                Our directors combine institutional governance with startup agility to pave actionable pathways for builders.
              </p>
            </div>
          </div>

          {/* 4-Column Leader Profile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {LEADERSHIP_DATA.map((leader, i) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-[24px] overflow-hidden border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Grayscale Filter */}
                <div className="relative w-full h-[260px] sm:h-[280px] bg-[#E5E7EB] overflow-hidden">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  {/* LinkedIn Icon Action Pill */}
                  <a
                    href={leader.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[#111315] flex items-center justify-center hover:bg-[#D2F842] hover:border-[#D2F842] transition-colors shadow-md"
                    aria-label={`${leader.name} LinkedIn Profile`}
                  >
                    <LinkedInIcon size={15} />
                  </a>
                </div>

                {/* Content Details */}
                <div className="p-6 flex flex-col gap-2 flex-1 justify-between">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[18px] font-extrabold text-[#111315] tracking-[-0.015em]">
                      {leader.name}
                    </h3>
                    <p className={`text-[12px] font-bold tracking-tight ${leader.isDirector ? "text-[#059669]" : "text-[#6C7278]"}`}>
                      {leader.role}
                    </p>
                  </div>
                  <p className="text-[13px] text-[#6C7278] leading-[1.55] pt-2 border-t border-[#F0F1F3]">
                    {leader.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 7. ENTERPRISE & ACADEMIC ALLIANCE BANNER */}
        <section>
          <div className="relative bg-[#0B0D0F] rounded-[28px] p-8 sm:p-12 lg:p-16 text-white overflow-hidden shadow-2xl border border-white/10">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D2F842]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Content */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <span className="text-[11px] sm:text-[12px] font-mono font-bold tracking-[0.15em] uppercase text-[#D2F842]">
                  ENTERPRISE & ACADEMIC ALIGNMENT
                </span>
                <h2 className="text-[28px] sm:text-[38px] lg:text-[44px] font-extrabold tracking-[-0.03em] leading-[1.15]">
                  Empowered by Indonesia&apos;s Foremost Tech & Educational Ecosystem.
                </h2>
                <p className="text-[15px] sm:text-[16px] text-neutral-300 leading-[1.65] max-w-[680px]">
                  We partner with high-velocity enterprises, venture studios, and academic departments to set up satellite offices, co-located R&D pods, and funded fellowship residencies.
                </p>

                {/* Partner Brand Chips */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  {["Telkom Indonesia", "SMK Telkom Malang", "Indigo Ventures", "Telkom University"].map((brand) => (
                    <span
                      key={brand}
                      className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[12px] font-semibold text-neutral-200 tracking-wide"
                    >
                      • {brand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Actions (Stacked) */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setPartnerModalOpen(true)}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#D2F842] hover:bg-[#BCE332] text-[#111315] font-extrabold text-[14px] tracking-wide transition-all duration-200 shadow-lg hover:shadow-[#D2F842]/20 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Partner With Us</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImpactReport}
                  className="w-full flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold text-[14px] transition-all duration-200 cursor-pointer"
                >
                  <Download size={16} className="text-[#D2F842]" />
                  <span>Download Impact Report</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 8. STANDARDIZED ULTRA-PREMIUM FOOTER */}
      <Footer />

      {/* INTERACTIVE PARTNERSHIP MODAL */}
      <AnimatePresence>
        {partnerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-[560px] bg-white rounded-[28px] p-8 sm:p-10 border border-[#E5E7EB] shadow-2xl text-[#111315]"
            >
              <button
                type="button"
                onClick={() => setPartnerModalOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#F8F9FA] hover:bg-[#E5E7EB] text-[#6C7278] hover:text-[#111315] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col gap-2 mb-6">
                <span className="text-[11px] font-mono font-bold tracking-[0.15em] uppercase text-[#059669]">
                  • INSTITUTIONAL COLLABORATION
                </span>
                <h3 className="text-[24px] sm:text-[28px] font-black tracking-[-0.02em]">
                  Partner With UHUB<span className="text-[#D2F842]">.</span>
                </h3>
                <p className="text-[13px] text-[#6C7278]">
                  Set up dedicated satellite R&D pods, venture syndicates, or institutional campus residencies.
                </p>
              </div>

              <form onSubmit={handlePartnerSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Dr. Budi Santoso / Jane Smith"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[14px] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerOrg}
                      onChange={(e) => setPartnerOrg(e.target.value)}
                      placeholder="e.g. Telkom Digital"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[14px] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[14px] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                    Collaboration Scope / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={partnerMessage}
                    onChange={(e) => setPartnerMessage(e.target.value)}
                    placeholder="Briefly describe your R&D, student sponsorship, or satellite office requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[14px] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPartnerModalOpen(false)}
                    className="px-5 py-3 rounded-full text-[13px] font-bold text-[#6C7278] hover:text-[#111315] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={partnerSubmitted}
                    className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#111315] hover:bg-black text-[#D2F842] font-extrabold text-[13px] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {partnerSubmitted ? (
                      <>
                        <Check size={16} />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
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
    </div>
  );
}
