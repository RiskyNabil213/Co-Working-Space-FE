"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import RealQRCode from "@/components/RealQRCode";

export interface ReservationData {
  id: number | string;
  kode_booking?: string;
  bookingCode?: string;
  eTicketNumber?: string;
  e_ticket_number?: string;
  nama_space?: string;
  spaceTitle?: string;
  nama_member?: string;
  memberName?: string;
  email?: string;
  telp?: string;
  instansi?: string;
  memberCompany?: string;
  tanggal_reservasi?: string;
  tanggal?: string;
  date?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  timeSlot?: string;
  durasi_jam?: number;
  durationHours?: number;
  harga_per_jam?: number;
  total_harga_awal?: number;
  grossAmount?: number;
  potongan_diskon?: number;
  discountAmount?: number;
  total_bayar?: number;
  netTotalPaid?: number;
  status?: string;
  created_at?: string;
  tipe?: string;
  categoryLabel?: string;
  location?: string;
  checkInStatus?: string;
}

interface ETicketNotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationData | null;
}

export default function ETicketNotaModal({
  isOpen,
  onClose,
  reservation,
}: ETicketNotaModalProps) {
  const [activeTab, setActiveTab] = useState<"combo" | "ticket" | "nota">("combo");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen || !reservation) return null;

  // Normalized Fields
  const id = reservation.id;
  const bookingCode =
    reservation.kode_booking ||
    reservation.bookingCode ||
    `UHUB-${String(id).padStart(6, "0")}`;
  const eTicketNumber =
    reservation.e_ticket_number ||
    reservation.eTicketNumber ||
    `TICKET-MOKLET-${String(id).padStart(5, "0")}`;
  const spaceName =
    reservation.nama_space ||
    reservation.spaceTitle ||
    "Executive Coworking Space";
  const memberName =
    reservation.nama_member ||
    reservation.memberName ||
    "Member UHUB";
  const company =
    reservation.instansi ||
    reservation.memberCompany ||
    "Individual Professional";
  const dateStr =
    reservation.tanggal_reservasi ||
    reservation.tanggal ||
    reservation.date ||
    "2026-09-15";
  const timeSlotStr =
    reservation.timeSlot ||
    (reservation.jam_mulai && reservation.jam_selesai
      ? `${reservation.jam_mulai} - ${reservation.jam_selesai} WIB`
      : "09:00 - 12:00 WIB");
  const duration =
    reservation.durasi_jam ||
    reservation.durationHours ||
    3;
  const hourlyRate =
    reservation.harga_per_jam ||
    Math.round(
      (reservation.total_harga_awal || reservation.grossAmount || 60000) /
        duration
    ) ||
    20000;
  const gross =
    reservation.total_harga_awal ||
    reservation.grossAmount ||
    hourlyRate * duration;
  const net =
    reservation.total_bayar ||
    reservation.netTotalPaid ||
    gross;
  const discount =
    reservation.potongan_diskon ||
    reservation.discountAmount ||
    Math.max(0, gross - net);
  const statusRaw = reservation.status || "disetujui";
  const locationStr =
    reservation.location || "Moklet Hub • Level 2, Studio North Wing";

  const formatTimestamp = (dStr?: string) => {
    if (!dStr) return new Date().toLocaleString("id-ID");
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      return `${d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} • ${d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })} WIB`;
    } catch {
      return dStr;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/reservasi?code=${bookingCode}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
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
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#F8F9FA] rounded-[28px] max-w-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain border border-[#EAEAEA] shadow-2xl flex flex-col print:max-w-full print:max-h-none print:border-none print:shadow-none print:bg-white print:rounded-none"
        >
          {/* Top Modal Controls Header (Hidden on Print) */}
          <div className="bg-white border-b border-[#EAEAEA] px-6 py-4 flex items-center justify-between sticky top-0 z-20 rounded-t-[28px] print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#111111] text-[#D4F34A] flex items-center justify-center font-black text-[17px]">
                U
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#111111] leading-tight">
                  E-Ticket & Nota Resmi Transaksi
                </h3>
                <p className="text-[11.5px] text-[#6B7280]">
                  Dokumen digital validasi check-in turnstile & kwitansi pembayaran lunas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector */}
              <div className="hidden sm:flex items-center bg-[#F4F5F7] p-1 rounded-full border border-[#E5E7EB] text-[12px] font-bold">
                <button
                  onClick={() => setActiveTab("combo")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "combo"
                      ? "bg-white text-[#111111] shadow-xs"
                      : "text-[#6B7280] hover:text-[#111111]"
                  }`}
                >
                  Lengkap
                </button>
                <button
                  onClick={() => setActiveTab("ticket")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "ticket"
                      ? "bg-white text-[#111111] shadow-xs"
                      : "text-[#6B7280] hover:text-[#111111]"
                  }`}
                >
                  E-Ticket
                </button>
                <button
                  onClick={() => setActiveTab("nota")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeTab === "nota"
                      ? "bg-white text-[#111111] shadow-xs"
                      : "text-[#6B7280] hover:text-[#111111]"
                  }`}
                >
                  Nota Pembayaran
                </button>
              </div>

              {/* Print Action */}
              <button
                onClick={handlePrint}
                className="h-[38px] px-4 rounded-full bg-[#111111] hover:bg-black text-white text-[12px] font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Cetak atau Simpan PDF"
              >
                <Printer size={14} />
                <span className="hidden xs:inline">Cetak / PDF</span>
              </button>

              {/* Close Action */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#F4F5F7] hover:bg-[#EAEAEA] text-[#6B7280] hover:text-[#111111] flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div
            ref={printAreaRef}
            className="printable-area p-5 sm:p-7 space-y-6 flex-1 text-[#111111] print:p-0"
          >
            {/* ========================================================================= */}
            {/* PART 1: DIGITAL E-TICKET PASS                                             */}
            {/* ========================================================================= */}
            {(activeTab === "combo" || activeTab === "ticket") && (
              <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden relative">
                {/* Header Ticket Banner */}
                <div className="bg-[#111315] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D2F842] text-[#111315] flex items-center justify-center font-black text-[16px]">
                      U
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-extrabold uppercase tracking-widest text-[#D2F842]">
                          UHUB DIGITAL PASS
                        </span>
                        <span className="bg-white/10 text-white/90 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider">
                          TURNSTILE ADMISSION
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 mt-0.5">
                        Moklet Hub Coworking Space • Malang, Jawa Timur
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        statusRaw === "disetujui" || statusRaw === "aktif"
                          ? "bg-[#059669]/20 text-[#34D399] border border-[#059669]/40"
                          : statusRaw === "selesai"
                          ? "bg-white/10 text-white/70"
                          : "bg-[#D97706]/20 text-[#FBBF24] border border-[#D97706]/40"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      <span>
                        {statusRaw === "belum_dikonfirm"
                          ? "Menunggu Persetujuan"
                          : statusRaw === "aktif"
                          ? "Sesi Sedang Berlangsung"
                          : statusRaw === "disetujui"
                          ? "Terkonfirmasi / Ready for Check-in"
                          : statusRaw}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Ticket Body Content */}
                <div className="p-6 sm:p-7 space-y-6">
                  {/* Top Row: Reference Codes & QR Turnstile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
                    <div className="space-y-4 flex-1">
                      <div>
                        <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-[#6B7280] block">
                          KODE BOOKING REFERENSI
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[22px] sm:text-[24px] font-black text-[#111111] tracking-tight">
                            {bookingCode}
                          </span>
                          <button
                            onClick={handleCopyCode}
                            className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111111] transition-colors cursor-pointer print:hidden"
                            title="Salin Kode Booking"
                          >
                            {copiedCode ? (
                              <Check size={16} className="text-[#059669]" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-[#6B7280] block">
                          NOMOR E-TICKET
                        </span>
                        <span className="font-mono text-[13px] font-bold text-[#111111] mt-0.5 block">
                          {eTicketNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#059669] font-bold">
                        <Clock size={13} className="shrink-0" />
                        <span>Waktu Trx: {formatTimestamp(reservation.created_at)}</span>
                      </div>
                    </div>

                    {/* QR Turnstile Frame */}
                    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-[20px] p-3 flex flex-col items-center justify-center shrink-0 w-[150px] text-center shadow-xs">
                      <RealQRCode
                        value={
                          typeof window !== "undefined"
                            ? `${window.location.origin}/reservasi?code=${bookingCode}&ticket=${eTicketNumber}`
                            : `UHUB-PASS:${bookingCode}|${spaceName}|${memberName}|${dateStr}|LUNAS`
                        }
                        size={84}
                        level="M"
                      />
                      <span className="text-[9px] font-black text-[#6B7280] mt-2 uppercase tracking-widest">
                        SCAN TURNSTILE #01
                      </span>
                    </div>
                  </div>

                  {/* Ticket Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#6B7280] tracking-wider block">
                        RUANG / MEJA KERJA
                      </span>
                      <span className="text-[14px] font-bold text-[#111111] mt-1 block">
                        {spaceName}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        {locationStr}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#6B7280] tracking-wider block">
                        TANGGAL SESI
                      </span>
                      <span className="text-[14px] font-bold text-[#111111] mt-1 block">
                        {dateStr}
                      </span>
                      <span className="text-[11px] text-[#059669] font-semibold">
                        Slot Terjadwal
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#6B7280] tracking-wider block">
                        WAKTU & DURASI
                      </span>
                      <span className="text-[14px] font-bold text-[#111111] mt-1 block">
                        {timeSlotStr}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        {duration} Jam Sesi Akses
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#6B7280] tracking-wider block">
                        NAMA MEMBER
                      </span>
                      <span className="text-[14px] font-bold text-[#111111] mt-1 block">
                        {memberName}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        {company}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#6B7280] tracking-wider block">
                        TOTAL DIBAYAR
                      </span>
                      <span className="text-[16px] font-black text-[#111111] mt-1 block tabular-nums">
                        Rp {Number(net).toLocaleString("id-ID")}
                      </span>
                      <span className="text-[11px] text-[#059669] font-bold">
                        Lunas Terverifikasi
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#6B7280] tracking-wider block">
                        STATUS CHECK-IN
                      </span>
                      <span className="text-[13px] font-bold text-[#059669] mt-1 block">
                        Gate #1 Turnstile Ready
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        Tunjukkan QR saat tiba
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ticket Bottom Barcode */}
                <div className="bg-[#111315] text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-2 text-[#D2F842] font-bold">
                    <ShieldCheck size={16} />
                    <span>VERIFIED OFFICIAL E-TICKET • UHUB SECURITY PROTOCOL</span>
                  </div>
                  <div className="font-mono text-[11px] text-white/50 tracking-widest">
                    ||| | | |||| ||| || | ||| || |||
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PART 2: OFFICIAL NOTA TRANSAKSI (PAYMENT RECEIPT / INVOICE)               */}
            {/* ========================================================================= */}
            {(activeTab === "combo" || activeTab === "nota") && (
              <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm p-6 sm:p-8 space-y-6 relative">
                {/* Official Letterhead */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#111111] text-[#D4F34A] flex items-center justify-center font-black text-[14px]">
                        U
                      </div>
                      <h4 className="font-black text-[18px] text-[#111111] tracking-tight">
                        MOKLET HUB COWORKING SPACE
                      </h4>
                    </div>
                    <p className="text-[12px] text-[#6B7280]">
                      Jl. Danau Ranau No. 1, Sawojajar, Malang • Telp: 0812-9876-5432
                    </p>
                    <p className="text-[11px] text-[#8C9196] font-mono">
                      NPWP / Entity ID: UKR-COWORK-2026-MALANG • Web: uhub.workspace.id
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="bg-[#111111] text-white text-[10px] font-black px-2.5 py-1 rounded tracking-wider uppercase inline-block">
                      NOTA RESMI PEMBAYARAN
                    </span>
                    <div className="font-mono text-[12px] font-bold text-[#111111]">
                      No: NOTA/UHUB/{dateStr.replace(/-/g, "")}/{id}
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      Waktu Transaksi: {formatTimestamp(reservation.created_at)}
                    </div>
                  </div>
                </div>

                {/* Customer Information Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-2xl border border-[#E5E7EB] text-[12px]">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#6B7280] tracking-wider block">
                      DITERBITKAN UNTUK:
                    </span>
                    <div className="font-bold text-[14px] text-[#111111] mt-0.5">
                      {memberName}
                    </div>
                    <div className="text-[#6B7280]">{company}</div>
                    {reservation.telp && (
                      <div className="text-[#6B7280] font-mono text-[11px]">
                        Telp: {reservation.telp}
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase text-[#6B7280] tracking-wider block">
                      STATUS & METODE BAYAR:
                    </span>
                    <div className="inline-flex items-center gap-1.5 text-[#059669] font-black text-[13px]">
                      <CheckCircle2 size={15} />
                      <span>LUNAS / PAID (VERIFIED)</span>
                    </div>
                    <div className="text-[#6B7280] text-[11.5px]">
                      Midtrans Payment Gateway / QRIS Instant
                    </div>
                    <div className="text-[#8C9196] text-[10.5px] font-mono">
                      Ref Trx: {bookingCode}
                    </div>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[#6B7280] font-bold text-[10.5px] uppercase tracking-wider">
                        <th className="py-2.5 px-3">DESKRIPSI LAYANAN</th>
                        <th className="py-2.5 px-3 text-center">TANGGAL & WAKTU</th>
                        <th className="py-2.5 px-3 text-center">DURASI</th>
                        <th className="py-2.5 px-3 text-right">TARIF / JAM</th>
                        <th className="py-2.5 px-3 text-right">JUMLAH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      <tr>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#111111]">{spaceName}</div>
                          <div className="text-[11px] text-[#6B7280]">{locationStr}</div>
                        </td>
                        <td className="py-3 px-3 text-center text-[#4B5563] text-[11.5px]">
                          <div>{dateStr}</div>
                          <div className="text-[#6B7280] text-[10.5px]">{timeSlotStr}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-[#111111]">
                          {duration} Jam
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#4B5563]">
                          Rp {Number(hourlyRate).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-right font-bold font-mono tabular-nums text-[#111111]">
                          Rp {Number(gross).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary Rows */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-3 border-t border-[#E5E7EB]">
                  {/* Left Notes */}
                  <div className="text-[11.5px] text-[#6B7280] space-y-1.5 max-w-sm">
                    <p className="font-bold text-[#111111]">Catatan & Kebijakan Reservasi:</p>
                    <p>
                      1. Nota ini merupakan bukti transaksi sah yang diterbitkan otomatis oleh sistem UHUB Operations.
                    </p>
                    <p>
                      2. Penggunaan ruang coworking mencakup fasilitas High-Speed WiFi, Listrik, Free-Flow Coffee & Refreshment.
                    </p>
                  </div>

                  {/* Right Calculation Box */}
                  <div className="w-full sm:w-[280px] space-y-2 text-[12.5px]">
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Subtotal Sewa Ruang</span>
                      <span className="font-mono tabular-nums font-semibold text-[#111111]">
                        Rp {Number(gross).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-[#059669]">
                        <span>Potongan Voucher Promo</span>
                        <span className="font-mono tabular-nums font-bold">
                          - Rp {Number(discount).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#6B7280]">
                      <span>Biaya Layanan & PPN (0%)</span>
                      <span className="font-mono tabular-nums">Rp 0</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-[#E5E7EB] font-black text-[15px] text-[#111111]">
                      <span>TOTAL LUNAS</span>
                      <span className="font-mono tabular-nums text-[17px] text-[#111111]">
                        Rp {Number(net).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signature & Digital Stamp Block */}
                <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Official Digital Stamp Box */}
                    <div className="border-2 border-dashed border-[#059669] bg-[#ECFDF5] rounded-xl px-4 py-2 text-center rotate-[-2deg]">
                      <span className="text-[10px] font-black uppercase text-[#059669] tracking-wider block">
                        UHUB OFFICIAL NOTA
                      </span>
                      <span className="text-[13px] font-black text-[#059669] block">
                        LUNAS / PAID
                      </span>
                      <span className="text-[8.5px] font-mono text-[#059669]/80 block">
                        {new Date().toISOString().slice(0, 10)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      Dokumen ini telah diverifikasi secara elektronik oleh sistem UHUB Core.
                    </div>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                      Facility Managing Director
                    </span>
                    <div className="font-serif italic font-bold text-[15px] text-[#111111] pt-1">
                      Ahmad Bidin, S.Kom
                    </div>
                    <div className="text-[10px] text-[#8C9196] font-mono">
                      UHUB Coworking Operations Console
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer Actions (Hidden on Print) */}
          <div className="bg-white border-t border-[#EAEAEA] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-b-[28px] print:hidden">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-full border border-[#E5E7EB] hover:border-[#111111] bg-white text-[#111111] text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check size={14} className="text-[#059669]" /> : <Share2 size={14} />}
                <span>{copiedLink ? "Tautan Tersalin!" : "Salin Tautan Pass"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-[#EAEAEA] text-[12.5px] font-bold text-[#4B5563] hover:bg-[#F4F5F7] transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-[12.5px] font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Printer size={15} />
                <span>Cetak Nota & E-Ticket (PDF)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
