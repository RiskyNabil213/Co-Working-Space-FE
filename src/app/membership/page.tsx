"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Layout,
  Wifi,
  Users,
  Coffee,
  UserCheck,
  Mail,
  Shield,
  Lock,
  Headphones,
  Sliders,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BlurredStagger } from "@/components/WhyUhub";

// 3 Primary Tiers Data
const PRICING_PLANS = [
  {
    id: "flexpass",
    tier: "TIER 01",
    badge: "CASUAL PASS",
    name: "FlexPass",
    subtitle:
      "For nomadic freelancers, students, and part-time creators seeking casual access.",
    monthlyPrice: 20,
    annualPrice: 16,
    unit: "/Mon",
    billingNote: "Billed monthly • Tax included",
    annualBillingNote: "Billed annually ($192/yr) • Tax included",
    isPopular: false,
    ctaText: "Subscribe to FlexPass",
    ctaStyle: "dark",
    features: [
      "Shared workspaces during business hours (08:00–18:00)",
      "100Mbps high-speed optical internet and tech amenities",
      "Community events, developer mixers, and networking access",
      "Complimentary infused water and standard pantry coffee",
      "3 hours of acoustic quiet call booth usage per month",
    ],
  },
  {
    id: "dedicated-desk",
    tier: "TIER 02",
    badge: "DEDICATED SEAT",
    name: "DedicatedDesk Pro",
    subtitle:
      "For dedicated professionals and founders needing a reserved personal workstation 24/7.",
    monthlyPrice: 60,
    annualPrice: 48,
    unit: "/Mon",
    billingNote: "Billed monthly • Includes ergonomic Herman Miller chair",
    annualBillingNote: "Billed annually ($576/yr) • Includes Herman Miller chair",
    isPopular: true,
    ctaText: "Subscribe to Dedicated Pro",
    ctaStyle: "lime",
    features: [
      "24/7 unlimited access to coworking areas and amenities",
      "Reserved motorized sit-stand desk & lockable storage cabinet",
      "All FlexPass benefits included",
      "10 hours complimentary Meeting Room booking credits monthly",
      "Dedicated business mailing address and mail handling",
      "Free artisan espresso from the barista bar (1/day)",
    ],
  },
  {
    id: "private-suite",
    tier: "TIER 03",
    badge: "PRIVATE SUITE",
    name: "PrivateOffice Pro",
    subtitle:
      "For high-growth startups, agency pods, and teams requiring acoustic privacy and keys.",
    monthlyPrice: 150,
    annualPrice: 120,
    unit: "/desk /Mon",
    billingNote: "Available in 2, 4, 6, and 8-person configurations",
    annualBillingNote: "Billed annually ($1,440/seat/yr) • Configurable 2–8 seats",
    isPopular: false,
    ctaText: "Subscribe to Private Suite",
    ctaStyle: "dark",
    features: [
      "Fully lockable acoustic glass suite with smart key & credentials",
      "24/7 dedicated access for all registered team members",
      "All FlexPass and DedicatedDesk benefits included",
      "25 hours of executive boardroom conference credits monthly",
      "Custom company logo launch upon suite entrance door",
      "Priority access to phone pods and guest passes (10/mo)",
    ],
  },
];

// Visual Amenity Cards Data
const AMENITY_SHOWCASES = [
  {
    title: "ERGONOMIC LOUNGES",
    caption: "Acoustic Comfort & Lumbar Support",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "BOARDROOMS & PODS",
    caption: "Dual 4K Laser Projection & Microphones",
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "ARTISAN COFFEE BAR",
    caption: "Daily Specialty Single-Origin Roasts",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=85",
  },
];

// Specification Comparison Matrix
const COMPARISON_ROWS = [
  {
    icon: Clock,
    category: "Access Hours",
    flexpass: "Business Hours (08:00–18:00)",
    dedicated: "24/7 Keycard Entry",
    suite: "24/7 Smart Lock + Master Key",
  },
  {
    icon: Layout,
    category: "Desk Type",
    flexpass: "Hot Desk (First-Come)",
    dedicated: "Assigned Sit-Stand Desk",
    suite: "Enclosed Private Suite",
  },
  {
    icon: Wifi,
    category: "Internet Connection",
    flexpass: "100Mbps Shared Optical",
    dedicated: "500Mbps Dedicated + LAN Port",
    suite: "Gigabit Symmetrical LAN + VLAN",
  },
  {
    icon: Users,
    category: "Meeting Room Credits",
    flexpass: "Pay-as-you-go (Rp 10.000/hr)",
    dedicated: "10 Hours / Month",
    suite: "25 Hours / Month",
  },
  {
    icon: Coffee,
    category: "Pantry & Barista",
    flexpass: "Self-service Drip & Tea",
    dedicated: "1 Barista Drink / day",
    suite: "Unlimited Barista Beverages",
  },
  {
    icon: UserCheck,
    category: "Guest Passes",
    flexpass: "Not included",
    dedicated: "2 Passes / Month",
    suite: "10 Passes / Month",
  },
  {
    icon: Mail,
    category: "Mail & Package Handling",
    flexpass: "Add-on",
    dedicated: "Included",
    suite: "Included + Suite Drop-off",
  },
];

// FAQ Items
const FAQ_ITEMS = [
  {
    q: "Can I upgrade or downgrade my membership anytime?",
    a: "Yes. You can upgrade instantly via your member console. Upgrades reflect immediately with prorated billing adjustments. Downgrades take effect at the start of your subsequent monthly billing cycle without penalties.",
  },
  {
    q: "How does guest access work for non-members?",
    a: "Members with DedicatedDesk Pro receive 2 guest day passes per month, and PrivateOffice Pro subscribers receive 10 passes. You can register your guests via the mobile dashboard to generate dynamic entry QR codes.",
  },
  {
    q: "Are meeting room credits transferable to next month?",
    a: "To maintain balanced schedule availability across our hubs, monthly meeting room allotments refresh on the 1st of every calendar month.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit/debit cards (Visa, Mastercard), Bank Transfers / Virtual Accounts (BCA, Mandiri, BNI), QRIS, and automated monthly corporate invoices for registered teams.",
  },
];

export default function MembershipPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [teamSeats, setTeamSeats] = useState(6);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  // Live calculator calculation
  const seatRateMonthly = 900000; // Rp 900.000 per seat/mo
  const totalTeamCost = teamSeats * seatRateMonthly;

  return (
    <div className="min-h-screen bg-[#F6F6F4] text-[#0E0F12] flex flex-col justify-between selection:bg-[#D5F066] selection:text-[#0E0F12]">
      {/* Sticky Floating Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* ================= 1. HERO HEADER ================= */}
        <section className="pt-6 sm:pt-12 pb-10 flex flex-col items-center text-center">


          {/* H1 Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.5rem,5.5vw,4.2rem)] font-black tracking-[-0.035em] leading-[1.08] text-[#0E0F12] max-w-[860px]"
          >
            Choose Your
            <br />
            Working Rhythm
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[14px] sm:text-[15px] text-[#707175] leading-[1.65] max-w-[620px] mt-4"
          >
            Transparent monthly commitments with zero hidden facility fees. Scale up, switch desks, or pause anytime with 1-click flexibility.
          </motion.p>

          {/* Interactive Billing Interval Switcher */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 inline-flex items-center bg-white p-1.5 rounded-full border border-[#E2E2DF] shadow-xs relative"
          >
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`relative px-6 py-2 rounded-full text-[13px] font-bold transition-colors duration-200 cursor-pointer z-10 ${!isAnnual ? "text-white" : "text-[#707175] hover:text-[#0E0F12]"
                }`}
            >
              {!isAnnual && (
                <motion.div
                  layoutId="activeBillingCycle"
                  className="absolute inset-0 bg-[#0E0F12] rounded-full shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`relative px-6 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 transition-colors duration-200 cursor-pointer z-10 ${isAnnual ? "text-white" : "text-[#707175] hover:text-[#0E0F12]"
                }`}
            >
              {isAnnual && (
                <motion.div
                  layoutId="activeBillingCycle"
                  className="absolute inset-0 bg-[#0E0F12] rounded-full shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span>Annual Billing</span>
              <span className="bg-[#D5F066] text-[#0E0F12] text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase">
                SAVE 20%
              </span>
            </button>
          </motion.div>
        </section>

        {/* ================= 2. 3 MEMBERSHIP TIER CARDS DECK ================= */}
        <section className="py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
            {PRICING_PLANS.map((plan, index) => {
              const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const displayNote = isAnnual ? plan.annualBillingNote : plan.billingNote;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className={`bg-white rounded-[24px] p-8 sm:p-9 flex flex-col justify-between transition-all duration-300 relative shadow-xs group ${plan.isPopular
                    ? "border-2 border-[#0E0F12] lg:scale-[1.02] shadow-md z-10"
                    : "border border-[#E2E2DF] hover:border-[#0E0F12]/60 hover:shadow-md"
                    }`}
                >
                  {/* Floating Popular Badge
                  {plan.popularBadge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-[#D5F066] text-[#0E0F12] text-[10px] font-extrabold tracking-[0.06em] uppercase px-4 py-1.5 rounded-full shadow-xs border border-[#0E0F12]/15">
                        {plan.popularBadge}
                      </span>
                    </div>
                  )} */}

                  <div>
                    {/* Header Row: Badge & Tier Number */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#707175]">
                        {plan.badge}
                      </span>
                      <span className="text-[11px] font-bold text-[#707175] tabular-nums">
                        {plan.tier}
                      </span>
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-[22px] font-extrabold text-[#0E0F12] mt-3">
                      {plan.name}
                    </h3>

                    {/* Subtitle Description */}
                    <p className="text-[13px] text-[#707175] leading-[1.55] mt-2 mb-6 min-h-[40px]">
                      {plan.subtitle}
                    </p>

                    {/* Price Block */}
                    <div className="pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[44px] sm:text-[48px] font-extrabold text-[#0E0F12] tabular-nums tracking-tight leading-none">
                          ${displayPrice}
                        </span>
                        <span className="text-[13px] font-semibold text-[#707175]">
                          {plan.unit}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#707175] mt-2 leading-tight">
                        {displayNote}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-[1px] bg-[#E2E2DF] my-6" />

                    {/* Features List */}
                    <ul className="space-y-3.5">
                      {plan.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-start gap-2.5 text-[13px] text-[#0E0F12] leading-[1.5]"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} strokeWidth={3} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Action Button */}
                  <div className="mt-8 pt-2">
                    <Link
                      href={`/register/member?plan=${plan.id}&interval=${isAnnual ? "annual" : "monthly"}`}
                      className={`w-full h-[48px] rounded-full text-[13px] font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs active:scale-98 ${plan.ctaStyle === "lime"
                        ? "bg-[#D5F066] text-[#0E0F12] hover:brightness-105"
                        : "bg-[#0E0F12] text-white hover:bg-[#D5F066] hover:text-[#0E0F12]"
                        }`}
                    >
                      <span>{plan.ctaText}</span>
                      {plan.ctaStyle === "lime" ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowRight size={15} />
                      )}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ================= 3. 3 VISUAL AMENITY PREVIEW CARDS ================= */}
        <section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AMENITY_SHOWCASES.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-[24px] overflow-hidden border border-[#E2E2DF] shadow-xs group cursor-default"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E2E2DF]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </div>
                <div className="p-5 flex items-center justify-between">
                  <h4 className="text-[12px] font-extrabold tracking-[0.05em] uppercase text-[#0E0F12]">
                    {item.title}
                  </h4>
                  <span className="text-[11px] font-medium text-[#707175]">
                    {item.caption}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= 4. SPECIFICATION MATRIX CARD ================= */}
        <section className="py-6">
          <div className="bg-white rounded-[24px] border border-[#E2E2DF] p-6 sm:p-10 shadow-xs">
            {/* Matrix Header */}
            <div className="mb-8">
              <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#707175]">
                SPECIFICATIONS • COMPREHENSIVE OVERVIEW
              </p>
              <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#0E0F12] tracking-[-0.02em] mt-1.5">
                Compare Plan Privileges
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#707175] mt-1">
                Every detail of our space amenities side-by-side to find the precise fit for your work rhythm.
              </p>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-[#0E0F12]">
                    <th className="py-4 text-[11px] font-bold uppercase tracking-[0.06em] text-[#707175] w-[28%]">
                      Feature Category
                    </th>
                    <th className="py-4 text-center text-[13px] font-extrabold text-[#0E0F12] w-[24%]">
                      <div>FlexPass</div>
                      <span className="text-[11px] font-medium text-[#707175]">$20/mo</span>
                    </th>
                    <th className="py-4 text-center text-[13px] font-extrabold text-[#0E0F12] w-[24%] bg-[#D5F066]/10 rounded-t-[12px]">
                      <div>DedicatedDesk</div>
                      <span className="text-[11px] font-extrabold text-[#15803D]">$60/mo</span>
                    </th>
                    <th className="py-4 text-center text-[13px] font-extrabold text-[#0E0F12] w-[24%]">
                      <div>PrivateOffice</div>
                      <span className="text-[11px] font-medium text-[#707175]">$150/mo</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2DF]">
                  {COMPARISON_ROWS.map((row, rIdx) => {
                    const IconComp = row.icon;
                    return (
                      <tr
                        key={rIdx}
                        className="hover:bg-[#F9F9F8] transition-colors"
                      >
                        <td className="py-4.5 pr-4 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#F6F6F4] border border-[#E2E2DF] flex items-center justify-center shrink-0 text-[#707175]">
                            <IconComp size={14} />
                          </div>
                          <span className="text-[13px] font-bold text-[#0E0F12]">
                            {row.category}
                          </span>
                        </td>
                        <td className="py-4.5 px-3 text-center text-[12.5px] text-[#707175]">
                          {row.flexpass}
                        </td>
                        <td className="py-4.5 px-3 text-center text-[12.5px] font-semibold text-[#0E0F12] bg-[#D5F066]/5">
                          {row.dedicated}
                        </td>
                        <td className="py-4.5 px-3 text-center text-[12.5px] font-semibold text-[#0E0F12]">
                          {row.suite}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>



        {/* ================= 7. MEMBERSHIP FAQS ACCORDION ================= */}
        <section className="w-full max-w-[860px] mx-auto py-12">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#707175] mb-2">
              QUESTIONS & TERMS
            </p>
            <h2 className="text-[28px] sm:text-[34px] font-extrabold text-[#0E0F12] tracking-[-0.02em]">
              Membership FAQs
            </h2>
            <p className="text-[14px] text-[#707175] mt-2">
              Answers to common spatial, credential, and billing questions.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, fIdx) => {
              const isOpen = openFaq === fIdx;
              return (
                <div
                  key={fIdx}
                  className="bg-white rounded-[16px] border border-[#E2E2DF] overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(fIdx)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left cursor-pointer group focus:outline-none"
                  >
                    <span className="text-[14.5px] font-bold text-[#0E0F12] group-hover:text-black">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={17}
                      className={`text-[#707175] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#0E0F12]" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`faq-content-${fIdx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-2 border-t border-[#E2E2DF]/60">
                          <BlurredStagger
                            text={faq.a}
                            className="text-[13.5px] text-[#707175] leading-[1.65] max-w-2xl font-normal"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>


      </main>

      {/* Dark Footer */}
      <Footer />
    </div>
  );
}

