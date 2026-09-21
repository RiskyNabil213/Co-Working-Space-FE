"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  ShieldCheck,
  User,
  CheckCircle2,
} from "lucide-react";

import { authApi, setAuthSession } from "@/lib/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin_space1");
  const [password, setPassword] = useState("Admin123!");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await authApi.login({ username, password });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Kredensial login admin salah!");
        return;
      }

      const userData = res.data;
      if (userData.role !== "admin_space") {
        setErrorMessage("Akun ini bukan merupakan akun Admin Space!");
        return;
      }

      const adminUser = {
        id: userData.id,
        nama: userData.space_owner?.nama_pemilik || userData.username,
        username: userData.username,
        email: `${userData.username}@uhub.space`,
        role: "admin_space",
        profesi: "Space Owner / Facility Manager",
        perusahaan: userData.space_owner?.nama_coworking || "UHUB Moklet",
        telp: userData.space_owner?.telp || "",
        owner_id: userData.space_owner?.id,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      };

      setAuthSession(userData.access_token, adminUser);
      setLoginSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghubungkan ke backend API!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] md:bg-[#F6F6F4] flex items-center justify-center p-0 md:p-6 lg:p-10 selection:bg-[#D5F066] selection:text-[#0E0F12]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="w-full max-w-[1280px] min-h-screen md:min-h-[720px] bg-white md:rounded-[32px] overflow-hidden border-0 md:border md:border-[#E2E2DF] shadow-xs flex flex-col lg:flex-row p-0 md:p-4 lg:p-6 gap-6"
      >
        {/* Left Admin Panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative w-full lg:w-[46%] min-h-[380px] lg:min-h-[680px] rounded-[24px] lg:rounded-[28px] overflow-hidden bg-[#0E0F12] flex flex-col justify-between p-6 sm:p-8 text-white"
        >
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85"
            alt="Admin Control Console"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <motion.img
                whileHover={{ scale: 1.08 }}
                src="/img/logo.svg"
                alt="UHUB Logo"
                className="h-7 w-auto object-contain brightness-0 invert"
              />
              <span className="font-extrabold text-[12px] tracking-tight bg-white/20 px-2 py-0.5 rounded-full text-white">
                ADMIN
              </span>
            </Link>
            <span className="bg-[#D5F066] text-[#0E0F12] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
              Facility Portal
            </span>
          </div>

          {/* Bottom Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative z-10 bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[20px] p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 text-[#D5F066] text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={16} />
              <span>FACILITY & SPACE MANAGER CONSOLE</span>
            </div>
            <h3 className="text-[18px] font-bold text-white">
              Moklet Hub Coworking Operations
            </h3>
            <p className="text-[12px] text-white/70 mt-1 leading-relaxed">
              Manage member check-ins, automated door locks, room reservations,
              real-time revenue reports, and seasonal promo vouchers.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Form Console */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-full lg:w-[54%] bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-8">
              <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[#707175] hover:text-[#0E0F12] transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Switch to Member Login</span>
                </Link>
              </motion.div>
              <Link
                href="/register/admin"
                className="text-[13px] font-bold text-[#0E0F12] hover:underline"
              >
                Register Location ↗
              </Link>
            </div>

            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F6F4] border border-[#E2E2DF] text-[11px] font-bold text-[#707175] uppercase tracking-wider mb-3">
                <Building2 size={12} />
                <span>ADMIN SPACE AUTHENTICATION</span>
              </div>
              <h1 className="text-[32px] sm:text-[38px] font-extrabold text-[#0E0F12] tracking-tight">
                Manager Portal Log In
              </h1>
              <p className="text-[14px] text-[#707175] mt-2">
                Sign in with your registered manager credentials to access the coworking space control dashboard.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {loginSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 rounded-[20px] bg-[#ECFDF5] border border-[#A7F3D0] text-center flex flex-col items-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  >
                    <CheckCircle2 size={48} className="text-[#10B981] mb-3" />
                  </motion.div>
                  <h3 className="text-[20px] font-bold text-[#0E0F12]">
                    Admin Session Active!
                  </h3>
                  <p className="text-[14px] text-[#707175] mt-2 max-w-[400px]">
                    Welcome back, manager. You have full access to manage spaces, members, and reservations.
                  </p>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Link
                      href="/admin"
                      className="mt-6 bg-[#0E0F12] text-white text-[14px] font-bold px-8 py-3 rounded-full hover:bg-black transition-all inline-block"
                    >
                      Go to Admin Management Console →
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px]"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  {/* Username */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1.5">
                      MANAGER USERNAME (<span className="font-mono lowercase text-[#707175]">`username`</span>) *
                    </label>
                    <div className="h-[50px] border border-[#E2E2DF] rounded-[12px] px-4 bg-white flex items-center gap-3 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                      <User size={16} className="text-[#707175]" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin_space1"
                        required
                        className="w-full text-[14px] font-medium text-[#0E0F12] outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1.5">
                      SECURITY PASSWORD (<span className="font-mono lowercase text-[#707175]">`password`</span>) *
                    </label>
                    <div className="h-[50px] border border-[#E2E2DF] rounded-[12px] px-4 bg-white flex items-center justify-between focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                      <div className="flex items-center gap-3 flex-1 mr-2">
                        <Lock size={16} className="text-[#707175]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full text-[14px] font-medium text-[#0E0F12] outline-none bg-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#707175] hover:text-[#0E0F12] p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[52px] rounded-full bg-[#0E0F12] text-white hover:bg-[#D5F066] hover:text-[#0E0F12] text-[15px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <span>Authenticating...</span>
                      ) : (
                        <>
                          <span>Log In to Manager Console</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 pt-6 border-t border-[#E2E2DF]/60 text-center font-mono text-[11px] text-[#707175]">
            UKK RPL 2026/2027 • UHUB Admin Space Manager Service
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
