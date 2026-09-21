"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface HotspotInfo {
  id: string;
  name: string;
  capacity: string;
  type: string;
}

const ROOM_HOTSPOTS: Record<string, HotspotInfo> = {
  suite1: { id: "suite1", name: "Executive Suite A", capacity: "4 Persons", type: "Private Office" },
  suite2: { id: "suite2", name: "Executive Suite B", capacity: "4 Persons", type: "Private Office" },
  suite3: { id: "suite3", name: "Focus Studio 01", capacity: "2 Persons", type: "Quiet Zone" },
  pod1: { id: "pod1", name: "Flexi Focus Pod 01", capacity: "1 Person", type: "Dedicated Workstation" },
  pod2: { id: "pod2", name: "Flexi Focus Pod 02", capacity: "1 Person", type: "Dedicated Workstation" },
  cluster: { id: "cluster", name: "Modular Quad Cluster", capacity: "4 Persons", type: "Team Desks" },
  roundTable: { id: "roundTable", name: "Collaboration Circle", capacity: "4 Persons", type: "Brainstorm Zone" },
  boardroom: { id: "boardroom", name: "Executive Boardroom", capacity: "8 Persons", type: "Conference Room" },
  reception: { id: "reception", name: "Smart Concierge & Welcome Bar", capacity: "Open Access", type: "Reception" },
};

export default function LocationsAndBlueprint() {
  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotInfo | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleHotspotEnter = (hotspotKey: string, e: React.MouseEvent) => {
    const info = ROOM_HOTSPOTS[hotspotKey];
    if (info) {
      setHoveredHotspot(info);
      const bounds = e.currentTarget.getBoundingClientRect();
      const parentBounds = e.currentTarget.closest(".cad-container")?.getBoundingClientRect();
      if (parentBounds) {
        setTooltipPos({
          x: bounds.left - parentBounds.left + bounds.width / 2,
          y: bounds.top - parentBounds.top - 10,
        });
      }
    }
  };

  const handleHotspotLeave = () => {
    setHoveredHotspot(null);
  };

  const pathDraw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom: number = 0) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5, delay: custom * 0.05, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        opacity: { duration: 0.3, delay: custom * 0.05 },
      },
    }),
  };

  const nodeFade: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number = 0) => ({
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: 0.8 + custom * 0.04,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section id="locations" className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 sm:mb-14">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full sm:w-1/3 text-left"
        >
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707175]">
            CHOOSE YOUR URBANHUB LOCATION
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full sm:w-1/3 text-center"
        >
          <h2 className="text-[#0E0F12] text-[clamp(2rem,3.5vw,2.75rem)] font-bold tracking-[-0.02em]">
            Locations
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full sm:w-1/3 text-right"
        >
          <p className="text-[13px] font-medium text-[#707175]">
            2 Cities, 21 Locations
          </p>
        </motion.div>
      </div>

      {/* Location Photography Sub-grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {/* Left Card: Enters from -30px */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col group cursor-pointer"
        >
          <div className="relative aspect-[16/10] w-full rounded-[24px] overflow-hidden bg-[#E2E2DF]">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85"
              alt="Creativity, productivity, and community"
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-[1.03]"
            />
          </div>
          <p className="text-[14px] text-[#707175] mt-4 font-normal transition-colors group-hover:text-[#0E0F12]">
            Creativity, productivity, and community
          </p>
        </motion.div>

        {/* Right Card: Enters from +30px */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col group cursor-pointer"
        >
          <div className="relative aspect-[16/10] w-full rounded-[24px] overflow-hidden bg-[#E2E2DF]">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85"
              alt="Crafting Work Harmony"
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-[1.03]"
            />
          </div>
          <p className="text-[14px] text-[#707175] mt-4 font-normal transition-colors group-hover:text-[#0E0F12]">
            Crafting Work Harmony
          </p>
        </motion.div>
      </div>

      {/* Architectural CAD Blueprint Card */}
      <div className="cad-container mt-12 sm:mt-16 bg-white border border-[#E2E2DF] rounded-[24px] p-6 sm:p-12 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#707175]">
              PLAN FOR PRODUCTIVITY
            </p>
            <h3 className="text-[18px] font-bold text-[#0E0F12] mt-1">
              Interactive Architectural Floorplan
            </h3>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-medium text-[#707175] bg-[#F6F6F4] px-3 py-1.5 rounded-full border border-[#E2E2DF]">
            Hover zones to inspect capacity
          </span>
        </div>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredHotspot && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: "translate(-50%, -100%)",
              }}
              className="absolute z-30 pointer-events-none bg-[#0E0F12] text-white px-3.5 py-2 rounded-[12px] shadow-xl text-center whitespace-nowrap border border-white/15"
            >
              <p className="text-[12px] font-bold text-[#D5F066]">
                {hoveredHotspot.name}
              </p>
              <p className="text-[11px] text-white/70">
                {hoveredHotspot.type} • {hoveredHotspot.capacity}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authentic 2D CAD Architectural Schematic SVG */}
        <div className="w-full flex items-center justify-center py-4 sm:py-8 overflow-x-auto">
          <motion.svg
            viewBox="0 0 920 460"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-[860px] h-auto text-[#0E0F12]"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Outer Boundary Wall */}
            <motion.line x1="80" y1="60" x2="840" y2="60" strokeWidth="2.5" custom={0} variants={pathDraw} />
            <motion.line x1="840" y1="60" x2="840" y2="400" strokeWidth="2.5" custom={1} variants={pathDraw} />
            <motion.line x1="80" y1="60" x2="80" y2="400" strokeWidth="2.5" custom={2} variants={pathDraw} />
            <motion.line x1="80" y1="400" x2="520" y2="400" strokeWidth="2.5" custom={3} variants={pathDraw} />
            <motion.line x1="600" y1="400" x2="840" y2="400" strokeWidth="2.5" custom={4} variants={pathDraw} />
            {/* Door swing arc */}
            <motion.path
              d="M 520 400 A 80 80 0 0 1 600 400"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              custom={5}
              variants={pathDraw}
            />

            {/* Top Row: Executive Suites (Interactive) */}
            <g
              className="cursor-pointer transition-all group"
              onMouseEnter={(e) => handleHotspotEnter("suite1", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.rect
                x="100"
                y="75"
                width="90"
                height="90"
                strokeWidth="1.5"
                className="hover:stroke-[#D5F066] hover:fill-[#D5F066]/10 transition-colors"
                custom={6}
                variants={pathDraw}
              />
            </g>
            <g
              className="cursor-pointer transition-all group"
              onMouseEnter={(e) => handleHotspotEnter("suite2", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.rect
                x="190"
                y="75"
                width="90"
                height="90"
                strokeWidth="1.5"
                className="hover:stroke-[#D5F066] hover:fill-[#D5F066]/10 transition-colors"
                custom={7}
                variants={pathDraw}
              />
            </g>
            <g
              className="cursor-pointer transition-all group"
              onMouseEnter={(e) => handleHotspotEnter("suite3", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.rect
                x="280"
                y="75"
                width="90"
                height="90"
                strokeWidth="1.5"
                className="hover:stroke-[#D5F066] hover:fill-[#D5F066]/10 transition-colors"
                custom={8}
                variants={pathDraw}
              />
            </g>

            {/* Top Center: Storage / Counter */}
            <motion.rect x="440" y="75" width="110" height="45" strokeWidth="1.5" custom={9} variants={pathDraw} />
            <motion.line x1="440" y1="95" x2="550" y2="95" strokeWidth="1.2" custom={10} variants={pathDraw} />

            {/* Top Right: Storage Units */}
            <motion.rect x="700" y="75" width="50" height="40" strokeWidth="1.5" custom={11} variants={pathDraw} />
            <motion.rect x="700" y="115" width="50" height="40" strokeWidth="1.5" custom={12} variants={pathDraw} />

            {/* Left Area: 2 Focus Workstation Pods (Interactive) */}
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) => handleHotspotEnter("pod1", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.rect
                x="125"
                y="220"
                width="75"
                height="75"
                strokeWidth="1.5"
                className="hover:stroke-[#D5F066] hover:fill-[#D5F066]/10 transition-colors"
                custom={13}
                variants={pathDraw}
              />
              <motion.circle
                cx="162.5"
                cy="257.5"
                r="14"
                strokeWidth="1.5"
                custom={1}
                variants={nodeFade}
              />
            </g>

            <g
              className="cursor-pointer group"
              onMouseEnter={(e) => handleHotspotEnter("pod2", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.rect
                x="125"
                y="310"
                width="75"
                height="75"
                strokeWidth="1.5"
                className="hover:stroke-[#D5F066] hover:fill-[#D5F066]/10 transition-colors"
                custom={14}
                variants={pathDraw}
              />
              <motion.circle
                cx="162.5"
                cy="347.5"
                r="14"
                strokeWidth="1.5"
                custom={2}
                variants={nodeFade}
              />
            </g>

            {/* Center Left: Solid Focus Block / Reception (Interactive) */}
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) => handleHotspotEnter("reception", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.rect
                x="360"
                y="220"
                width="45"
                height="55"
                fill="#0E0F12"
                strokeWidth="1.5"
                className="hover:fill-[#D5F066] transition-colors"
                custom={15}
                variants={pathDraw}
              />
            </g>

            {/* Center Lower: Hot Desk Bench */}
            <motion.rect x="340" y="325" width="60" height="35" strokeWidth="1.5" custom={16} variants={pathDraw} />

            {/* Center Area: Modular 4-Desk Cluster (Interactive) */}
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) => handleHotspotEnter("cluster", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.rect x="450" y="220" width="40" height="35" strokeWidth="1.5" className="hover:stroke-[#D5F066]" custom={17} variants={pathDraw} />
              <motion.rect x="490" y="220" width="40" height="35" strokeWidth="1.5" className="hover:stroke-[#D5F066]" custom={18} variants={pathDraw} />
              <motion.rect x="450" y="255" width="40" height="35" strokeWidth="1.5" className="hover:stroke-[#D5F066]" custom={19} variants={pathDraw} />
              <motion.rect x="490" y="255" width="40" height="35" strokeWidth="1.5" className="hover:stroke-[#D5F066]" custom={20} variants={pathDraw} />
              {/* Chairs for 4-desk cluster */}
              <motion.circle cx="470" cy="208" r="6" strokeWidth="1.2" custom={3} variants={nodeFade} />
              <motion.circle cx="510" cy="208" r="6" strokeWidth="1.2" custom={4} variants={nodeFade} />
              <motion.circle cx="470" cy="302" r="6" strokeWidth="1.2" custom={5} variants={nodeFade} />
              <motion.circle cx="510" cy="302" r="6" strokeWidth="1.2" custom={6} variants={nodeFade} />
            </g>

            {/* Lower Center-Right: Round Collaboration Table (Interactive) */}
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) => handleHotspotEnter("roundTable", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.circle
                cx="560"
                cy="360"
                r="30"
                strokeWidth="1.5"
                className="hover:stroke-[#D5F066] hover:fill-[#D5F066]/15 transition-colors"
                custom={21}
                variants={pathDraw}
              />
              {/* 4 Chairs surrounding round table */}
              <motion.circle cx="560" cy="318" r="7" strokeWidth="1.2" custom={7} variants={nodeFade} />
              <motion.circle cx="602" cy="360" r="7" strokeWidth="1.2" custom={8} variants={nodeFade} />
              <motion.circle cx="560" cy="402" r="7" strokeWidth="1.2" custom={9} variants={nodeFade} />
              <motion.circle cx="518" cy="360" r="7" strokeWidth="1.2" custom={10} variants={nodeFade} />
            </g>

            {/* Right Area: Conference Table with 8 Chair Nodes (Interactive) */}
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) => handleHotspotEnter("boardroom", e)}
              onMouseLeave={handleHotspotLeave}
            >
              <motion.rect
                x="660"
                y="230"
                width="50"
                height="100"
                rx="12"
                strokeWidth="1.5"
                className="hover:stroke-[#D5F066] hover:fill-[#D5F066]/15 transition-colors"
                custom={22}
                variants={pathDraw}
              />
              {/* Left/Right End Chairs */}
              <motion.circle cx="685" cy="216" r="6" strokeWidth="1.2" custom={11} variants={nodeFade} />
              <motion.circle cx="685" cy="344" r="6" strokeWidth="1.2" custom={12} variants={nodeFade} />
              {/* Left side 3 chairs */}
              <motion.circle cx="646" cy="245" r="6" strokeWidth="1.2" custom={13} variants={nodeFade} />
              <motion.circle cx="646" cy="280" r="6" strokeWidth="1.2" custom={14} variants={nodeFade} />
              <motion.circle cx="646" cy="315" r="6" strokeWidth="1.2" custom={15} variants={nodeFade} />
              {/* Right side 3 chairs */}
              <motion.circle cx="724" cy="245" r="6" strokeWidth="1.2" custom={16} variants={nodeFade} />
              <motion.circle cx="724" cy="280" r="6" strokeWidth="1.2" custom={17} variants={nodeFade} />
              <motion.circle cx="724" cy="315" r="6" strokeWidth="1.2" custom={18} variants={nodeFade} />
            </g>
          </motion.svg>
        </div>
      </div>
    </section>
  );
}
