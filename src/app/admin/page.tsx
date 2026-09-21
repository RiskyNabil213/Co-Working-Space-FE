"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  LogIn,
  LogOut,
  Search,
  RefreshCw,
  ExternalLink,
  X,
  Copy,
  Check,
  CalendarCheck,
  Building2,
  Clock,
  Download,
  FileSpreadsheet,
  ArrowUpRight,
  Filter,
  Receipt,
  Eye,
  ShieldCheck,
  Tag,
  Users,
  Camera,
  Upload,
  Menu,
} from "lucide-react";
import {
  adminApi,
  authApi,
  getAuthToken,
  setAuthSession,
  clearAuthSession,
  getCurrentUser,
  API_BASE_URL,
} from "@/lib/api";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ETicketNotaModal from "@/components/ETicketNotaModal";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "reservations" | "spaces" | "discounts" | "members" | "profile"
  >("overview");

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedTicketItem, setSelectedTicketItem] = useState<any | null>(null);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Overview / Reports State
  const [incomeSummary, setIncomeSummary] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());

  // Master Reservations State & Matrix Filters
  const [reservations, setReservations] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("2026");
  const [resStatusFilter, setResStatusFilter] = useState<string>("all");
  const [filterSpaceType, setFilterSpaceType] = useState<string>("all");
  const [filterSpecificDate, setFilterSpecificDate] = useState<string>("");
  const [resSearch, setResSearch] = useState<string>("");

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Spaces State
  const [spaces, setSpaces] = useState<any[]>([]);
  const [spaceModalOpen, setSpaceModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<any | null>(null);
  const [spaceForm, setSpaceForm] = useState({
    nama_space: "",
    harga_per_jam: 20000,
    tipe: "desk",
    kapasitas: 1,
    deskripsi: "",
    foto: "desk_flexi_01.jpg",
  });

  // Discounts State
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any | null>(null);
  const [discountForm, setDiscountForm] = useState({
    nama_diskon: "DISKONBARU",
    persentase_diskon: 20,
    tanggal_awal: "2026-01-01",
    tanggal_akhir: "2026-12-31",
  });

  // Members State
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState<string>("");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [memberForm, setMemberForm] = useState({
    nama_member: "",
    username: "",
    password: "",
    instansi: "",
    alamat: "",
    telp: "",
    foto: "",
  });

  // Coworking Profile State
  const [coworkingProfile, setCoworkingProfile] = useState({
    nama_coworking: "Moklet Hub Coworking Space",
    nama_pemilik: "Ahmad Bidin, S.Kom",
    telp: "081298765432",
    alamat: "Jl. Danau Ranau No. 1, Sawojajar, Malang",
    deskripsi_fasilitas: "Coworking modern dengan koneksi internet cepat, ruang meeting lengkap, dan kopi gratis.",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
    showToast(`Kode ${text} disalin ke clipboard!`);
  };

  const formatRealtimeTimestamp = (dateStr?: string) => {
    if (!dateStr) return "-";
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

  // Sync tab from URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qTab = params.get("tab");
      if (
        qTab &&
        ["overview", "reservations", "spaces", "discounts", "members", "profile"].includes(
          qTab
        )
      ) {
        setActiveTab(qTab as any);
      }
    }
  }, []);

  // Load current admin user
  const loadAdminUser = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    return user;
  };

  // Refresh data for current tab & load overview
  const refreshData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "overview") {
        const [incomeRes, reportRes, resList, memberRes, spaceRes] = await Promise.all([
          adminApi.getIncomeSummary(),
          adminApi.getMonthlyReport({ month: reportMonth, year: reportYear }),
          adminApi.getReservations({ month: reportMonth, year: reportYear }),
          adminApi.getMembers(),
          adminApi.getSpaces(),
        ]);

        if (incomeRes.success) setIncomeSummary((incomeRes as any).summary || (incomeRes as any).data || incomeRes);
        if (reportRes.success) setMonthlyReport((reportRes as any).stats || (reportRes as any).data || reportRes);
        if (resList.success && Array.isArray((resList as any).data)) {
          setReservations((resList as any).data);
        }
        if (memberRes.success && Array.isArray(memberRes.data)) {
          setMembers(memberRes.data);
        }
        if (spaceRes.success && Array.isArray(spaceRes.data)) {
          setSpaces(spaceRes.data);
        }
      } else if (activeTab === "reservations") {
        const res = await adminApi.getReservations({
          status: resStatusFilter,
          search: resSearch,
          month: filterMonth !== "all" ? filterMonth : undefined,
          year: filterYear !== "all" ? filterYear : undefined,
        });
        if (res.success && Array.isArray(res.data)) {
          setReservations(res.data);
        }
      } else if (activeTab === "spaces") {
        const res = await adminApi.getSpaces();
        if (res.success && Array.isArray(res.data)) {
          setSpaces(res.data);
        }
      } else if (activeTab === "discounts") {
        const res = await adminApi.getDiscounts();
        if (res.success && Array.isArray(res.data)) {
          setDiscounts(res.data);
        }
      } else if (activeTab === "members") {
        const res = await adminApi.getMembers(memberSearch || undefined);
        if (res.success && Array.isArray(res.data)) {
          setMembers(res.data);
        }
      } else if (activeTab === "profile") {
        const res = await adminApi.getCoworkingProfile();
        if (res.success && res.data) {
          setCoworkingProfile({
            nama_coworking: res.data.nama_coworking || "Moklet Hub Coworking Space",
            nama_pemilik: res.data.nama_pemilik || "Ahmad Bidin, S.Kom",
            telp: res.data.telp || "081298765432",
            alamat: res.data.alamat || "Jl. Danau Ranau No. 1, Sawojajar, Malang",
            deskripsi_fasilitas: res.data.deskripsi_fasilitas || "",
          });
        }
      }
    } catch (err: any) {
      console.error("Refresh admin data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = loadAdminUser();
    if (user && (user.role === "admin_space" || user.role === "admin")) {
      refreshData();
    }
  }, [activeTab, reportMonth, reportYear, resStatusFilter, filterMonth, filterYear, memberSearch]);

  // Lock background scroll when any modal is active
  useEffect(() => {
    const isAnyModalOpen =
      spaceModalOpen ||
      discountModalOpen ||
      memberModalOpen ||
      showTicketModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [spaceModalOpen, discountModalOpen, memberModalOpen, showTicketModal]);

  // Reservation Actions
  const handleUpdateStatus = async (id: number, status: any) => {
    try {
      const res = await adminApi.updateReservationStatus(id, status);
      if (res.success) {
        showToast(`Status reservasi #${id} berhasil diubah menjadi "${status}".`);
        refreshData();
      } else {
        showToast(res.message || "Gagal mengubah status reservasi.");
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  const handleCheckIn = async (id: number) => {
    try {
      const res = await adminApi.checkIn(id);
      if (res.success) {
        showToast(`Check-In berhasil! Tamu telah aktif di reservasi #${id}.`);
        refreshData();
      } else {
        showToast(res.message || "Gagal melakukan check-in.");
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      const res = await adminApi.checkOut(id);
      if (res.success) {
        showToast(`Check-Out berhasil! Sesi reservasi #${id} telah selesai.`);
        refreshData();
      } else {
        showToast(res.message || "Gagal melakukan check-out.");
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  // Export Master CSV
  const handleExportMasterCsv = () => {
    const headers = [
      "KODE BOOKING",
      "MEMBER NAMA",
      "INSTANSI",
      "SPACE",
      "TIPE",
      "TANGGAL",
      "SLOT JAM",
      "DURASI (JAM)",
      "TOTAL BAYAR (RP)",
      "STATUS",
    ];

    const rows = filteredReservations.map((r) => [
      r.kode_booking || `UHUB-${r.id}`,
      r.nama_member || "Member",
      r.instansi || "-",
      r.nama_space || "Space",
      r.tipe || "desk",
      r.tanggal_reservasi || r.tanggal || "2026-08-30",
      `${r.jam_mulai} - ${r.jam_selesai}`,
      r.durasi_jam || 3,
      r.total_bayar || 0,
      r.status || "belum_dikonfirm",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UHUB_Master_Reservasi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Master CSV berhasil diunduh!");
  };

  // Space Actions
  const handleSaveSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSpace) {
        const res = await adminApi.updateSpace(editingSpace.id, spaceForm);
        if (res.success) {
          showToast("Space berhasil diperbarui!");
          setSpaceModalOpen(false);
          setEditingSpace(null);
          refreshData();
        } else {
          showToast(res.message || "Gagal memperbarui space.");
        }
      } else {
        const res = await adminApi.createSpace(spaceForm);
        if (res.success) {
          showToast("Space baru berhasil ditambahkan!");
          setSpaceModalOpen(false);
          refreshData();
        } else {
          showToast(res.message || "Gagal membuat space baru.");
        }
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  const handleDeleteSpace = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus space ini?")) return;
    try {
      const res = await adminApi.deleteSpace(id);
      if (res.success) {
        showToast("Space berhasil dihapus.");
        refreshData();
      } else {
        showToast(res.message || "Gagal menghapus space.");
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  // Discount Actions
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDiscount) {
        const res = await adminApi.updateDiscount(editingDiscount.id, discountForm);
        if (res.success) {
          showToast("Voucher diskon berhasil diperbarui!");
          setDiscountModalOpen(false);
          setEditingDiscount(null);
          refreshData();
        } else {
          showToast(res.message || "Gagal memperbarui diskon.");
        }
      } else {
        const res = await adminApi.createDiscount(discountForm);
        if (res.success) {
          showToast("Voucher promo berhasil dibuat!");
          setDiscountModalOpen(false);
          refreshData();
        } else {
          showToast(res.message || "Gagal membuat voucher.");
        }
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus voucher ini?")) return;
    try {
      const res = await adminApi.deleteDiscount(id);
      if (res.success) {
        showToast("Voucher promo berhasil dihapus.");
        refreshData();
      } else {
        showToast(res.message || "Gagal menghapus diskon.");
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  // Member Actions
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const res = await adminApi.updateMember(editingMember.id, {
          nama_member: memberForm.nama_member,
          instansi: memberForm.instansi,
          alamat: memberForm.alamat,
          telp: memberForm.telp,
          foto: memberForm.foto || null,
        });
        if (res.success) {
          showToast("Data member berhasil diperbarui!");
          setMemberModalOpen(false);
          setEditingMember(null);
          refreshData();
        } else {
          showToast(res.message || "Gagal memperbarui member.");
        }
      } else {
        const res = await adminApi.createMember(memberForm);
        if (res.success) {
          showToast("Member baru berhasil didaftarkan!");
          setMemberModalOpen(false);
          refreshData();
        } else {
          showToast(res.message || "Gagal membuat member.");
        }
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Hapus akun member ini beserta relasi datanya?")) return;
    try {
      const res = await adminApi.deleteMember(id);
      if (res.success) {
        showToast("Member berhasil dihapus.");
        refreshData();
      } else {
        showToast(res.message || "Gagal menghapus member.");
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    }
  };

  // Save Coworking Profile
  const handleSaveCoworkingProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await adminApi.updateCoworkingProfile(coworkingProfile);
      if (res.success) {
        showToast("Profil Coworking Space berhasil disimpan!");
      } else {
        showToast(res.message || "Gagal memperbarui profil.");
      }
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filtered reservations for Master Feed
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Space Type filter
      if (filterSpaceType !== "all") {
        if (r.tipe !== filterSpaceType) return false;
      }
      // Specific date filter
      if (filterSpecificDate.trim()) {
        const itemDate = r.tanggal_reservasi || r.tanggal;
        if (itemDate && !itemDate.includes(filterSpecificDate.trim())) return false;
      }
      // Status filter
      if (resStatusFilter !== "all") {
        if (r.status !== resStatusFilter) return false;
      }
      // Search term
      if (resSearch.trim()) {
        const q = resSearch.toLowerCase();
        const code = (r.kode_booking || "").toLowerCase();
        const member = (r.nama_member || "").toLowerCase();
        const space = (r.nama_space || "").toLowerCase();
        const instansi = (r.instansi || "").toLowerCase();
        if (!code.includes(q) && !member.includes(q) && !space.includes(q) && !instansi.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [reservations, filterSpaceType, filterSpecificDate, resStatusFilter, resSearch]);

  const totalRevenueNumber =
    Number(monthlyReport?.total_pendapatan || incomeSummary?.total_pendapatan || 0);
  const realizedRevenueNumber =
    Number(monthlyReport?.pendapatan_realisasi || incomeSummary?.pendapatan_realisasi || totalRevenueNumber);
  const totalTransactionsCount =
    Number(monthlyReport?.total_reservasi || incomeSummary?.total_transaksi || reservations.length);
  const pendingApprovalCount =
    Number(
      monthlyReport?.pending_approval ||
        reservations.filter((r) => r.status === "belum_dikonfirm").length
    );

  // Module A Chart & Analytics State
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "30D" | "90D" | "YTD" | "ALL">("30D");
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; label: string; value: number; x: number; y: number } | null>(null);

  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 20;
  const paddingY = 24;

  const chartDataPoints = useMemo(() => {
    const daysCount = chartTimeframe === "7D" ? 7 : chartTimeframe === "90D" ? 90 : 31;
    const points: { day: number; label: string; value: number }[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const curMonth = monthNames[reportMonth - 1] || "Aug";

    for (let i = 1; i <= daysCount; i++) {
      const dayStr = String(i).padStart(2, "0");
      const matched = reservations.filter((r) => {
        if (r.status === "dibatalkan") return false;
        const d = r.tanggal_reservasi || r.tanggal || "";
        return d.includes(`-${dayStr}`) || d.endsWith(`-${dayStr}`);
      });
      const rev = matched.reduce((sum, r) => sum + Number(r.total_bayar || r.total || 0), 0);
      points.push({
        day: i,
        label: `${i} ${curMonth} ${reportYear}`,
        value: rev,
      });
    }
    return points;
  }, [reservations, chartTimeframe, reportMonth, reportYear]);

  const maxChartVal = useMemo(() => {
    const maxVal = Math.max(...chartDataPoints.map((p) => p.value), 0);
    return maxVal > 0 ? Math.ceil((maxVal * 1.25) / 10000) * 10000 : 100000;
  }, [chartDataPoints]);

  const chartCoordinates = useMemo(() => {
    const usableW = chartWidth - paddingX * 2;
    const usableH = chartHeight - paddingY * 2;
    const count = chartDataPoints.length;

    return chartDataPoints.map((pt, idx) => {
      const x = paddingX + (idx / (count - 1 || 1)) * usableW;
      const normalizedY = maxChartVal > 0 ? pt.value / maxChartVal : 0;
      const y = chartHeight - paddingY - normalizedY * usableH;
      return { ...pt, x, y };
    });
  }, [chartDataPoints, maxChartVal]);

  const splinePath = useMemo(() => {
    if (chartCoordinates.length === 0) return "";
    let path = `M ${chartCoordinates[0].x} ${chartCoordinates[0].y}`;
    for (let i = 0; i < chartCoordinates.length - 1; i++) {
      const p0 = chartCoordinates[i === 0 ? 0 : i - 1];
      const p1 = chartCoordinates[i];
      const p2 = chartCoordinates[i + 1];
      const p3 = chartCoordinates[i + 2 >= chartCoordinates.length ? i + 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [chartCoordinates]);

  const areaPath = useMemo(() => {
    if (chartCoordinates.length === 0) return "";
    const first = chartCoordinates[0];
    const last = chartCoordinates[chartCoordinates.length - 1];
    return `${splinePath} L ${last.x} ${chartHeight} L ${first.x} ${chartHeight} Z`;
  }, [splinePath, chartCoordinates]);

  const spaceCategoryStats = useMemo(() => {
    const categories = [
      { key: "desk", label: "Personal Desk Workstation", color: "#111111", pillBg: "#F3F4F6" },
      { key: "meeting_room", label: "Meeting Pod & Boardroom", color: "#CEF23F", pillBg: "#111111" },
      { key: "private_office", label: "Private Suite Office", color: "#10B981", pillBg: "#ECFDF5" },
    ];
    return categories.map((cat) => {
      const filtered = reservations.filter((r) => {
        if (r.status === "dibatalkan") return false;
        const t = (r.tipe || r.space_tipe || "").toLowerCase();
        return (
          t === cat.key ||
          (cat.key === "desk" && t.includes("desk")) ||
          (cat.key === "meeting_room" && t.includes("meeting")) ||
          (cat.key === "private_office" && t.includes("office"))
        );
      });
      const revenue = filtered.reduce((acc, r) => acc + Number(r.total_bayar || r.total || 0), 0);
      const hours = filtered.reduce((acc, r) => acc + Number(r.durasi_jam || 0), 0);
      const totalRev = totalRevenueNumber > 0 ? totalRevenueNumber : 0;
      const pct = totalRev > 0 ? Math.min(100, Math.round((revenue / totalRev) * 100)) : 0;
      return {
        ...cat,
        sessionsCount: filtered.length,
        totalHours: hours,
        totalRevenue: revenue,
        yieldPct: pct,
      };
    });
  }, [reservations, totalRevenueNumber]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] flex flex-col selection:bg-[#D4F34A] selection:text-[#111111]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#111111] text-white px-5 py-3 rounded-full shadow-2xl text-[13px] font-semibold flex items-center gap-2.5 border border-white/20"
          >
            <CheckCircle size={16} className="text-[#D4F34A]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#EAEAEA] sticky top-0 z-40">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#111111] text-[#D4F34A] hover:bg-black transition-colors cursor-pointer flex items-center justify-center shadow-xs shrink-0"
              aria-label="Buka Menu Navigasi"
              title="Buka Menu Navigasi"
            >
              <Menu size={18} />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#111111] flex items-center justify-center text-[#D4F34A] font-black text-[20px] shadow-xs">
                U
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[16px] text-[#111111] tracking-tight leading-none">
                    UHUB
                  </span>
                  <span className="bg-[#F3F4F6] text-[#6B7280] text-[9.5px] font-bold px-1.5 py-0.5 rounded-[5px] border border-[#E5E7EB] tracking-wide leading-tight">
                    ADMIN
                  </span>
                </div>
                <span className="text-[9.5px] font-bold tracking-[0.12em] text-[#8C9196] uppercase mt-0.5 leading-none">
                  OPERATIONS CONSOLE
                </span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#EAEAEA] text-[12px] text-[#6B7280]">
              <span className="font-bold text-[#111111]">
                {coworkingProfile.nama_coworking}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/admin/rekapitulasi"
              className="text-[11.5px] sm:text-[12px] font-bold text-[#111111] bg-[#D4F34A] hover:bg-[#c4e339] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <TrendingUp size={13} />
              <span className="hidden sm:inline">Rekapitulasi Finansial ↗</span>
              <span className="sm:hidden">Rekap ↗</span>
            </Link>

            <Link
              href="/spaces"
              className="text-[11.5px] sm:text-[12px] font-bold text-[#6B7280] hover:text-[#111111] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-[#E5E7EB] hover:bg-[#F8F9FA] transition-all flex items-center gap-1.5 shrink-0"
              title="Katalog Publik"
            >
              <span className="hidden sm:inline">Katalog Publik</span>
              <ExternalLink size={13} />
            </Link>

            <button
              onClick={() => {
                clearAuthSession();
                window.location.href = "/login";
              }}
              className="text-[11.5px] sm:text-[12px] font-bold text-red-600 hover:bg-red-50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Log Out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as any)}
          currentUser={currentUser}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        {/* Dynamic Main Stage */}
        <main className="flex-1 min-w-0">
          {/* ================= TAB 1: OVERVIEW & REPORTS (MODULE A & B) ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Header Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-[#EAEAEA] shadow-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A] inline-block mb-1.5">
                    OPERATIONS CONSOLE • FINANCIAL SUITE
                  </span>
                  <h1 className="text-[22px] font-black text-[#111111] tracking-tight">
                    Financial Analytics & Master Ledger
                  </h1>
                  <p className="text-[12.5px] text-[#6B7280]">
                    Laporan rekapitulasi performa finansial harian, analisis sewa workstation, dan audit ledger real-time.
                  </p>
                </div>

                {/* Timeframe Selector & Actions */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center bg-[#F4F5F7] p-1 rounded-full border border-[#E5E7EB]">
                    {(["7D", "30D", "90D", "YTD", "ALL"] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setChartTimeframe(tf)}
                        className={`px-3 py-1 text-[11.5px] font-black rounded-full transition-all cursor-pointer ${
                          chartTimeframe === tf
                            ? "bg-[#111111] text-[#D4F34A] shadow-xs"
                            : "text-[#6B7280] hover:text-[#111111]"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  <Link
                    href="/admin/rekapitulasi"
                    className="bg-[#D4F34A] text-[#111111] hover:bg-[#c4e339] text-[12.5px] font-extrabold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Receipt size={14} />
                    <span>Financial Statement</span>
                    <ArrowUpRight size={14} />
                  </Link>

                  <button
                    onClick={refreshData}
                    className="p-2.5 bg-[#111111] text-white rounded-full hover:bg-black transition-colors cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* Primary KPI Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-[22px] border border-[#EAEAEA] shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider">
                      REALISASI PENDAPATAN
                    </span>
                    <span className="bg-[#ECFDF5] text-[#10B981] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                      {totalRevenueNumber > 0
                        ? `${Math.round((realizedRevenueNumber / totalRevenueNumber) * 100)}% YIELD`
                        : "0% YIELD"}
                    </span>
                  </div>
                  <div className="text-[26px] font-black text-[#111111] tabular-nums mt-1">
                    Rp {realizedRevenueNumber.toLocaleString("id-ID")}
                  </div>
                  <span className="text-[11px] text-[#10B981] font-bold mt-1 inline-block">
                    ✓ Transaksi Disetujui & Selesai
                  </span>
                </div>

                <div className="bg-white p-5 rounded-[22px] border border-[#EAEAEA] shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider">
                      TOTAL TRANSAKSI
                    </span>
                    <span className="bg-[#F3F4F6] text-[#4B5563] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#E5E7EB]">
                      VOLUME
                    </span>
                  </div>
                  <div className="text-[26px] font-black text-[#111111] tabular-nums mt-1">
                    {totalTransactionsCount} Booking
                  </div>
                  <span className="text-[11px] text-[#6B7280] mt-1 inline-block">
                    Semua workstation & meeting pod
                  </span>
                </div>

                <div className="bg-white p-5 rounded-[22px] border border-[#EAEAEA] shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider">
                      MENUNGGU APPROVAL
                    </span>
                    <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#FDE68A]">
                      PENDING
                    </span>
                  </div>
                  <div className="text-[26px] font-black text-[#D97706] tabular-nums mt-1">
                    {pendingApprovalCount}
                  </div>
                  <span className="text-[11px] text-[#D97706] font-semibold mt-1 inline-block">
                    🟡 Perlu tindakan di Master Ledger
                  </span>
                </div>

                <div className="bg-white p-5 rounded-[22px] border border-[#EAEAEA] shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider">
                      TOTAL SPACES READY
                    </span>
                    <span className="bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-[26px] font-black text-[#111111] tabular-nums mt-1">
                    {spaces.length} Ruangan
                  </div>
                  <span className="text-[11px] text-[#3B82F6] font-semibold mt-1 inline-block">
                    Siap direservasi pengguna
                  </span>
                </div>
              </div>

              {/* MODULE A: INTERACTIVE TRAJECTORY SPLINE CHART & CATEGORY DISTRIBUTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (60% ~ col-span-7): Trajectory Spline Curve */}
                <div className="lg:col-span-7 bg-white rounded-[24px] p-6 border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <h2 className="text-[17px] font-extrabold text-[#111111] tracking-tight">
                          Tren Pertumbuhan Pendapatan Harian
                        </h2>
                        <p className="text-[12px] text-[#6B7280]">
                          Trajectory kurva pendapatan akumulatif rentang waktu {chartTimeframe}
                        </p>
                      </div>
                      {/* Legend */}
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-[#4B5563]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
                          <span>Realisasi Harian</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#CEF23F] border border-[#111111]" />
                          <span>Volume Puncak</span>
                        </div>
                      </div>
                    </div>

                    {/* SVG Spline Chart Canvas */}
                    <div className="relative w-full overflow-hidden pt-2 pb-1">
                      {/* Y-Axis Guidelines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#9CA3AF] font-mono select-none pr-2">
                        <div className="border-b border-[#F1F3F5] w-full flex justify-between">
                          <span>Rp {(maxChartVal / 1000).toLocaleString("id-ID")}k</span>
                        </div>
                        <div className="border-b border-[#F1F3F5] w-full flex justify-between">
                          <span>Rp {((maxChartVal * 0.75) / 1000).toLocaleString("id-ID")}k</span>
                        </div>
                        <div className="border-b border-[#F1F3F5] w-full flex justify-between">
                          <span>Rp {((maxChartVal * 0.5) / 1000).toLocaleString("id-ID")}k</span>
                        </div>
                        <div className="border-b border-[#F1F3F5] w-full flex justify-between">
                          <span>Rp {((maxChartVal * 0.25) / 1000).toLocaleString("id-ID")}k</span>
                        </div>
                        <div className="w-full flex justify-between">
                          <span>Rp 0</span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <svg
                          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                          className="w-full h-[220px] overflow-visible"
                        >
                          <defs>
                            <linearGradient id="neonGradientFillAdmin" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#CEF23F" stopOpacity="0.55" />
                              <stop offset="50%" stopColor="#D4F34A" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#E2F952" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Area Gradient Fill */}
                          <path d={areaPath} fill="url(#neonGradientFillAdmin)" className="transition-all duration-300" />

                          {/* Spline Stroke Curve */}
                          <path
                            d={splinePath}
                            fill="none"
                            stroke="#111111"
                            strokeWidth="2.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Data Points on Curve */}
                          {chartCoordinates.map((pt, idx) => (
                            <g key={idx} className="cursor-pointer">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={hoveredPoint?.day === pt.day ? 6.5 : 3.5}
                                fill={hoveredPoint?.day === pt.day ? "#CEF23F" : "#111111"}
                                stroke={hoveredPoint?.day === pt.day ? "#111111" : "#FFFFFF"}
                                strokeWidth="2"
                                className="transition-all duration-150"
                                onMouseEnter={() => setHoveredPoint(pt)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                            </g>
                          ))}
                        </svg>

                        {/* Interactive Hover Tooltip */}
                        {hoveredPoint && (
                          <div
                            className="absolute z-30 pointer-events-none bg-[#111111] text-white px-3.5 py-2 rounded-[12px] text-left shadow-xl border border-white/20 transform -translate-x-1/2 -translate-y-full"
                            style={{
                              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                              top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                              marginTop: "-12px",
                            }}
                          >
                            <div className="text-[10px] text-[#CEF23F] font-black uppercase tracking-wider">
                              {hoveredPoint.label}
                            </div>
                            <div className="text-[13.5px] font-black tabular-nums">
                              Rp {hoveredPoint.value.toLocaleString("id-ID")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F1F3F5] flex items-center justify-between text-[11.5px] text-[#6B7280]">
                    <span>Model kurva akumulasi pendapatan real-time dari seluruh workstation.</span>
                    <span className="font-bold text-[#111111]">
                      Rata-rata: Rp {Math.round(totalRevenueNumber / (chartDataPoints.length || 1)).toLocaleString("id-ID")}/Hari
                    </span>
                  </div>
                </div>

                {/* Right Column (40% ~ col-span-5): Yield Distribution Cards */}
                <div className="lg:col-span-5 bg-white rounded-[24px] p-6 border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-[17px] font-extrabold text-[#111111] tracking-tight">
                          Distribusi Yield Kategori Space
                        </h2>
                        <p className="text-[12px] text-[#6B7280]">
                          Breakdown sewa per tipe fasilitas coworking
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold px-2.5 py-1 bg-[#F4F5F7] rounded-full text-[#111111] border border-[#E5E7EB]">
                        3 Kategori
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {spaceCategoryStats.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-[18px] border border-[#EAEAEA] hover:border-[#111111] transition-all bg-[#FAFAFA]"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] font-extrabold text-[#111111]">
                              {item.label}
                            </span>
                            <span className="text-[12px] font-black text-[#111111] bg-[#CEF23F] px-2 py-0.5 rounded-full border border-black/10">
                              {item.yieldPct}% Yield
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11.5px] text-[#6B7280] mb-2">
                            <span>{item.sessionsCount} Sesi ({item.totalHours} Jam Terpakai)</span>
                            <span className="font-extrabold text-[#111111]">
                              Rp {item.totalRevenue.toLocaleString("id-ID")}
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#111111] rounded-full transition-all duration-500"
                              style={{ width: `${item.yieldPct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F1F3F5] flex items-center justify-between">
                    <span className="text-[11.5px] text-[#6B7280]">
                      Kapasitas Terutilisasi: <strong className="text-[#111111]">
                        {totalTransactionsCount > 0 && spaces.length > 0
                          ? `${Math.min(100, Math.round((totalTransactionsCount / (spaces.length * 30)) * 100))}%`
                          : "0%"}
                      </strong>
                    </span>
                    <Link
                      href="/admin/rekapitulasi"
                      className="text-[11.5px] font-bold text-[#111111] hover:underline flex items-center gap-1"
                    >
                      <span>Detail Rekapitulasi CSV</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* MODULE B: MASTER RESERVATION LEDGER & MONITORING FEED */}
              <div className="bg-white rounded-[24px] border border-[#EAEAEA] overflow-hidden shadow-xs">
                <div className="p-5 border-b border-[#EAEAEA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-black text-[#111111] tracking-tight">
                        Master Reservation Ledger
                      </h3>
                      <span className="px-2 py-0.5 text-[10.5px] font-bold bg-[#F3F4F6] text-[#4B5563] rounded-full">
                        {reservations.length} Transaksi
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6B7280]">
                      Pantau status kedatangan, approval instan, check-in jam real-time, dan cetak E-Ticket Nota.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("reservations")}
                    className="bg-[#111111] text-white hover:bg-black text-[12px] font-extrabold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <span>Buka Full Ledger & Filter</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-[#EAEAEA] bg-[#F8F9FA] text-[#6B7280] font-bold text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">KODE BOOKING</th>
                        <th className="py-3 px-4">MEMBER</th>
                        <th className="py-3 px-4">SPACE / WORKSTATION</th>
                        <th className="py-3 px-4">JADWAL SEWA</th>
                        <th className="py-3 px-4">TOTAL</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">AKSI CEPAT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.length > 0 ? (
                        reservations.slice(0, 6).map((r: any) => (
                          <tr
                            key={r.id}
                            className="border-b border-[#EAEAEA] hover:bg-[#FAFAFA] transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono">
                              <span className="font-extrabold text-[#111111] bg-[#F3F4F6] px-2 py-1 rounded-[6px] text-[11.5px] border border-[#E5E7EB]">
                                {r.kode_booking || `BOOK-20260830-00${r.id}`}
                              </span>
                              <span className="block text-[10.5px] font-sans font-semibold text-[#059669] mt-1">
                                {formatRealtimeTimestamp(r.created_at)}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-[#111111]">
                                {r.nama_member || "Member User"}
                              </div>
                              <div className="text-[11px] text-[#6B7280]">
                                {r.instansi || r.telp || "Komunitas Moklet"}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#111111]">
                                {r.nama_space || "Workstation Desk"}
                              </div>
                              <div className="text-[11px] text-[#6B7280] capitalize">
                                Tipe: {r.tipe || r.space_tipe || "Desk"}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-[#111111]">
                                {r.tanggal_reservasi || r.tanggal || "2026-08-30"}
                              </div>
                              <div className="text-[11px] font-mono text-[#6B7280]">
                                {r.jam_mulai || "09:00"} - {r.jam_selesai || "12:00"}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-black text-[#111111] text-[14px]">
                                Rp {Number(r.total_bayar || r.total || 0).toLocaleString("id-ID")}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {r.status === "disetujui" && (
                                <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                  ✓ Disetujui
                                </span>
                              )}
                              {r.status === "belum_dikonfirm" && (
                                <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                                  🟡 Menunggu Approval
                                </span>
                              )}
                              {r.status === "digunakan" && (
                                <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                                  🟢 Sedang Digunakan
                                </span>
                              )}
                              {r.status === "selesai" && (
                                <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                                  Cleared
                                </span>
                              )}
                              {r.status === "batal" && (
                                <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                                  Dibatalkan
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* E-Ticket Preview Trigger */}
                                <button
                                  onClick={() => {
                                    setSelectedTicketItem(r);
                                    setShowTicketModal(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#111111] rounded-full text-[11px] font-extrabold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Lihat E-Ticket & Nota"
                                >
                                  <Receipt size={13} className="text-[#059669]" />
                                  <span>Nota</span>
                                </button>

                                {r.status === "belum_dikonfirm" && (
                                  <button
                                    onClick={() => handleUpdateStatus(r.id, "disetujui")}
                                    className="px-3 py-1.5 bg-[#111111] hover:bg-black text-[#D4F34A] rounded-full text-[11px] font-black transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                {r.status === "disetujui" && (
                                  <button
                                    onClick={() => handleCheckIn(r.id)}
                                    className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-full text-[11px] font-black transition-colors cursor-pointer"
                                  >
                                    Check In
                                  </button>
                                )}
                                {r.status === "aktif" && (
                                  <button
                                    onClick={() => handleCheckOut(r.id)}
                                    className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white rounded-full text-[11px] font-black transition-colors cursor-pointer"
                                  >
                                    Check Out
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                            Belum ada data reservasi masuk di sistem.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: MODULE B MASTER RESERVATION FEED ================= */}
          {activeTab === "reservations" && (
            <div className="space-y-6">
              {/* 3.1 Top Header, Live Status & API Route */}
              <div className="bg-white p-6 rounded-[20px] border border-[#EAEAEA] shadow-xs space-y-4">
                {/* Breadcrumb & Live Sync Cluster */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <span>Admin Console</span>
                    <span>/</span>
                    <span>Bookings</span>
                    <span>/</span>
                    <span className="font-bold text-[#111111]">Master Reservation Feed</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-bold px-3 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                      <span>Live Feed Synced</span>
                    </span>

                    <button
                      onClick={() => setActiveTab("overview")}
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-[#111111] hover:underline cursor-pointer"
                    >
                      <span>Quick Dispatch Roster</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>

                {/* API Developer Route Strip */}
                <div className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#111111] text-[#D4F34A] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                      GET
                    </span>
                    <span className="font-mono text-[11.5px] text-[#374151] font-semibold">
                      /api/admin/reservasi?month={filterMonth}&year={filterYear}&status={resStatusFilter}&id_space={filterSpaceType}
                    </span>
                  </div>
                  <span className="font-mono text-[10.5px] text-[#6B7280] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded">
                    Schema: ReservationFilterDto
                  </span>
                </div>

                {/* Title & Primary CTA Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2">
                  <div>
                    <h1 className="text-[26px] font-black text-[#111111] tracking-tight">
                      Semua Data Reservasi (Monitoring)
                    </h1>
                    <p className="text-[13px] text-[#6B7280] mt-0.5">
                      Monitor and filter coworking bookings across months, spaces, dates, and operational states.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleExportMasterCsv}
                      className="bg-white border border-[#E5E7EB] text-[#111111] hover:bg-[#F8F9FA] px-4 py-2.5 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Export Master CSV / Excel</span>
                    </button>

                    <Link
                      href="/booking"
                      className="bg-[#D4F34A] text-[#111111] hover:bg-[#c4e339] px-5 py-2.5 rounded-full text-[13px] font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>+ New Reservation</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3.2 Interactive Filter Matrix & Criteria Bar */}
              <div className="bg-white p-5 rounded-[20px] border border-[#EAEAEA] shadow-xs space-y-4">
                {/* 5-Column Grid Filter Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider mb-1.5">
                      BULAN (MONTH)
                    </label>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] px-3 py-2 text-[12px] font-bold text-[#111111] outline-none cursor-pointer"
                    >
                      <option value="all">Semua Bulan</option>
                      <option value="08">August (08)</option>
                      <option value="09">September (09)</option>
                      <option value="10">October (10)</option>
                      <option value="11">November (11)</option>
                      <option value="12">December (12)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider mb-1.5">
                      TAHUN (YEAR)
                    </label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] px-3 py-2 text-[12px] font-bold text-[#111111] outline-none cursor-pointer"
                    >
                      <option value="all">Semua Tahun</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider mb-1.5">
                      STATUS BOOKING
                    </label>
                    <select
                      value={resStatusFilter}
                      onChange={(e) => setResStatusFilter(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] px-3 py-2 text-[12px] font-bold text-[#111111] outline-none cursor-pointer"
                    >
                      <option value="all">Semua Status</option>
                      <option value="belum_dikonfirm">Belum Dikonfirmasi</option>
                      <option value="disetujui">Disetujui</option>
                      <option value="aktif">Aktif / Digunakan</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider mb-1.5">
                      WORKSTATION / SPACE
                    </label>
                    <select
                      value={filterSpaceType}
                      onChange={(e) => setFilterSpaceType(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] px-3 py-2 text-[12px] font-bold text-[#111111] outline-none cursor-pointer"
                    >
                      <option value="all">All Spaces</option>
                      <option value="desk">Personal Desk</option>
                      <option value="meeting_room">Meeting Room</option>
                      <option value="private_office">Private Office</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold uppercase text-[#6B7280] tracking-wider mb-1.5">
                      TANGGAL SPESIFIK
                    </label>
                    <input
                      type="date"
                      value={filterSpecificDate}
                      onChange={(e) => setFilterSpecificDate(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-[12px] px-3 py-2 text-[12px] font-bold text-[#111111] outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Filter Execution Bar & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#EAEAEA]">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-[340px]">
                      <Search
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />
                      <input
                        type="text"
                        placeholder="Cari kode booking, member, instansi..."
                        value={resSearch}
                        onChange={(e) => setResSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full text-[12px] text-[#111111] outline-none"
                      />
                    </div>

                    <button
                      onClick={refreshData}
                      className="px-4 py-2 rounded-full bg-[#111111] text-white text-[12px] font-bold hover:bg-black transition-colors cursor-pointer"
                    >
                      Apply Filters
                    </button>

                    <button
                      onClick={() => {
                        setFilterMonth("all");
                        setFilterYear("2026");
                        setResStatusFilter("all");
                        setFilterSpaceType("all");
                        setFilterSpecificDate("");
                        setResSearch("");
                      }}
                      className="text-[12px] font-bold text-[#6B7280] hover:text-[#111111] px-2 cursor-pointer"
                    >
                      Reset All
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                      ACTIVE:
                    </span>
                    <span className="bg-[#F3F4F6] text-[#111111] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#E5E7EB]">
                      Month: {filterMonth === "all" ? "All Months" : `August 2026`}
                    </span>
                    <span className="bg-[#ECFDF5] text-[#065F46] text-[11px] font-bold px-3 py-0.5 rounded-full border border-[#A7F3D0]">
                      Showing {filteredReservations.length} Total Reservations
                    </span>
                  </div>
                </div>
              </div>

              {/* 3.3 Master Reservation Ledger Table */}
              <div className="bg-white rounded-[20px] border border-[#EAEAEA] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-[#EAEAEA] bg-[#F8F9FA] text-[#6B7280] font-bold text-[11px] uppercase tracking-wider">
                        <th className="py-3.5 px-4">KODE BOOKING</th>
                        <th className="py-3.5 px-4">MEMBER INFO</th>
                        <th className="py-3.5 px-4">DESK / SPACE</th>
                        <th className="py-3.5 px-4">JADWAL & DURASI</th>
                        <th className="py-3.5 px-4">TOTAL TAGIHAN</th>
                        <th className="py-3.5 px-4">STATUS</th>
                        <th className="py-3.5 px-4 text-right">AKSI & DISPATCH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.length > 0 ? (
                        filteredReservations.map((r) => {
                          const gross = Number(r.total_harga_awal || (r.harga_per_jam || 20000) * (r.durasi_jam || 3));
                          const net = Number(r.total_bayar || gross);
                          const discount = Number(r.potongan_diskon || Math.max(0, gross - net));
                          const bookingCodeStr = r.kode_booking || `BOOK-20260830-00${r.id}`;

                          return (
                            <tr
                              key={r.id}
                              className="border-b border-[#EAEAEA] hover:bg-gray-50/70 transition-colors"
                            >
                              {/* 1. KODE BOOKING & JAM TRANSAKSI */}
                              <td className="py-4 px-4 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-[#111111] bg-[#F3F4F6] px-2 py-0.5 rounded text-[12px]">
                                    {bookingCodeStr}
                                  </span>
                                  <button
                                    onClick={() => handleCopyText(bookingCodeStr)}
                                    className="p-1 rounded text-[#6B7280] hover:text-[#111111] transition-colors cursor-pointer"
                                    title="Copy Booking Code"
                                  >
                                    {copiedCode === bookingCodeStr ? (
                                      <Check size={12} className="text-[#10B981]" />
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-[#059669] font-bold mt-1.5 font-sans">
                                  <Clock size={11} className="shrink-0 text-[#10B981]" />
                                  <span>Trx: {formatRealtimeTimestamp(r.created_at)}</span>
                                </div>
                              </td>

                              {/* 2. MEMBER INFO */}
                              <td className="py-4 px-4">
                                <div className="font-bold text-[13.5px] text-[#111111]">
                                  {r.nama_member || "John Doe"}
                                </div>
                                <div className="text-[11px] text-[#6B7280]">
                                  {r.member_telp || "081234567890"}
                                </div>
                                <div className="text-[11px] text-[#6B7280] truncate max-w-[180px]">
                                  {r.instansi || "Universitas Brawijaya"}
                                </div>
                              </td>

                              {/* 3. DESK / SPACE */}
                              <td className="py-4 px-4">
                                <div className="font-bold text-[#111111]">
                                  {r.nama_space || "Personal Desk - Flexi 01"}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="bg-[#111111] text-[#D4F34A] text-[9.5px] font-black px-2 py-0.5 rounded uppercase">
                                    {r.tipe === "meeting_room" ? "MEETING ROOM" : r.tipe === "private_office" ? "PRIVATE SUITE" : "PERSONAL DESK"}
                                  </span>
                                  <span className="text-[11px] text-[#6B7280]">
                                    Moklet Hub 2F
                                  </span>
                                </div>
                              </td>

                              {/* 4. JADWAL & DURASI */}
                              <td className="py-4 px-4 text-[#111111]">
                                <div className="font-bold">
                                  {r.tanggal_reservasi || r.tanggal || "30 Aug 2026"}
                                </div>
                                <div className="text-[11.5px] text-[#6B7280] mt-0.5">
                                  {r.jam_mulai || "09:00"} – {r.jam_selesai || "12:00"} WIB
                                </div>
                                <span className="inline-block bg-[#F3F4F6] text-[#4B5563] text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                                  {r.durasi_jam || 3} Jam Akses
                                </span>
                              </td>

                              {/* 5. TOTAL TAGIHAN */}
                              <td className="py-4 px-4">
                                <div className="font-black text-[14px] text-[#111111] tabular-nums">
                                  Rp {net.toLocaleString("id-ID")}
                                </div>
                                {discount > 0 ? (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="line-through text-[11px] text-[#8C9196] tabular-nums">
                                      Rp {gross.toLocaleString("id-ID")}
                                    </span>
                                    <span className="bg-[#ECFDF5] text-[#065F46] text-[9.5px] font-bold px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                                      -Rp {discount.toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10.5px] text-[#10B981] font-medium block mt-0.5">
                                    Paid via Payment Gateway
                                  </span>
                                )}
                              </td>

                              {/* 6. STATUS */}
                              <td className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                                    r.status === "aktif"
                                      ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                      : r.status === "disetujui"
                                      ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                      : r.status === "selesai"
                                      ? "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]"
                                      : r.status === "dibatalkan"
                                      ? "bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]"
                                      : "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      r.status === "aktif"
                                        ? "bg-[#10B981] animate-pulse"
                                        : r.status === "disetujui"
                                        ? "bg-[#10B981]"
                                        : r.status === "selesai"
                                        ? "bg-[#6B7280]"
                                        : r.status === "dibatalkan"
                                        ? "bg-[#EF4444]"
                                        : "bg-[#D97706] animate-pulse"
                                    }`}
                                  ></span>
                                  <span>
                                    {r.status === "belum_dikonfirm"
                                      ? "Belum Dikonfirmasi"
                                      : r.status === "aktif"
                                      ? "Aktif / Digunakan"
                                      : r.status}
                                  </span>
                                </span>
                              </td>

                              {/* 7. AKSI & DISPATCH */}
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedTicketItem(r);
                                      setShowTicketModal(true);
                                    }}
                                    className="px-2.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] hover:border-[#111111] text-[#111111] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                    title="Lihat & Cetak E-Ticket / Nota Resmi"
                                  >
                                    <Receipt size={12} />
                                    <span>E-Ticket & Nota</span>
                                  </button>

                                  {r.status === "belum_dikonfirm" && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateStatus(r.id, "disetujui")}
                                        className="px-3.5 py-1.5 rounded-full bg-[#D4F34A] text-[#111111] text-[11.5px] font-extrabold hover:bg-[#c4e339] transition-all cursor-pointer shadow-xs"
                                      >
                                        Review & Dispatch &gt;
                                      </button>
                                      <button
                                        onClick={() => handleUpdateStatus(r.id, "dibatalkan")}
                                        className="px-2.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold hover:bg-red-100 transition-all cursor-pointer"
                                      >
                                        ✕
                                      </button>
                                    </>
                                  )}

                                  {r.status === "disetujui" && (
                                    <button
                                      onClick={() => handleCheckIn(r.id)}
                                      className="px-3.5 py-1.5 rounded-full bg-[#111111] text-[#D4F34A] text-[11.5px] font-bold hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <LogIn size={13} />
                                      <span>Check-In Desk</span>
                                    </button>
                                  )}

                                  {r.status === "aktif" && (
                                    <button
                                      onClick={() => handleCheckOut(r.id)}
                                      className="px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-[11.5px] font-bold hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <LogOut size={13} />
                                      <span>Check-Out Desk</span>
                                    </button>
                                  )}

                                  {r.status === "selesai" && (
                                    <button
                                      onClick={() => setSelectedReceipt(r)}
                                      className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111111] text-[11.5px] font-bold hover:bg-[#F8F9FA] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <Receipt size={13} />
                                      <span>View Receipt</span>
                                    </button>
                                  )}

                                  {r.status === "dibatalkan" && (
                                    <button
                                      onClick={() => setSelectedReceipt(r)}
                                      className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111111] underline cursor-pointer"
                                    >
                                      Details
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-[#6B7280]">
                            Tidak ada data reservasi yang sesuai dengan kriteria filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3.4 Pagination & Security Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280] pt-2">
                <span>
                  Showing 1 to {filteredReservations.length} of {reservations.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#8C9196] font-semibold cursor-not-allowed">
                    &lt; Prev
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-[#111111] text-white font-bold flex items-center justify-center">
                    1
                  </button>
                  <button className="w-8 h-8 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] font-bold flex items-center justify-center hover:bg-[#F8F9FA]">
                    2
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] font-semibold hover:bg-[#F8F9FA] cursor-pointer">
                    Next &gt;
                  </button>
                </div>
              </div>

              {/* System Database Integrity Footer */}
              <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span>
                    Semua alur reservasi &amp; filtering tersinkronisasi langsung dengan MySQL database tenant UKK RPL.
                  </span>
                </div>
                <div className="font-mono text-[10.5px] text-[#8C9196]">
                  Last Checksum: 4ffb8c...32f6e0 (Maker Engine Active)
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: MANAJEMEN SPACE (CRUD) ================= */}
          {activeTab === "spaces" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[20px] border border-[#EAEAEA] flex items-center justify-between shadow-xs">
                <div>
                  <h1 className="text-[22px] font-black text-[#111111] tracking-tight">
                    Manajemen Ruangan &amp; Meja Kerja (Spaces)
                  </h1>
                  <p className="text-[13px] text-[#6B7280] mt-0.5">
                    Kelola ketersediaan workstation, ruang rapat, harga per jam, dan kapasitas.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingSpace(null);
                    setSpaceForm({
                      nama_space: "",
                      harga_per_jam: 20000,
                      tipe: "desk",
                      kapasitas: 1,
                      deskripsi: "",
                      foto: "desk_flexi_01.jpg",
                    });
                    setSpaceModalOpen(true);
                  }}
                  className="bg-[#111111] text-white px-4 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-black transition-all cursor-pointer shadow-xs"
                >
                  <Plus size={16} />
                  <span>Tambah Space Baru</span>
                </button>
              </div>

              {/* Spaces Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {spaces.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-[20px] border border-[#EAEAEA] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group"
                  >
                    {/* Space Image */}
                    <div className="relative aspect-[16/10] w-full bg-[#1A1A1A] overflow-hidden">
                      <img
                        src={
                          s.foto && s.foto.startsWith("http")
                            ? s.foto
                            : s.tipe === "meeting_room"
                            ? "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80"
                            : s.tipe === "private_office"
                            ? "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80"
                            : "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={s.nama_space}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-[#111111]/90 backdrop-blur-md text-[#D4F34A] text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase border border-white/10">
                          {s.tipe === "meeting_room" ? "Meeting Room" : s.tipe === "private_office" ? "Private Office" : "Personal Desk"}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded-full">
                          👤 {s.kapasitas} Pax
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-[17px] font-bold text-[#111111] leading-snug">
                          {s.nama_space}
                        </h3>
                        <p className="text-[12.5px] text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed">
                          {s.deskripsi || "Workstation lengkap dengan WiFi ultra cepat dan stopkontak."}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EAEAEA] flex items-baseline justify-between">
                        <span className="text-[11px] font-bold text-[#6B7280] uppercase">
                          Tarif per Jam:
                        </span>
                        <span className="text-[17px] font-extrabold text-[#111111] tabular-nums">
                          Rp {Number(s.harga_per_jam).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F8F9FA] border-t border-[#EAEAEA] flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingSpace(s);
                          setSpaceForm({
                            nama_space: s.nama_space,
                            harga_per_jam: s.harga_per_jam,
                            tipe: s.tipe,
                            kapasitas: s.kapasitas,
                            deskripsi: s.deskripsi || "",
                            foto: s.foto || "desk_flexi_01.jpg",
                          });
                          setSpaceModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-white border border-[#EAEAEA] text-[#111111] hover:bg-[#F8F9FA] text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSpace(s.id)}
                        className="p-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: DISKON & PROMO (CRUD) ================= */}
          {activeTab === "discounts" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[20px] border border-[#EAEAEA] flex items-center justify-between shadow-xs">
                <div>
                  <h1 className="text-[22px] font-black text-[#111111] tracking-tight">
                    Manajemen Kode Promo &amp; Diskon Event
                  </h1>
                  <p className="text-[13px] text-[#6B7280] mt-0.5">
                    Buat kode kupon potongan harga dengan masa berlaku untuk member saat melakukan booking.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingDiscount(null);
                    setDiscountForm({
                      nama_diskon: "DISKONBARU",
                      persentase_diskon: 20,
                      tanggal_awal: "2026-01-01",
                      tanggal_akhir: "2026-12-31",
                    });
                    setDiscountModalOpen(true);
                  }}
                  className="bg-[#111111] text-white px-4 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-black transition-all cursor-pointer shadow-xs"
                >
                  <Plus size={16} />
                  <span>Tambah Diskon Baru</span>
                </button>
              </div>

              {/* Discounts Table */}
              <div className="bg-white rounded-[20px] border border-[#EAEAEA] overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] bg-[#F8F9FA] text-[#6B7280] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">KODE DISKON</th>
                      <th className="py-3 px-4">POTONGAN</th>
                      <th className="py-3 px-4">TANGGAL AWAL</th>
                      <th className="py-3 px-4">TANGGAL AKHIR</th>
                      <th className="py-3 px-4 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.length > 0 ? (
                      discounts.map((d) => (
                        <tr
                          key={d.id}
                          className="border-b border-[#EAEAEA] hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-[#111111]">
                            {d.nama_diskon}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-[#D4F34A] text-[#111111] text-[11px] font-black px-2.5 py-0.5 rounded-full">
                              {d.persentase_diskon}% OFF
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#6B7280]">{d.tanggal_awal}</td>
                          <td className="py-3.5 px-4 text-[#6B7280]">{d.tanggal_akhir}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingDiscount(d);
                                  setDiscountForm({
                                    nama_diskon: d.nama_diskon,
                                    persentase_diskon: d.persentase_diskon,
                                    tanggal_awal: d.tanggal_awal ? d.tanggal_awal.split("T")[0] : "2026-01-01",
                                    tanggal_akhir: d.tanggal_akhir ? d.tanggal_akhir.split("T")[0] : "2026-12-31",
                                  });
                                  setDiscountModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-[#EAEAEA] hover:bg-[#F8F9FA] text-[#111111] cursor-pointer"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteDiscount(d.id)}
                                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                          Belum ada voucher promo. Klik tombol Tambah Diskon Baru di atas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 5: MEMBER MANAGEMENT (CRUD) ================= */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[20px] border border-[#EAEAEA] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-[22px] font-black text-[#111111] tracking-tight">
                      Data Member &amp; Pengguna Coworking
                    </h1>
                    <span className="bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      {members.length} Pengguna Terdaftar
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mt-0.5">
                    Daftar akun member, instansi, alamat, dan total transaksi yang telah dilakukan.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative min-w-[240px]">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9196]"
                    />
                    <input
                      type="text"
                      placeholder="Cari nama, username, instansi..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-full pl-9 pr-4 py-2 text-[12.5px] font-medium text-[#111111] outline-none focus:border-[#111111]"
                    />
                    {memberSearch && (
                      <button
                        onClick={() => setMemberSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setEditingMember(null);
                      setMemberForm({
                        nama_member: "",
                        username: "",
                        password: "",
                        instansi: "",
                        alamat: "",
                        telp: "",
                        foto: "",
                      });
                      setMemberModalOpen(true);
                    }}
                    className="bg-[#111111] text-white px-4 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-black transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus size={16} />
                    <span>Tambah Member Baru</span>
                  </button>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-[20px] border border-[#EAEAEA] overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] bg-[#F8F9FA] text-[#6B7280] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">PENGGUNA / MEMBER</th>
                      <th className="py-3 px-4">USERNAME</th>
                      <th className="py-3 px-4">INSTANSI / KAMPUS</th>
                      <th className="py-3 px-4">NO. TELEPON / WA</th>
                      <th className="py-3 px-4">AKTIVITAS BOOKING</th>
                      <th className="py-3 px-4 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length > 0 ? (
                      members.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-[#EAEAEA] hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-[#111111]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#111111] text-[#D4F34A] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden border border-[#E5E7EB] relative">
                                {m.foto ? (
                                  <img
                                    src={
                                      m.foto.startsWith("http") || m.foto.startsWith("data:")
                                        ? m.foto
                                        : `${API_BASE_URL}/uploads/${m.foto}`
                                    }
                                    alt={m.nama_member}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span>{(m.nama_member || "U").substring(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[13.5px] text-[#111111] leading-tight">
                                  {m.nama_member}
                                </div>
                                <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                                  {m.alamat || "Alamat belum diatur"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#111111]">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                              @{m.username}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#4B5563]">
                            {m.instansi || "-"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#4B5563]">
                            {m.telp || "-"}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#111111]">
                            <span className="inline-flex items-center gap-1.5 bg-[#F3F4F6] text-[#111111] font-bold px-2.5 py-1 rounded-full text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                              {m.total_reservasi || 0} Sesi
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingMember(m);
                                  setMemberForm({
                                    nama_member: m.nama_member,
                                    username: m.username,
                                    password: "",
                                    instansi: m.instansi || "",
                                    alamat: m.alamat || "",
                                    telp: m.telp || "",
                                    foto: m.foto || "",
                                  });
                                  setMemberModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-[#EAEAEA] hover:bg-[#F8F9FA] text-[#111111] cursor-pointer"
                                title="Edit Member"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m.id)}
                                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                                title="Hapus Member"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#6B7280]">
                          {isLoading ? "Memuat data pengguna..." : "Belum ada member terdaftar yang sesuai pencarian."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 6: PROFIL COWORKING ================= */}
          {activeTab === "profile" && (
            <div className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#EAEAEA] max-w-[720px] shadow-xs">
              <h1 className="text-[22px] font-black text-[#111111] tracking-tight mb-1">
                Profil Lokasi Coworking Space
              </h1>
              <p className="text-[13px] text-[#6B7280] mb-6">
                Perbarui identitas hub coworking, nama penanggung jawab/pemilik, dan hotline reservasi.
              </p>

              <form onSubmit={handleSaveCoworkingProfile} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    NAMA COWORKING SPACE *
                  </label>
                  <input
                    type="text"
                    required
                    value={coworkingProfile.nama_coworking}
                    onChange={(e) =>
                      setCoworkingProfile({
                        ...coworkingProfile,
                        nama_coworking: e.target.value,
                      })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[14px] font-bold text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    NAMA PEMILIK / PENANGGUNG JAWAB *
                  </label>
                  <input
                    type="text"
                    required
                    value={coworkingProfile.nama_pemilik}
                    onChange={(e) =>
                      setCoworkingProfile({
                        ...coworkingProfile,
                        nama_pemilik: e.target.value,
                      })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[14px] font-bold text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    NOMOR TELEPON / HOTLINE WHATSAPP *
                  </label>
                  <input
                    type="text"
                    required
                    value={coworkingProfile.telp}
                    onChange={(e) =>
                      setCoworkingProfile({
                        ...coworkingProfile,
                        telp: e.target.value,
                      })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[14px] font-bold text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    ALAMAT LENGKAP
                  </label>
                  <input
                    type="text"
                    value={coworkingProfile.alamat}
                    onChange={(e) =>
                      setCoworkingProfile({
                        ...coworkingProfile,
                        alamat: e.target.value,
                      })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[14px] font-bold text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    DESKRIPSI FASILITAS
                  </label>
                  <textarea
                    rows={3}
                    value={coworkingProfile.deskripsi_fasilitas}
                    onChange={(e) =>
                      setCoworkingProfile({
                        ...coworkingProfile,
                        deskripsi_fasilitas: e.target.value,
                      })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-3 text-[13px] text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-[#111111] text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan Profil"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] max-w-[480px] w-full border border-[#EAEAEA] shadow-2xl overflow-hidden text-[#111111]"
            >
              <div className="p-5 bg-[#111111] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-[#D4F34A]" />
                  <span className="font-extrabold text-[15px]">Official Reservation Receipt</span>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-[13px]">
                <div className="text-center pb-3 border-b border-[#EAEAEA]">
                  <h4 className="font-black text-[18px] text-[#111111]">Moklet Hub Coworking</h4>
                  <p className="text-[11px] text-[#6B7280]">Jl. Danau Ranau No. 1, Sawojajar, Malang</p>
                  <div className="mt-2 inline-block bg-[#F3F4F6] font-mono text-[12px] font-extrabold px-3 py-1 rounded">
                    {selectedReceipt.kode_booking || `UHUB-${selectedReceipt.id}`}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Member</span>
                    <span className="font-bold text-[#111111]">{selectedReceipt.nama_member || "Member"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Space &amp; Type</span>
                    <span className="font-bold text-[#111111]">{selectedReceipt.nama_space} ({selectedReceipt.tipe || "desk"})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Schedule Slot</span>
                    <span className="font-bold text-[#111111]">
                      {selectedReceipt.tanggal_reservasi || selectedReceipt.tanggal} ({selectedReceipt.jam_mulai} - {selectedReceipt.jam_selesai})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Duration</span>
                    <span className="font-bold text-[#111111]">{selectedReceipt.durasi_jam || 3} Jam Akses</span>
                  </div>
                  <div className="flex justify-between border-t border-[#EAEAEA] pt-2">
                    <span className="font-bold text-[#111111]">Total Paid</span>
                    <span className="font-black text-[16px] text-[#111111] tabular-nums">
                      Rp {Number(selectedReceipt.total_bayar || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Status</span>
                    <span className="font-bold text-[#10B981] capitalize">{selectedReceipt.status}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAEAEA] flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 rounded-full bg-[#111111] text-[#D4F34A] text-[12px] font-extrabold hover:bg-black transition-colors cursor-pointer"
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Space Modal (Add/Edit) */}
      <AnimatePresence>
        {spaceModalOpen && (
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain"
          >
            <motion.div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] p-6 max-w-[500px] w-full max-h-[90vh] overflow-y-auto overscroll-contain border border-[#EAEAEA] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-4">
                <h3 className="text-[17px] font-black text-[#111111]">
                  {editingSpace ? "Edit Detail Space" : "Tambah Space Baru"}
                </h3>
                <button
                  onClick={() => setSpaceModalOpen(false)}
                  className="p-1 rounded-full hover:bg-[#F8F9FA] text-[#6B7280]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveSpace} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Nama Ruang / Space *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Executive Private Office 03"
                    value={spaceForm.nama_space}
                    onChange={(e) =>
                      setSpaceForm({ ...spaceForm, nama_space: e.target.value })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                      Tipe Space
                    </label>
                    <select
                      value={spaceForm.tipe}
                      onChange={(e) =>
                        setSpaceForm({ ...spaceForm, tipe: e.target.value })
                      }
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                    >
                      <option value="desk">Personal Desk</option>
                      <option value="meeting_room">Meeting Room</option>
                      <option value="private_office">Private Office</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                      Kapasitas (Orang)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={spaceForm.kapasitas}
                      onChange={(e) =>
                        setSpaceForm({
                          ...spaceForm,
                          kapasitas: Number(e.target.value),
                        })
                      }
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Harga Sewa per Jam (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={spaceForm.harga_per_jam}
                    onChange={(e) =>
                      setSpaceForm({
                        ...spaceForm,
                        harga_per_jam: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Deskripsi &amp; Fasilitas
                  </label>
                  <textarea
                    rows={2}
                    value={spaceForm.deskripsi}
                    onChange={(e) =>
                      setSpaceForm({ ...spaceForm, deskripsi: e.target.value })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-2.5 text-[13px] text-[#111111] outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSpaceModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#E5E7EB] text-[12px] font-bold text-[#6B7280]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#111111] text-white text-[12px] font-bold hover:bg-black"
                  >
                    Simpan Space
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discount Modal (Add/Edit) */}
      <AnimatePresence>
        {discountModalOpen && (
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain"
          >
            <motion.div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] p-6 max-w-[480px] w-full max-h-[90vh] overflow-y-auto overscroll-contain border border-[#EAEAEA] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-4">
                <h3 className="text-[17px] font-black text-[#111111]">
                  {editingDiscount ? "Edit Voucher Promo" : "Tambah Voucher Promo Baru"}
                </h3>
                <button
                  onClick={() => setDiscountModalOpen(false)}
                  className="p-1 rounded-full hover:bg-[#F8F9FA] text-[#6B7280]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDiscount} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Kode Voucher (Contoh: PROMO2026)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DISKONHEMAT20"
                    value={discountForm.nama_diskon}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        nama_diskon: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-mono font-bold text-[#111111] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Persentase Diskon (%)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={discountForm.persentase_diskon}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        persentase_diskon: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                      Tanggal Mulai Berlaku
                    </label>
                    <input
                      type="date"
                      required
                      value={discountForm.tanggal_awal}
                      onChange={(e) =>
                        setDiscountForm({
                          ...discountForm,
                          tanggal_awal: e.target.value,
                        })
                      }
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[12px] text-[#111111] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                      Tanggal Berakhir
                    </label>
                    <input
                      type="date"
                      required
                      value={discountForm.tanggal_akhir}
                      onChange={(e) =>
                        setDiscountForm({
                          ...discountForm,
                          tanggal_akhir: e.target.value,
                        })
                      }
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[12px] text-[#111111] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#E5E7EB] text-[12px] font-bold text-[#6B7280]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#111111] text-white text-[12px] font-bold hover:bg-black"
                  >
                    Simpan Voucher
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Modal (Add/Edit) */}
      <AnimatePresence>
        {memberModalOpen && (
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain"
          >
            <motion.div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] p-6 max-w-[480px] w-full max-h-[90vh] overflow-y-auto overscroll-contain border border-[#EAEAEA] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-4">
                <h3 className="text-[17px] font-black text-[#111111]">
                  {editingMember ? "Edit Member" : "Tambah Member Baru"}
                </h3>
                <button
                  onClick={() => setMemberModalOpen(false)}
                  className="p-1 rounded-full hover:bg-[#F8F9FA] text-[#6B7280]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Nama Lengkap Member *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Riko Pramono"
                    value={memberForm.nama_member}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, nama_member: e.target.value })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                  />
                </div>

                {!editingMember && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                        Username Login *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="rikopram"
                        value={memberForm.username}
                        onChange={(e) =>
                          setMemberForm({ ...memberForm, username: e.target.value })
                        }
                        className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={memberForm.password}
                        onChange={(e) =>
                          setMemberForm({ ...memberForm, password: e.target.value })
                        }
                        className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Instansi / Perusahaan / Kampus
                  </label>
                  <input
                    type="text"
                    placeholder="Universitas Brawijaya"
                    value={memberForm.instansi}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, instansi: e.target.value })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={memberForm.telp}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, telp: e.target.value })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    Alamat Domisili
                  </label>
                  <input
                    type="text"
                    placeholder="Jl. Soekarno Hatta No. 10, Malang"
                    value={memberForm.alamat}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, alamat: e.target.value })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">
                    URL Foto Profil / Avatar (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... atau /uploads/..."
                    value={memberForm.foto}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, foto: e.target.value })
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] text-[#111111] outline-none font-mono text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMemberModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#E5E7EB] text-[12px] font-bold text-[#6B7280]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#111111] text-white text-[12px] font-bold hover:bg-black"
                  >
                    Simpan Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official E-Ticket & Nota Modal for Admin */}
      <ETicketNotaModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        reservation={selectedTicketItem}
      />
    </div>
  );
}
