"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSpaceById, SPACES_DATA, SpaceItem, mapBackendSpaceToSpaceItem } from "@/data/spaces";
import {
  ArrowLeft,
  Clock,
  Ticket,
  Lock,
  Minus,
  Plus,
  CheckCircle2,
  CalendarCheck,
  QrCode,
  CreditCard,
  Smartphone,
  Building2,
  Copy,
  Check,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import {
  reservasiApi,
  spaceApi,
  authApi,
  getAuthToken,
  setAuthSession,
  diskonApi,
} from "@/lib/api";
import AppleCalendarPicker from "@/components/ui/apple-calendar-picker";

export default function BookingPage() {
  const [spaceId, setSpaceId] = useState("personal-desk-flexi-01");
  const [liveSpaces, setLiveSpaces] = useState<SpaceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState("2026-09-15");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(3);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    id?: number;
    code: string;
    percentage: number;
  } | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 mins availability lock
  const [createdBookingCode, setCreatedBookingCode] = useState("");
  const [isApplePickerOpen, setIsApplePickerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [customContact, setCustomContact] = useState({
    nama: "",
    instansi: "",
    telp: "",
  });

  // Load user from session & listen to auth changes
  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("uhub_user");
        if (raw && raw !== "guest") {
          const u = JSON.parse(raw);
          setCurrentUser(u);
          setCustomContact({
            nama: u.nama || u.nama_member || "",
            instansi: u.perusahaan || u.instansi || u.profesi || "",
            telp: u.telp || u.phone || "081234567890",
          });
          if (u.telp) setEwalletPhone(u.telp);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };
    loadUser();
    window.addEventListener("authChange", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("authChange", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  // Fetch live spaces from backend
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await spaceApi.getSpaces();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLiveSpaces(res.data.map(mapBackendSpaceToSpaceItem));
        }
      } catch (err) {
        console.warn("Booking page fetch spaces note:", err);
      }
    };
    fetchSpaces();
  }, []);

  // Payment Gateway State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "va" | "ewallet">("qris");
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bni" | "bri">("bca");
  const [selectedEwallet, setSelectedEwallet] = useState<"gopay" | "ovo" | "shopeepay" | "dana">("gopay");
  const [ewalletPhone, setEwalletPhone] = useState("081234567890");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [copiedVA, setCopiedVA] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(899); // 14:59 min countdown

  // Read URL query parameters on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qSpaceId = params.get("spaceId") || params.get("space");
      const qTanggal = params.get("tanggal") || params.get("date");
      const qJam = params.get("jam") || params.get("time");
      const qDurasi = params.get("durasi") || params.get("duration");

      if (qSpaceId) setSpaceId(qSpaceId);
      if (qTanggal) setSelectedDate(qTanggal);
      if (qJam) setStartTime(qJam);
      if (qDurasi) setDuration(Number(qDurasi) || 3);
    }
  }, []);

  const space = getSpaceById(spaceId, liveSpaces) || SPACES_DATA[0];

  // 15-Minute Countdown Lock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      setPaymentTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Pricing calculations
  const pricePerHour = space.rate;
  const subtotal = pricePerHour * duration;
  const discountAmount = appliedVoucher
    ? (subtotal * appliedVoucher.percentage) / 100
    : 0;
  const totalPayable = subtotal - discountAmount;

  // Calculate End Time (e.g., 09:00 + 3 hours -> 12:00 WIB)
  const calculateEndTime = (start: string, dur: number) => {
    const [h, m] = start.split(":").map(Number);
    const endH = (h + dur) % 24;
    return `${endH.toString().padStart(2, "0")}:${(m || 0)
      .toString()
      .padStart(2, "0")}`;
  };

  const endTime = calculateEndTime(startTime, duration);

  const handleApplyVoucher = async (codeToApply: string) => {
    setVoucherError("");
    const cleaned = codeToApply.trim().toUpperCase();

    try {
      const res = await diskonApi.getDiscounts();
      if (res.success && Array.isArray(res.data)) {
        const match = res.data.find(
          (d) => d.nama_diskon.toUpperCase() === cleaned
        );
        if (match) {
          setAppliedVoucher({
            id: match.id,
            code: match.nama_diskon,
            percentage: match.persentase_diskon,
          });
          setVoucherCode(match.nama_diskon);
          return;
        }
      }
    } catch {
      // fallback
    }

    if (cleaned === "DISKONHEMAT20") {
      setAppliedVoucher({ code: "DISKONHEMAT20", percentage: 20 });
      setVoucherCode("DISKONHEMAT20");
    } else if (cleaned === "UKKPROMO50") {
      setAppliedVoucher({ code: "UKKPROMO50", percentage: 50 });
      setVoucherCode("UKKPROMO50");
    } else {
      setVoucherError("Kode voucher tidak valid atau sudah kedaluwarsa!");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const getNumericSpaceId = (sId: string | number) => {
    const found = liveSpaces.find(
      (ls) => ls.id === String(sId) || ls.title.toLowerCase() === String(sId).toLowerCase()
    );
    if (found && !isNaN(Number(found.id))) {
      return Number(found.id);
    }
    const n = parseInt(String(sId), 10);
    if (!isNaN(n) && n > 0) return n;
    const s = String(sId).toLowerCase();
    if (s.includes("flexi") || s.includes("desk")) return 1;
    if (s.includes("alpha") || s.includes("meeting")) return 2;
    if (s.includes("office") || s.includes("private")) return 3;
    return 1;
  };

  // Open Payment Gateway Modal
  const handleProceedToPayment = () => {
    setSubmitError("");
    setIsPaymentModalOpen(true);
  };

  // Simulate Payment & Confirm Reservation
  const handleSimulatePayment = async () => {
    setIsVerifyingPayment(true);
    setSubmitError("");

    try {
      // Ensure member is authenticated
      let token = getAuthToken();
      if (!token) {
        // Auto sign-in with default member
        const authRes = await authApi.login({
          username: "johndoe",
          password: "Secret123!",
        });
        if (authRes.success && authRes.data) {
          token = authRes.data.access_token || authRes.data.token;
          const userObj = {
            id: authRes.data.id,
            nama: authRes.data.member?.nama_member || authRes.data.username || "John Doe",
            username: authRes.data.username,
            email: `${authRes.data.username}@uhub.space`,
            role: authRes.data.role,
            profesi: authRes.data.member?.instansi || "Member",
            perusahaan: authRes.data.member?.instansi || "UHUB Space",
            avatar:
              authRes.data.member?.foto ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          };
          setAuthSession(token!, userObj);
          setCurrentUser(userObj);
        }
      }

      // Simulate network verification delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const numericSpaceId = getNumericSpaceId(spaceId);

      const res = await reservasiApi.create({
        id_space: numericSpaceId,
        tanggal: selectedDate,
        tanggal_reservasi: selectedDate,
        jam_mulai: startTime,
        jam_selesai: endTime,
        durasi_jam: duration,
        kode_promo: appliedVoucher?.code || undefined,
        id_diskon: appliedVoucher?.id || undefined,
      });

      if (!res.success || !res.data) {
        setSubmitError(
          res.message || "Gagal membuat reservasi. Silakan periksa kembali jadwal Anda."
        );
        setIsVerifyingPayment(false);
        return;
      }

      const bookingData = res.data;
      const bookingCode = bookingData.kode_booking;
      setCreatedBookingCode(bookingCode);

      // Clear any legacy custom cache
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("uhub_custom_reservations");
        } catch {
          // Ignore
        }
      }

      // Close payment modal and switch to success view
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setBookingSuccess(true);
        setIsVerifyingPayment(false);
      }, 800);
    } catch (err: any) {
      setSubmitError(err.message || "Terjadi kesalahan saat memverifikasi pembayaran.");
      setIsVerifyingPayment(false);
    }
  };

  const getVirtualAccountNumber = (bank: string) => {
    switch (bank) {
      case "bca":
        return "8801 0812 9823 4401";
      case "mandiri":
        return "8902 2026 8812 9903";
      case "bni":
        return "8808 1902 4492 0182";
      case "bri":
        return "8812 7701 9283 5521";
      default:
        return "8801 0812 9823 4401";
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 280,
        damping: 24,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col justify-between selection:bg-[#D5F066] selection:text-[#0E0F12]">
      {/* Floating Navbar */}
      <Navbar />

      {/* Main Reservation Container */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb & User Auth */}
        <motion.div
          variants={cardVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 mb-6"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/spaces"
                className="inline-flex items-center gap-2 bg-white border border-[#E5E7EB] hover:border-[#111827] text-[#111827] text-[13px] font-semibold px-4 py-2 rounded-full transition-all shadow-xs"
              >
                <ArrowLeft size={15} />
                <span>Kembali ke Katalog</span>
              </Link>
            </motion.div>

            <nav className="flex items-center gap-2 text-[13px] text-[#6B7280] ml-1">
              <span>UHUB</span>
              <span className="text-[#E5E7EB]">/</span>
              <Link href="/reservasi" className="hover:text-[#111827] transition-colors">
                My Reservations
              </Link>
              <span className="text-[#E5E7EB]">/</span>
              <span className="font-semibold text-[#111827]">
                Reservasi & Pembayaran
              </span>
            </nav>
          </div>

          {/* Active Member Status Pill */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white border border-[#E5E7EB] rounded-full py-1.5 pl-2 pr-4 flex items-center gap-2.5 shadow-xs"
          >
            <div className="relative w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-[11px] font-bold overflow-hidden">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.nama ? currentUser.nama.slice(0, 2).toUpperCase() : "MB"}</span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-[#111827]">
                {currentUser?.nama || currentUser?.nama_member || "Member Terverifikasi"}
              </span>
              <span className="text-[11px] text-[#6B7280]">
                • Sesi Aktif
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Page Header */}
        <motion.div variants={cardVariants} className="mb-8">
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.06em] text-[#6B7280] shadow-xs mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            <span>PEMESANAN WORKSPACE & GATEWAY PEMBAYARAN</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-[clamp(2.25rem,4vw,2.9rem)] font-extrabold text-[#111827] tracking-[-0.03em] leading-[1.1]">
                Reservasi Ruang Kerja
              </h1>
              <p className="text-[14px] text-[#6B7280] mt-1.5 max-w-[660px] leading-relaxed">
                Tentukan jadwal penggunaan space, klaim voucher diskon eksklusif, dan selesaikan transaksi melalui Payment Gateway interaktif.
              </p>
            </div>

            {/* Availability Lock Countdown Tag */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-[#E5E7EB] rounded-full px-4 py-2 flex items-center gap-2 text-[12px] font-semibold text-[#374151] shadow-xs shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span>
                Kunci Ketersediaan Aktif (
                <span className="font-mono tabular-nums text-[#111827] font-bold">
                  {formatTimer(timeRemaining)}
                </span>{" "}
                tersisa)
              </span>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {bookingSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white border border-[#E5E7EB] rounded-[28px] p-8 sm:p-12 text-center flex flex-col items-center my-8 shadow-xl max-w-[720px] mx-auto"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] mb-5 shadow-xs"
              >
                <CheckCircle2 size={38} />
              </motion.div>

              <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-1 rounded-full mb-3">
                PEMBAYARAN BERHASIL • MENUNGGU KONFIRMASI ADMIN
              </span>
              <h2 className="text-[26px] sm:text-[30px] font-extrabold text-[#111827] tracking-tight">
                Reservasi Berhasil Didaftarkan!
              </h2>
              <p className="text-[14px] text-[#6B7280] mt-2 max-w-[520px] leading-relaxed">
                Pemesanan Anda untuk <span className="font-bold text-[#111827]">{space.title}</span> (Kode: <span className="font-mono font-bold text-[#111827]">{createdBookingCode}</span>) pada tanggal{" "}
                <span className="font-semibold text-[#111827]">{selectedDate} ({startTime} - {endTime} WIB)</span> telah terbayar lunas dan sedang menunggu persetujuan Admin Space.
              </p>

              {/* Summary Card */}
              <div className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-[20px] p-5 my-6 text-left space-y-2.5 text-[13px]">
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-[#6B7280]">Kode Booking</span>
                  <span className="font-mono font-bold text-[#111827]">{createdBookingCode}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-[#6B7280]">Status Reservasi</span>
                  <span className="bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full text-[11px] uppercase">
                    Menunggu Persetujuan Admin
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-[#6B7280]">Total Terbayar</span>
                  <span className="font-extrabold text-[#111827]">
                    Rp {totalPayable.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Metode Pembayaran</span>
                  <span className="font-bold text-[#111827] capitalize">
                    {paymentMethod === "qris" ? "QRIS Instant Settlement" : paymentMethod === "va" ? `Virtual Account ${selectedBank.toUpperCase()}` : `E-Wallet ${selectedEwallet.toUpperCase()}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/reservasi"
                    className="bg-[#111111] text-[#D4F34A] text-[14px] font-bold px-8 py-3.5 rounded-full hover:bg-black transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <CalendarCheck size={16} />
                    <span>Buka Halaman My Reservations →</span>
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setBookingSuccess(false)}
                  className="bg-[#F8F9FA] text-[#111827] text-[14px] font-semibold px-6 py-3.5 rounded-full border border-[#E5E7EB] hover:bg-white transition-colors cursor-pointer"
                >
                  Pesan Sesi Lainnya
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* 2-Column Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-5">
                {/* Chosen Space Card */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                  className="bg-white border border-[#E5E7EB] rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="relative w-[108px] h-[82px] min-w-[108px] rounded-[14px] overflow-hidden bg-[#1A1A1A]">
                      <img
                        src={space.image}
                        alt={space.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#111827] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {space.badgeTag}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[6px] px-2 py-0.5 text-[11px] font-semibold text-[#111827]">
                          {space.categoryLabel}
                        </span>
                        <span className="text-[12px] text-[#6B7280]">
                          {space.capacity}
                        </span>
                      </div>
                      <h3 className="text-[18px] sm:text-[20px] font-bold text-[#111827] mt-1 mb-2">
                        {space.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {space.amenities.slice(0, 3).map((amenity, i) => (
                          <span
                            key={i}
                            className="bg-white border border-[#E5E7EB] rounded-[6px] px-2 py-0.5 text-[11px] text-[#6B7280]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                    <span className="text-[10px] font-bold tracking-[0.06em] uppercase text-[#6B7280]">
                      TARIF PER JAM
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[20px] sm:text-[22px] font-extrabold text-[#111827] tabular-nums">
                        Rp {space.rate.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[12px] text-[#6B7280]">/jam</span>
                    </div>
                  </div>
                </motion.div>

                {/* Step 01: Schedule & Timing */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                  className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-7 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between pb-5 border-b border-[#E5E7EB]/70">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-[12px] font-extrabold">
                        01
                      </div>
                      <h3 className="text-[18px] font-bold text-[#111827]">
                        Pilih Jadwal & Durasi Sesi
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                      ✓ Sinkron Realtime
                    </span>
                  </div>

                  <div className="space-y-4 mt-5">
                    {/* Unified Apple DateTime Trigger Card */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.05em] uppercase text-[#374151] mb-2">
                        TANGGAL & JAM MULAI RESERVASI
                      </label>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        onClick={() => setIsApplePickerOpen(true)}
                        className="w-full bg-[#F8F9FA] hover:bg-white border border-[#E5E7EB] hover:border-[#111827] rounded-[16px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-xs cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-[#111827]/10 text-[#111827] flex items-center justify-center group-hover:bg-[#111827] group-hover:text-white transition-colors shrink-0">
                            <Clock size={18} />
                          </div>
                          <div>
                            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                              JADWAL TERPILIH (KLIK UNTUK MENGUBAH)
                            </span>
                            <span className="text-[15px] sm:text-[16px] font-bold text-[#111827] group-hover:text-[#111827] transition-colors">
                              {selectedDate} • {startTime} WIB
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="text-[12px] font-bold text-[#111827] bg-[#D4F34A] px-3.5 py-1.5 rounded-full transition-colors shadow-xs">
                            Ganti Jadwal ↗
                          </span>
                        </div>
                      </motion.button>
                    </div>

                    {/* Duration Stepper & Quick Hour Chips */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] font-bold tracking-[0.05em] uppercase text-[#374151]">
                          DURASI PENGGUNAAN SPACE
                        </label>
                        <span className="text-[11px] text-[#6B7280]">
                          1 – 12 jam fleksibel
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-[16px]">
                        {/* Preset Quick Chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[1, 2, 3, 4, 6, 8].map((h) => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => setDuration(h)}
                              className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                                duration === h
                                  ? "bg-[#111827] text-white shadow-xs"
                                  : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#111827] hover:text-[#111827]"
                              }`}
                            >
                              {h === 8 ? "8 Jam (Full Day)" : `${h} Jam`}
                            </button>
                          ))}
                        </div>

                        {/* Stepper Controls */}
                        <div className="h-[40px] bg-white border border-[#E5E7EB] rounded-full px-1.5 flex items-center gap-2.5 w-fit shrink-0 self-end sm:self-center">
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            type="button"
                            onClick={() => setDuration((prev) => Math.max(1, prev - 1))}
                            className="w-[28px] h-[28px] rounded-full bg-[#F8F9FA] hover:bg-[#E5E7EB] flex items-center justify-center text-[#111827] transition-all cursor-pointer"
                            aria-label="Kurangi durasi"
                          >
                            <Minus size={13} />
                          </motion.button>
                          <span className="text-[13px] font-bold tabular-nums text-[#111827] min-w-[54px] text-center">
                            {duration} Jam
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            type="button"
                            onClick={() => setDuration((prev) => Math.min(12, prev + 1))}
                            className="w-[28px] h-[28px] rounded-full bg-[#F8F9FA] hover:bg-[#E5E7EB] flex items-center justify-center text-[#111827] transition-all cursor-pointer"
                            aria-label="Tambah durasi"
                          >
                            <Plus size={13} />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Slot Summary Bar */}
                    <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-[14px] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[13px] text-[#065F46]">
                        <Clock size={16} className="text-[#059669] shrink-0" />
                        <span>
                          Slot Jam Terpilih:{" "}
                          <strong className="font-extrabold text-[#065F46]">
                            {startTime} – {endTime} WIB
                          </strong>{" "}
                          ({duration} Jam Total)
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#A7F3D0] text-[11px] font-bold text-[#059669] w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                        Slot Tersedia
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Step 02: Voucher */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                  className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-7 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between pb-5 border-b border-[#E5E7EB]/70">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-[12px] font-extrabold">
                        02
                      </div>
                      <h3 className="text-[18px] font-bold text-[#111827]">
                        Gunakan Voucher Promo
                      </h3>
                    </div>
                    <span className="text-[12px] font-semibold text-[#059669] flex items-center gap-1">
                      🏷️ Promo Tersedia
                    </span>
                  </div>

                  <div className="mt-5 h-[50px] border border-[#E5E7EB] rounded-[12px] bg-white flex items-center justify-between pl-4 pr-1.5 focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/10 transition-all">
                    <div className="flex items-center gap-2.5 flex-1 mr-2">
                      <Ticket size={16} className="text-[#6B7280] shrink-0" />
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="MASUKKAN KODE PROMO"
                        className="w-full text-[14px] font-bold font-mono text-[#111827] placeholder:text-[#9CA3AF] bg-transparent outline-none uppercase"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => handleApplyVoucher(voucherCode)}
                      className="h-[38px] px-5 rounded-[8px] bg-[#111827] text-white text-[13px] font-semibold hover:bg-black transition-all cursor-pointer"
                    >
                      Klaim
                    </motion.button>
                  </div>

                  {voucherError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12px] text-[#EF4444] mt-2 font-medium"
                    >
                      {voucherError}
                    </motion.p>
                  )}

                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.06em] uppercase text-[#6B7280]">
                      KODE PROMO POPULER:
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => handleApplyVoucher("DISKONHEMAT20")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                        appliedVoucher?.code === "DISKONHEMAT20"
                          ? "bg-[#D5F066] border border-[#BBDC3D] text-[#111827] shadow-xs"
                          : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]"
                      }`}
                    >
                      <Ticket size={12} />
                      <span>DISKONHEMAT20 (20% OFF)</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => handleApplyVoucher("UKKPROMO50")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                        appliedVoucher?.code === "UKKPROMO50"
                          ? "bg-[#D5F066] border border-[#BBDC3D] text-[#111827] font-bold shadow-xs"
                          : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]"
                      }`}
                    >
                      <Ticket size={12} />
                      <span>UKKPROMO50 (50% OFF)</span>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {appliedVoucher && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[10px] p-3 px-4 flex items-center justify-between gap-3 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 text-[12px] text-[#065F46]">
                          <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />
                          <span>
                            Voucher <strong className="font-mono font-bold">{appliedVoucher.code}</strong> aktif! Diskon{" "}
                            <strong className="font-bold">{appliedVoucher.percentage}%</strong> berhasil dipotong dari total tagihan.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          className="text-[12px] font-semibold text-[#6B7280] hover:text-[#EF4444] underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Step 03: Member Details */}
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                  className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-7 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between pb-5 border-b border-[#E5E7EB]/70">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-[12px] font-extrabold">
                        03
                      </div>
                      <h3 className="text-[18px] font-bold text-[#111827]">
                        Informasi Pemesan / Member
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingContact(!isEditingContact)}
                      className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827] underline cursor-pointer"
                    >
                      {isEditingContact ? "Batal Edit" : "Ubah Data Kontak"}
                    </button>
                  </div>

                  {isEditingContact ? (
                    <div className="mt-5 space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.06em] uppercase text-[#6B7280] mb-1">
                            NAMA LENGKAP
                          </label>
                          <input
                            type="text"
                            value={customContact.nama}
                            onChange={(e) =>
                              setCustomContact((prev) => ({ ...prev, nama: e.target.value }))
                            }
                            placeholder="John Doe"
                            className="w-full h-[44px] px-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-[10px] text-[13px] font-bold text-[#111827] focus:outline-none focus:border-[#111827] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.06em] uppercase text-[#6B7280] mb-1">
                            INSTANSI / PERUSAHAAN
                          </label>
                          <input
                            type="text"
                            value={customContact.instansi}
                            onChange={(e) =>
                              setCustomContact((prev) => ({ ...prev, instansi: e.target.value }))
                            }
                            placeholder="Digital Studio Malang"
                            className="w-full h-[44px] px-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-[10px] text-[13px] font-bold text-[#111827] focus:outline-none focus:border-[#111827] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.06em] uppercase text-[#6B7280] mb-1">
                            WHATSAPP
                          </label>
                          <input
                            type="tel"
                            value={customContact.telp}
                            onChange={(e) =>
                              setCustomContact((prev) => ({ ...prev, telp: e.target.value }))
                            }
                            placeholder="081234567890"
                            className="w-full h-[44px] px-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-[10px] text-[13px] font-bold text-[#111827] focus:outline-none focus:border-[#111827] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (currentUser) {
                              const updated = {
                                ...currentUser,
                                nama: customContact.nama || currentUser.nama,
                                perusahaan: customContact.instansi || currentUser.perusahaan,
                                instansi: customContact.instansi || currentUser.instansi,
                                telp: customContact.telp || currentUser.telp,
                              };
                              localStorage.setItem("uhub_user", JSON.stringify(updated));
                              setCurrentUser(updated);
                              window.dispatchEvent(new Event("authChange"));
                            }
                            setIsEditingContact(false);
                          }}
                          className="px-4 py-1.5 rounded-full bg-[#111827] text-white text-[12px] font-bold hover:bg-black transition-colors cursor-pointer"
                        >
                          Simpan Kontak
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 mt-5">
                      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] p-3 sm:p-3.5">
                        <span className="block text-[10px] font-bold tracking-[0.06em] uppercase text-[#6B7280]">
                          NAMA PEMESAN
                        </span>
                        <div className="text-[14px] font-bold text-[#111827] mt-1 truncate">
                          {customContact.nama || currentUser?.nama || currentUser?.nama_member || "John Doe"}
                        </div>
                      </div>

                      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] p-3 sm:p-3.5">
                        <span className="block text-[10px] font-bold tracking-[0.06em] uppercase text-[#6B7280]">
                          INSTANSI / AFILIASI
                        </span>
                        <div className="text-[13px] font-bold text-[#111827] mt-1 truncate">
                          {customContact.instansi || currentUser?.perusahaan || currentUser?.instansi || currentUser?.profesi || "UHUB Space Member"}
                        </div>
                      </div>

                      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] p-3 sm:p-3.5">
                        <span className="block text-[10px] font-bold tracking-[0.06em] uppercase text-[#6B7280]">
                          HOTLINE WHATSAPP
                        </span>
                        <div className="text-[14px] font-bold text-[#111827] mt-1 tabular-nums">
                          {customContact.telp || currentUser?.telp || currentUser?.phone || "081234567890"}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right Column: Real-Time Order Summary */}
              <div className="lg:col-span-5 space-y-4">
                <motion.div
                  variants={cardVariants}
                  className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-8 shadow-xs sticky top-[96px] transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-center justify-between pb-5 border-b border-[#E5E7EB]">
                    <div>
                      <h2 className="text-[22px] font-extrabold text-[#111827] tracking-[-0.02em]">
                        Ringkasan Tagihan
                      </h2>
                      <p className="text-[12px] text-[#6B7280] mt-0.5">
                        Kalkulasi resmi sistem reservasi
                      </p>
                    </div>
                    <span className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-full px-3 py-1 text-[11px] font-semibold text-[#6B7280]">
                      Hitung Otomatis
                    </span>
                  </div>

                  <div className="space-y-3 pt-5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#6B7280]">
                        Tarif Dasar (Rp {pricePerHour.toLocaleString("id-ID")} × {duration} Jam)
                      </span>
                      <span className="font-bold tabular-nums text-[#111827]">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#6B7280]">
                        Subtotal Awal
                      </span>
                      <span className="font-bold tabular-nums text-[#111827]">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#6B7280]">Potongan Voucher</span>
                        {appliedVoucher && (
                          <span className="bg-[#D5F066] text-[#111827] text-[10px] font-extrabold px-1.5 py-0.5 rounded-[4px]">
                            {appliedVoucher.percentage}% OFF
                          </span>
                        )}
                      </div>
                      <span className="font-bold tabular-nums text-[#10B981]">
                        {discountAmount > 0
                          ? `- Rp ${discountAmount.toLocaleString("id-ID")}`
                          : "Rp 0"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#6B7280]">
                        Fasilitas (WiFi 100Mbps, AC, Free Kopi)
                      </span>
                      <span className="font-bold text-[#111827]">
                        Termasuk (Gratis)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#6B7280]">Biaya Layanan & Pajak</span>
                      <span className="font-bold text-[#10B981]">
                        Rp 0 (Bebas Biaya)
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-baseline justify-between">
                    <div>
                      <span className="block text-[11px] font-bold tracking-[0.06em] uppercase text-[#374151]">
                        TOTAL DIBAYAR
                      </span>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">
                        Pembayaran via Payment Gateway
                      </p>
                    </div>
                    <motion.div
                      key={totalPayable}
                      initial={{ scale: 1.1, color: "#10B981" }}
                      animate={{ scale: 1, color: "#111827" }}
                      transition={{ duration: 0.3 }}
                      className="text-[30px] sm:text-[32px] font-extrabold tracking-[-0.03em] tabular-nums"
                    >
                      Rp {totalPayable.toLocaleString("id-ID")}
                    </motion.div>
                  </div>

                  <div className="mt-6 bg-[#F8F9FA] border border-[#E5E7EB] rounded-[14px] p-4 space-y-2">
                    <div className="flex items-start gap-2 text-[11px] font-medium text-[#374151]">
                      <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                      <span>Verifikasi otomatis pembayaran melalui simulasi payment gateway</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] font-medium text-[#374151]">
                      <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                      <span>Admin menerima notifikasi langsung untuk menyetujui jadwal</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] font-medium text-[#374151]">
                      <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                      <span>E-Ticket & QR Pass langsung tersedia di My Reservations</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleProceedToPayment}
                      className="w-full h-[52px] rounded-full bg-[#111111] text-[#D4F34A] hover:bg-black text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <CreditCard size={17} />
                      <span>Lanjutkan ke Pembayaran (Rp {totalPayable.toLocaleString("id-ID")})</span>
                      <span>→</span>
                    </motion.button>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#6B7280]">
                    <Lock size={12} />
                    <span>Enkripsi 256-Bit SSL • Transaksi Aman & Terverifikasi</span>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* ================= PAYMENT GATEWAY MODAL ================= */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[28px] max-w-[580px] w-full border border-[#E2E2DF] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 bg-[#111111] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#222222] border border-white/10 flex items-center justify-center text-[#D4F34A]">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-extrabold tracking-tight flex items-center gap-2">
                      <span>UHUB Payment Gateway</span>
                      <span className="bg-[#D4F34A] text-[#111111] text-[9.5px] font-black px-2 py-0.5 rounded-full">
                        SECURE
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                      Pilih metode pembayaran untuk menyelesaikan reservasi #{space.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-[#111111]">
                {/* Total Payment Banner */}
                <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[18px] p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                      TOTAL TAGIHAN PEMBAYARAN
                    </span>
                    <span className="text-[24px] font-black text-[#111111] tabular-nums">
                      Rp {totalPayable.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                      BATAS WAKTU
                    </span>
                    <span className="font-mono font-bold text-[#EF4444] text-[14px]">
                      {formatTimer(paymentTimer)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Switcher Tabs */}
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    PILIH METODE PEMBAYARAN
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("qris")}
                      className={`p-3 rounded-[14px] border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === "qris"
                          ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                          : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111111]"
                      }`}
                    >
                      <QrCode size={20} className={paymentMethod === "qris" ? "text-[#D4F34A]" : ""} />
                      <span className="text-[12px] font-bold">QRIS Instant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("va")}
                      className={`p-3 rounded-[14px] border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === "va"
                          ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                          : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111111]"
                      }`}
                    >
                      <Building2 size={20} className={paymentMethod === "va" ? "text-[#D4F34A]" : ""} />
                      <span className="text-[12px] font-bold">Virtual Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("ewallet")}
                      className={`p-3 rounded-[14px] border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === "ewallet"
                          ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                          : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111111]"
                      }`}
                    >
                      <Smartphone size={20} className={paymentMethod === "ewallet" ? "text-[#D4F34A]" : ""} />
                      <span className="text-[12px] font-bold">E-Wallet</span>
                    </button>
                  </div>
                </div>

                {/* METHOD 1: QRIS VIEW */}
                {paymentMethod === "qris" && (
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[20px] p-5 flex flex-col items-center text-center space-y-3">
                    <div className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-1 rounded-full text-[11px] font-bold text-[#111111]">
                      <Sparkles size={12} className="text-[#10B981]" />
                      <span>Semua Bank & E-Wallet (BCA, GoPay, ShopeePay, OVO, Dana)</span>
                    </div>

                    {/* QR Code Container with pulsating radar frame */}
                    <div className="relative p-3 bg-white rounded-[20px] border-2 border-[#111111] shadow-md my-1">
                      {/* Dynamic QR SVG Pattern */}
                      <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="180" height="180" fill="white" />
                        {/* Corner Top-Left */}
                        <rect x="15" y="15" width="45" height="45" rx="8" stroke="#111111" strokeWidth="6" />
                        <rect x="27" y="27" width="21" height="21" rx="4" fill="#111111" />
                        {/* Corner Top-Right */}
                        <rect x="120" y="15" width="45" height="45" rx="8" stroke="#111111" strokeWidth="6" />
                        <rect x="132" y="27" width="21" height="21" rx="4" fill="#111111" />
                        {/* Corner Bottom-Left */}
                        <rect x="15" y="120" width="45" height="45" rx="8" stroke="#111111" strokeWidth="6" />
                        <rect x="27" y="132" width="21" height="21" rx="4" fill="#111111" />
                        {/* Mock QR Data Blocks */}
                        <rect x="70" y="20" width="10" height="20" fill="#111111" />
                        <rect x="90" y="20" width="15" height="10" fill="#111111" />
                        <rect x="70" y="50" width="20" height="10" fill="#111111" />
                        <rect x="20" y="70" width="140" height="10" fill="#111111" />
                        <rect x="30" y="90" width="15" height="15" fill="#111111" />
                        <rect x="55" y="90" width="20" height="10" fill="#111111" />
                        <rect x="85" y="85" width="25" height="25" rx="4" fill="#111111" />
                        <rect x="120" y="90" width="15" height="15" fill="#111111" />
                        <rect x="145" y="85" width="15" height="20" fill="#111111" />
                        <rect x="70" y="120" width="15" height="20" fill="#111111" />
                        <rect x="95" y="120" width="20" height="10" fill="#111111" />
                        <rect x="125" y="120" width="15" height="15" fill="#111111" />
                        <rect x="70" y="150" width="45" height="10" fill="#111111" />
                        <rect x="125" y="145" width="25" height="15" fill="#111111" />
                        {/* Center Center Logo */}
                        <circle cx="90" cy="90" r="14" fill="#111111" />
                        <text x="90" y="95" fill="#D4F34A" fontSize="13" fontWeight="900" textAnchor="middle">U</text>
                      </svg>
                      <div className="text-[10px] font-mono text-[#6B7280] mt-1 font-bold">
                        NMID: ID102026880912
                      </div>
                    </div>

                    <p className="text-[12px] text-[#6B7280] max-w-[340px]">
                      Buka aplikasi perbankan atau e-wallet Anda, arahkan kamera ke QRIS di atas untuk menyelesaikan transfer.
                    </p>
                  </div>
                )}

                {/* METHOD 2: VIRTUAL ACCOUNT VIEW */}
                {paymentMethod === "va" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {(["bca", "mandiri", "bni", "bri"] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-2.5 rounded-[12px] border text-center font-bold text-[12px] uppercase transition-all cursor-pointer ${
                            selectedBank === b
                              ? "bg-[#111111] text-white border-[#111111]"
                              : "bg-[#F8F9FA] text-[#6B7280] border-[#E5E7EB] hover:border-[#111111]"
                          }`}
                        >
                          {b.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[18px] p-4.5 space-y-2">
                      <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                        NOMOR VIRTUAL ACCOUNT {selectedBank.toUpperCase()}
                      </span>
                      <div className="flex items-center justify-between gap-2 bg-white border border-[#E5E7EB] rounded-[12px] p-3">
                        <span className="font-mono font-black text-[17px] text-[#111111] tracking-wider">
                          {getVirtualAccountNumber(selectedBank)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(getVirtualAccountNumber(selectedBank).replace(/\s/g, ""));
                            setCopiedVA(true);
                            setTimeout(() => setCopiedVA(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#111111] text-white text-[11px] font-bold hover:bg-black transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedVA ? (
                            <>
                              <Check size={12} className="text-[#D4F34A]" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                        1. Masuk ke m-Banking {selectedBank.toUpperCase()} &gt; Transfer &gt; Virtual Account.<br />
                        2. Masukkan nomor VA di atas dan konfirmasi total tagihan Rp {totalPayable.toLocaleString("id-ID")}.
                      </p>
                    </div>
                  </div>
                )}

                {/* METHOD 3: E-WALLET VIEW */}
                {paymentMethod === "ewallet" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {(["gopay", "ovo", "shopeepay", "dana"] as const).map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedEwallet(w)}
                          className={`p-2.5 rounded-[12px] border text-center font-bold text-[12px] capitalize transition-all cursor-pointer ${
                            selectedEwallet === w
                              ? "bg-[#111111] text-white border-[#111111]"
                              : "bg-[#F8F9FA] text-[#6B7280] border-[#E5E7EB] hover:border-[#111111]"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>

                    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[18px] p-4.5 space-y-2">
                      <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                        NOMOR HANDPHONE TERDAFTAR {selectedEwallet.toUpperCase()}
                      </label>
                      <input
                        type="tel"
                        value={ewalletPhone}
                        onChange={(e) => setEwalletPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full bg-white border border-[#E5E7EB] rounded-[12px] px-3.5 py-2.5 text-[14px] font-bold text-[#111111] outline-none focus:border-[#111111]"
                      />
                      <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
                        Notifikasi push konfirmasi pembayaran akan dikirimkan langsung ke aplikasi {selectedEwallet.toUpperCase()} Anda.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer / Action */}
              <div className="p-5 sm:p-6 bg-[#F8F9FA] border-t border-[#E5E7EB] space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={isVerifyingPayment}
                  onClick={handleSimulatePayment}
                  className="w-full h-[50px] rounded-full bg-[#111111] text-[#D4F34A] hover:bg-black text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isVerifyingPayment ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#D4F34A] border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Pembayaran ke Payment Gateway...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Simulasikan Pembayaran Berhasil (Bayar Rp {totalPayable.toLocaleString("id-ID")})</span>
                    </>
                  )}
                </motion.button>
                <div className="text-center text-[11px] text-[#6B7280]">
                  Setelah simulasi pembayaran berhasil, reservasi dikirim ke Admin untuk disetujui.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 7. FOOTER ================= */}
      <Footer />

      {/* ================= 8. APPLE-STYLE DATETIME PICKER MODAL ================= */}
      <AppleCalendarPicker
        isOpen={isApplePickerOpen}
        onClose={() => setIsApplePickerOpen(false)}
        initialDate={selectedDate}
        initialTime={startTime}
        onDateTimeSelect={(result) => {
          setSelectedDate(result.dateString);
          setStartTime(result.time);
          setIsApplePickerOpen(false);
        }}
        title={`Pilih Jadwal: ${space.title}`}
      />
    </div>
  );
}
