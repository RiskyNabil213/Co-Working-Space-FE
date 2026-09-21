"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, LogIn, ArrowLeft, Lock, ArrowRight, Home } from "lucide-react";
import { getCurrentUser, getAuthToken } from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authState, setAuthState] = useState<"checking" | "authorized" | "unauthenticated" | "forbidden">("checking");
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      const user = getCurrentUser();

      if (!token || !user || user === "guest") {
        setAuthState("unauthenticated");
        return;
      }

      setUserInfo(user);

      // Check role: must be admin_space or admin
      if (user.role === "admin_space" || user.role === "admin") {
        setAuthState("authorized");
      } else {
        // User is logged in, but not an admin (e.g. member)
        setAuthState("forbidden");
      }
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [pathname]);

  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-[#0E0F12] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-12 h-12 border-3 border-[#D5F066] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[14px] font-mono text-white/70">Memverifikasi Otoritas Admin Space...</p>
      </div>
    );
  }

  // Case 1: Not logged in at all
  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0E0F12] flex items-center justify-center p-4 sm:p-6 selection:bg-[#D5F066] selection:text-[#0E0F12]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[480px] bg-[#17191E] border border-white/10 rounded-[28px] p-8 text-center shadow-2xl text-white"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock size={32} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
            401 • Autentikasi Diperlukan
          </span>

          <h2 className="text-[24px] font-extrabold text-white tracking-tight mb-2">
            Akses Admin Terkunci
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed mb-6">
            Halaman ini berada di bawah proteksi keamanan. Anda harus login menggunakan akun <strong className="text-white">Admin Space / Facility Manager</strong> untuk mengakses konsol manajemen coworking.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/login/admin"
              className="w-full h-[50px] rounded-full bg-[#D5F066] text-[#0E0F12] text-[14px] font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md cursor-pointer"
            >
              <LogIn size={16} />
              <span>Login sebagai Admin Space</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/"
              className="w-full h-[46px] rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[13px] font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 text-[11px] font-mono text-white/40">
            Sistem Keamanan UHUB Space • UKK RPL 2026/2027
          </div>
        </motion.div>
      </div>
    );
  }

  // Case 2: Logged in as Member (Role mismatch)
  if (authState === "forbidden") {
    return (
      <div className="min-h-screen bg-[#0E0F12] flex items-center justify-center p-4 sm:p-6 selection:bg-[#D5F066] selection:text-[#0E0F12]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[520px] bg-[#17191E] border border-white/10 rounded-[28px] p-8 text-center shadow-2xl text-white"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShieldAlert size={32} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
            403 • Hak Akses Ditolak
          </span>

          <h2 className="text-[24px] font-extrabold text-white tracking-tight mb-2">
            Akses Dibatasi untuk Member
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed mb-4">
            Halo <strong className="text-[#D5F066]">{userInfo?.nama || "Member"}</strong>, Anda saat ini login sebagai akun <strong className="text-white">Member</strong>. Halaman ini khusus diperuntukkan bagi pengelola coworking space.
          </p>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left mb-6">
            <div className="text-[11px] font-mono text-white/40 uppercase mb-1">Status Sesi Aktif:</div>
            <div className="text-[13px] text-white font-medium flex items-center justify-between">
              <span>Username: {userInfo?.username}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#D5F066]/20 text-[#D5F066] text-[11px] font-bold uppercase">
                {userInfo?.role}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full h-[50px] rounded-full bg-[#D5F066] text-[#0E0F12] text-[14px] font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md cursor-pointer"
            >
              <Home size={16} />
              <span>Buka Dashboard Member</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/login/admin"
              className="w-full h-[46px] rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[13px] font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <LogIn size={16} />
              <span>Ganti Akun ke Admin Space</span>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 text-[11px] font-mono text-white/40">
            Sistem Keamanan UHUB Space • UKK RPL 2026/2027
          </div>
        </motion.div>
      </div>
    );
  }

  // Case 3: Authorized
  return <>{children}</>;
}
