'use client'

import * as React from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"

interface UhubFeature {
  id: string
  number: string
  title: string
  description: string
}

const features: UhubFeature[] = [
  {
    id: "item-1",
    number: "01",
    title: "Flexible Workspaces",
    description:
      "Find the workspace that suits your unique work style, whether you prefer private offices, collaborative shared spaces, or modern meeting rooms. UrbanHub adapts to your needs,fostering a productive and tailored environment.",
  },
  {
    id: "item-2",
    number: "02",
    title: "Tech-Infused Productivity",
    description:
      "Equipped with enterprise-grade high-speed internet, smart meeting room management, and seamless IoT integrations designed to keep your workflow uninterrupted.",
  },
  {
    id: "item-3",
    number: "03",
    title: "Community Collaboration",
    description:
      "Connect with like-minded creators, founders, and professionals through curated community events, networking mixers, and collaborative open lounges.",
  },
  {
    id: "item-4",
    number: "04",
    title: "Premium Comfort Spaces",
    description:
      "Ergonomic furniture, wellness areas, and artisanal café amenities ensure maximum comfort, focus, and rejuvenation throughout your workday.",
  },
]

export const BlurredStagger = ({
  text,
  className = "text-black/80 text-sm md:text-base leading-relaxed max-w-2xl font-normal",
}: {
  text: string
  className?: string
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.008,
      },
    },
  }

  const letterAnimation: Variants = {
    hidden: { opacity: 0, filter: "blur(6px)", y: 2 },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  }

  return (
    <motion.p
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={letterAnimation}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.p>
  )
}

export default function WhyUhub() {
  const [openId, setOpenId] = React.useState<string | null>("item-1")

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section className="w-full bg-transparent py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black mb-12 md:mb-16 select-none">
          WHY UHUB?
        </h2>

        <div className="w-full divide-y divide-black/15 border-b border-black/15">
          {features.map((item) => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                className="py-2"
              >
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between py-6 text-left group focus:outline-none cursor-pointer"
                >
                  <span className="text-xl md:text-2xl font-bold tracking-tight text-black group-hover:text-black/60 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-base md:text-lg font-bold text-black tabular-nums">
                    {item.number}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={`content-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pt-0">
                        <BlurredStagger text={item.description} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
