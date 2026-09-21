"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const WORKSPACES = [
  {
    id: "public-space",
    title: "Public Space",
    caption: "Embrace the energy of our public spaces",
    image:
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1000&q=85",
    delay: 0,
  },
  {
    id: "private-space",
    title: "Private Space",
    caption: "Focus of your own private space",
    image:
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1000&q=85",
    delay: 0.15,
  },
  {
    id: "meeting-room",
    title: "Meeting Room",
    caption: "We provide the ideal setting for productive collaboration",
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1000&q=85",
    delay: 0.3,
  },
];

export default function WorkspaceGrid() {
  return (
    <section id="spaces" className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {WORKSPACES.map((space) => (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.75,
              delay: space.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              href="/spaces"
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Container with 4:3 ratio & 24px radius */}
              <div className="relative aspect-[4/3] w-full rounded-[24px] overflow-hidden bg-[#E2E2DF]">
                <img
                  src={space.image}
                  alt={space.title}
                  className="w-full h-full object-cover transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] will-change-transform"
                />
              </div>

              {/* Typography with +4px shift on hover */}
              <div className="mt-[18px] flex flex-col">
                <h3 className="text-[18px] font-semibold text-[#0E0F12] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-black">
                  {space.title}
                </h3>
                <p className="text-[14px] text-[#707175] mt-[6px] leading-normal">
                  {space.caption}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
