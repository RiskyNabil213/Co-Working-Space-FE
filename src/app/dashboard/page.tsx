"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RealQRCode from "@/components/RealQRCode";
import ETicketNotaModal from "@/components/ETicketNotaModal";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  QrCode,
  Zap,
  Tag,
  Building,
  User,
  Phone,
  Receipt,
  FileText,
  Sparkles,
  TrendingUp,
  CreditCard,
  LogOut,
  CalendarCheck,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Compass,
  Briefcase,
  Layers,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Search,
  X,
  Info,
  Users,
  Edit3,
  Mail,
  Lock,
  Camera,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import {
  getCurrentUser,
  getAuthToken,
  setAuthSession,
  clearAuthSession,
  authApi,
  uploadApi,
  reservasiApi,
  diskonApi,
  spaceApi,
  DiscountApiItem,
  SpaceApiItem,
} from "@/lib/api";

const AVATAR_PRESETS = [
  {
    label: "Professional Man",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
  },
  {
    label: "Creative Designer",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
  },
  {
    label: "Tech Founder",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
  },
  {
    label: "Product Lead",
    url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=240&q=80",
  },
  {
    label: "Software Engineer",
    url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=240&q=80",
  },
  {
    label: "Executive Architect",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  },
];

export default function MemberDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<DiscountApiItem[]>([]);
  const [spaces, setSpaces] = useState<SpaceApiItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // E-Ticket Modal State
  const [selectedTicketItem, setSelectedTicketItem] = useState<any | null>(null);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    nama: "",
    instansi: "",
    telp: "",
    alamat: "",
    email: "",
    foto: "",
    password: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
    showToast(`${label} "${text}" disalin!`);
  };

  // Local File Upload Handler
  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal ukuran file adalah 5MB.");
      return;
    }

    setIsUploadingFile(true);

    // 1. Instant base64 preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64Str = ev.target?.result as string;
      if (base64Str) {
        setProfileForm((prev) => ({ ...prev, foto: base64Str }));
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to backend if available
    try {
      const res = await uploadApi.uploadAvatar(file);
      const uploadedUrl = res.data?.url || (res as any).url;
      if (res && res.success && uploadedUrl) {
        setProfileForm((prev) => ({ ...prev, foto: uploadedUrl }));
        showToast("Foto berhasil dipilih dari file lokal!");
      } else {
        showToast("Foto lokal berhasil dimuat!");
      }
    } catch {
      showToast("Foto lokal siap disimpan!");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Auth Protection Guard
  useEffect(() => {
    const token = getAuthToken();
    const user = getCurrentUser();

    if (!token || !user || user === "guest") {
      router.push("/login?redirect=/dashboard");
      return;
    }

    setCurrentUser(user);
    setIsAuthChecking(false);
  }, [router]);

  // Sync Form with Current User
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        username: currentUser.username || "",
        nama: currentUser.nama || currentUser.nama_member || "",
        instansi: currentUser.instansi || currentUser.perusahaan || "",
        telp: currentUser.telp || "",
        alamat: currentUser.alamat || "",
        email: currentUser.email || `${currentUser.username || "member"}@uhub.space`,
        foto: currentUser.foto || currentUser.avatar || "",
        password: "",
      });
      setAvatarError(false);
    }
  }, [currentUser, showProfileModal]);

  // Fetch Member Real Data
  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [resData, discData, spaceData, profileRes] = await Promise.all([
        reservasiApi.getMyReservations(),
        diskonApi.getDiscounts(),
        spaceApi.getSpaces(),
        authApi.getProfile().catch(() => null),
      ]);

      if (resData && resData.success && Array.isArray(resData.data)) {
        setReservations(resData.data);
      }
      if (discData && discData.success && Array.isArray(discData.data)) {
        setDiscounts(discData.data);
      }
      if (spaceData && spaceData.success && Array.isArray(spaceData.data)) {
        setSpaces(spaceData.data);
      }
      if (profileRes && profileRes.success && profileRes.data) {
        const p = profileRes.data;
        const mergedUser = {
          ...(currentUser || {}),
          ...p,
          nama: p.nama_member || p.nama || p.username || currentUser?.nama,
          instansi: p.instansi || currentUser?.instansi,
          telp: p.telp || currentUser?.telp,
          alamat: p.alamat || currentUser?.alamat,
          foto: p.foto || currentUser?.foto,
          avatar: p.foto || currentUser?.avatar,
        };
        setCurrentUser(mergedUser);
      }
    } catch (err) {
      console.warn("Error loading member dashboard data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isAuthChecking && currentUser) {
      loadDashboardData();
    }
  }, [isAuthChecking]);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSaveSuccess(false);

    try {
      const payload: any = {
        username: profileForm.username.trim(),
        nama_member: profileForm.nama.trim(),
        nama: profileForm.nama.trim(),
        instansi: profileForm.instansi.trim(),
        telp: profileForm.telp.trim(),
        alamat: profileForm.alamat.trim(),
        foto: profileForm.foto.trim() || null,
      };

      if (profileForm.password && profileForm.password.trim().length > 0) {
        payload.password = profileForm.password.trim();
      }

      const res = await authApi.updateProfile(payload);

      if (res.success && res.data) {
        const u = res.data;
        const updatedUser = {
          ...currentUser,
          ...u,
          id: u.id || currentUser.id,
          username: u.username || payload.username,
          nama: u.nama || u.nama_member || payload.nama,
          instansi: u.instansi || payload.instansi,
          perusahaan: u.instansi || payload.instansi,
          telp: u.telp || payload.telp,
          alamat: u.alamat || payload.alamat,
          avatar: u.foto || payload.foto,
          foto: u.foto || payload.foto,
          email: profileForm.email,
        };

        const activeToken = (res as any).token || (res as any).access_token || getAuthToken() || "";
        setAuthSession(activeToken, updatedUser);
        setCurrentUser(updatedUser);
        setAvatarError(false);
        setProfileSaveSuccess(true);
        showToast("Profil berhasil diperbarui!");

        setTimeout(() => {
          setShowProfileModal(false);
          setProfileSaveSuccess(false);
        }, 1200);

        loadDashboardData();
      } else {
        alert(res.message || "Gagal memperbarui profil.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Real Calculated Metrics
  const stats = useMemo(() => {
    const totalBookings = reservations.length;
    const activePasses = reservations.filter(
      (r) => r.status === "aktif" || r.status === "disetujui"
    ).length;
    const totalHours = reservations.reduce((acc, curr) => {
      if (curr.status !== "dibatalkan") {
        return acc + Number(curr.durasi_jam || 0);
      }
      return acc;
    }, 0);
    const totalSpend = reservations.reduce((acc, curr) => {
      if (curr.status !== "dibatalkan") {
        return acc + Number(curr.total_bayar || 0);
      }
      return acc;
    }, 0);
    const activeDiscounts = discounts.length;

    return {
      totalBookings,
      activePasses,
      totalHours,
      totalSpend,
      activeDiscounts,
    };
  }, [reservations, discounts]);

  // Active or Upcoming Reservation for Primary Pass Card
  const primaryActiveReservation = useMemo(() => {
    return (
      reservations.find((r) => r.status === "aktif") ||
      reservations.find((r) => r.status === "disetujui") ||
      reservations.find((r) => r.status === "belum_dikonfirm") ||
      null
    );
  }, [reservations]);

  // Filtered reservations list
  const filteredReservations = useMemo(() => {
    let list = reservations;

    if (statusFilter === "ACTIVE") {
      list = list.filter((r) => r.status === "aktif" || r.status === "disetujui");
    } else if (statusFilter === "PENDING") {
      list = list.filter((r) => r.status === "belum_dikonfirm");
    } else if (statusFilter === "COMPLETED") {
      list = list.filter((r) => r.status === "selesai");
    } else if (statusFilter === "CANCELLED") {
      list = list.filter((r) => r.status === "dibatalkan");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.kode_booking && r.kode_booking.toLowerCase().includes(q)) ||
          (r.nama_space && r.nama_space.toLowerCase().includes(q)) ||
          (r.space?.nama_space && r.space.nama_space.toLowerCase().includes(q)) ||
          (r.tanggal_reservasi && r.tanggal_reservasi.includes(q))
      );
    }

    return list;
  }, [reservations, statusFilter, searchQuery]);

  const handleOpenTicket = (item: any) => {
    const rate = Number(item.harga_per_jam || item.space_rate || item.space?.harga_per_jam || 25000);
    const dur = Number(item.durasi_jam || 3);
    const gross = Number(item.total_harga_awal || rate * dur);
    const net = Number(item.total_bayar || gross);
    const discount = Number(item.potongan_diskon || Math.max(0, gross - net));

    let mappedStatus: "Selesai" | "Disetujui" | "Aktif / Digunakan" | "Belum Dikonfirmasi" | "Dibatalkan" = "Belum Dikonfirmasi";
    if (item.status === "selesai") mappedStatus = "Selesai";
    else if (item.status === "disetujui") mappedStatus = "Disetujui";
    else if (item.status === "aktif") mappedStatus = "Aktif / Digunakan";
    else if (item.status === "dibatalkan") mappedStatus = "Dibatalkan";

    const spaceName = item.nama_space || item.space?.nama_space || "Coworking Space";
    const spaceType = item.tipe || item.space?.tipe || "desk";

    const formattedItem = {
      id: item.kode_booking || `BOOK-${item.id}`,
      numericId: item.id,
      bookingCode: item.kode_booking || `UHUB-${item.id}`,
      eTicketNumber: `TICKET-MOKLET-${item.tanggal_reservasi?.replace(/-/g, "") || "20260830"}-${item.id}`,
      bookedAt: item.created_at || "Baru saja",
      status: mappedStatus,
      rawStatus: item.status || "belum_dikonfirm",
      spaceTitle: spaceName,
      categoryLabel:
        spaceType === "meeting_room"
          ? "Acoustic Meeting Pod"
          : spaceType === "private_office"
          ? "Executive Office Suite"
          : "Personal Desk Focus",
      location: item.lokasi_coworking || "Moklet Hub Coworking • Sawojajar, Malang",
      deskNumber: `Station #${item.id || "01"}`,
      floor: "Level 1 • Focus Wing",
      image:
        item.foto ||
        (spaceType === "meeting_room"
          ? "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80"
          : spaceType === "private_office"
          ? "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=600&q=80"
          : "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=600&q=80"),
      date: item.tanggal_reservasi || item.tanggal || "2026-08-30",
      timeSlot: `${item.jam_mulai || "09:00"} – ${item.jam_selesai || "12:00"} WIB`,
      durationHours: dur,
      ratePerHour: rate,
      grossAmount: gross,
      discountAmount: discount,
      discountPromoName: item.nama_diskon ? `${item.nama_diskon} (-${item.persentase_diskon}%)` : undefined,
      netTotalPaid: net,
      checkInStatus: item.status === "aktif" ? "Active In-Session" : item.status === "selesai" ? "Completed" : "Scheduled Slot",
      checkInTime: item.check_in_time || "Check-in ready on schedule",
      memberName: currentUser?.nama || currentUser?.nama_member || "Member UHUB",
      memberCompany: currentUser?.instansi || currentUser?.perusahaan || "UHUB Verified Member",
      memberPhone: currentUser?.telp || "081234567890",
      memberEmail: currentUser?.email || `${currentUser?.username || "member"}@uhub.space`,
      qrPayload: `VERIFY-RESERVASI-${item.id}-${item.kode_booking || "PASS"}-MOKLETHUB`,
      barcodeHash: `hash-${item.id}-${item.kode_booking || "key"}`,
      timestampGenerated: item.created_at || new Date().toISOString(),
    };

    setSelectedTicketItem(formattedItem);
    setShowTicketModal(true);
  };

  const handleCancelBooking = async (id: number | string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan reservasi ini?")) return;
    try {
      const res = await reservasiApi.cancel(id);
      if (res.success) {
        showToast("Reservasi berhasil dibatalkan");
        loadDashboardData();
      } else {
        alert(res.message || "Gagal membatalkan reservasi");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat membatalkan reservasi.");
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    showToast("Berhasil logout. Mengalihkan ke landing page...");
    setTimeout(() => {
      window.location.href = "/";
    }, 400);
  };

  const isPhotoValid =
    !avatarError &&
    (currentUser?.avatar || currentUser?.foto) &&
    (currentUser?.avatar?.startsWith("http") ||
      currentUser?.avatar?.startsWith("data:") ||
      currentUser?.foto?.startsWith("http") ||
      currentUser?.foto?.startsWith("data:"));

  const userInitials = (currentUser?.nama || currentUser?.nama_member || currentUser?.username || "MB")
    .trim()
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F6F6F4] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0E0F12] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[13px] font-mono text-[#707175]">Memuat sesi member...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F4] selection:bg-[#D5F066] selection:text-[#0E0F12]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#0E0F12] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 text-[13px] font-medium"
          >
            <CheckCircle2 size={18} className="text-[#D5F066]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ================= 1. MEMBER PROFILE HERO HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-[#0E0F12] rounded-[28px] sm:rounded-[36px] overflow-hidden p-6 sm:p-10 text-white shadow-xl mb-8 border border-white/10"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D5F066]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Member Info Block */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Avatar Box with Safe Fallback */}
              <div
                onClick={() => setShowProfileModal(true)}
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-[#1E2024] to-[#2B2D33] border-2 border-[#D5F066]/40 flex items-center justify-center text-[24px] sm:text-[30px] font-black text-[#D5F066] shadow-xl shrink-0 overflow-hidden relative cursor-pointer group hover:border-[#D5F066] transition-all"
                title="Klik untuk ubah foto profil"
              >
                {isPhotoValid ? (
                  <img
                    src={currentUser.avatar || currentUser.foto}
                    alt={currentUser.nama || currentUser.username}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="leading-none tracking-tight font-black">
                      {userInitials}
                    </span>
                  </div>
                )}
                {/* Overlay edit icon on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={20} className="text-[#D5F066]" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D5F066] text-[#0E0F12] text-[11px] font-black uppercase tracking-wider">
                    <ShieldCheck size={13} />
                    <span>VERIFIED MEMBER</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[11px] font-mono">
                    ID: #{currentUser?.member_id || currentUser?.id || "UHUB-01"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[11px] font-mono">
                    @{currentUser?.username}
                  </span>
                </div>

                <h1 className="text-[26px] sm:text-[34px] font-extrabold tracking-tight text-white leading-tight">
                  Halo, {currentUser?.nama || currentUser?.nama_member || currentUser?.username || "Member"}!
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/60 mt-1.5 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={14} className="text-[#D5F066]" />
                    {currentUser?.instansi || currentUser?.perusahaan || "Perusahaan Belum Diisi"}
                  </span>
                  {currentUser?.telp && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} className="text-white/40" />
                      {currentUser?.telp}
                    </span>
                  )}
                  {currentUser?.alamat && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-white/40" />
                      {currentUser?.alamat}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Header Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                href="/spaces"
                className="h-[46px] px-6 rounded-full bg-[#D5F066] text-[#0E0F12] text-[13px] font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md cursor-pointer"
              >
                <PlusCircle size={16} />
                <span>Pesan Ruang Baru</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="h-[46px] px-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
                title="Edit Profil & Data Akun"
              >
                <Edit3 size={15} />
                <span>Edit Profil</span>
              </button>

              <button
                type="button"
                onClick={loadDashboardData}
                disabled={isLoadingData}
                className="h-[46px] w-[46px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 shrink-0"
                title="Refresh Data Dashboard"
              >
                <RefreshCw size={16} className={isLoadingData ? "animate-spin" : ""} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="h-[46px] px-4 rounded-full bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 text-[13px] font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                title="Keluar dari Akun"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ================= 2. METRICS CARDS (4 COLS) ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Metric 1 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#E2E2DF] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold text-[#707175] uppercase tracking-wider">
                Total Reservasi
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F6F6F4] text-[#0E0F12] flex items-center justify-center">
                <Calendar size={18} />
              </div>
            </div>
            <div>
              <div className="text-[28px] sm:text-[34px] font-extrabold text-[#0E0F12] tracking-tight">
                {stats.totalBookings}
              </div>
              <span className="text-[11px] text-[#707175] font-medium">
                Riwayat sewa ruangan Anda
              </span>
            </div>
          </motion.div>

          {/* Metric 2 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#E2E2DF] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold text-[#707175] uppercase tracking-wider">
                Pass Aktif / Siap
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap size={18} />
              </div>
            </div>
            <div>
              <div className="text-[28px] sm:text-[34px] font-extrabold text-[#10B981] tracking-tight">
                {stats.activePasses}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Siap scan di gerbang turnstile
              </span>
            </div>
          </motion.div>

          {/* Metric 3 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#E2E2DF] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold text-[#707175] uppercase tracking-wider">
                Total Jam Sewa
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
            </div>
            <div>
              <div className="text-[28px] sm:text-[34px] font-extrabold text-[#0E0F12] tracking-tight">
                {stats.totalHours} <span className="text-[16px] font-semibold text-[#707175]">Jam</span>
              </div>
              <span className="text-[11px] text-[#707175] font-medium">
                Akumulasi durasi produktivitas
              </span>
            </div>
          </motion.div>

          {/* Metric 4 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#E2E2DF] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold text-[#707175] uppercase tracking-wider">
                Voucher Promo
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#D5F066]/40 text-[#0E0F12] flex items-center justify-center">
                <Tag size={18} />
              </div>
            </div>
            <div>
              <div className="text-[28px] sm:text-[34px] font-extrabold text-[#0E0F12] tracking-tight">
                {stats.activeDiscounts} <span className="text-[16px] font-semibold text-[#707175]">Promo</span>
              </div>
              <span className="text-[11px] text-[#707175] font-medium">
                Klaim potongan biaya sewa
              </span>
            </div>
          </motion.div>
        </div>

        {/* ================= 3. SPLIT SECTION: LIVE DIGITAL PASS & PROMO CAROUSEL ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left: Active Digital Keycard Pass (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-7 bg-white rounded-[28px] border border-[#E2E2DF] p-6 sm:p-8 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-5 border-b border-[#E2E2DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0E0F12] text-[#D5F066] flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[#0E0F12]">
                    Digital Access Keycard & Turnstile QR
                  </h2>
                  <p className="text-[11px] text-[#707175]">
                    Scan QR ini di turnstile sensor saat memasuki coworking space
                  </p>
                </div>
              </div>

              {primaryActiveReservation && (
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                    primaryActiveReservation.status === "aktif"
                      ? "bg-emerald-100 text-emerald-800 animate-pulse"
                      : primaryActiveReservation.status === "disetujui"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {primaryActiveReservation.status === "aktif"
                    ? "Active Session"
                    : primaryActiveReservation.status === "disetujui"
                    ? "Approved Slot"
                    : "Pending Approval"}
                </span>
              )}
            </div>

            {primaryActiveReservation ? (
              <div className="py-6 flex flex-col md:flex-row items-center gap-6">
                {/* QR Code Container */}
                <div className="p-4 rounded-2xl bg-[#0E0F12] border border-black text-center shrink-0 shadow-lg">
                  <div className="bg-white p-2 rounded-xl mb-2 flex items-center justify-center">
                    <RealQRCode
                      value={`VERIFY-RESERVASI-${primaryActiveReservation.id}-${primaryActiveReservation.kode_booking || "PASS"}`}
                      size={130}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#D5F066] tracking-wider uppercase font-bold block">
                    {primaryActiveReservation.kode_booking || `BOOK-${primaryActiveReservation.id}`}
                  </span>
                </div>

                {/* Booking Key Info */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <span className="text-[11px] font-bold text-[#707175] uppercase tracking-wider">
                      Ruang Kerja yang Dipesan
                    </span>
                    <h3 className="text-[20px] font-extrabold text-[#0E0F12] leading-snug">
                      {primaryActiveReservation.nama_space || primaryActiveReservation.space?.nama_space || "Coworking Space Station"}
                    </h3>
                    <p className="text-[12px] text-[#707175]">
                      {primaryActiveReservation.lokasi_coworking || "Moklet Hub Coworking • Sawojajar, Malang"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#F6F6F4] border border-[#E2E2DF]">
                      <span className="text-[10px] font-bold text-[#707175] uppercase block">
                        Tanggal Reservasi
                      </span>
                      <span className="text-[13px] font-bold text-[#0E0F12] block mt-0.5">
                        {primaryActiveReservation.tanggal_reservasi || primaryActiveReservation.tanggal}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F6F6F4] border border-[#E2E2DF]">
                      <span className="text-[10px] font-bold text-[#707175] uppercase block">
                        Slot Jam
                      </span>
                      <span className="text-[13px] font-bold text-[#0E0F12] block mt-0.5">
                        {primaryActiveReservation.jam_mulai} - {primaryActiveReservation.jam_selesai || "Selesai"} ({primaryActiveReservation.durasi_jam || 1} Jam)
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenTicket(primaryActiveReservation)}
                      className="flex-1 h-[42px] rounded-full bg-[#0E0F12] text-white text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-black transition-all cursor-pointer shadow-xs"
                    >
                      <Receipt size={15} />
                      <span>Buka E-Ticket & Nota Resmi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          primaryActiveReservation.kode_booking || `UHUB-${primaryActiveReservation.id}`,
                          "Kode Booking"
                        )
                      }
                      className="h-[42px] px-4 rounded-full bg-[#F6F6F4] hover:bg-[#E2E2DF] text-[#0E0F12] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E2E2DF]"
                    >
                      {copiedCode === (primaryActiveReservation.kode_booking || `UHUB-${primaryActiveReservation.id}`) ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>Salin Kode</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#F6F6F4] border border-[#E2E2DF] text-[#707175] flex items-center justify-center mb-3">
                  <CalendarCheck size={24} />
                </div>
                <h3 className="text-[16px] font-bold text-[#0E0F12]">
                  Belum Ada Sesi Ruangan Aktif
                </h3>
                <p className="text-[13px] text-[#707175] max-w-[360px] mt-1 mb-5">
                  Anda belum memiliki jadwal reservasi aktif hari ini. Dapatkan meja kerja nyaman dengan fasilitas lengkap sekarang.
                </p>
                <Link
                  href="/spaces"
                  className="h-[42px] px-6 rounded-full bg-[#D5F066] text-[#0E0F12] text-[13px] font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-xs cursor-pointer"
                >
                  <PlusCircle size={15} />
                  <span>Pesan Ruangan Sekarang</span>
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-[#E2E2DF] flex items-center justify-between text-[11px] text-[#707175]">
              <span className="flex items-center gap-1.5">
                <Zap size={13} className="text-emerald-500" />
                IoT Door Unlock & Smart Locker Integration Active
              </span>
              <span className="font-mono">WiFi SSID: UHUB_MOKLET_5G</span>
            </div>
          </motion.div>

          {/* Right: Available Promo Vouchers (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-5 bg-gradient-to-br from-[#121316] to-[#1E2024] rounded-[28px] border border-white/10 p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D5F066] text-[#0E0F12] flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-white">
                      Voucher & Promo Member
                    </h2>
                    <p className="text-[11px] text-white/50">
                      Diskon otomatis dari database untuk booking
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Cards List */}
              <div className="space-y-3 mt-4 max-h-[260px] overflow-y-auto pr-1">
                {discounts.length > 0 ? (
                  discounts.map((disc) => (
                    <div
                      key={disc.id}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D5F066]/20 border border-[#D5F066]/30 text-[#D5F066] flex flex-col items-center justify-center shrink-0">
                          <span className="text-[13px] font-black leading-none">
                            {disc.persentase_diskon}%
                          </span>
                          <span className="text-[8px] font-bold uppercase">OFF</span>
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-white group-hover:text-[#D5F066] transition-colors">
                            {disc.nama_diskon}
                          </h4>
                          <span className="text-[11px] text-white/50 block">
                            Berlaku s/d {disc.tanggal_akhir}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(disc.nama_diskon, "Kode Promo")}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#D5F066] hover:text-[#0E0F12] text-white text-[11px] font-bold transition-all cursor-pointer shrink-0"
                      >
                        {copiedCode === disc.nama_diskon ? "Tersalin!" : "Salin Kode"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-white/50 text-[13px]">
                    Belum ada voucher promo aktif saat ini.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[12px] text-white/60">
                Gunakan saat checkout pemesanan
              </span>
              <Link
                href="/spaces"
                className="text-[12px] font-bold text-[#D5F066] hover:underline inline-flex items-center gap-1"
              >
                <span>Pakai Voucher Sekarang</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ================= 4. POPULAR SPACES READY FOR QUICK BOOKING (REAL DATA) ================= */}
        {spaces.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[18px] font-extrabold text-[#0E0F12] tracking-tight">
                  Pilihan Ruang Kerja Siap Dipesan
                </h3>
                <p className="text-[12px] text-[#707175]">
                  Pilih tipe ruangan sesuai kebutuhan fokus atau kolaborasi Anda
                </p>
              </div>
              <Link
                href="/spaces"
                className="text-[12px] font-bold text-[#0E0F12] hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua Ruang</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {spaces.slice(0, 3).map((sp) => (
                <div
                  key={sp.id}
                  className="bg-white rounded-[24px] border border-[#E2E2DF] overflow-hidden shadow-xs hover:border-[#0E0F12] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-[160px] w-full bg-[#0E0F12] overflow-hidden">
                    <img
                      src={
                        sp.foto ||
                        (sp.tipe === "meeting_room"
                          ? "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80"
                          : sp.tipe === "private_office"
                          ? "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=600&q=80"
                          : "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=600&q=80")
                      }
                      alt={sp.nama_space}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#D5F066] text-[10px] font-bold uppercase tracking-wider">
                      {sp.tipe === "meeting_room" ? "Meeting Room" : sp.tipe === "private_office" ? "Private Suite" : "Dedicated Desk"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[16px] font-bold text-[#0E0F12]">
                        {sp.nama_space}
                      </h4>
                      <div className="flex items-center gap-3 text-[12px] text-[#707175] mt-1">
                        <span className="flex items-center gap-1">
                          <Users size={13} />
                          Kapasitas {sp.kapasitas} Orang
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E2E2DF] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#707175] uppercase font-bold block">Tarif</span>
                        <span className="text-[15px] font-extrabold text-[#0E0F12]">
                          Rp {Number(sp.harga_per_jam).toLocaleString("id-ID")}<span className="text-[11px] font-normal text-[#707175]">/jam</span>
                        </span>
                      </div>

                      <Link
                        href={`/spaces/${sp.id}`}
                        className="h-[36px] px-4 rounded-full bg-[#0E0F12] hover:bg-black text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Pesan Ruang</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 5. MEMBER RESERVATION HISTORY & LEDGER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white rounded-[28px] border border-[#E2E2DF] p-6 sm:p-8 shadow-xs mb-8"
        >
          {/* Header & Filter Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E2E2DF]">
            <div>
              <h2 className="text-[20px] font-extrabold text-[#0E0F12] tracking-tight">
                Riwayat & Tiket Reservasi Anda
              </h2>
              <p className="text-[13px] text-[#707175]">
                Daftar lengkap seluruh ruang kerja yang pernah dan sedang Anda pesan
              </p>
            </div>

            {/* Search Input & Status Filter Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707175]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode booking / space..."
                  className="h-[38px] pl-9 pr-3 rounded-full bg-[#F6F6F4] border border-[#E2E2DF] text-[12px] text-[#0E0F12] outline-none focus:border-[#0E0F12] w-full sm:w-[220px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707175] hover:text-black cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "ALL", label: "Semua" },
                  { id: "ACTIVE", label: "Aktif / Disetujui" },
                  { id: "PENDING", label: "Menunggu" },
                  { id: "COMPLETED", label: "Selesai" },
                  { id: "CANCELLED", label: "Dibatalkan" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
                      statusFilter === tab.id
                        ? "bg-[#0E0F12] text-white shadow-xs"
                        : "bg-[#F6F6F4] text-[#707175] hover:text-[#0E0F12]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reservations Table / Cards */}
          {isLoadingData ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-[#0E0F12] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[13px] text-[#707175]">Memuat riwayat reservasi...</p>
            </div>
          ) : filteredReservations.length > 0 ? (
            <div className="divide-y divide-[#E2E2DF] mt-2">
              {filteredReservations.map((item) => {
                const spaceName = item.nama_space || item.space?.nama_space || "Coworking Space";
                const spaceType = item.tipe || item.space?.tipe || "desk";
                const totalPaid = Number(item.total_bayar || 0);

                let statusBadge = (
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800">
                    Menunggu Konfirmasi
                  </span>
                );

                if (item.status === "aktif") {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 animate-pulse">
                      Sedang Digunakan
                    </span>
                  );
                } else if (item.status === "disetujui") {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-800">
                      Disetujui
                    </span>
                  );
                } else if (item.status === "selesai") {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-neutral-100 text-neutral-700">
                      Selesai
                    </span>
                  );
                } else if (item.status === "dibatalkan") {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-red-100 text-red-700">
                      Dibatalkan
                    </span>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAFAFA] -mx-4 px-4 rounded-2xl transition-colors"
                  >
                    {/* Left: Info Space & Jadwal */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0E0F12] text-white flex items-center justify-center font-mono font-bold text-[14px] shrink-0">
                        {spaceType === "meeting_room" ? "MR" : spaceType === "private_office" ? "PO" : "DK"}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[12px] font-bold text-[#0E0F12]">
                            {item.kode_booking || `UHUB-${item.id}`}
                          </span>
                          {statusBadge}
                        </div>

                        <h4 className="text-[16px] font-bold text-[#0E0F12]">
                          {spaceName}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#707175] mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {item.tanggal_reservasi || item.tanggal}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            {item.jam_mulai} – {item.jam_selesai || "Selesai"} ({item.durasi_jam || 1} Jam)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Payment & Action Buttons */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E2E2DF]/60">
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] font-bold text-[#707175] uppercase block">
                          Total Pembayaran
                        </span>
                        <span className="text-[16px] font-extrabold text-[#0E0F12]">
                          Rp {totalPaid.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenTicket(item)}
                          className="h-[38px] px-4 rounded-full bg-[#0E0F12] text-white hover:bg-black text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Receipt size={14} />
                          <span>E-Ticket</span>
                        </button>

                        {(item.status === "belum_dikonfirm" || item.status === "disetujui") && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(item.id)}
                            className="h-[38px] px-3.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-bold transition-colors cursor-pointer border border-red-200"
                            title="Batalkan reservasi"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#F6F6F4] text-[#707175] flex items-center justify-center mb-3">
                <FileText size={22} />
              </div>
              <h3 className="text-[15px] font-bold text-[#0E0F12]">
                {searchQuery ? "Tidak ada reservasi yang cocok dengan pencarian" : "Belum ada riwayat reservasi"}
              </h3>
              <p className="text-[12px] text-[#707175] mt-0.5">
                {searchQuery
                  ? "Coba kata kunci lain atau bersihkan kotak pencarian."
                  : "Mulai pesan meja atau ruang meeting pertama Anda hari ini."}
              </p>
            </div>
          )}
        </motion.div>

        {/* ================= 6. QUICK NAVIGATION SHORTCUTS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <Link
            href="/spaces"
            className="p-6 rounded-[24px] bg-white border border-[#E2E2DF] hover:border-[#0E0F12] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#0E0F12] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building size={20} />
              </div>
              <h3 className="text-[17px] font-extrabold text-[#0E0F12]">
                Katalog Ruang Kerja
              </h3>
              <p className="text-[13px] text-[#707175] mt-1">
                Pilih Dedicated Desk, Acoustic Meeting Pods, atau Private Office Suite.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-[13px] font-bold text-[#0E0F12] group-hover:underline">
              <span>Eksplorasi Ruangan</span>
              <ArrowUpRight size={16} />
            </div>
          </Link>

          <Link
            href="/reservasi"
            className="p-6 rounded-[24px] bg-white border border-[#E2E2DF] hover:border-[#0E0F12] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#0E0F12] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Receipt size={20} />
              </div>
              <h3 className="text-[17px] font-extrabold text-[#0E0F12]">
                Portal Buku & Rekapitulasi Nota
              </h3>
              <p className="text-[13px] text-[#707175] mt-1">
                Cetak nota thermal POS, unduh e-ticket PDF, dan review ledger lengkap.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-[13px] font-bold text-[#0E0F12] group-hover:underline">
              <span>Buka Ledger Nota</span>
              <ArrowUpRight size={16} />
            </div>
          </Link>

          <Link
            href="/events"
            className="p-6 rounded-[24px] bg-white border border-[#E2E2DF] hover:border-[#0E0F12] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#0E0F12] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sparkles size={20} />
              </div>
              <h3 className="text-[17px] font-extrabold text-[#0E0F12]">
                Community Workshops & Events
              </h3>
              <p className="text-[13px] text-[#707175] mt-1">
                Ikuti seminar teknologi, networking night, dan masterclass eksklusif.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-[13px] font-bold text-[#0E0F12] group-hover:underline">
              <span>Lihat Jadwal Event</span>
              <ArrowUpRight size={16} />
            </div>
          </Link>
        </div>
      </main>

      {/* ================= MODAL 1: E-TICKET & OFFICIAL NOTA MODAL ================= */}
      {selectedTicketItem && (
        <ETicketNotaModal
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicketItem(null);
          }}
          reservation={selectedTicketItem}
        />
      )}

      {/* ================= MODAL 2: EDIT PROFILE MODAL ================= */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-[620px] bg-white rounded-[32px] overflow-hidden border border-[#E2E2DF] shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="bg-[#0E0F12] p-6 sm:p-7 text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#D5F066] text-[#0E0F12] flex items-center justify-center font-bold text-[18px]">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-extrabold text-white leading-tight">
                      Edit Profil Member
                    </h3>
                    <p className="text-[12px] text-white/60">
                      Perbarui identitas, username, perusahaan, dan foto avatar
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
                {/* 1. Avatar Preview & Local File Upload / Preset Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-[#3A3B40] uppercase tracking-wider mb-2.5">
                    FOTO PROFIL / AVATAR
                  </label>

                  {/* Hidden File Input for Local File Selection */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleLocalFileUpload}
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#F6F6F4] border border-[#E2E2DF]">
                    {/* Live Image Box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-18 h-18 rounded-2xl bg-[#0E0F12] text-[#D5F066] flex items-center justify-center font-bold text-[22px] overflow-hidden border-2 border-[#D5F066]/50 shrink-0 relative group cursor-pointer"
                      title="Klik untuk upload foto dari komputer"
                    >
                      {profileForm.foto && (profileForm.foto.startsWith("http") || profileForm.foto.startsWith("data:")) ? (
                        <img
                          src={profileForm.foto}
                          alt="Preview Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="font-black text-[22px]">{userInitials}</span>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Camera size={18} className="text-[#D5F066]" />
                        <span className="text-[9px] font-bold mt-0.5">Upload</span>
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2.5">
                      {/* Action Buttons Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingFile}
                          className="h-[38px] px-4 rounded-xl bg-[#0E0F12] hover:bg-black text-white text-[12px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-75"
                        >
                          {isUploadingFile ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload size={15} className="text-[#D5F066]" />
                          )}
                          <span>Pilih Foto dari Komputer</span>
                        </button>

                        {profileForm.foto && (
                          <button
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, foto: "" })}
                            className="h-[38px] px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold transition-colors cursor-pointer border border-red-200"
                          >
                            Hapus Foto
                          </button>
                        )}
                      </div>

                      {/* URL input fallback */}
                      <div className="flex items-center gap-2">
                        <ImageIcon size={14} className="text-[#707175] shrink-0" />
                        <input
                          type="text"
                          value={profileForm.foto}
                          onChange={(e) => setProfileForm({ ...profileForm, foto: e.target.value })}
                          placeholder="Atau tempel link URL foto..."
                          className="w-full h-[34px] px-3 rounded-lg bg-white border border-[#E2E2DF] text-[11px] text-[#0E0F12] outline-none focus:border-[#0E0F12]"
                        />
                      </div>

                      {/* Quick Avatar Presets */}
                      <div>
                        <span className="text-[10px] text-[#707175] font-semibold block mb-1">
                          Atau pilih avatar preset:
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {AVATAR_PRESETS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setProfileForm({ ...profileForm, foto: p.url })}
                              className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer shrink-0 ${
                                profileForm.foto === p.url ? "border-[#0E0F12] ring-2 ring-[#D5F066]" : "border-white"
                              }`}
                              title={p.label}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Grid Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A3B40] uppercase tracking-wider mb-1.5">
                      USERNAME (@) <span className="text-red-500">*</span>
                    </label>
                    <div className="h-[46px] px-3.5 rounded-xl border border-[#E2E2DF] bg-white flex items-center gap-2 focus-within:border-[#0E0F12] transition-all">
                      <span className="text-[#707175] font-bold text-[13px]">@</span>
                      <input
                        type="text"
                        required
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        placeholder="username"
                        className="w-full text-[13px] font-medium text-[#0E0F12] outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A3B40] uppercase tracking-wider mb-1.5">
                      NAMA LENGKAP <span className="text-red-500">*</span>
                    </label>
                    <div className="h-[46px] px-3.5 rounded-xl border border-[#E2E2DF] bg-white flex items-center gap-2 focus-within:border-[#0E0F12] transition-all">
                      <User size={15} className="text-[#707175]" />
                      <input
                        type="text"
                        required
                        value={profileForm.nama}
                        onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                        placeholder="Risky Nabil"
                        className="w-full text-[13px] font-medium text-[#0E0F12] outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Instansi / Perusahaan */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A3B40] uppercase tracking-wider mb-1.5">
                      NAMA PERUSAHAAN / INSTANSI
                    </label>
                    <div className="h-[46px] px-3.5 rounded-xl border border-[#E2E2DF] bg-white flex items-center gap-2 focus-within:border-[#0E0F12] transition-all">
                      <Briefcase size={15} className="text-[#707175]" />
                      <input
                        type="text"
                        value={profileForm.instansi}
                        onChange={(e) => setProfileForm({ ...profileForm, instansi: e.target.value })}
                        placeholder="PT Risky Maju Mundur"
                        className="w-full text-[13px] font-medium text-[#0E0F12] outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Nomor Telepon / WhatsApp */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A3B40] uppercase tracking-wider mb-1.5">
                      NO. TELEPON / WHATSAPP
                    </label>
                    <div className="h-[46px] px-3.5 rounded-xl border border-[#E2E2DF] bg-white flex items-center gap-2 focus-within:border-[#0E0F12] transition-all">
                      <Phone size={15} className="text-[#707175]" />
                      <input
                        type="text"
                        value={profileForm.telp}
                        onChange={(e) => setProfileForm({ ...profileForm, telp: e.target.value })}
                        placeholder="085790519397"
                        className="w-full text-[13px] font-medium text-[#0E0F12] outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A3B40] uppercase tracking-wider mb-1.5">
                      EMAIL AKUN
                    </label>
                    <div className="h-[46px] px-3.5 rounded-xl border border-[#E2E2DF] bg-white flex items-center gap-2 focus-within:border-[#0E0F12] transition-all">
                      <Mail size={15} className="text-[#707175]" />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="member@uhub.space"
                        className="w-full text-[13px] font-medium text-[#0E0F12] outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Ganti Password (Opsional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A3B40] uppercase tracking-wider mb-1.5">
                      GANTI PASSWORD <span className="text-[10px] text-[#707175] font-normal">(Opsional)</span>
                    </label>
                    <div className="h-[46px] px-3.5 rounded-xl border border-[#E2E2DF] bg-white flex items-center gap-2 focus-within:border-[#0E0F12] transition-all">
                      <Lock size={15} className="text-[#707175]" />
                      <input
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        placeholder="Kosongkan jika tak diubah"
                        className="w-full text-[13px] font-medium text-[#0E0F12] outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Alamat Lengkap */}
                <div>
                  <label className="block text-[11px] font-bold text-[#3A3B40] uppercase tracking-wider mb-1.5">
                    ALAMAT DOMISILI / KANTOR
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-[#E2E2DF] bg-white flex items-start gap-2 focus-within:border-[#0E0F12] transition-all">
                    <MapPin size={15} className="text-[#707175] mt-1 shrink-0" />
                    <textarea
                      rows={2}
                      value={profileForm.alamat}
                      onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                      placeholder="Jl. Sudirman No. 123, Jakarta Selatan..."
                      className="w-full text-[13px] font-medium text-[#0E0F12] outline-none bg-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Success Banner */}
                {profileSaveSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="font-semibold">Profil berhasil disimpan dan diperbarui!</span>
                  </div>
                )}

                {/* Modal CTA Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E2DF]">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="h-[46px] px-6 rounded-full bg-[#F6F6F4] hover:bg-[#E2E2DF] text-[#0E0F12] text-[13px] font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="h-[46px] px-7 rounded-full bg-[#0E0F12] text-white hover:bg-black text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-75"
                  >
                    {isSavingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} className="text-[#D5F066]" />
                        <span>Simpan Perubahan Profil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
