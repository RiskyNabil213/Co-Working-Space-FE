"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, ArrowRight, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3500);
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={containerRef}
      className="relative w-full overflow-hidden mt-20 sm:mt-24"
    >
      {/* ================= 1. CLEAN FULL-WIDTH MARQUEE STRIP (NO CLIPPING) ================= */}
      <div className="relative z-20 w-full overflow-hidden bg-[#D2F842] py-3 shadow-md border-y border-[#0B0D0F]/15 select-none">
        <div className="flex w-fit whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 px-4 text-[12px] sm:text-[13px] font-black uppercase tracking-[0.18em] text-[#0B0D0F]"
            >
              <span>ACCOUNTABILITY REDEFINED</span>
              <span className="text-[#0B0D0F]/40 text-[10px]">✦</span>
              <span>TRANSPARENT TRACKING</span>
              <span className="text-[#0B0D0F]/40 text-[10px]">✦</span>
              <span>FLEXIBLE SPACES</span>
              <span className="text-[#0B0D0F]/40 text-[10px]">✦</span>
              <span>FOCUS & COLLABORATION</span>
              <span className="text-[#0B0D0F]/40 text-[10px]">✦</span>
              <span>SMART RESERVATION</span>
              <span className="text-[#0B0D0F]/40 text-[10px]">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 2. MAIN CLEAN DARK FOOTER CONTAINER ================= */}
      <div className="relative z-10 w-full bg-[#0B0D0F] text-white pt-14 sm:pt-16 pb-8 px-6 sm:px-12 overflow-hidden border-t border-white/[0.08]">
        {/* Subtle Animated Radial Glow Aurora */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none opacity-30 blur-[100px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(210, 248, 66, 0.15) 0%, rgba(56, 189, 248, 0.06) 45%, transparent 70%)",
          }}
        />

        {/* 60px Geometric Grid Mask Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #FFFFFF 1px, transparent 1px),
              linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 max-w-[1240px] mx-auto flex flex-col items-center">


          {/* Sub-Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-[13px] font-semibold text-white/70 tracking-wide mb-6"
          >
            <Link
              href="/spaces"
              className="hover:text-[#D2F842] transition-colors relative py-1"
            >
              Spaces
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link
              href="/events"
              className="hover:text-[#D2F842] transition-colors relative py-1"
            >
              Events
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link
              href="/#about"
              className="hover:text-[#D2F842] transition-colors relative py-1"
            >
              About Us
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link
              href="/reservasi"
              className="hover:text-[#D2F842] transition-colors relative py-1"
            >
              My Bookings
            </Link>
            <span className="text-white/20 select-none">•</span>
            <Link
              href="/login/admin"
              className="hover:text-[#D2F842] transition-colors relative py-1 text-white/50"
            >
              Admin Portal
            </Link>
          </motion.div>

          {/* Main Headline with Metallic Drop-Shadow Glow */}
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2.2rem,5vw,3.8rem)] font-black tracking-[-0.03em] text-center mb-3 select-none uppercase leading-[1.05]"
            style={{
              textShadow: "0 0 35px rgba(210, 248, 66, 0.22), 0 0 70px rgba(255, 255, 255, 0.08)",
            }}
          >
            STAY CONNECTED
          </motion.h2>

          <p className="text-[13.5px] sm:text-[14px] text-white/60 text-center max-w-[480px] mb-7 leading-relaxed font-normal">
            Join 15,000+ founders, remote builders, and innovators receiving curated
            workspace perks, member discounts, and priority desk bookings.
          </p>

          {/* Glassmorphism Pill Newsletter Form */}
          <motion.form
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSubmit}
            className={`w-full max-w-[460px] h-[52px] bg-white/[0.06] backdrop-blur-2xl border rounded-full pl-5 pr-1.5 py-1 flex items-center justify-between transition-all duration-300 shadow-xl ${isFocused
              ? "border-[#D2F842] ring-3 ring-[#D2F842]/20 bg-white/[0.09]"
              : "border-white/15 hover:border-white/30"
              }`}
          >
            <input
              type="email"
              suppressHydrationWarning
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                subscribed
                  ? "✓ You're on the priority insider list!"
                  : "Enter your work email address..."
              }
              required
              disabled={subscribed}
              className="w-full bg-transparent text-white text-[13.5px] placeholder:text-white/40 focus:outline-none pr-3 font-medium"
            />

            <motion.button
              suppressHydrationWarning
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={subscribed}
              className={`h-[40px] min-w-[40px] px-4 rounded-full font-bold text-[12.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${subscribed
                ? "bg-[#10B981] text-white"
                : "bg-[#D2F842] text-[#0B0D0F] hover:bg-[#BCE332] shadow-[0_0_15px_rgba(210,248,66,0.35)]"
                }`}
              aria-label="Subscribe to newsletter"
            >
              {subscribed ? (
                <>
                  <Check size={15} />
                  <span className="hidden sm:inline">Joined</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Subscribe</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Quick Perks Pill Row */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-5 mb-8 text-[11.5px] text-white/40 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D2F842]"></span>
              No Spam Ever
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D2F842]"></span>
              Instant 20% Voucher Code
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D2F842]"></span>
              Unsubscribe Anytime
            </span>
          </div>

          {/* ================= 3. BOTTOM META BAR ================= */}
          <div className="relative z-20 w-full pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Brand info & copyright */}
            <div className="flex items-center gap-2.5 text-center md:text-left">
              <Link href="/" className="flex items-center gap-1.5 group">
                <span className="text-[16px] font-black tracking-tight text-white group-hover:text-[#D2F842] transition-colors">
                  UHUB<span className="text-[#D2F842]">.</span>
                </span>
              </Link>
              <span className="text-white/20">|</span>
              <p className="text-[12px] text-white/50">
                © {new Date().getFullYear()} UHUB Coworking Space. All rights reserved.
              </p>
            </div>



            {/* Right: Social Links & Back-to-Top Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-white/70 hover:text-[#D2F842] hover:border-[#D2F842]/50 hover:bg-[#D2F842]/10 transition-all"
                  aria-label="Facebook"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-white/70 hover:text-[#D2F842] hover:border-[#D2F842]/50 hover:bg-[#D2F842]/10 transition-all"
                  aria-label="Instagram"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-white/70 hover:text-[#D2F842] hover:border-[#D2F842]/50 hover:bg-[#D2F842]/10 transition-all"
                  aria-label="LinkedIn"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>

              {/* Back To Top Button */}
              <motion.button
                suppressHydrationWarning
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={scrollToTop}
                className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-[#D2F842] text-white hover:text-[#0B0D0F] border border-white/20 hover:border-[#D2F842] flex items-center justify-center transition-all cursor-pointer shadow-md"
                aria-label="Back to top"
                title="Back to Top"
              >
                <ArrowUp size={15} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
