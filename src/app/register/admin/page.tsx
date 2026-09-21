"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  User,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { authApi, setAuthSession } from "@/lib/api";
import OtpVerificationModal from "@/components/OtpVerificationModal";

export default function RegisterAdminPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    nama_coworking: "",
    nama_pemilik: "",
    telp: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const executeRegistration = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await authApi.registerAdminSpace({
        username: formData.username,
        password: formData.password,
        nama_coworking: formData.nama_coworking,
        nama_pemilik: formData.nama_pemilik,
        telp: formData.telp,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Registrasi admin lokasi gagal!");
        return;
      }

      const userData = res.data;
      const adminUser = {
        id: userData.id,
        nama: formData.nama_pemilik,
        username: userData.username,
        email: formData.email || `${userData.username}@uhub.space`,
        role: "admin_space",
        profesi: "Space Owner / Facility Manager",
        perusahaan: formData.nama_coworking,
        telp: formData.telp,
        owner_id: userData.space_owner?.id,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      };

      setAuthSession(userData.access_token, adminUser);
      setRegisterSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan koneksi saat registrasi admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes("@")) {
      setErrorMessage("Silakan masukkan alamat email Gmail yang valid untuk verifikasi OTP.");
      return;
    }

    setErrorMessage("");

    if (isOtpVerified) {
      await executeRegistration();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.sendOtp(formData.email);
      if (!res.success) {
        setErrorMessage(res.message || "Gagal mengirim kode OTP ke Gmail.");
        return;
      }
      setShowOtpModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengirim kode OTP ke Gmail.");
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
    <div className="min-h-screen w-full bg-[#FFFFFF] md:bg-[#F6F6F4] flex items-center justify-center p-0 md:p-6 lg:p-10 selection:bg-[#D5F066] selection:text-[#0E0F12]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="w-full max-w-[1280px] min-h-screen md:min-h-[760px] bg-white md:rounded-[32px] overflow-hidden border-0 md:border md:border-[#E2E2DF] shadow-xs flex flex-col lg:flex-row p-0 md:p-4 lg:p-6 gap-6"
      >
        {/* Left Visual Panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative w-full lg:w-[44%] min-h-[360px] lg:min-h-full rounded-[24px] lg:rounded-[28px] overflow-hidden bg-[#0E0F12] flex flex-col justify-between p-6 sm:p-8 text-white"
        >
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85"
            alt="Space Manager"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <motion.img
                whileHover={{ scale: 1.08 }}
                src="/img/logo.svg"
                alt="UHUB Logo"
                className="h-7 w-auto object-contain brightness-0 invert"
              />
              <span className="font-extrabold text-[12px] tracking-tight bg-white/20 px-2 py-0.5 rounded-full text-white">
                PARTNER
              </span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative z-10 bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[20px] p-5 sm:p-6"
          >
            <span className="text-[#D5F066] text-[10px] font-bold uppercase tracking-wider block mb-2">
              LIST YOUR SPACE WITH UHUB
            </span>
            <h3 className="text-[18px] font-bold text-white">
              Launch Your Smart Coworking Hub
            </h3>
            <p className="text-[12px] text-white/70 mt-1 leading-relaxed">
              Connect your physical location to automated smart turnstiles,
              real-time reservation ledgers, and digital e-ticketing.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Form Console */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-full lg:w-[56%] bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-8">
              <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[#707175] hover:text-[#0E0F12]"
                >
                  <ArrowLeft size={16} />
                  <span>Switch to Member Registration</span>
                </Link>
              </motion.div>
              <Link
                href="/login/admin"
                className="text-[13px] font-bold text-[#0E0F12] hover:underline"
              >
                Admin Log In ↗
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-[32px] sm:text-[38px] font-extrabold text-[#0E0F12] tracking-tight">
                Register Coworking Location
              </h1>
              <p className="text-[14px] text-[#707175] mt-1.5">
                Register as an Admin / Space Owner to manage workstations and bookings.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {registerSuccess ? (
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
                    Location Registered Successfully!
                  </h3>
                  <p className="text-[14px] text-[#707175] mt-2 max-w-[400px]">
                    Your admin account <span className="font-bold text-[#0E0F12]">{formData.username}</span> is now active.
                  </p>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Link
                      href="/login/admin"
                      className="mt-6 bg-[#0E0F12] text-white text-[14px] font-bold px-8 py-3 rounded-full hover:bg-black transition-all inline-block"
                    >
                      Log In to Manager Console →
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px]"
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1">
                      COWORKING NAME (`nama_coworking`) *
                    </label>
                    <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-4 flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                      <Building2 size={16} className="text-[#707175]" />
                      <input
                        type="text"
                        name="nama_coworking"
                        value={formData.nama_coworking}
                        onChange={handleInputChange}
                        placeholder="e.g. Moklet Hub Coworking"
                        required
                        className="w-full text-[14px] text-[#0E0F12] outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1">
                        OWNER NAME (`nama_pemilik`) *
                      </label>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-4 flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <User size={16} className="text-[#707175]" />
                        <input
                          type="text"
                          name="nama_pemilik"
                          value={formData.nama_pemilik}
                          onChange={handleInputChange}
                          placeholder="e.g. Ahmad Bidin"
                          required
                          className="w-full text-[14px] text-[#0E0F12] outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1">
                        PHONE (`telp`) *
                      </label>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-4 flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <Phone size={16} className="text-[#707175]" />
                        <input
                          type="tel"
                          name="telp"
                          value={formData.telp}
                          onChange={handleInputChange}
                          placeholder="081298765432"
                          required
                          className="w-full text-[14px] text-[#0E0F12] outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase">
                          EMAIL ADDRESS (`verifikasi otp`) *
                        </label>
                        {isOtpVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            <ShieldCheck size={11} /> Verified
                          </span>
                        )}
                      </div>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-4 flex items-center gap-2.5 focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <Mail size={16} className="text-[#707175]" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={(e) => {
                            handleInputChange(e);
                            setIsOtpVerified(false);
                          }}
                          placeholder="admin@perusahaan.com / gmail"
                          required
                          className="w-full text-[14px] text-[#0E0F12] outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1">
                        ADMIN USERNAME (`username`) *
                      </label>
                      <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-4 flex items-center focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="admin_space1"
                          required
                          className="w-full text-[14px] text-[#0E0F12] outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.05em] text-[#3A3B40] uppercase mb-1">
                      PASSWORD (`password`) *
                    </label>
                    <div className="h-[48px] border border-[#E2E2DF] rounded-[12px] px-4 flex items-center justify-between focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <Lock size={16} className="text-[#707175]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••••••"
                          required
                          className="w-full text-[14px] text-[#0E0F12] outline-none bg-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#707175] hover:text-[#0E0F12]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[52px] rounded-full bg-[#0E0F12] text-white hover:bg-[#D5F066] hover:text-[#0E0F12] text-[15px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Register Coworking Location</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E2E2DF]/60 text-center font-mono text-[11px] text-[#707175]">
            UKK RPL 2026/2027 • UHUB Space Admin Registration
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
          title="Verifikasi OTP Admin"
          description="Masukkan kode 6-digit yang dikirim ke Gmail Anda"
        />
      )}
    </div>
  );
}
