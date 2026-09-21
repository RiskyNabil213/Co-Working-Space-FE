"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  PenTool,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  RotateCcw,
  RotateCw,
  Download,
  Trash2,
  StickyNote,
} from "lucide-react";

interface InteractiveWhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTitle?: string;
}

type ToolType = "pen" | "highlighter" | "eraser" | "line" | "rect" | "circle" | "text" | "note";
type BgType = "dots" | "grid" | "blank" | "dark";

export default function InteractiveWhiteboardModal({
  isOpen,
  onClose,
  spaceTitle = "UHUB Smart Glass Whiteboard • Live Collab Studio",
}: InteractiveWhiteboardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<ToolType>("pen");
  const [color, setColor] = useState<string>("#0E0F12");
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [bgType, setBgType] = useState<BgType>("dots");
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [exportNotice, setExportNotice] = useState(false);

  // Position and snapshot tracking
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);

  const colors = [
    { name: "Obsidian", value: "#0E0F12" },
    { name: "Electric Lime", value: "#A3E635" },
    { name: "Signal Red", value: "#EF4444" },
    { name: "Ocean Blue", value: "#3B82F6" },
    { name: "Emerald", value: "#10B981" },
    { name: "Violet", value: "#8B5CF6" },
    { name: "Pure White", value: "#FFFFFF" },
  ];

  // Draw background grid/dots cleanly
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, type: BgType) => {
      ctx.save();
      if (type === "dark") {
        ctx.fillStyle = "#12141A";
        ctx.fillRect(0, 0, width, height);

        // Dark grid dots
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        const spacing = 24;
        for (let x = 12; x < width; x += spacing) {
          for (let y = 12; y < height; y += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Pure White / Off-white glass
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        if (type === "dots") {
          ctx.fillStyle = "rgba(14, 15, 18, 0.12)";
          const spacing = 24;
          for (let x = 12; x < width; x += spacing) {
            for (let y = 12; y < height; y += spacing) {
              ctx.beginPath();
              ctx.arc(x, y, 1.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else if (type === "grid") {
          ctx.strokeStyle = "rgba(14, 15, 18, 0.06)";
          ctx.lineWidth = 1;
          const spacing = 28;
          ctx.beginPath();
          for (let x = 0; x <= width; x += spacing) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
          }
          for (let y = 0; y <= height; y += spacing) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    },
    []
  );

  // Save state to undo history
  const pushHistorySnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        trimmed.push(data);
        if (trimmed.length > 20) trimmed.shift();
        return trimmed;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 19));
    } catch {
      // Security / browser limits fallback
    }
  }, [historyIndex]);

  // Initialize Canvas whenever modal opens or background type changes
  useEffect(() => {
    if (!isOpen) return;

    const setupCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const w = Math.max(300, Math.floor(rect.width));
      const h = Math.max(300, Math.floor(rect.height));

      canvas.width = w;
      canvas.height = h;

      drawBackground(ctx, w, h, bgType);

      try {
        const initData = ctx.getImageData(0, 0, w, h);
        setHistory([initData]);
        setHistoryIndex(0);
      } catch {
        // Fallback
      }
    };

    const timer = setTimeout(setupCanvas, 100);
    window.addEventListener("resize", setupCanvas);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", setupCanvas);
    };
  }, [isOpen, bgType, drawBackground]);

  // Handle Undo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const targetIndex = historyIndex - 1;
    const targetData = history[targetIndex];
    if (targetData) {
      ctx.putImageData(targetData, 0, 0);
      setHistoryIndex(targetIndex);
    }
  };

  // Handle Redo
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const targetIndex = historyIndex + 1;
    const targetData = history[targetIndex];
    if (targetData) {
      ctx.putImageData(targetData, 0, 0);
      setHistoryIndex(targetIndex);
    }
  };

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    drawBackground(ctx, canvas.width, canvas.height, bgType);
    pushHistorySnapshot();
  };

  // Export as PNG
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imageUri = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `uhub-whiteboard-${Date.now()}.png`;
      link.href = imageUri;
      link.click();

      setExportNotice(true);
      setTimeout(() => setExportNotice(false), 2500);
    } catch {
      alert("Whiteboard export ready!");
    }
  };

  // Coordinates helper (Normalized 1:1 with canvas pixel buffer)
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Capture pointer
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    const pos = getCanvasCoords(e);
    startPosRef.current = pos;
    lastPosRef.current = pos;
    setIsDrawing(true);

    // Snapshot for previewing geometric shapes
    try {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch {
      snapshotRef.current = null;
    }

    // Text Note Tool
    if (tool === "text") {
      const textToDraw = prompt("Masukkan teks catatan pada whiteboard:") || "";
      if (textToDraw) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.max(16, lineWidth * 6)}px Inter, sans-serif`;
        ctx.fillText(textToDraw, pos.x, pos.y);
        ctx.restore();
        pushHistorySnapshot();
      }
      setIsDrawing(false);
      return;
    }

    // Sticky Note Preset Tool
    if (tool === "note") {
      const noteContent = prompt("Masukkan isi sticky note:") || "Catatan Kolaborasi";
      if (noteContent) {
        ctx.save();
        const noteW = 160;
        const noteH = 110;
        ctx.fillStyle = "#FEF08A"; // Yellow note
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(pos.x, pos.y, noteW, noteH);

        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#FDE047";
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x, pos.y, noteW, noteH);

        // Header bar
        ctx.fillStyle = "#FACC15";
        ctx.fillRect(pos.x, pos.y, noteW, 20);

        ctx.fillStyle = "#713F12";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillText("STICKY NOTE", pos.x + 8, pos.y + 14);

        // Text Body
        ctx.fillStyle = "#0E0F12";
        ctx.font = "12px Inter, sans-serif";
        ctx.fillText(noteContent.slice(0, 30), pos.x + 10, pos.y + 45);
        if (noteContent.length > 30) {
          ctx.fillText(noteContent.slice(30, 60), pos.x + 10, pos.y + 65);
        }
        ctx.restore();
        pushHistorySnapshot();
      }
      setIsDrawing(false);
      return;
    }

    // Start single dot for freehand pen / highlighter / eraser
    if (tool === "pen" || tool === "highlighter" || tool === "eraser") {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, lineWidth / 2, 0, Math.PI * 2);

      if (tool === "eraser") {
        ctx.fillStyle = bgType === "dark" ? "#12141A" : "#FFFFFF";
      } else if (tool === "highlighter") {
        ctx.fillStyle = color === "#0E0F12" ? "rgba(213, 240, 102, 0.45)" : `${color}55`;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();
      ctx.restore();
    }
  };

  // Pointer Move (Silky Smooth 120FPS Segment-based drawing)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const currentPos = getCanvasCoords(e);

    if (tool === "pen" || tool === "highlighter" || tool === "eraser") {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);

      if (tool === "eraser") {
        ctx.strokeStyle = bgType === "dark" ? "#12141A" : "#FFFFFF";
        ctx.lineWidth = lineWidth * 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      } else if (tool === "highlighter") {
        ctx.strokeStyle = color === "#0E0F12" ? "rgba(213, 240, 102, 0.45)" : `${color}55`;
        ctx.lineWidth = lineWidth * 5;
        ctx.lineCap = "square";
        ctx.lineJoin = "bevel";
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }

      ctx.stroke();
      ctx.restore();
      lastPosRef.current = currentPos;
    } else if (snapshotRef.current) {
      // Geometric Shape Live Drag Preview
      ctx.putImageData(snapshotRef.current, 0, 0);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";

      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;
      const w = currentPos.x - startX;
      const h = currentPos.y - startY;

      ctx.beginPath();
      if (tool === "line") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(startX, startY, w, h);
      } else if (tool === "circle") {
        const radius = Math.sqrt(w * w + h * h) / 2;
        const centerX = startX + w / 2;
        const centerY = startY + h / 2;
        ctx.arc(centerX, centerY, Math.max(1, radius), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    try {
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }

    pushHistorySnapshot();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-5 select-none overscroll-contain"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0E0F12]/85 backdrop-blur-md"
          />

          {/* Whiteboard Modal Container */}
          <motion.div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-[1400px] h-[93vh] bg-[#FFFFFF] rounded-[24px] shadow-2xl border border-[#E2E2DF] flex flex-col overflow-hidden z-10 overscroll-contain"
          >
            {/* Top Header Bar */}
            <div className="h-[60px] bg-[#0E0F12] text-white px-4 sm:px-6 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#D5F066] text-[#0E0F12] flex items-center justify-center font-bold shadow-xs">
                  <PenTool size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-white tracking-tight">
                      Smart Glass Whiteboard Studio
                    </h3>
                    <span className="bg-[#D5F066] text-[#0E0F12] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 line-clamp-1">{spaceTitle}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 text-white transition-colors cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 text-white transition-colors cursor-pointer"
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCw size={16} />
                </button>
                <div className="h-5 w-[1px] bg-white/20 mx-1 hidden sm:block" />

                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-white/10 hover:bg-red-500/80 px-3 py-1.5 rounded-full text-white transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Clear Board</span>
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-[#D5F066] hover:bg-[#c4e34c] text-[#0E0F12] px-3.5 py-1.5 rounded-full transition-all shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>{exportNotice ? "Saved! ✓" : "Export PNG"}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white ml-2 transition-colors cursor-pointer"
                  aria-label="Close Whiteboard"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Canvas Drawing Area & Floating Toolbar */}
            <div
              ref={containerRef}
              className="relative flex-1 bg-[#F6F6F4] overflow-hidden flex items-center justify-center"
            >
              {/* HTML5 Canvas */}
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-full touch-none cursor-crosshair"
              />

              {/* Floating Bottom Dock Toolbar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0E0F12]/92 backdrop-blur-xl border border-white/20 rounded-full p-2 px-3 sm:px-4 shadow-2xl flex items-center gap-2 sm:gap-3 z-20 flex-wrap justify-center max-w-[95vw]">
                {/* Tools Selector */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full">
                  {[
                    { id: "pen", icon: PenTool, label: "Pen" },
                    { id: "highlighter", icon: Highlighter, label: "Highlighter" },
                    { id: "eraser", icon: Eraser, label: "Eraser" },
                    { id: "line", icon: Minus, label: "Line" },
                    { id: "rect", icon: Square, label: "Rectangle" },
                    { id: "circle", icon: Circle, label: "Circle" },
                    { id: "text", icon: Type, label: "Text Note" },
                    { id: "note", icon: StickyNote, label: "Sticky Note" },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isActive = tool === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTool(t.id as ToolType)}
                        className={`p-2 rounded-full transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#D5F066] text-[#0E0F12] shadow-xs scale-105"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                        title={t.label}
                      >
                        <Icon size={15} />
                      </button>
                    );
                  })}
                </div>

                {/* Color Palette */}
                <div className="flex items-center gap-1.5 px-1 sm:px-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        setColor(c.value);
                        if (tool === "eraser") setTool("pen");
                      }}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        color === c.value
                          ? "border-[#D5F066] scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {color === c.value && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.value === "#FFFFFF" || c.value === "#A3E635"
                              ? "bg-[#0E0F12]"
                              : "bg-white"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Stroke Size Stepper */}
                <div className="hidden md:flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-white text-[11px] font-bold">
                  {[2, 4, 8, 14].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setLineWidth(size)}
                      className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                        lineWidth === size
                          ? "bg-[#D5F066] text-[#0E0F12]"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {size === 2 ? "Fine" : size === 4 ? "Med" : size === 8 ? "Thick" : "Max"}
                    </button>
                  ))}
                </div>

                {/* Background Pattern Style */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full text-white">
                  {[
                    { id: "dots", label: "Dots" },
                    { id: "grid", label: "Grid" },
                    { id: "blank", label: "Blank" },
                    { id: "dark", label: "Dark" },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBgType(bg.id as BgType)}
                      className={`px-2 sm:px-2.5 py-1 text-[10px] font-bold uppercase rounded-full transition-all cursor-pointer ${
                        bgType === bg.id
                          ? "bg-white text-[#0E0F12]"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

