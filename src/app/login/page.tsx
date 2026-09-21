"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  ExternalLink,
  QrCode,
  Check,
  CheckCircle2,
} from "lucide-react";

import { authApi, setAuthSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("johndoe");
  const [password, setPassword] = useState("Secret123!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("Silakan masukkan username dan password.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await authApi.login({ username, password });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Username atau password salah!");
        return;
      }

      const userData = res.data;
      const token = res.token || "";
      const userObj = {
        id: userData.id,
        nama: userData.nama_member || userData.nama_coworking || userData.nama_pemilik || userData.username,
        username: userData.username,
        email: `${userData.username}@uhub.space`,
        role: userData.role,
        profesi: userData.instansi || (userData.role === "admin_space" ? "Facility Manager" : "Member"),
        perusahaan: userData.instansi || userData.nama_coworking || "UHUB Space",
        telp: userData.telp || "",
        alamat: userData.alamat || "",
        member_id: userData.member_id || userData.id,
        owner_id: userData.owner_id,
        app_key: userData.app_key,
        avatar: userData.foto || null,
      };

      setAuthSession(token, userObj);
      setLoginSuccess(true);

      setTimeout(() => {
        if (userData.role === "admin_space" || userData.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal melakukan login. Periksa koneksi backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] md:bg-[#F6F6F4] flex items-center justify-center p-0 md:p-6 lg:p-10 selection:bg-[#D5F066] selection:text-[#0E0F12]">
      {/* Outer Master Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="w-full max-w-[1360px] min-h-screen md:min-h-[760px] bg-white md:rounded-[32px] overflow-hidden border-0 md:border md:border-[#E2E2DF] shadow-xs flex flex-col lg:flex-row p-0 md:p-4 lg:p-6 gap-6"
      >
        {/* ================= LEFT ATMOSPHERIC VISUAL PANEL (46%) ================= */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative w-full lg:w-[46%] min-h-[420px] lg:min-h-[700px] rounded-[24px] lg:rounded-[28px] overflow-hidden bg-[#111215] flex flex-col justify-between p-6 sm:p-8"
        >
          {/* Background Photography - Night Loft Architecture */}
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=85"
            alt="Evening Workspace View"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.85]"
          />

          {/* Dark Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30 pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.img
                whileHover={{ scale: 1.08 }}
                src="/img/logo.svg"
                alt="UHUB Logo"
                className="h-30 w-auto object-contain brightness-0 invert"
              />
            </Link>
          </div>

          {/* Bottom Glassmorphic Digital Pass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative z-10 bg-[rgba(18,19,23,0.75)] backdrop-blur-[20px] border border-white/14 rounded-[20px] p-5 sm:p-6 shadow-2xl"
          >
            {/* Top Meta Row */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center bg-[#D5F066] text-[#0E0F12] text-[10px] font-extrabold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full">
                DIGITAL PASS TOKEN
              </span>
              <span className="font-mono text-[11px] text-white/50">
                ID: #UHUB-8821
              </span>
            </div>

            {/* Card Title & Description */}
            <h3 className="text-white text-[18px] font-bold mt-3.5 tracking-[-0.01em]">
              Seamless Check-in via Digital QR
            </h3>
            <p className="text-[12px] text-white/70 leading-[1.5] mt-1.5 font-normal">
              Access booked meeting rooms, dedicated desks, and member perks with
              zero waiting time at automated turnstiles.
            </p>

            {/* Bottom Status Sub-Card */}
            <div className="mt-4 bg-black/45 border border-white/10 rounded-[14px] p-3 sm:p-3.5 flex items-center justify-between gap-3">
              {/* Left Group */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 min-w-9 rounded-[8px] bg-white flex items-center justify-center text-[#0E0F12] shadow-sm">
                  <QrCode size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-white leading-tight">
                    Dynamic Keycard Ready
                  </span>
                  <span className="text-[11px] text-white/50 mt-0.5">
                    Turnstile Sensor Proximity: Active
                  </span>
                </div>
              </div>

              {/* Right Fiber Status Tag */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D5F066]/15 border border-[#D5F066]/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                <span className="text-[11px] font-semibold text-[#D5F066]">
                  1Gbps Fiber
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ================= RIGHT FORM CONSOLE PANEL (54%) ================= */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-full lg:w-[54%] bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between"
        >
          <div>
            {/* Top Utility Navigation Row */}
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/#spaces"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[#707175] hover:text-[#0E0F12] transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Spaces</span>
                </Link>
              </motion.div>
              <div className="text-[13px] text-[#707175]">
                New to UHUB?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#0E0F12] hover:underline transition-all inline-flex items-center gap-1"
                >
                  <span>Register Account</span>
                  <span className="text-[12px]">↗</span>
                </Link>
              </div>
            </div>

            {/* Header Block */}
            <div className="mb-8">
              <h1 className="text-[clamp(2.1rem,3.5vw,2.75rem)] font-extrabold text-[#0E0F12] tracking-[-0.03em] leading-[1.1]">
                Welcome Back
              </h1>
              <p className="text-[14px] text-[#707175] leading-[1.55] mt-2.5 max-w-[520px]">
                Enter your member credentials to access your active bookings,
                workstation passes, and facility keycards.
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
                    Login Successful!
                  </h3>
                  <p className="text-[14px] text-[#707175] mt-2 max-w-[420px]">
                    Welcome back, <span className="font-semibold text-[#0E0F12]">{username}</span>. Redirecting you to your workstation dashboard...
                  </p>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Link
                      href="/dashboard"
                      className="mt-6 bg-[#D5F066] text-[#0E0F12] text-[14px] font-bold px-8 py-3 rounded-full hover:brightness-95 transition-all shadow-xs inline-block"
                    >
                      Open Dashboard →
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

                  {/* 1. Username Input Field */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1.5">
                      USERNAME (<span className="font-mono lowercase text-[#707175]">`username`</span>){" "}
                      <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="h-[50px] border border-[#E2E2DF] rounded-[12px] px-4 bg-white flex items-center justify-between focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                      <div className="flex items-center gap-3 flex-1 mr-2">
                        <AtSign size={16} className="text-[#707175] shrink-0" />
                        <input
                          type="text"
                          name="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="johndoe"
                          required
                          className="w-full text-[14px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                        />
                      </div>
                      <div className="px-2.5 py-0.5 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] shrink-0">
                        <span className="text-[11px] font-semibold text-[#059669]">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Password Input Field */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase">
                        PASSWORD (<span className="font-mono lowercase text-[#707175]">`password`</span>){" "}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <Link
                        href="#"
                        className="text-[12px] font-medium text-[#707175] hover:text-[#0E0F12] transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <div className="h-[50px] border border-[#E2E2DF] rounded-[12px] px-4 bg-white flex items-center justify-between focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                      <div className="flex items-center gap-3 flex-1 mr-2">
                        <Lock size={16} className="text-[#707175] shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full text-[14px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#707175] hover:text-[#0E0F12] transition-colors p-1 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* 3. Session Persistence Checkbox */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${rememberMe
                        ? "bg-[#0E0F12] border border-[#0E0F12] text-white"
                        : "bg-white border border-[#C4C4C0]"
                        }`}
                      aria-label="Remember for 30 days"
                    >
                      {rememberMe && <Check size={12} strokeWidth={3} />}
                    </motion.button>
                    <span
                      onClick={() => setRememberMe(!rememberMe)}
                      className="text-[13px] font-medium text-[#3A3B40] select-none cursor-pointer"
                    >
                      Remember for 30 days
                    </span>
                  </div>

                  {/* 4. Primary Submit CTA */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[52px] rounded-full bg-[#D5F066] text-[#0E0F12] text-[15px] font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-xs disabled:opacity-75 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-[#0E0F12] border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        <>
                          <span>Log In to Workspace</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* 5. Portal Switcher Divider */}
                  <div className="pt-3">
                    <div className="relative flex items-center justify-center">
                      <div className="w-full border-t border-[#E2E2DF]"></div>
                      <span className="absolute bg-white px-3.5 text-[11px] font-bold tracking-[0.06em] uppercase text-[#707175]">
                        OR SWITCH PORTAL
                      </span>
                    </div>
                  </div>

                  {/* 6. Facility & Space Manager Switcher Card */}
                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/login/admin"
                      className="w-full h-[60px] border border-[#E2E2DF] rounded-[14px] px-5 bg-white flex items-center justify-between hover:border-[#0E0F12] hover:bg-[#FAFAFA] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-[8px] bg-[#F6F6F4] border border-[#E2E2DF] flex items-center justify-center text-[#0E0F12] group-hover:bg-white transition-colors">
                          <Building2 size={18} />
                        </div>
                        <span className="text-[13px] font-bold text-[#0E0F12]">
                          Facility & Space Manager Portal
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#707175] group-hover:text-[#0E0F12] transition-colors">
                        <span>Access Console</span>
                        <ExternalLink size={14} className="text-[#2563EB]" />
                      </div>
                    </Link>
                  </motion.div>
                </form>
              )}
            </AnimatePresence>
          </div>

          {/* 7. Footer Telemetry & Accreditation */}
          <div className="mt-10 pt-6 border-t border-[#E2E2DF]/60 flex items-center justify-between">
            <div className="font-mono text-[11px] text-[#707175] tracking-[0.02em]">
              UKK RPL 2026/2027 • UHUB Coworking Platform
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
