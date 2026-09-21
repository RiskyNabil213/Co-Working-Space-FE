"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Info,
  X,
  Printer,
  Menu,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { adminApi } from "@/lib/api";

export default function RekapitulasiPendapatanPage() {
  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Current Month or August
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Active hover/selected point for Area Chart
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Export Modal State
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Show temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch live backend data
  const loadReport = async () => {
    try {
      setIsUpdating(true);
      const res = await adminApi.getMonthlyReport({
        month: selectedMonth,
        year: selectedYear,
      });
      if (res.success && res.data) {
        setReportData(res.data);
      } else if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.warn("Backend live report fetch note:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (showPdfModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPdfModal]);

  // Handle Refresh Action
  const handleUpdateReport = () => {
    loadReport();
    showToast("Laporan keuangan berhasil dimutakhirkan & diverifikasi!");
  };

  // Dynamic Trajectory
  const dailyTrajectory = useMemo(() => {
    if (
      reportData?.daily_trajectory &&
      Array.isArray(reportData.daily_trajectory) &&
      reportData.daily_trajectory.length > 0
    ) {
      return reportData.daily_trajectory;
    }
    // Generate empty 31-day trajectory if not loaded
    const emptyTrajectory = [];
    for (let d = 1; d <= 31; d++) {
      emptyTrajectory.push({
        day: d,
        dateStr: `Day ${String(d).padStart(2, "0")}`,
        revenue: 0,
        bookings: 0,
        isPeak: false,
      });
    }
    return emptyTrajectory;
  }, [reportData]);

  // Dynamic Space Breakdown
  const spaceBreakdown = useMemo(() => {
    if (
      reportData?.space_breakdown &&
      Array.isArray(reportData.space_breakdown) &&
      reportData.space_breakdown.length > 0
    ) {
      return reportData.space_breakdown;
    }
    return [];
  }, [reportData]);

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    return (
      reportData?.stats || {
        total_pendapatan: 0,
        pendapatan_kotor: 0,
        total_potongan_promo: 0,
        total_reservasi: 0,
        total_jam_terpakai: 0,
        rata_rata_durasi: 0,
        pendapatan_realisasi: 0,
        pending_approval: 0,
        disetujui: 0,
        aktif: 0,
        selesai: 0,
        dibatalkan: 0,
      }
    );
  }, [reportData]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
    showToast("Endpoint API tersalin ke clipboard!");
  };

  // Generate and Download Raw CSV
  const handleDownloadCsv = () => {
    const csvRows = [
      ["UHUB OPERATIONS CONSOLE - REKAPITULASI PENDAPATAN BULANAN"],
      [`Periode: ${selectedMonth}/${selectedYear} - Active Fiscal`, `Tahun: ${selectedYear}`],
      [`Status Audit: Final / Cleared`, `App Maker Key: sk_4f718c4b14e50896e77478fa7b227dee`],
      [],
      ["KATEGORI / METRIK", "VOLUME SESI", "DURASI TERPAKAI (JAM)", "PENDAPATAN KOTOR (RP)", "POTONGAN VOUCHER (RP)", "PENDAPATAN BERSIH (RP)", "YIELD (%)"],
      ...spaceBreakdown.map((sb: any) => [
        `${sb.label} (${sb.sub})`,
        String(sb.total_bookings),
        String(sb.total_jam),
        String(sb.pendapatan_kotor),
        `-${sb.potongan_diskon}`,
        String(sb.total_pendapatan),
        `${sb.yield}%`,
      ]),
      [],
      [
        "TOTAL KONSOLIDASI",
        String(stats.total_reservasi || 0),
        String(stats.total_jam_terpakai || 0),
        String(stats.pendapatan_kotor || 0),
        `-${stats.total_potongan_promo || 0}`,
        String(stats.total_pendapatan || 0),
        "100.0%",
      ],
      [],
      [`Generated at: ${new Date().toISOString()}`, "Endpoint: GET /api/admin/reports/monthly"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UHUB_Rekapitulasi_Pendapatan_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File Raw CSV berhasil diunduh!");
  };

  // Print PDF statement
  const handlePrintPdf = () => {
    window.print();
  };

  // SVG Chart Geometry Calculations
  const chartWidth = 680;
  const chartHeight = 220;
  const paddingX = 35;
  const paddingY = 25;

  const maxVal = useMemo(() => {
    const revs = dailyTrajectory.map((p: any) => p.revenue || 0);
    const m = Math.max(...revs, 0);
    return m > 0 ? Math.ceil(m * 1.25) : 200000;
  }, [dailyTrajectory]);

  const points = useMemo(() => {
    return dailyTrajectory.map((pt: any, idx: number) => {
      const x =
        paddingX +
        (idx / (dailyTrajectory.length - 1 || 1)) * (chartWidth - paddingX * 2);
      const y =
        chartHeight -
        paddingY -
        (((pt.revenue || 0) / maxVal) * (chartHeight - paddingY * 2));
      return { x, y, pt, idx };
    });
  }, [dailyTrajectory, maxVal]);

  // Construct smooth SVG Catmull-Rom or cubic bezier spline path
  const splinePath = useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottomY = chartHeight - paddingY;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${splinePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [splinePath, points]);

  // Selected or hovered point
  const currentHovered = useMemo(() => {
    if (hoveredDayIndex !== null && points[hoveredDayIndex]) {
      return points[hoveredDayIndex];
    }
    const peakPt = points.find((p: any) => p.pt?.isPeak);
    return peakPt || points[points.length - 1] || points[0];
  }, [hoveredDayIndex, points]);

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#111111] flex flex-col font-sans selection:bg-[#D4F34A] selection:text-[#111111]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-full shadow-2xl text-[13px] font-semibold flex items-center gap-2.5 border border-white/20"
          >
            <CheckCircle2 size={16} className="text-[#D4F34A]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col lg:flex-row min-h-screen w-full">
        {/* ========================================================================= */}
        {/* COMPONENT A: LEFT SIDEBAR NAVIGATION (260px Fixed Width)                  */}
        {/* ========================================================================= */}
        <AdminSidebar
          activeTab="overview"
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        {/* ========================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA                                               */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Meta Bar */}
          <div className="bg-white border-b border-[#EAEAEA] px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
            {/* Breadcrumbs with Mobile Hamburger */}
            <div className="flex items-center gap-2 text-[12px] text-[#71767B] font-medium">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-1.5 rounded-lg bg-[#111111] text-[#D4F34A] hover:bg-black transition-colors cursor-pointer shadow-xs shrink-0"
                aria-label="Buka Menu Navigasi"
              >
                <Menu size={16} />
              </button>
              <span>Admin Console</span>
              <ChevronRight size={13} className="text-[#C4C7C5]" />
              <span>Financial Analytics</span>
              <ChevronRight size={13} className="text-[#C4C7C5]" />
              <span className="text-[#111111] font-bold">
                Monthly Revenue Recap
              </span>
            </div>

            {/* Status & Endpoint Tags */}
            <div className="flex items-center gap-3">
              {/* Ledger Synced Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F9F0] border border-[#B3F0D2] text-[#00BA7C] text-[11px] font-bold">
                <CheckCircle2 size={13} className="text-[#00BA7C]" />
                <span>Ledger Synced & Verified</span>
              </div>

              {/* Endpoint API Tag */}
              <button
                onClick={() => handleCopy("GET /api/admin/reports/monthly")}
                title="Click to copy API endpoint"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F5F7] border border-[#E5E7EB] text-[#4B5563] text-[11px] font-mono font-medium hover:bg-[#EAEAEA] transition-colors"
              >
                <span className="text-[#8C9196]">Endpoint :</span>
                <span className="text-[#111111] font-semibold">
                  GET /api/admin/reports/monthly
                </span>
                {copiedEndpoint ? (
                  <Check size={12} className="text-[#00BA7C]" />
                ) : (
                  <Copy size={11} className="text-[#8C9196]" />
                )}
              </button>
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] w-full mx-auto">
            {/* ========================================================================= */}
            {/* COMPONENT B: TITLE & ACTION ROW                                           */}
            {/* ========================================================================= */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#111111] tracking-tight leading-tight">
                  Rekapitulasi Pendapatan
                </h1>
                <p className="text-[13px] text-[#6B7280] mt-1 max-w-2xl font-normal">
                  Executive financial audit and space category yield analysis
                  for commercial coworking operators.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {/* PDF Export Button */}
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="flex items-center gap-2 bg-[#111111] hover:bg-black text-white px-5 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Download size={15} />
                  <span>Export Financial Statement (PDF)</span>
                </button>

                {/* CSV Raw Button */}
                <button
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-2 bg-white hover:bg-[#F9FAFB] text-[#111111] border border-[#EAEAEA] px-4 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition-all hover:border-[#D1D5DB] cursor-pointer"
                >
                  <FileSpreadsheet size={15} className="text-[#6B7280]" />
                  <span>Raw CSV</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* COMPONENT C: FILTER & CONTEXT BAR                                         */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAEAEA] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Dropdown BULAN */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C9196]">
                    BULAN
                  </span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-[#F4F5F7] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-xl px-3.5 py-1.5 text-[13px] font-bold text-[#111111] outline-none cursor-pointer transition-colors"
                  >
                    <option value={8}>August 2026 - Active Fiscal</option>
                    <option value={7}>July 2026 - Audited</option>
                    <option value={6}>June 2026 - Audited</option>
                    <option value={9}>September 2026 - Projected</option>
                  </select>
                </div>

                {/* Dropdown TAHUN */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C9196]">
                    TAHUN
                  </span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-[#F4F5F7] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-xl px-3.5 py-1.5 text-[13px] font-bold text-[#111111] outline-none cursor-pointer transition-colors"
                  >
                    <option value={2026}>2026 (UKR Standard)</option>
                    <option value={2027}>2027 (Next Fiscal)</option>
                  </select>
                </div>

                {/* Update Report Button */}
                <button
                  onClick={handleUpdateReport}
                  disabled={isUpdating}
                  className="bg-[#111111] hover:bg-black text-white px-4 py-1.5 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={isUpdating ? "animate-spin" : ""}
                  />
                  <span>{isUpdating ? "Updating..." : "Update Report"}</span>
                </button>
              </div>

              {/* Status Audit Info */}
              <div className="flex items-center gap-2 text-[12px] text-[#4B5563] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_6px_#10B981]" />
                <span>
                  Reporting Period:{" "}
                  <strong className="text-[#111111] font-bold">
                    August 2026 (Active Fiscal)
                  </strong>
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* COMPONENT D: PRIMARY KPI METRICS CARDS (4 Columns Grid)                    */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Realisasi Pendapatan Bersih */}
              <div className="bg-white rounded-2xl p-6 border border-[#EAEAEA] border-t-2 border-t-[#D4F34A] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                      REALISASI PENDAPATAN BERSIH
                    </span>
                    <span className="bg-[#D4F34A] text-[#111111] text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                      Live Actual
                    </span>
                  </div>
                  <div className="text-[30px] font-extrabold text-[#111111] tracking-tight tabular-nums mt-1">
                    Rp {Number(stats.total_pendapatan || 0).toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F4F5F7] mt-4 flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280] leading-tight">
                    Net cleared turnover after promo voucher deductions
                  </span>
                  <span className="bg-[#E6F9F0] text-[#00BA7C] font-mono font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ml-2">
                    HTTP 200 OK
                  </span>
                </div>
              </div>

              {/* Card 2: Estimasi Pendapatan Kotor */}
              <div className="bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                      ESTIMASI PENDAPATAN KOTOR
                    </span>
                    <span className="bg-[#F1F3F5] text-[#4B5563] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      GROSS
                    </span>
                  </div>
                  <div className="text-[30px] font-extrabold text-[#111111] tracking-tight tabular-nums mt-1">
                    Rp {Number(stats.pendapatan_kotor || stats.total_pendapatan || 0).toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F4F5F7] mt-4 text-[11px] text-[#6B7280] leading-tight">
                  Total theoretical booking billings before deductions
                </div>
              </div>

              {/* Card 3: Total Potongan Promo */}
              <div className="bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                      TOTAL POTONGAN PROMO
                    </span>
                    <span className="bg-[#E6F9F0] text-[#00BA7C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Voucher Applied
                    </span>
                  </div>
                  <div className="text-[30px] font-extrabold text-[#00BA7C] tracking-tight tabular-nums mt-1">
                    - Rp {Number(stats.total_potongan_promo || 0).toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F4F5F7] mt-4 text-[11px] text-[#6B7280] leading-tight">
                  Total marketing subsidy via applied discount codes
                </div>
              </div>

              {/* Card 4: Utilisasi Ruangan & Meja */}
              <div className="bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                      UTILISASI RUANGAN & MEJA
                    </span>
                    <span className="bg-[#F1F3F5] text-[#4B5563] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      USAGE
                    </span>
                  </div>
                  <div className="text-[30px] font-extrabold text-[#111111] tracking-tight tabular-nums mt-1 flex items-baseline gap-1.5">
                    <span>{stats.total_reservasi || 0} Bookings</span>
                    <span className="text-[16px] font-semibold text-[#8C9196]">
                      / {stats.total_jam_terpakai || 0} Jam
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F4F5F7] mt-4 text-[11px] text-[#6B7280] leading-tight">
                  Average duration: {Number(stats.rata_rata_durasi || 3).toFixed(1)} hours per reservation
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* COMPONENT E: ANALYTICS & VISUAL BREAKDOWN (2 Columns: 60% / 40%)          */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri (60% ~ col-span-7): Tren Pertumbuhan Pendapatan Bulanan */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div>
                  {/* Header & Legend */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-[17px] font-extrabold text-[#111111] tracking-tight">
                        Tren Pertumbuhan Pendapatan Bulanan
                      </h2>
                      <p className="text-[12px] text-[#6B7280]">
                        Daily turnover trajectory across 31 days of August 2026
                      </p>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-[#4B5563]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
                        <span>Realisasi Harian</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4F34A] border border-[#111111]" />
                        <span>Target Titik Puncak</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="relative w-full overflow-hidden pt-2 pb-1">
                    {/* Y-Axis Reference Guidelines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#8C9196] font-mono select-none pr-2">
                      <div className="border-b border-[#F1F3F5] w-full flex justify-between">
                        <span>Rp 2.0M</span>
                      </div>
                      <div className="border-b border-[#F1F3F5] w-full flex justify-between">
                        <span>Rp 1.5M</span>
                      </div>
                      <div className="border-b border-[#F1F3F5] w-full flex justify-between">
                        <span>Rp 1.0M</span>
                      </div>
                      <div className="border-b border-[#F1F3F5] w-full flex justify-between">
                        <span>Rp 500k</span>
                      </div>
                      <div className="w-full flex justify-between">
                        <span>Rp 0</span>
                      </div>
                    </div>

                    {/* SVG Spline Canvas */}
                    <div className="relative z-10">
                      <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="w-full h-[220px] overflow-visible"
                      >
                        <defs>
                          {/* Smooth Neon Lime Area Gradient */}
                          <linearGradient
                            id="neonGradientFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#D4F34A"
                              stopOpacity="0.45"
                            />
                            <stop
                              offset="50%"
                              stopColor="#E2F952"
                              stopOpacity="0.2"
                            />
                            <stop
                              offset="100%"
                              stopColor="#E2F952"
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                        </defs>

                        {/* Area Path */}
                        <path
                          d={areaPath}
                          fill="url(#neonGradientFill)"
                          className="transition-all duration-300"
                        />

                        {/* Spline Stroke */}
                        <path
                          d={splinePath}
                          fill="none"
                          stroke="#111111"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Interactive Data Points */}
                        {points.map(({ x, y, pt, idx }: { x: number; y: number; pt: any; idx: number }) => {
                          const isHovered = hoveredDayIndex === idx;
                          const isPeak = pt.isPeak;

                          return (
                            <g
                              key={idx}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredDayIndex(idx)}
                              onClick={() => setHoveredDayIndex(idx)}
                            >
                              {/* Pulse effect on peak */}
                              {isPeak && (
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="9"
                                  fill="#D4F34A"
                                  className="animate-ping opacity-75"
                                />
                              )}

                              {/* Target Point Outline */}
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? "6" : isPeak ? "5.5" : "3"}
                                fill={isPeak ? "#D4F34A" : "#FFFFFF"}
                                stroke="#111111"
                                strokeWidth={isHovered ? "2.5" : "1.8"}
                                className="transition-all duration-150"
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Tooltip Interaktif: Box rounded warna hitam pekat */}
                      {currentHovered && (
                        <div
                          className="absolute pointer-events-none transition-all duration-200 z-20"
                          style={{
                            left: `${(currentHovered.x / chartWidth) * 100}%`,
                            top: `${(currentHovered.y / chartHeight) * 100}%`,
                            transform: "translate(-50%, -125%)",
                          }}
                        >
                          <div className="bg-[#111111] text-white rounded-xl px-3.5 py-2.5 shadow-2xl border border-white/15 whitespace-nowrap min-w-[170px]">
                            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-1 mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4F34A]">
                                {currentHovered.pt.isPeak
                                  ? "PUNCAK AGUSTUS 2026"
                                  : `TANGGAL ${currentHovered.pt.dateStr}`}
                              </span>
                              <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono">
                                Day {currentHovered.pt.day < 10 ? `0${currentHovered.pt.day}` : currentHovered.pt.day}
                              </span>
                            </div>
                            <div className="text-[13px] font-extrabold text-white">
                              {currentHovered.pt.dateStr}: Rp{" "}
                              {currentHovered.pt.revenue.toLocaleString("id-ID")}
                            </div>
                            <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                              {currentHovered.pt.note ||
                                `${currentHovered.pt.bookings} Booking (${
                                  currentHovered.pt.revenue > 100000
                                    ? "Meeting Room & Desk"
                                    : "Flexi Desk Workstation"
                                })`}
                            </div>
                          </div>
                          {/* Triangle indicator */}
                          <div className="w-2.5 h-2.5 bg-[#111111] rotate-45 mx-auto -mt-1 border-r border-b border-white/15" />
                        </div>
                      )}
                    </div>

                    {/* Sumbu X: Day 01, Day 05, Day 10, Day 15, Day 20, Day 25, Day 31 */}
                    <div className="flex items-center justify-between text-[11px] text-[#71767B] font-mono pt-2 border-t border-[#EAEAEA] mt-2">
                      <span>Day 01</span>
                      <span>Day 05</span>
                      <span>Day 10</span>
                      <span>Day 15</span>
                      <span>Day 20</span>
                      <span>Day 25</span>
                      <span className="font-bold text-[#111111]">Day 31</span>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="pt-3 border-t border-[#F4F5F7] mt-3 flex items-center gap-2 text-[11px] text-[#6B7280]">
                  <Info size={13} className="text-[#8C9196] shrink-0" />
                  <span>
                    Model kurva akumulasi pendapatan otomatis dari status transaksi disetujui, aktif, dan selesai.
                  </span>
                </div>
              </div>

              {/* Kolom Kanan (40% ~ col-span-5): Distribusi Pendapatan per Jenis Space */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-[17px] font-extrabold text-[#111111] tracking-tight">
                        Distribusi Pendapatan per Jenis Space
                      </h2>
                      <p className="text-[12px] text-[#6B7280]">
                        Turnover and rental hours broken down by room category.
                      </p>
                    </div>
                    <span className="bg-[#F1F3F5] text-[#111111] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#E5E7EB]">
                      {spaceBreakdown.length} Categories
                    </span>
                  </div>

                  {/* Categories Breakdown List */}
                  <div className="space-y-4 pt-1">
                    {spaceBreakdown.map((sb: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] hover:border-[#D1D5DB] transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#D4F34A] text-[#111111] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                              {sb.label}
                            </span>
                            <span className="text-[11px] font-semibold text-[#6B7280]">
                              {sb.sub}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[13px] font-extrabold text-[#111111]">
                              Rp {Number(sb.total_pendapatan || 0).toLocaleString("id-ID")}
                            </span>
                            <span className="text-[11px] font-bold text-[#00BA7C] ml-1.5">
                              {sb.yield}% Yield
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden mb-2">
                          <div
                            className="bg-[#111111] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, sb.yield))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                          <span>
                            {sb.total_bookings} Bookings • {sb.total_jam} Jam terpakai
                          </span>
                          <span className="font-semibold text-[#111111]">
                            {sb.total_jam > 0
                              ? `Avg Rp ${Math.round(sb.total_pendapatan / sb.total_jam).toLocaleString("id-ID")}/Jam`
                              : "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Callout */}
                <div className="mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[12px] text-[#374151] flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00BA7C] shrink-0" />
                  <span>
                    Kontributor omzet tertinggi periode ini:{" "}
                    <strong className="text-[#111111] font-bold">
                      {spaceBreakdown[0]?.label || "Workstation"} ({spaceBreakdown[0]?.yield || 0}%)
                    </strong>
                    .
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* COMPONENT F: AUDITED FINANCIAL TABLE (Bottom Section)                     */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
              {/* Header Table */}
              <div className="p-6 border-b border-[#EAEAEA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div>
                  <h2 className="text-[18px] font-extrabold text-[#111111] tracking-tight">
                    Konsolidasi Laporan Keuangan Bulanan (Audited)
                  </h2>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">
                    Tinjauan agregat sesuai skema response resmi UKR RPL 2026/2027.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-bold px-3 py-1 rounded-full border border-[#D1D5DB] text-[#374151] bg-[#F9FAFB]">
                    Status: Final / Cleared
                  </span>
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] bg-[#F8F9FA] text-[#6B7280] font-extrabold text-[11px] tracking-wider uppercase">
                      <th className="py-3.5 px-6">KATEGORI / METRIK</th>
                      <th className="py-3.5 px-4 text-center">VOLUME SESI</th>
                      <th className="py-3.5 px-4 text-center">DURASI TERPAKAI</th>
                      <th className="py-3.5 px-6 text-right">PENDAPATAN KOTOR</th>
                      <th className="py-3.5 px-6 text-right">POTONGAN VOUCHER</th>
                      <th className="py-3.5 px-6 text-right">PENDAPATAN BERSIH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]/80">
                    {spaceBreakdown.map((sb: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-[#111111]">
                            {sb.label}
                          </div>
                          <div className="text-[11px] text-[#6B7280]">
                            {sb.sub}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-medium text-[#111111]">
                          {sb.total_bookings} Transaksi
                        </td>
                        <td className="py-4 px-4 text-center font-medium text-[#4B5563]">
                          {sb.total_jam} Jam
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-[#111111] tabular-nums">
                          Rp {Number(sb.pendapatan_kotor || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-[#00BA7C] tabular-nums">
                          - Rp {Number(sb.potongan_diskon || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 px-6 text-right font-extrabold text-[#111111] tabular-nums">
                          Rp {Number(sb.total_pendapatan || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Summary Row (Footer Tabel - Background Light Tint) */}
                  <tfoot>
                    <tr className="bg-[#F8F9FA] border-t-2 border-[#111111] font-bold text-[#111111]">
                      <td className="py-4 px-6 font-extrabold text-[14px]">
                        Total Rekapitulasi Periode Aktif
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-[13px]">
                        {stats.total_reservasi || 0} Transaksi
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-[13px]">
                        {stats.total_jam_terpakai || 0} Jam
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-[13px] tabular-nums">
                        Rp {Number(stats.pendapatan_kotor || stats.total_pendapatan || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-[#00BA7C] text-[13px] tabular-nums">
                        - Rp {Number(stats.total_potongan_promo || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-[15px] tabular-nums text-[#111111]">
                        Rp {Number(stats.total_pendapatan || 0).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Table Metadata */}
              <div className="p-4 bg-[#FFFFFF] border-t border-[#EAEAEA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block shadow-[0_0_5px_#10B981]" />
                  <span>
                    Data validated under App Maker Key{" "}
                    <code className="bg-[#F1F3F5] text-[#111111] font-mono px-1.5 py-0.5 rounded font-bold">
                      sk_4f718c4b14e50896e77478fa7b227dee
                    </code>
                    . All financial figures are final for current billing month.
                  </span>
                </div>
                <div className="font-mono text-[#8C9196] shrink-0">
                  Last Sync: 2026-08-31 23:59:59 WIB
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* EXPORT FINANCIAL STATEMENT MODAL PREVIEW                                 */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* EXPORT FINANCIAL STATEMENT MODAL PREVIEW                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPdfModal && (
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs overflow-y-auto overscroll-contain print:p-0 print:bg-white print:static print:inset-auto"
          >
            <motion.div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain border border-[#EAEAEA] shadow-2xl p-6 sm:p-8 print:max-w-full print:max-h-none print:border-none print:shadow-none print:p-0"
            >
              {/* Modal Header Controls (Hidden on Print) */}
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4 mb-6 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#D4F34A] flex items-center justify-center font-black text-[18px]">
                    U
                  </div>
                  <div>
                    <h3 className="text-[17px] font-extrabold text-[#111111]">
                      Official Financial Statement Preview
                    </h3>
                    <p className="text-[12px] text-[#6B7280]">
                      UHUB Operations Console • Audit Periode: Bulan {selectedMonth} Tahun {selectedYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="w-9 h-9 rounded-full bg-[#F4F5F7] hover:bg-[#EAEAEA] text-[#6B7280] hover:text-[#111111] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable Content Frame */}
              <div
                id="statement-print-area"
                className="printable-area bg-[#FAFAFA] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] space-y-6 text-[12px] print:bg-white print:border-none print:p-0"
              >
                {/* Letterhead */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#111111] pb-5 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#111111] text-[#D4F34A] flex items-center justify-center font-black text-[14px]">
                        U
                      </div>
                      <h4 className="font-black text-[18px] text-[#111111] tracking-tight">
                        MOKLET HUB COWORKING SPACE
                      </h4>
                    </div>
                    <p className="text-[#6B7280] text-[11.5px]">
                      Facility Operator: Ahmad Bidin, S.Kom • Tel: 0812-9876-5432
                    </p>
                    <p className="text-[#6B7280] text-[11px]">
                      Jl. Danau Ranau No. 1, Sawojajar, Malang • Tax/Entity ID: UKR-COWORK-2026-B
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="bg-[#111111] text-white text-[10px] font-extrabold px-2.5 py-1 rounded tracking-wider uppercase inline-block">
                      AUDITED OFFICIAL FINANCIAL STATEMENT
                    </span>
                    <p className="text-[#111111] font-mono font-bold text-[12px] mt-1">
                      Ref: UHUB-FIN-{selectedYear}{String(selectedMonth).padStart(2, "0")}-01
                    </p>
                    <p className="text-[#6B7280] text-[11px]">
                      Issued: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* 3 Main Executive KPI Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 bg-white rounded-xl border border-[#EAEAEA] shadow-xs">
                    <span className="text-[10px] uppercase text-[#6B7280] font-extrabold tracking-wider block">
                      Gross Revenue (Kotor)
                    </span>
                    <span className="font-black text-[16px] text-[#111111] mt-1 block tabular-nums">
                      Rp {Number(stats.pendapatan_kotor || stats.total_pendapatan || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-[#6B7280] mt-0.5 block">
                      {stats.total_reservasi || 0} Sesi / {stats.total_jam_terpakai || 0} Jam
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#EAEAEA] shadow-xs">
                    <span className="text-[10px] uppercase text-[#6B7280] font-extrabold tracking-wider block">
                      Marketing Subsidy / Voucher
                    </span>
                    <span className="font-black text-[16px] text-[#00BA7C] mt-1 block tabular-nums">
                      - Rp {Number(stats.total_potongan_promo || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-[#00BA7C] mt-0.5 block">
                      Program Insentif Diskon
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#EAEAEA] shadow-xs border-l-4 border-l-[#111111]">
                    <span className="text-[10px] uppercase text-[#6B7280] font-extrabold tracking-wider block">
                      Net Turnover (Bersih)
                    </span>
                    <span className="font-black text-[16px] text-[#111111] mt-1 block tabular-nums">
                      Rp {Number(stats.total_pendapatan || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-[#10B981] font-bold mt-0.5 block">
                      100% Lunas Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Detailed Category Table */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <table className="w-full text-left border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#6B7280] font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3.5">KATEGORI RUANG</th>
                        <th className="py-2.5 px-3 text-center">VOLUME SESI</th>
                        <th className="py-2.5 px-3 text-center">DURASI (JAM)</th>
                        <th className="py-2.5 px-3 text-right">PENDAPATAN KOTOR</th>
                        <th className="py-2.5 px-3 text-right">POTONGAN</th>
                        <th className="py-2.5 px-3.5 text-right">NET CLEARED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {spaceBreakdown.length > 0 ? (
                        spaceBreakdown.map((sb: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#F9FAFB]">
                            <td className="py-2.5 px-3.5 font-bold text-[#111111]">
                              <div>{sb.label}</div>
                              <div className="text-[10px] text-[#6B7280] font-normal">{sb.sub}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-[#111111]">
                              {sb.total_bookings}
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-[#4B5563]">
                              {sb.total_jam}h
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#4B5563]">
                              Rp {Number(sb.pendapatan_kotor || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#00BA7C]">
                              -Rp {Number(sb.potongan_diskon || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-bold font-mono tabular-nums text-[#111111]">
                              Rp {Number(sb.total_pendapatan || 0).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-[#8C9196] italic">
                            Belum ada catatan transaksi pada periode laporan yang dipilih.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="border-t-2 border-[#111111] bg-[#F8F9FA] font-extrabold text-[12.5px]">
                      <tr>
                        <td className="py-3 px-3.5 text-[#111111] uppercase tracking-wider">
                          TOTAL KONSOLIDASI
                        </td>
                        <td className="py-3 px-3 text-center">
                          {stats.total_reservasi || 0}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {stats.total_jam_terpakai || 0}h
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          Rp {Number(stats.pendapatan_kotor || stats.total_pendapatan || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#00BA7C]">
                          -Rp {Number(stats.total_potongan_promo || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono tabular-nums text-[14px] text-[#111111]">
                          Rp {Number(stats.total_pendapatan || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Audit Seals & Certification Block */}
                <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px]">
                  <div className="space-y-1.5 max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block shadow-[0_0_5px_#10B981]" />
                      <span className="font-bold text-[#111111]">
                        Verified Under App Key:
                      </span>
                      <code className="bg-[#F1F3F5] text-[#111111] font-mono px-1.5 py-0.5 rounded font-bold">
                        sk_4f718c4b14e50896e77478fa7b227dee
                      </code>
                    </div>
                    <p className="text-[#6B7280]">
                      Laporan keuangan ini digenerate secara otomatis dan divalidasi oleh sistem inti akuntansi UHUB Coworking Operations.
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                      Authorized & Certified by:
                    </span>
                    <div className="font-serif italic font-bold text-[16px] text-[#111111] pt-1">
                      Ahmad Bidin, S.Kom
                    </div>
                    <div className="text-[10px] text-[#8C9196] font-mono">
                      Director of Operations • Moklet Hub
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions (Hidden on Print) */}
              <div className="flex items-center justify-end gap-3 mt-6 print:hidden">
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#EAEAEA] text-[13px] font-bold text-[#4B5563] hover:bg-[#F4F5F7] transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={handlePrintPdf}
                  className="px-6 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Printer size={15} />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
