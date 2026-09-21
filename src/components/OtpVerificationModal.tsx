"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { authApi } from "@/lib/api";

interface OtpVerificationModalProps {
  isOpen?: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess?: (email: string) => void;
  title?: string;
  description?: string;
}

export default function OtpVerificationModal({
  isOpen = true,
  initialEmail = "",
  onClose,
  onSuccess,
  title,
  description,
}: OtpVerificationModalProps) {
  const [step, setStep] = useState<"request" | "verify">(
    initialEmail ? "verify" : "request"
  );
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update email if initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setStep("verify");
    }
  }, [initialEmail]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first OTP box when entering verify step
  useEffect(() => {
    if (step === "verify" && !isVerified) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step, isVerified]);

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // If pasted multi-digit string (e.g. 6 digits)
    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split("");
      const newOtp = [...otp];
      chars.forEach((c, i) => {
        if (i < 6) newOtp[i] = c;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    // Single digit input
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto focus next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const autofillCode = (code: string) => {
    const digits = code.split("").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Harap masukkan alamat email yang valid.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setStatusMsg("");

    try {
      const res = await authApi.sendOtp(email);
      if (!res.success) {
        throw new Error(res.message || "Gagal mengirim kode OTP");
      }

      const receivedOtp = (res as any).debugOtp || (res.data as any)?.debugOtp;
      if (receivedOtp) {
        setDebugCode(receivedOtp);
        autofillCode(receivedOtp);
      }

      setStatusMsg(res.message || "Kode OTP telah dibuat.");
      setStep("verify");
      setCountdown(60); // 60s cooldown for resend
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal terhubung ke layanan pengiriman email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setErrorMsg("Harap lengkapi 6 digit kode OTP.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await authApi.verifyOtp(email, otpCode);
      if (!res.success) {
        throw new Error(res.message || "Kode OTP tidak valid atau telah kedaluwarsa.");
      }

      setIsVerified(true);
      setStatusMsg("Email Anda berhasil diverifikasi!");

      setTimeout(() => {
        if (onSuccess) onSuccess(email);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Verifikasi OTP gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[440px] bg-white rounded-[28px] border border-[#E2E2DF] shadow-2xl p-6 sm:p-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F6F4] text-[#707175] hover:text-[#0E0F12] hover:bg-[#E2E2DF] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>

          {/* Top Brand / Security Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-[#D5F066] text-[#0E0F12] flex items-center justify-center shadow-xs">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-[#0E0F12] tracking-tight">
                {title || (step === "request" ? "Verifikasi Email Akun" : "Masukkan Kode OTP")}
              </h3>
              <p className="text-[12px] text-[#707175]">
                {description || "Keamanan akun dengan verifikasi OTP"}
              </p>
            </div>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {statusMsg && !isVerified && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2"
            >
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>{statusMsg}</span>
            </motion.div>
          )}

          {/* Verified Success State */}
          {isVerified ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981] flex items-center justify-center mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-[18px] font-bold text-[#0E0F12]">
                Verifikasi OTP Berhasil!
              </h4>
              <p className="text-[13px] text-[#707175] mt-1.5 max-w-[280px]">
                Email <span className="font-semibold text-[#0E0F12]">{email}</span> telah terverifikasi. Melanjutkan pendaftaran...
              </p>
            </motion.div>
          ) : step === "request" ? (
            /* STEP 1: REQUEST EMAIL FORM */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#3A3B40] uppercase mb-1.5">
                  Alamat Email Penerima <span className="text-red-500">*</span>
                </label>
                <div className="h-[48px] border border-[#E2E2DF] rounded-[14px] px-3.5 bg-[#FBFBFA] flex items-center gap-2.5 focus-within:bg-white focus-within:border-[#0E0F12] focus-within:ring-2 focus-within:ring-[#0E0F12]/10 transition-all">
                  <Mail size={16} className="text-[#707175] shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="namaanda@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-[13px] font-medium text-[#0E0F12] placeholder:text-[#A1A1A5] bg-transparent outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#707175] mt-1.5">
                  Kode 6-digit akan dikirimkan langsung ke kotak masuk email yang Anda masukkan.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-[13px] font-semibold text-[#707175] hover:text-[#0E0F12] hover:bg-[#F6F6F4] rounded-full transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="px-6 py-2.5 text-[13px] font-bold bg-[#D5F066] text-[#0E0F12] rounded-full hover:brightness-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#0E0F12] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Kirim Kode OTP</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: VERIFY OTP FORM */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-[#3A3B40] uppercase">
                    Kode 6-Digit OTP
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="text-[11px] text-[#0E0F12] font-semibold underline hover:text-black cursor-pointer"
                  >
                    Ganti Email
                  </button>
                </div>

                <div className="text-[12px] text-[#707175] mb-3">
                  Terkirim ke: <strong className="text-[#0E0F12]">{email}</strong> (Berlaku 5 menit)
                </div>

                {debugCode && (
                  <div className="mb-3 p-2.5 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-between">
                    <span className="text-[11px] text-[#52525B]">
                      Kode Verifikasi: <strong className="font-mono text-[#0E0F12] text-[13px] tracking-wider">{debugCode}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => autofillCode(debugCode)}
                      className="text-[11px] font-bold text-[#0E0F12] bg-[#D5F066] px-2.5 py-1 rounded-lg hover:brightness-95 cursor-pointer"
                    >
                      Isi Otomatis
                    </button>
                  </div>
                )}

                {/* 6 Digit Input Grid */}
                <div className="grid grid-cols-6 gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="h-[52px] text-center text-[20px] font-bold text-[#0E0F12] bg-[#FBFBFA] border border-[#E2E2DF] rounded-[12px] focus:bg-white focus:border-[#0E0F12] focus:ring-2 focus:ring-[#0E0F12]/10 outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP Section */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[12px] text-[#707175]">
                  Tidak menerima email?
                </span>
                {countdown > 0 ? (
                  <span className="text-[12px] font-medium text-[#707175]">
                    Kirim ulang ({countdown}s)
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendOtp()}
                    className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0E0F12] hover:underline cursor-pointer"
                  >
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                    <span>Kirim Ulang</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-[13px] font-semibold text-[#707175] hover:text-[#0E0F12] hover:bg-[#F6F6F4] rounded-full transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="flex-1 py-3 text-[13px] font-bold bg-[#D5F066] text-[#0E0F12] rounded-full hover:brightness-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#0E0F12] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound size={15} />
                      <span>Verifikasi OTP</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
