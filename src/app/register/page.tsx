"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Check,
  User,
  Building,
  Phone,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { authApi, setAuthSession } from "@/lib/api";
import OtpVerificationModal from "@/components/OtpVerificationModal";

export default function RegisterMemberPage() {
  const [formData, setFormData] = useState({
    nama_member: "",
    instansi: "",
    telp: "",
    email: "",
    username: "",
    alamat: "",
    password: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Ukuran file foto maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setAvatarPreview(base64Url);
      };
      reader.readAsDataURL(file);
    }
  };

  // Password strength calculation (0 to 4)
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const pwdStrength = getPasswordStrength(formData.password);

  const executeRegistration = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await authApi.registerMember({
        username: formData.username,
        password: formData.password,
        nama_member: formData.nama_member,
        instansi: formData.instansi,
        alamat: formData.alamat,
        telp: formData.telp,
        foto: avatarPreview || null,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Registrasi gagal. Silakan coba lagi.");
        return;
      }

      const userData = res.data;
      const token = res.token || "";
      const newUser = {
        id: userData.id,
        nama: userData.nama_member || formData.nama_member,
        username: userData.username || formData.username,
        email: formData.email || `${userData.username || formData.username}@uhub.space`,
        role: "member",
        profesi: userData.instansi || formData.instansi || "Member",
        perusahaan: userData.instansi || formData.instansi || "UHUB Space",
        telp: userData.telp || formData.telp,
        alamat: userData.alamat || formData.alamat,
        member_id: userData.member_id || userData.id,
        avatar:
          userData.foto ||
          avatarPreview ||
          null,
      };

      setAuthSession(token, newUser);
      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat registrasi member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMessage("Silakan setujui Ketentuan Layanan dan Kebijakan Privasi.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password minimal 6 karakter.");
      return;
    }
    if (!formData.email || !formData.email.includes("@")) {
      setErrorMessage("Silakan masukkan alamat email Gmail yang valid untuk verifikasi OTP.");
      return;
    }

    setErrorMessage("");

    // Jika sudah diverifikasi sebelumnya, langsung registrasi
    if (isOtpVerified) {
      await executeRegistration();
      return;
    }

    // Jika belum diverifikasi, kirim OTP dan buka modal verifikasi
    setIsSubmitting(true);
    try {
      const res = await authApi.sendOtp(formData.email);
      if (!res.success) {
        setErrorMessage(res.message || "Gagal mengirimkan kode OTP ke Gmail.");
        return;
      }
      setShowOtpModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengirimkan kode OTP ke Gmail.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSuccess = async () => {
    setIsOtpVerified(true);
    setShowOtpModal(false);
    await executeRegistration();
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F6F4] flex items-center justify-center p-0 md:p-6 lg:p-8 selection:bg-[#D5F066] selection:text-[#0E0F12]">
      {/* Outer Master Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="w-full max-w-[1400px] min-h-screen md:min-h-[920px] bg-white md:rounded-[32px] overflow-hidden border border-[#E2E2DF] shadow-xs flex flex-col lg:flex-row"
      >
        {/* ================= LEFT ARCHITECTURAL VISUAL PANEL (42%) ================= */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative w-full lg:w-[42%] min-h-[320px] lg:min-h-full bg-[#141519] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12"
        >
          {/* Background Photography */}
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85"
            alt="Coworking Space Architecture"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.88]"
          />

          {/* Dark Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50 pointer-events-none" />

          {/* Top Logo / Mobile Brand Mark */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.img
                whileHover={{ scale: 1.08 }}
                src="/img/logo.svg"
                alt="UHUB Logo"
                className="h-7 w-auto object-contain brightness-0 invert"
              />
            </Link>
          </div>

          {/* Center Left Hero Statement */}
          <div className="relative z-10 my-auto py-10 lg:py-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block bg-[#D5F066] text-[#0E0F12] text-[11px] font-extrabold tracking-[0.06em] uppercase px-3 py-1.5 rounded-[6px] mb-4"
            >
              SMART WORKSTATION & PRIVATE OFFICE
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-[clamp(2.1rem,3.8vw,3.25rem)] font-bold tracking-[-0.025em] leading-[1.15] max-w-[420px]"
            >
              Craft your success in architect-designed spaces.
            </motion.h2>
          </div>

          {/* Bottom Glassmorphic Social Proof Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="relative z-10 hidden sm:block bg-[rgba(20,21,25,0.72)] backdrop-blur-[20px] border border-white/18 rounded-[20px] p-5 sm:p-6 mt-6 shadow-xl"
          >
            {/* Top Row: Avatars + Stats */}
            <div className="flex items-center gap-3.5">
              {/* Overlapping Avatar Stack */}
              <div className="flex items-center -space-x-2.5">
                <div className="w-[34px] h-[34px] rounded-full bg-[#2B2D33] border-2 border-[#0E0F12] flex items-center justify-center text-white text-[11px] font-bold">
                  JD
                </div>
                <div className="w-[34px] h-[34px] rounded-full bg-[#3F424A] border-2 border-[#0E0F12] flex items-center justify-center text-white text-[11px] font-bold">
                  AS
                </div>
                <div className="w-[34px] h-[34px] rounded-full bg-[#D5F066] border-2 border-[#0E0F12] flex items-center justify-center text-[#0E0F12] text-[11px] font-bold">
                  21+
                </div>
              </div>

              {/* Stats Meta */}
              <div className="flex flex-col">
                <h4 className="text-[13px] font-bold text-white leading-tight">
                  Joined by 1,400+ Creative Professionals
                </h4>
                <p className="text-[12px] font-normal text-white/65 mt-0.5">
                  Across 21 Locations in 2 Major Cities
                </p>
              </div>
            </div>

            {/* Quote Row */}
            <p className="text-[12px] text-white/75 leading-[1.5] mt-3 pt-3 border-t border-white/10 font-normal">
              &ldquo;Instant access to high-speed fiber internet, private acoustic
              pods, ergonomic sit-stand desks, and vibrant networking
              lounges.&rdquo;
            </p>
          </motion.div>
        </motion.div>

        {/* ================= RIGHT FORM CONSOLE PANEL (58%) ================= */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-full lg:w-[58%] bg-white p-6 sm:p-10 lg:p-14 overflow-y-auto flex flex-col justify-between"
        >
          <div>
            {/* Top Utility Navigation */}
            <div className="flex items-center justify-between mb-8">
              <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[#0E0F12] hover:opacity-70 transition-opacity"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Home</span>
                </Link>
              </motion.div>
              <div className="text-[13px] text-[#707175]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#0E0F12] underline hover:text-black transition-colors"
                >
                  Log In ↗
                </Link>
              </div>
            </div>

            {/* Title & Introduction Block */}
            <div className="mb-8">
              <h1 className="text-[clamp(2.1rem,3.5vw,2.75rem)] font-extrabold text-[#0E0F12] tracking-[-0.03em] leading-[1.1]">
                Register Member Account
              </h1>
              <p className="text-[14px] text-[#707175] leading-[1.55] mt-2.5 max-w-[560px]">
                Create your verified member profile to explore workspace catalogs,
                book soundproof meeting pods, and manage active workstation passes.
              </p>
            </div>

            {/* Success State Overlay or Form */}
            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 sm:p-10 rounded-[24px] bg-[#ECFDF5] border border-[#A7F3D0] text-center flex flex-col items-center my-6"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  >
                    <CheckCircle2 size={54} className="text-[#10B981] mb-4" />
                  </motion.div>
                  <h3 className="text-[22px] font-bold text-[#0E0F12]">
                    Registration Successful!
                  </h3>
                  <p className="text-[14px] text-[#707175] mt-2 max-w-[460px] leading-relaxed">
                    Welcome to UHUB, <span className="font-bold text-[#0E0F12]">{formData.nama_member}</span>! Your member credential has been registered. You can now log in or continue to your dashboard.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Link
                        href="/"
                        className="bg-[#D5F066] text-[#0E0F12] text-[14px] font-bold px-8 py-3.5 rounded-full hover:brightness-95 transition-all shadow-xs inline-block"
                      >
                        Explore Spaces Now →
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Link
                        href="/login"
                        className="bg-white text-[#0E0F12] text-[14px] font-semibold px-6 py-3.5 rounded-full border border-[#E2E2DF] hover:bg-[#F6F6F4] transition-colors inline-block"
                      >
                        Go to Member Login
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px]"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  {/* 1. Avatar Upload Row */}
                  <div className="flex items-center gap-5 p-4 rounded-[16px] bg-[#F6F6F4] border border-[#E2E2DF]">
                    <div className="relative">
                      <div className="w-[64px] h-[64px] rounded-full overflow-hidden bg-[#E2E2DF] flex items-center justify-center border-2 border-white shadow-xs">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={28} className="text-[#707175]" />
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-[24px] h-[24px] rounded-full bg-[#0E0F12] text-white flex items-center justify-center hover:bg-[#D5F066] hover:text-[#0E0F12] transition-colors cursor-pointer shadow-sm"
                        aria-label="Upload Avatar"
                      >
                        <Camera size={12} />
                      </motion.button>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-[13px] font-bold text-[#0E0F12]">
                        Profile Avatar Picture
                      </h4>
                      <p className="text-[11px] text-[#707175] mt-0.5">
                        Supports PNG, JPG, or WebP (max. 2MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[12px] font-bold text-[#0E0F12] underline mt-1 hover:text-black cursor-pointer"
                      >
                        Choose Image File
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  {/* 2. Full Name & Organization Split Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1.5">
                        FULL NAME (<span className="font-mono lowercase text-[#707175]">`nama_member`</span>){" "}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-3.5 bg-white flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <User size={15} className="text-[#707175] shrink-0" />
                        <input
                          type="text"
                          name="nama_member"
                          value={formData.nama_member}
                          onChange={handleInputChange}
                          placeholder="e.g. John Doe"
                          required
                          className="w-full text-[13px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Institution / Company */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1.5">
                        COMPANY / INSTANSI (<span className="font-mono lowercase text-[#707175]">`instansi`</span>){" "}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-3.5 bg-white flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <Building size={15} className="text-[#707175] shrink-0" />
                        <input
                          type="text"
                          name="instansi"
                          value={formData.instansi}
                          onChange={handleInputChange}
                          placeholder="e.g. PT Maju Digital"
                          required
                          className="w-full text-[13px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Phone Number, Email & Username Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1.5">
                        PHONE NUMBER (<span className="font-mono lowercase text-[#707175]">`telp`</span>){" "}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-3.5 bg-white flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <Phone size={15} className="text-[#707175] shrink-0" />
                        <input
                          type="tel"
                          name="telp"
                          value={formData.telp}
                          onChange={handleInputChange}
                          placeholder="081234567890"
                          required
                          className="w-full text-[13px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase">
                          EMAIL ADDRESS (<span className="font-mono lowercase text-[#707175]">`verifikasi otp`</span>){" "}
                          <span className="text-[#EF4444]">*</span>
                        </label>
                        {isOtpVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            <ShieldCheck size={11} /> Verified
                          </span>
                        )}
                      </div>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-3.5 bg-white flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <Mail size={15} className="text-[#707175] shrink-0" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={(e) => {
                            handleInputChange(e);
                            setIsOtpVerified(false);
                          }}
                          placeholder="namaanda@email.com"
                          required
                          className="w-full text-[13px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1.5">
                        USERNAME (<span className="font-mono lowercase text-[#707175]">`username`</span>){" "}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-3.5 bg-white flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <AtSign size={15} className="text-[#707175] shrink-0" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="johndoe"
                          required
                          className="w-full text-[13px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Complete Address */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1.5">
                      COMPLETE ADDRESS (<span className="font-mono lowercase text-[#707175]">`alamat`</span>){" "}
                      <span className="text-[#EF4444]">*</span>
                    </label>
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="e.g. Jl. Danau Ranau No. 1, Sawojajar, Malang, Jawa Timur"
                      required
                      className="w-full p-3.5 border border-[#E2E2DF] rounded-[12px] text-[13px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-white focus:border-[#0E0F12] focus:ring-2 focus:ring-[#0E0F12]/10 transition-all outline-none resize-none"
                    />
                  </div>

                  {/* 5. Password & Strength Indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase">
                        SECURITY PASSWORD (<span className="font-mono lowercase text-[#707175]">`password`</span>){" "}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <span className="text-[11px] text-[#707175]">
                        Min. 6 characters
                      </span>
                    </div>

                    <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-3.5 bg-white flex items-center justify-between focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                      <div className="flex items-center gap-2.5 flex-1 mr-2">
                        <Lock size={15} className="text-[#707175] shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create strong password..."
                          required
                          className="w-full text-[13px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#707175] hover:text-[#0E0F12] transition-colors p-1 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#E2E2DF] rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((step) => (
                            <motion.div
                              key={step}
                              initial={{ width: 0 }}
                              animate={{ width: "25%" }}
                              className={`h-full rounded-full transition-colors ${step <= pwdStrength
                                  ? pwdStrength <= 1
                                    ? "bg-[#EF4444]"
                                    : pwdStrength === 2
                                      ? "bg-[#F59E0B]"
                                      : "bg-[#10B981]"
                                  : "bg-transparent"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-[#707175] capitalize">
                          {pwdStrength <= 1
                            ? "Weak"
                            : pwdStrength === 2
                              ? "Medium"
                              : "Strong"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 6. Terms & Conditions Agreement */}
                  <div className="flex items-start gap-3 pt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className={`w-[18px] h-[18px] min-w-[18px] mt-0.5 rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${agreeTerms
                          ? "bg-[#0E0F12] border border-[#0E0F12] text-white"
                          : "bg-white border border-[#C4C4C0]"
                        }`}
                      aria-label="Agree to Terms of Service"
                    >
                      {agreeTerms && <Check size={12} strokeWidth={3} />}
                    </motion.button>
                    <label
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className="text-[12px] text-[#707175] leading-normal select-none cursor-pointer"
                    >
                      I agree to the{" "}
                      <Link
                        href="#"
                        className="font-semibold text-[#0E0F12] underline hover:text-black"
                      >
                        UHUB Workspace Membership Terms
                      </Link>{" "}
                      and acknowledge the house rules & safety protocols.
                    </label>
                  </div>

                  {/* 7. Primary CTA Submit */}
                  <div className="pt-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[52px] rounded-full bg-[#D5F066] text-[#0E0F12] text-[15px] font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-xs disabled:opacity-75 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-[#0E0F12] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Register Member Account</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* 8. Divider & Facility Admin Switcher */}
                  <div className="pt-4">
                    <div className="relative flex items-center justify-center">
                      <div className="w-full border-t border-[#E2E2DF]"></div>
                      <span className="absolute bg-white px-3.5 text-[11px] font-bold tracking-[0.06em] uppercase text-[#707175]">
                        OR FACILITY ADMIN
                      </span>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/register/admin"
                        className="mt-4 w-full h-[46px] rounded-full border border-[#E2E2DF] bg-white text-[#0E0F12] text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F6F6F4] transition-colors block text-center pt-2.5"
                      >
                        <span className="inline-flex items-center gap-1">
                          <span>Register as Space / Facility Manager</span>
                          <ArrowUpRight size={15} />
                        </span>
                      </Link>
                    </motion.div>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>

          {/* 9. Bottom Accreditation Footer */}
          <div className="mt-10 pt-6 text-center text-[12px] text-[#A1A1A5] tracking-[0.02em]">
            UKK RPL 2026/2027 • UHUB Coworking Platform
          </div>
        </motion.div>
      </motion.div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OtpVerificationModal
          isOpen={showOtpModal}
          initialEmail={formData.email}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          title="Verifikasi OTP Registrasi"
          description="Masukkan 6-digit kode yang dikirim ke Gmail Anda"
        />
      )}
    </div>
  );
}
