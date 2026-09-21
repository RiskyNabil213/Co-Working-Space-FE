"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  unit: string;
  features: string[];
  delay: number;
  highlighted?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "flex-pass",
    name: "FlexPass",
    price: "20$",
    unit: "/Mon",
    delay: 0.1,
    features: [
      "Shared workspaces during business hours.",
      "High-speed internet and tech amenities.",
      "Community events and networking opportunities.",
    ],
  },
  {
    id: "dedicated-desk",
    name: "DedicatedDesk Pro",
    price: "60$",
    unit: "/Mon",
    delay: 0.2,
    highlighted: true,
    features: [
      "24/7 access to coworking areas.",
      "Premium ergonomic furniture and storage.",
      "All FlexPass benefits.",
    ],
  },
  {
    id: "private-suite",
    name: "DedicatedDesk Pro",
    price: "150$",
    unit: "/Mon",
    delay: 0.3,
    features: [
      "24/7 access to coworking areas.",
      "Premium ergonomic furniture and storage.",
      "All FlexPass benefits.",
    ],
  },
];

export default function MembershipPricing() {
  return (
    <section id="membership" className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
      {/* Centered Section Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-[#0E0F12] text-[clamp(2.2rem,4vw,2.75rem)] font-bold text-center mb-12 sm:mb-16 tracking-[-0.02em]"
      >
        Membership
      </motion.h2>

      {/* 3-Tier Grid Layout with Staggered Entrance & Hover Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_TIERS.map((tier) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.75,
              delay: tier.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -6 }}
            className={`bg-white border rounded-[24px] p-8 sm:p-9 flex flex-col justify-between transition-colors duration-300 group shadow-xs ${
              tier.highlighted
                ? "border-[#0E0F12] shadow-sm md:scale-[1.015]"
                : "border-[#E2E2DF] hover:border-[#0E0F12]"
            }`}
          >
            <div>
              {/* Tier Name */}
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-[#0E0F12]">
                  {tier.name}
                </h3>
                {tier.highlighted && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D5F066] text-[#0E0F12] px-2.5 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </div>

              {/* Price & Unit */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[44px] sm:text-[48px] font-bold text-[#0E0F12] tabular-nums tracking-tight leading-none">
                  {tier.price}
                </span>
                <span className="text-[13px] font-normal text-[#707175]">
                  {tier.unit}
                </span>
              </div>

              {/* Bullet Features */}
              <ul className="mt-8 space-y-3.5">
                {tier.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-[13px] text-[#0E0F12] leading-[1.6]"
                  >
                    <span className="text-[#0E0F12] select-none">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe CTA Button with Color Inversion */}
            <div className="mt-10">
              <Link
                href="/login"
                className="w-full h-[48px] rounded-full bg-[#0E0F12] text-white text-[14px] font-semibold flex items-center justify-center hover:bg-[#D5F066] hover:text-[#0E0F12] active:scale-98 transition-all duration-200 cursor-pointer shadow-xs"
              >
                Subscribe
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
