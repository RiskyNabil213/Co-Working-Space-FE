"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export default function FeatureBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const containerScale = useTransform(scrollYProgress, [0, 0.5], [0.97, 1]);
  const imageY = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        ref={containerRef}
        style={{ scale: containerScale }}
        className="relative w-full min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] rounded-[32px] overflow-hidden flex items-center justify-center bg-[#111215] shadow-xs"
      >
        {/* Background Image with vertical parallax */}
        <motion.img
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=90"
          alt="Work Smarter Not Harder at UHUB"
          style={{ y: imageY, scale: 1.08 }}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-90 will-change-transform"
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />

        {/* Centered Console */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[760px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-white text-[clamp(2.5rem,5vw,4rem)] font-semibold tracking-[-0.02em] leading-[1.1]">
              Work Smarter,
              <br />
              Not Harder
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 sm:mt-8"
          >
            <motion.div
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 20px rgba(213, 240, 102, 0.5)",
              }}
              whileTap={{ scale: 0.97 }}
              className="inline-block rounded-full"
            >
              <Link
                href="/spaces"
                className="bg-[#D5F066] text-[#0E0F12] text-[15px] font-bold px-8 py-3.5 rounded-full inline-block transition-all shadow-xs"
              >
                Book A Space
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
