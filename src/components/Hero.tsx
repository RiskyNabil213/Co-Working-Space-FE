"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 16, y: y * 16 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Split reveal variants for words
  const wordVariants: Variants = {
    hidden: { y: "110%", opacity: 0 },
    visible: (custom: number) => ({
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.2 + custom * 0.08,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 pt-2 pb-6">
      {/* Expanding Container */}
      <motion.div
        initial={{ scale: 0.985, borderRadius: 40 }}
        animate={{ scale: 1, borderRadius: 32 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] overflow-hidden shadow-xs bg-[#1A1A1A] group cursor-default"
      >
        {/* Background Image with subtle parallax & slow zoom */}
        <motion.img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=90"
          alt="UHUB Coworking Loft"
          animate={{
            x: mousePos.x,
            y: mousePos.y,
            scale: 1.025,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full h-full object-cover object-center brightness-95 will-change-transform"
        />

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Hero Main Typography Split Line Reveal (Bottom Left) */}
        <div className="absolute bottom-10 sm:bottom-14 lg:bottom-16 left-8 sm:left-14 max-w-[92%] sm:max-w-[760px] z-10 select-none pb-2">
          <h1 className="text-white text-[clamp(3.2rem,6.8vw,5.5rem)] font-medium tracking-[-0.025em] leading-[1.15]">
            <div className="overflow-hidden inline-block mr-3 py-1">
              <motion.span
                custom={0}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className="inline-block"
              >
                Craft
              </motion.span>
            </div>
            <div className="overflow-hidden inline-block py-1">
              <motion.span
                custom={1}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className="inline-block"
              >
                your
              </motion.span>
            </div>
            <br />
            <div className="overflow-hidden inline-block mr-3 py-1.5 px-0.5">
              <motion.span
                custom={2}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className="italic font-normal inline-block pb-1 pr-1"
              >
                success
              </motion.span>
            </div>
            <div className="overflow-hidden inline-block py-1.5 px-0.5">
              <motion.span
                custom={3}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className="italic font-normal inline-block pb-1 pr-1.5"
              >
                here
              </motion.span>
            </div>
          </h1>
        </div>
      </motion.div>
    </section>
  );
}
