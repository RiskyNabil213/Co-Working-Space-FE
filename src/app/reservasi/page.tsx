"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RealQRCode from "@/components/RealQRCode";
import {
  Search,
  Download,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Share2,
  Printer,
  ShieldCheck,
  Check,
  Building,
  User,
  Phone,
  Receipt,
  FileText,
  Filter,
  Sparkles,
  QrCode,
  Zap,
  Info,
  ExternalLink,
  ChevronDown,
  LogIn,
  UserPlus,
  Compass,
} from "lucide-react";
import {
  reservasiApi,
  authApi,
  getAuthToken,
  getCurrentUser,
  setAuthSession,
  getSpaceImageUrl,
} from "@/lib/api";
import ETicketNotaModal from "@/components/ETicketNotaModal";

export interface LedgerReservationItem {
  id: string;
  numericId?: number;
  bookingCode: string;
  eTicketNumber: string;
  bookedAt: string;
  status: "Selesai" | "Disetujui" | "Aktif / Digunakan" | "Belum Dikonfirmasi" | "Dibatalkan";
  rawStatus: string;
  spaceTitle: string;
  categoryLabel: string;
  location: string;
  deskNumber: string;
  floor: string;
  image: string;
  date: string;
  dateRaw: string; // YYYY-MM-DD
  timeSlot: string;
  durationHours: number;
  ratePerHour: number;
  grossAmount: number;
  discountAmount: number;
  discountPromoName?: string;
  netTotalPaid: number;
  checkInStatus?: string;
  checkInTime?: string;
  memberName: string;
  memberCompany: string;
  memberPhone: string;
  memberEmail: string;
  qrPayload: string;
  barcodeHash: string;
  timestampGenerated: string;
}

export default function UnifiedMemberReservationDashboard() {
  // State Machine: "LEDGER" (State A) | "TICKET_PASS" (State B)
  const [activeViewState, setActiveViewState] = useState<"LEDGER" | "TICKET_PASS">("LEDGER");
  const [selectedPassItem, setSelectedPassItem] = useState<LedgerReservationItem | null>(null);
  const [isETicketModalOpen, setIsETicketModalOpen] = useState<boolean>(false);
  const [modalReservation, setModalReservation] = useState<any | null>(null);

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Ledger Items Data
  const [reservations, setReservations] = useState<LedgerReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const printPassRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load User & Fetch Real Backend Reservations
  const refreshReservations = async () => {
    setIsLoading(true);
    const token = getAuthToken();
    const user = getCurrentUser();

    if (!token || !user || user === "guest") {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setReservations([]);
      setIsLoading(false);
      return;
    }

    setIsLoggedIn(true);
    setCurrentUser(user);

    try {
      const res = await reservasiApi.getMyReservations();
      let realItems: LedgerReservationItem[] = [];

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        realItems = res.data.map((item: any) => {
          const spaceName = item.nama_space || item.space?.nama_space || "Coworking Space";
          const spaceType = item.tipe || item.space?.tipe || "desk";
          const rawStatus = item.status || "belum_dikonfirm";

          let mappedStatus: "Selesai" | "Disetujui" | "Aktif / Digunakan" | "Belum Dikonfirmasi" | "Dibatalkan" = "Belum Dikonfirmasi";
          if (rawStatus === "selesai" || rawStatus === "completed") mappedStatus = "Selesai";
          else if (rawStatus === "disetujui" || rawStatus === "approved") mappedStatus = "Disetujui";
          else if (rawStatus === "aktif" || rawStatus === "active") mappedStatus = "Aktif / Digunakan";
          else if (rawStatus === "dibatalkan" || rawStatus === "cancelled" || rawStatus === "rejected") mappedStatus = "Dibatalkan";

          const rate = Number(item.harga_per_jam || item.space_rate || 25000);
          const dur = Number(item.durasi_jam || 3);
          const gross = Number(item.total_harga_awal || rate * dur);
          const net = Number(item.total_bayar || gross);
          const discount = Number(item.potongan_diskon || Math.max(0, gross - net));

          const img = getSpaceImageUrl(item.foto, spaceType);

          const formatTimestamp = (dateStr?: string) => {
            if (!dateStr) return "Baru saja";
            try {
              const d = new Date(dateStr);
              if (isNaN(d.getTime())) return dateStr;
              const dateFormatted = d.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const timeFormatted = d.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              return `${dateFormatted} • ${timeFormatted} WIB`;
            } catch {
              return dateStr;
            }
          };

          return {
            id: item.kode_booking || `BOOK-202608-${item.id}`,
            numericId: item.id,
            bookingCode: item.kode_booking || `UHUB-${item.id}`,
            eTicketNumber: `TICKET-MOKLET-${item.tanggal_reservasi?.replace(/-/g, "") || "20260830"}-${item.id}`,
            bookedAt: formatTimestamp(item.created_at),
            status: mappedStatus,
            rawStatus,
            spaceTitle: spaceName,
            categoryLabel:
              spaceType === "meeting_room"
                ? "Acoustic Meeting Pod"
                : spaceType === "private_office"
                  ? "Executive Office Suite"
                  : "Personal Desk Focus",
            location: item.lokasi_coworking || "Moklet Hub Coworking • Sawojajar, Malang",
            deskNumber: `Desk #${item.id || "01"}`,
            floor: "Level 1 • Focus Wing",
            image: img,
            date: item.tanggal_reservasi || item.tanggal || "2026-08-30",
            dateRaw: item.tanggal_reservasi || item.tanggal || "2026-08-30",
            timeSlot: `${item.jam_mulai || "09:00"} – ${item.jam_selesai || "12:00"} WIB`,
            durationHours: dur,
            ratePerHour: rate,
            grossAmount: gross,
            discountAmount: discount,
            discountPromoName: item.nama_diskon ? `${item.nama_diskon} (-${item.persentase_diskon}%)` : discount > 0 ? "Member Voucher Promo" : undefined,
            netTotalPaid: net,
            checkInStatus: rawStatus === "aktif" ? "Active In-Session" : rawStatus === "selesai" ? "Completed" : "Scheduled Slot",
            checkInTime: item.check_in_time || "Check-in ready on schedule",
            memberName: user?.nama || user?.nama_member || "Member UHUB",
            memberCompany: user?.perusahaan || user?.instansi || "UHUB Verified Member",
            memberPhone: user?.telp || "081234567890",
            memberEmail: user?.email || `${user?.username || "member"}@uhub.space`,
            qrPayload: `VERIFY-RESERVASI-${item.id}-${item.kode_booking || "PASS"}-MOKLETHUB`,
            barcodeHash: `hash-${item.id}-${item.kode_booking || "key"}`,
            timestampGenerated: item.created_at || new Date().toISOString(),
          };
        });
      }

      // Clear any legacy cached custom reservations from browser localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("uhub_custom_reservations");
        } catch {
          // Ignore
        }
      }

      setReservations(realItems);
    } catch (err) {
      console.warn("Fetch reservations warning:", err);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshReservations();

    const handleAuthChange = () => {
      refreshReservations();
    };

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Quick Demo Login Action
  const handleDemoMemberLogin = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.login({
        username: "johndoe",
        password: "Secret123!",
      });
      if (res.success && res.data) {
        const u = {
          id: res.data.id,
          nama: res.data.member?.nama_member || "John Doe",
          username: res.data.username,
          email: "johndoe@uhub.space",
          role: "member",
          profesi: res.data.member?.instansi || "Software Engineer",
          perusahaan: res.data.member?.instansi || "Universitas Brawijaya",
          telp: res.data.member?.telp || "081234567890",
        };
        setAuthSession(res.data.access_token || res.data.token, u);
        showToast("Berhasil masuk sebagai Member (John Doe)!");
      } else {
        const demoUser = {
          id: 1,
          nama: "John Doe",
          username: "johndoe",
          email: "johndoe@uhub.space",
          role: "member",
          profesi: "UI/UX Designer",
          perusahaan: "Digital Studio Malang",
          telp: "081234567890",
        };
        setAuthSession("demo_token_member_1", demoUser);
        showToast("Berhasil masuk sebagai Member Demo!");
      }
    } catch {
      const demoUser = {
        id: 1,
        nama: "John Doe",
        username: "johndoe",
        email: "johndoe@uhub.space",
        role: "member",
        profesi: "UI/UX Designer",
        perusahaan: "Digital Studio Malang",
        telp: "081234567890",
      };
      setAuthSession("demo_token_member_1", demoUser);
      showToast("Berhasil masuk sebagai Member Demo!");
    } finally {
      refreshReservations();
    }
  };

  // Filtered Ledger Entries
  const filteredLedger = useMemo(() => {
    return reservations.filter((item) => {
      // Month match
      if (selectedMonth !== "ALL") {
        const itemMonth = item.dateRaw ? item.dateRaw.split("-")[1] : "08";
        if (itemMonth !== selectedMonth) return false;
      }
      // Year match
      if (selectedYear !== "ALL") {
        const itemYear = item.dateRaw ? item.dateRaw.split("-")[0] : "2026";
        if (itemYear !== selectedYear) return false;
      }
      // Status match
      if (statusFilter !== "ALL") {
        if (statusFilter === "SELESAI" && item.status !== "Selesai") return false;
        if (statusFilter === "DISETUJUI" && item.status !== "Disetujui" && item.status !== "Aktif / Digunakan") return false;
        if (statusFilter === "DIBATALKAN" && item.status !== "Dibatalkan") return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCode = item.bookingCode.toLowerCase().includes(query);
        const matchTitle = item.spaceTitle.toLowerCase().includes(query);
        const matchLoc = item.location.toLowerCase().includes(query);
        if (!matchCode && !matchTitle && !matchLoc) return false;
      }
      return true;
    });
  }, [reservations, selectedMonth, selectedYear, statusFilter, searchTerm]);

  // Metric Computations
  const metricTotalSessions = filteredLedger.length;
  const metricTotalExpenditure = useMemo(() => {
    return filteredLedger.reduce((acc, curr) => acc + curr.netTotalPaid, 0);
  }, [filteredLedger]);
  const metricTotalSaved = useMemo(() => {
    return filteredLedger.reduce((acc, curr) => acc + curr.discountAmount, 0);
  }, [filteredLedger]);

  // Actions
  const handleOpenReceipt = (item: LedgerReservationItem) => {
    setSelectedPassItem(item);
    setModalReservation({
      id: item.numericId || item.id,
      kode_booking: item.bookingCode,
      e_ticket_number: item.eTicketNumber,
      nama_space: item.spaceTitle,
      nama_member: item.memberName,
      instansi: item.memberCompany,
      tanggal_reservasi: item.dateRaw || item.date,
      timeSlot: item.timeSlot,
      durasi_jam: item.durationHours,
      total_harga_awal: item.grossAmount,
      potongan_diskon: item.discountAmount,
      total_bayar: item.netTotalPaid,
      status: item.rawStatus || item.status,
      created_at: item.bookedAt || item.timestampGenerated,
      location: item.location,
    });
    setIsETicketModalOpen(true);
  };

  const handleCopyBookingCode = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Booking reference ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleExportStatement = () => {
    const csvHeader = "Booking Code,E-Ticket Number,Space,Date,Time Slot,Duration (Hrs),Gross,Discount,Total Paid,Status\n";
    const csvRows = filteredLedger.map(
      (r) =>
        `"${r.bookingCode}","${r.eTicketNumber}","${r.spaceTitle}","${r.date}","${r.timeSlot}",${r.durationHours},${r.grossAmount},${r.discountAmount},${r.netTotalPaid},"${r.status}"`
    );
    const blob = new Blob([csvHeader + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `UHUB-Statement-${selectedYear}-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Statement exported successfully as CSV file!");
  };

  const handlePrintBoardingPass = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleSharePass = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("E-Ticket Pass URL copied to clipboard!");
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111315] font-sans flex flex-col justify-between selection:bg-[#D2F842] selection:text-[#111315]">
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-[#111315] text-white text-[13px] font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-white/15"
          >
            <CheckCircle2 size={16} className="text-[#D2F842]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Navigation */}
      <Navbar />

      {/* Main Interactive Stage Container */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 flex-1">
        {/* ===================================================================== */}
        {/* CASE 1: UN-AUTHENTICATED STATE (BELUM LOGIN)                          */}
        {/* ===================================================================== */}
        {!isLoggedIn && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-10 max-w-[800px] mx-auto space-y-8"
          >
            {/* Header / Hero Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-8 sm:p-10 shadow-sm text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-[#111315] text-[#D2F842] flex items-center justify-center mx-auto mb-5 shadow-sm">
                <ShieldCheck size={32} />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3F4F6] text-[#4B5563] text-[12px] font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Autentikasi Member Diperlukan</span>
              </div>

              <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#111315] tracking-tight">
                Akses Riwayat & E-Ticket Reservasi Anda
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#6C7278] mt-2 max-w-[560px] mx-auto leading-relaxed">
                Silakan masuk ke akun Member Anda untuk melihat jadwal booking aktif, e-ticket QR turnstile check-in, dan riwayat tagihan invoice resmi.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                <Link
                  href="/login/member"
                  className="h-[48px] px-7 rounded-full bg-[#111315] hover:bg-black text-white text-[14px] font-bold inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogIn size={16} className="text-[#D2F842]" />
                  <span>Masuk ke Akun Member</span>
                </Link>

                <Link
                  href="/register/member"
                  className="h-[48px] px-6 rounded-full border border-[#E5E7EB] hover:border-[#111315] bg-white text-[#111315] text-[14px] font-bold inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserPlus size={16} className="text-[#6C7278]" />
                  <span>Daftar Akun Baru</span>
                </Link>
              </div>

              {/* Fast Demo Switcher for Examiners / Testers */}
              <div className="mt-8 pt-6 border-t border-[#F3F4F6] flex flex-col sm:flex-row items-center justify-center gap-3 text-[12px] text-[#6C7278]">
                <span>Ingin langsung menguji alur reservasi?</span>
                <button
                  type="button"
                  onClick={handleDemoMemberLogin}
                  className="px-3.5 py-1.5 rounded-full bg-[#D2F842] hover:bg-[#BCE332] text-[#111315] font-extrabold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Zap size={13} />
                  <span>Masuk Cepat Demo Member (Budi Santoso)</span>
                </button>
              </div>
            </div>

            {/* Quick Explore Spaces Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-[#111315] shrink-0">
                  <Compass size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-[15px] text-[#111315]">
                    Belum memiliki reservasi?
                  </h4>
                  <p className="text-[12px] text-[#6C7278]">
                    Jelajahi pilihan Personal Desk, Meeting Room, dan Private Office Suite kami.
                  </p>
                </div>
              </div>
              <Link
                href="/spaces"
                className="h-[40px] px-5 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111315] text-[13px] font-bold inline-flex items-center gap-1.5 shrink-0 transition-all"
              >
                <span>Lihat Katalog Ruangan</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* ===================================================================== */}
        {/* CASE 2: AUTHENTICATED STATE - VIEW 1: RESERVATION LEDGER (STATE A)     */}
        {/* ===================================================================== */}
        {isLoggedIn && activeViewState === "LEDGER" && (
          <motion.div
            key="ledger-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* 1. Header & Breadcrumb Title Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase text-[#6C7278] mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#D2F842]"></span>
                  <span>• UKK RPL 2026/2027 STANDARD • LEDGER & RECONCILIATION</span>
                </div>
                <h1 className="text-[32px] sm:text-[40px] lg:text-[44px] font-extrabold text-[#111315] tracking-[-0.03em] leading-[1.1]">
                  My Reservations & E-Tickets
                </h1>
                <p className="text-[14px] text-[#6C7278] mt-1.5 max-w-[620px] leading-relaxed">
                  Selamat datang, <strong className="text-[#111315] font-bold">{currentUser?.nama || currentUser?.username}</strong>. Pantau jadwal booking aktif Anda, unduh nota invoice resmi, dan akses tiket QR untuk turnstile check-in di lokasi coworking.
                </p>
              </div>

              {/* Action Link to Create New Reservation */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="shrink-0">
                <Link
                  href="/spaces"
                  className="h-[48px] px-6 rounded-full bg-[#D2F842] hover:bg-[#BCE332] text-[#111315] text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Pesan Ruangan Baru</span>
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>

            {/* 2. Filtering Deck & Statement Generator */}
            <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Form Inputs */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative min-w-[220px] sm:w-[260px]">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C7278]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search space or booking code..."
                    className="w-full h-[42px] pl-9 pr-3.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full text-[13px] text-[#111315] placeholder:text-[#6C7278] focus:outline-none focus:border-[#111315] focus:bg-white transition-all"
                  />
                </div>

                {/* Month Selector */}
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-[42px] pl-4 pr-9 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full text-[13px] font-semibold text-[#111315] focus:outline-none focus:border-[#111315] focus:bg-white appearance-none cursor-pointer transition-all"
                  >
                    <option value="ALL">Semua Bulan</option>
                    <option value="08">Agustus (08)</option>
                    <option value="09">September (09)</option>
                    <option value="10">Oktober (10)</option>
                    <option value="07">Juli (07)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6C7278] pointer-events-none" />
                </div>

                {/* Year Selector */}
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="h-[42px] pl-4 pr-9 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full text-[13px] font-semibold text-[#111315] focus:outline-none focus:border-[#111315] focus:bg-white appearance-none cursor-pointer transition-all"
                  >
                    <option value="ALL">Semua Tahun</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6C7278] pointer-events-none" />
                </div>

                {/* Status Toggle Selector */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-[42px] pl-4 pr-9 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full text-[13px] font-semibold text-[#111315] focus:outline-none focus:border-[#111315] focus:bg-white appearance-none cursor-pointer transition-all"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="SELESAI">Selesai (Completed)</option>
                    <option value="DISETUJUI">Disetujui / Aktif</option>
                    <option value="DIBATALKAN">Dibatalkan</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6C7278] pointer-events-none" />
                </div>

                {/* Reset Button */}
                {(selectedMonth !== "ALL" || selectedYear !== "ALL" || searchTerm !== "" || statusFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth("ALL");
                      setSelectedYear("ALL");
                      setSearchTerm("");
                      setStatusFilter("ALL");
                    }}
                    className="text-[12px] font-bold text-[#6C7278] hover:text-[#111315] underline px-2 cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Right Export Action */}
              <div className="flex items-center gap-2 self-start lg:self-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleExportStatement}
                  disabled={filteredLedger.length === 0}
                  className="h-[42px] px-4 rounded-full border border-[#E5E7EB] hover:border-[#111315] bg-white text-[#111315] text-[13px] font-bold inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>Export CSV</span>
                </motion.button>
              </div>
            </div>

            {/* 3. Metric Overview Cards (2-Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Metric Card 1 */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="show"
                className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-7 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#6C7278]">
                    TOTAL RESERVASI SAYA
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse"></span>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-[32px] sm:text-[36px] font-extrabold text-[#111315] tabular-nums tracking-tight">
                    {metricTotalSessions} Reservasi
                  </span>
                </div>
                <p className="text-[13px] font-medium text-[#059669] mt-2 flex items-center gap-1.5">
                  <Check size={15} strokeWidth={3} />
                  <span>Sesi terverifikasi dengan QR E-Ticket & Turnstile check-in</span>
                </p>
              </motion.div>

              {/* Metric Card 2 */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="show"
                className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-7 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#6C7278]">
                    TOTAL PENGELUARAN SELESAI
                  </span>
                  <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                    Billed & Settled
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-[32px] sm:text-[36px] font-extrabold text-[#111315] tabular-nums tracking-tight">
                    Rp {metricTotalExpenditure.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-[#6C7278] mt-2">
                  Hemat{" "}
                  <strong className="text-[#111315] font-bold">
                    Rp {metricTotalSaved.toLocaleString("id-ID")}
                  </strong>{" "}
                  melalui voucher diskon terpasang
                </p>
              </motion.div>
            </div>

            {/* 4. Ledger Feed (Interactive Data Table / Card Rows) */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] overflow-hidden shadow-xs">
              {/* Feed Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#111315]">
                    DAFTAR TRANSAKSI & RESERVASI ({filteredLedger.length} ITEM)
                  </h3>
                </div>
                <span className="text-[12px] font-semibold text-[#6C7278]">
                  Urutan Tanggal (Terbaru)
                </span>
              </div>

              {/* Table Body */}
              {filteredLedger.length === 0 ? (
                <div className="p-12 text-center text-[#6C7278] space-y-3">
                  <Receipt size={40} className="mx-auto text-[#9CA3AF]" />
                  <p className="text-[16px] font-bold text-[#111315]">
                    Belum Ada Riwayat Reservasi
                  </p>
                  <p className="text-[13px] text-[#6C7278] max-w-md mx-auto">
                    Anda belum memiliki sesi reservasi untuk filter yang dipilih. Silakan pesan meja atau ruangan coworking sekarang.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/spaces"
                      className="px-6 py-2.5 rounded-full bg-[#111315] hover:bg-black text-white text-[13px] font-bold inline-flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Sparkles size={14} className="text-[#D2F842]" />
                      <span>Jelajahi Ruangan & Reservasi</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {filteredLedger.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ backgroundColor: "rgba(248, 249, 250, 0.6)" }}
                      className="p-5 sm:p-6 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      {/* Left: Space & Details */}
                      <div className="flex items-start gap-4 sm:gap-4.5 min-w-[280px]">
                        <img
                          src={item.image}
                          alt={item.spaceTitle}
                          className="w-[68px] h-[68px] rounded-[16px] object-cover bg-[#E5E7EB] shrink-0 border border-[#E5E7EB]"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              onClick={(e) => handleCopyBookingCode(item.bookingCode, e)}
                              className="font-mono text-[11px] font-bold bg-[#F3F4F6] text-[#111315] hover:bg-[#E5E7EB] px-2 py-0.5 rounded-[6px] cursor-pointer transition-colors"
                              title="Klik untuk menyalin kode booking"
                            >
                              {item.bookingCode} {copiedCode === item.bookingCode && "✓"}
                            </span>
                            <span className="text-[11px] font-bold text-[#059669] flex items-center gap-1 font-sans">
                              <Clock size={11} className="shrink-0 text-[#10B981]" />
                              <span>Waktu Transaksi: {item.bookedAt}</span>
                            </span>
                          </div>
                          <h4 className="text-[16px] font-bold text-[#111315] leading-tight">
                            {item.spaceTitle}
                          </h4>
                          <p className="text-[12px] text-[#6C7278] mt-0.5 flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{item.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Middle 1: Schedule & Duration */}
                      <div className="min-w-[220px]">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-[#6C7278]">
                          JADWAL & DURASI
                        </span>
                        <div className="text-[13px] font-bold text-[#111315] mt-1">
                          {item.date}
                        </div>
                        <div className="text-[12px] font-medium text-[#6C7278] mt-0.5">
                          {item.timeSlot} • {item.durationHours} Jam
                        </div>
                        {item.status === "Selesai" && item.checkInTime && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] mt-1">
                            <Check size={12} strokeWidth={3} />
                            <span>{item.checkInTime}</span>
                          </span>
                        )}
                        {item.status === "Dibatalkan" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] mt-1">
                            <span>Dibatalkan oleh Member</span>
                          </span>
                        )}
                      </div>

                      {/* Middle 2: Total Billed */}
                      <div className="min-w-[150px]">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-[#6C7278]">
                          TOTAL DIBAYAR
                        </span>
                        <div className="text-[16px] font-extrabold text-[#111315] tabular-nums mt-0.5">
                          Rp {item.netTotalPaid.toLocaleString("id-ID")}
                        </div>
                        <span className="text-[11px] text-[#6C7278]">
                          {item.discountPromoName || (item.netTotalPaid === 0 ? "Full Refund Issued" : "Tarif Standar • Terbayar")}
                        </span>
                      </div>

                      {/* Middle 3: Status Badge */}
                      <div className="min-w-[130px]">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-[#6C7278] mb-1">
                          STATUS
                        </span>
                        {item.status === "Selesai" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#374151] bg-[#F3F4F6] px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6C7278]"></span>
                            <span>• Selesai</span>
                          </span>
                        ) : item.status === "Disetujui" || item.status === "Aktif / Digunakan" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                            <span>• {item.status}</span>
                          </span>
                        ) : item.status === "Dibatalkan" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-red-200 px-2.5 py-1 rounded-full">
                            <span>• Dibatalkan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] bg-[#FFFBEB] border border-amber-200 px-2.5 py-1 rounded-full">
                            <span>• {item.status}</span>
                          </span>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0">
                        {item.status !== "Dibatalkan" ? (
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            onClick={() => handleOpenReceipt(item)}
                            className="h-[38px] px-3.5 rounded-full border border-[#E5E7EB] hover:border-[#111315] bg-white text-[#111315] text-[12px] font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Receipt size={14} />
                            <span>E-Ticket & Nota ↗</span>
                          </motion.button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => showToast("Status Pengembalian: 100% dana telah dikembalikan")}
                            className="h-[38px] px-3 rounded-full bg-[#F3F4F6] text-[#6C7278] text-[12px] font-semibold cursor-pointer"
                          >
                            Catatan Refund
                          </button>
                        )}

                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                          <Link
                            href={`/booking?space=personal-desk-flexi-01&date=2026-09-28&time=09:00`}
                            className="h-[38px] px-4 rounded-full bg-[#D2F842] hover:bg-[#BCE332] text-[#111315] text-[12px] font-bold inline-flex items-center justify-center transition-all shadow-xs cursor-pointer"
                          >
                            {item.status === "Dibatalkan" ? "Pesan Ulang" : "Pesan Lagi"}
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Corporate Accounting Banner */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-[14px] bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-[#111315] shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-[#111315]">
                    Butuh faktur pajak & rekap invoice konsolidasi untuk instansi Anda?
                  </h4>
                  <p className="text-[13px] text-[#6C7278] mt-0.5 max-w-[620px] leading-relaxed">
                    UHUB menyediakan invoice konsolidasi bulanan resmi yang sesuai dengan standar pelaporan akuntansi dan sistem reimbursement perusahaan.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => showToast("Menghubungkan ke Layanan Faktur Keuangan...")}
                className="h-[42px] px-5 rounded-full border border-[#E5E7EB] hover:border-[#111315] bg-white text-[#111315] text-[13px] font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <span>Hubungi Layanan Keuangan</span>
                <ArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: DIGITAL E-TICKET PASS & RECEIPT OVERLAY (STATE B)             */}
        {/* ===================================================================== */}
        {isLoggedIn && activeViewState === "TICKET_PASS" && selectedPassItem && (
          <motion.div
            key="pass-view"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* 1. Breadcrumb Action Bar (Hidden during print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 print:hidden">
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setActiveViewState("LEDGER")}
                className="inline-flex items-center gap-2 text-[13px] font-bold text-[#111315] hover:text-black transition-colors cursor-pointer bg-white border border-[#E5E7EB] px-4 py-2 rounded-full shadow-xs w-fit"
              >
                <ArrowLeft size={16} />
                <span>← Kembali ke Riwayat Reservasi</span>
              </motion.button>

              <div className="flex items-center gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleSharePass}
                  className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] hover:border-[#111315] flex items-center justify-center text-[#111315] shadow-xs cursor-pointer"
                  title="Bagikan E-Ticket Pass"
                >
                  <Share2 size={16} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handlePrintBoardingPass}
                  className="h-[42px] px-5 rounded-full bg-[#111315] hover:bg-black text-white text-[13px] font-bold inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Cetak Nota / PDF</span>
                </motion.button>
              </div>
            </div>

            {/* 2. Boarding Pass Container */}
            <div
              ref={printPassRef}
              className="w-full max-w-[680px] mx-auto bg-white border border-[#E5E7EB] rounded-[28px] shadow-2xl relative overflow-hidden transition-all print:border-0 print:shadow-none print:max-w-full"
            >
              {/* Top Section Header */}
              <div className="p-6 sm:p-8 border-b border-[#E5E7EB]/80 bg-gradient-to-b from-[#F8F9FA]/60 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/img/logo.svg" alt="UHUB Logo" className="h-7 w-auto object-contain" />
                    <div className="h-4 w-[1px] bg-[#E5E7EB]" />
                    <span className="text-[12px] font-extrabold tracking-[0.1em] uppercase text-[#111315]">
                      UHUB E-TICKET PASS
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-extrabold text-[#059669]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                    <span>● Disetujui / Ready for Check-in</span>
                  </span>
                </div>

                <p className="text-[12px] text-[#6C7278] mt-2 font-medium">
                  {selectedPassItem.location} • Tel: 081298765432
                </p>
              </div>

              {/* Main Ticket Grid */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Reference & QR Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]/80">
                  <div className="space-y-4 flex-1">
                    <div>
                      <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#6C7278] block">
                        BOOKING REFERENCE CODE
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[22px] sm:text-[24px] font-extrabold text-[#111315] tracking-tight">
                          {selectedPassItem.bookingCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyBookingCode(selectedPassItem.bookingCode)}
                          className="p-1 rounded-md hover:bg-[#F3F4F6] text-[#6C7278] hover:text-[#111315] transition-colors"
                          title="Copy Booking Code"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#6C7278] block">
                        E-TICKET NUMBER
                      </span>
                      <span className="font-mono text-[13px] font-semibold text-[#111315] mt-0.5 block">
                        {selectedPassItem.eTicketNumber}
                      </span>
                    </div>
                  </div>

                  {/* QR Scan Code Container */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[20px] p-3 flex flex-col items-center justify-center shrink-0 w-[145px] text-center shadow-xs">
                    <RealQRCode
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}/reservasi?code=${selectedPassItem.bookingCode}&ticket=${selectedPassItem.eTicketNumber}`
                          : `UHUB-PASS:${selectedPassItem.bookingCode}|${selectedPassItem.spaceTitle}|VERIFIED`
                      }
                      size={80}
                      level="M"
                    />
                    <span className="text-[9.5px] font-black text-[#6C7278] mt-2 uppercase tracking-wider">
                      SCAN AT TURNSTILE
                    </span>
                  </div>
                </div>

                {/* Reservation Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#6C7278] tracking-[0.06em] block">
                      RUANG / MEJA
                    </span>
                    <span className="text-[14px] font-bold text-[#111315] mt-1 block">
                      {selectedPassItem.spaceTitle}
                    </span>
                    <span className="text-[11px] text-[#6C7278]">
                      {selectedPassItem.categoryLabel}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#6C7278] tracking-[0.06em] block">
                      TANGGAL
                    </span>
                    <span className="text-[14px] font-bold text-[#111315] mt-1 block">
                      {selectedPassItem.date}
                    </span>
                    <span className="text-[11px] text-[#059669] font-medium">
                      Confirmed Slot
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#6C7278] tracking-[0.06em] block">
                      WAKTU & DURASI
                    </span>
                    <span className="text-[14px] font-bold text-[#111315] mt-1 block">
                      {selectedPassItem.timeSlot}
                    </span>
                    <span className="text-[11px] text-[#6C7278]">
                      {selectedPassItem.durationHours} Jam Sesi
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#6C7278] tracking-[0.06em] block">
                      NAMA MEMBER
                    </span>
                    <span className="text-[14px] font-bold text-[#111315] mt-1 block">
                      {selectedPassItem.memberName}
                    </span>
                    <span className="text-[11px] text-[#6C7278]">
                      {selectedPassItem.memberCompany}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#6C7278] tracking-[0.06em] block">
                      TOTAL DIBAYAR
                    </span>
                    <span className="text-[16px] font-extrabold text-[#111315] mt-1 block tabular-nums">
                      Rp {selectedPassItem.netTotalPaid.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] text-[#059669] font-medium">
                      Lunas Terbayar
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#6C7278] tracking-[0.06em] block">
                      CHECK-IN STATUS
                    </span>
                    <span className="text-[13px] font-bold text-[#059669] mt-1 block">
                      {selectedPassItem.checkInStatus || "Ready on schedule"}
                    </span>
                    <span className="text-[11px] text-[#6C7278]">
                      Turnstile Barrier #01
                    </span>
                  </div>
                </div>
              </div>

              {/* Boarding Pass Bottom Barcode Banner */}
              <div className="bg-[#111315] text-white p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[12px] font-bold text-[#D2F842]">
                    <ShieldCheck size={16} />
                    <span>VERIFIED OFFICIAL E-TICKET</span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    Valid for single entry during booked session window • UHUB Security ID #2026-B
                  </p>
                </div>

                <div className="font-mono text-[11px] text-white/40 tracking-widest shrink-0">
                  ||| | | |||| ||| || | ||| ||
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Official E-Ticket & Nota Modal */}
      <ETicketNotaModal
        isOpen={isETicketModalOpen}
        onClose={() => setIsETicketModalOpen(false)}
        reservation={modalReservation}
      />
    </div>
  );
}
