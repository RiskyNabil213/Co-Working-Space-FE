'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"

export interface TestimonialItem {
  id: string
  badge: string
  quote: string
  author: {
    name: string
    role: string
    initials: string
    avatarBg: "lime" | "dark"
  }
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "1",
    badge: "MOKLET HUB LEVEL 2",
    quote:
      "The sheer acoustic isolation and thoughtful daylighting make long drafting sessions effortless. UHUB feels less like a rental desk and more like an intentional architectural pavilion built specifically for spatial thinkers.",
    author: {
      name: "Rian Ardiansyah",
      role: "Lead Architect • Studio Karsa",
      initials: "RA",
      avatarBg: "lime",
    },
  },
  {
    id: "2",
    badge: "DEDICATEDDESK PRO",
    quote:
      "Low-latency redundant fiber, Herman Miller ergonomics, and seamless access to private phone booths transformed how our engineering squad works remotely. It is our undisputed home base.",
    author: {
      name: "Sarah Jenkins",
      role: "Sr. Backend Engineer • FinTech Corp",
      initials: "SJ",
      avatarBg: "dark",
    },
  },
  {
    id: "3",
    badge: "PRIVATEOFFICE SUITE",
    quote:
      "Pitching enterprise brands inside UHUB's executive boardroom instantly elevates our team's authority. The community vibe is calm yet genuinely electric—creative serendipity at its finest.",
    author: {
      name: "Bima Wicaksono",
      role: "Managing Partner • Forma Creative",
      initials: "BW",
      avatarBg: "lime",
    },
  },
  {
    id: "4",
    badge: "CREATOR STUDIO POD",
    quote:
      "The soundproof podcast and render suites let me record pristine studio audio and run intensive 3D viewport renders with zero distraction. Truly an elite ecosystem for digital creators.",
    author: {
      name: "Nadia Putri",
      role: "3D Visual Artist • Lumina CGI",
      initials: "NP",
      avatarBg: "dark",
    },
  },
  {
    id: "5",
    badge: "FLEXPASS LOUNGE",
    quote:
      "I drop in whenever I'm in town. The artisan barista bar, Gigabit fiber, and frictionless single-tap QR mobile check-in make it by far the most refined workspace in Southeast Asia.",
    author: {
      name: "Alexandre Moreau",
      role: "Product Designer • Remote Nomad",
      initials: "AM",
      avatarBg: "lime",
    },
  },
  {
    id: "6",
    badge: "ENTERPRISE TEAM WING",
    quote:
      "Scaling our 12-person robotics pod was completely effortless. UHUB customized our private acoustic glass suite with dedicated server racks and private lab access within 48 hours.",
    author: {
      name: "Dewi Lestari",
      role: "VP of Engineering • Sagara Tech",
      initials: "DL",
      avatarBg: "dark",
    },
  },
  {
    id: "7",
    badge: "DEDICATEDDESK PRO",
    quote:
      "The quiet focus zone is genuinely silent. Having an assigned motorized sit-stand desk with dual 4K monitors ready and waiting lets me dive straight into deep code every single morning.",
    author: {
      name: "Kenji Sato",
      role: "AI Research Fellow • Tokyo Systems",
      initials: "KS",
      avatarBg: "lime",
    },
  },
  {
    id: "8",
    badge: "EVENT & WORKSHOP ARENA",
    quote:
      "We hosted our 120-attendee developer meetup here. The dual 4K laser projection, integrated acoustic microphones, and spatial lighting made the execution 100% flawless.",
    author: {
      name: "Jessica Tan",
      role: "Community Lead • TechConnect",
      initials: "JT",
      avatarBg: "dark",
    },
  },
  {
    id: "9",
    badge: "PRIVATEOFFICE SUITE",
    quote:
      "24/7 keycard access, complimentary executive boardroom hours, and artisan single-origin roasts on tap give our founding team the stamina to execute and build at top speed.",
    author: {
      name: "Farhan Ramadhan",
      role: "Founder & CEO • HyperScale Labs",
      initials: "FR",
      avatarBg: "lime",
    },
  },
]

export function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="bg-white rounded-[24px] sm:rounded-[28px] p-7 sm:p-8 border border-[#E2E2DF] shadow-xs flex flex-col justify-between transition-all duration-300 hover:border-[#0E0F12]/50 hover:shadow-md group w-full max-w-[420px] select-none">
      <div>
        {/* Card Header: Pill Badge & Quote Icon */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.06em] px-3 py-1 rounded-full bg-[#F6F6F4] text-[#0E0F12] border border-[#E2E2DF]">
            {item.badge}
          </span>
          <Quote
            size={18}
            className="text-[#0E0F12] fill-current opacity-75 group-hover:scale-110 transition-transform duration-200"
          />
        </div>

        {/* Quote Content */}
        <p className="text-[13.5px] sm:text-[14px] text-[#0E0F12] leading-[1.65] font-normal">
          “{item.quote}”
        </p>
      </div>

      {/* Author Footer */}
      <div className="pt-6 mt-6 border-t border-[#E2E2DF]/60 flex items-center gap-3.5">
        {/* Initials Avatar */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105",
            item.author.avatarBg === "lime"
              ? "bg-[#D5F066] text-[#0E0F12]"
              : "bg-[#0E0F12] text-white"
          )}
        >
          {item.author.initials}
        </div>

        {/* Name & Role */}
        <div className="flex flex-col text-left">
          <span className="text-[14px] font-bold text-[#0E0F12]">
            {item.author.name}
          </span>
          <span className="text-[11.5px] text-[#707175]">
            {item.author.role}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialV2() {
  const col1 = TESTIMONIALS_DATA.slice(0, 3)
  const col2 = TESTIMONIALS_DATA.slice(3, 6)
  const col3 = TESTIMONIALS_DATA.slice(6, 9)

  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-20 sm:py-28 overflow-hidden">
      {/* Top Header Row */}
      <div className="pb-8 border-b border-[#E2E2DF] mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {/* Lime Green Pulsing Dot */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="w-2.5 h-2.5 rounded-full bg-[#D5F066] border border-[#0E0F12]/10 mb-4 animate-pulse"
          />

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.4rem,5.2vw,4.2rem)] font-black tracking-[-0.03em] leading-[1.08] text-[#0E0F12]"
          >
            Space to Create,
            <br />
            <span className="italic font-light tracking-tight">Room to Thrive</span>
          </motion.h2>
        </div>

        {/* Right Eyebrow Metadata */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.08em] text-[#707175]"
        >
          COMMUNITY PERSPECTIVES • 98.4% RETENTION
        </motion.div>
      </div>

      {/* Vertical Marquee Showcase Container */}
      <div className="relative flex h-[620px] sm:h-[680px] w-full flex-row items-center justify-center gap-6 overflow-hidden">
        {/* Column 1 (Normal Scroll) */}
        <Marquee vertical pauseOnHover repeat={4} className="[--duration:21s] w-full max-w-[420px]">
          {col1.map((item) => (
            <TestimonialCard key={`c1-${item.id}`} item={item} />
          ))}
        </Marquee>

        {/* Column 2 (Reverse Scroll) - hidden on mobile, visible on sm/md+ */}
        <Marquee vertical reverse pauseOnHover repeat={4} className="hidden sm:flex [--duration:24s] w-full max-w-[420px]">
          {col2.map((item) => (
            <TestimonialCard key={`c2-${item.id}`} item={item} />
          ))}
        </Marquee>

        {/* Column 3 (Normal Scroll) - visible on lg+ */}
        <Marquee vertical pauseOnHover repeat={4} className="hidden lg:flex [--duration:20s] w-full max-w-[420px]">
          {col3.map((item) => (
            <TestimonialCard key={`c3-${item.id}`} item={item} />
          ))}
        </Marquee>

        {/* Top & Bottom Gradient Masks blending with page canvas #F6F6F4 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-[#F6F6F4] via-[#F6F6F4]/70 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-[#F6F6F4] via-[#F6F6F4]/70 to-transparent z-10" />
      </div>
    </section>
  )
}
