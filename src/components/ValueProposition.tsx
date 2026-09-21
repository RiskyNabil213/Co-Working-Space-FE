"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function ValueProposition() {
  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (Micro Eyebrow) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-3"
        >
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#707175] uppercase">
            WORKPLACE OPTIONS FOR EVERY NEED
          </p>
        </motion.div>

        {/* Right Column (Headline & Action Link) */}
        <div className="lg:col-span-9 max-w-[860px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[#0E0F12] text-[clamp(1.75rem,3.2vw,2.75rem)] font-bold leading-[1.2] tracking-[-0.02em]">
              Finding the ideal space is a thing of the past. Welcome to a new era
              of productivity and collaboration.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 sm:mt-10"
          >
            <Link
              href="/#membership"
              className="group inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.06em] uppercase text-[#0E0F12] relative py-1 cursor-pointer"
            >
              <span>DISCOVER OUR MEMBERSHIP PLANS</span>
              <motion.div
                className="inline-block transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
              >
                <ArrowUpRight size={15} />
              </motion.div>

              {/* Animated underline */}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#0E0F12] origin-left group-hover:bg-[#707175] transition-colors"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
