"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  CheckCircle,
  WarningCircle,
  ArrowClockwise,
  SignOut,
  ShieldCheck,
} from "@phosphor-icons/react";

// ─── OTP Digit Boxes — bottom-border style matching AuthModal inputs ───────────

function OtpInput({ value, onChange, onVerify, hasError }) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleChange = (index, char) => {
    const cleaned = char.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    const joined = newDigits.join("");
    onChange(joined);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit on last digit
    if (cleaned && index === 5 && newDigits.every(Boolean)) {
      onVerify(joined);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const padded = pasted.padEnd(6, "").slice(0, 6);
    onChange(padded);
    if (pasted.length >= 6) {
      inputRefs.current[5]?.focus();
      onVerify(pasted.slice(0, 6));
    } else if (pasted.length > 0) {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex items-end justify-center gap-2.5" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <div key={i} className="relative flex flex-col items-center">
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-10 h-10 text-center text-lg font-display font-semibold bg-transparent text-white caret-osmo-lime focus:outline-none transition-all duration-300 border-b-2 ${
              hasError
                ? "border-red-400/70"
                : digit
                ? "border-osmo-lime"
                : "border-white/10 hover:border-white/20 focus:border-osmo-lime"
            }`}
            aria-label={`OTP digit ${i + 1}`}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Resend Button with 60s cooldown ──────────────────────────────────────────

function ResendButton({ onResend, isResending }) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleClick = () => {
    if (cooldown > 0 || isResending) return;
    onResend();
    setCooldown(60);
  };

  const isDisabled = cooldown > 0 || isResending;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex items-center gap-1.5 text-xs font-sans transition-colors cursor-pointer disabled:cursor-not-allowed ${
        isDisabled
          ? "text-gray-600"
          : "text-gray-400 hover:text-osmo-lime"
      }`}
    >
      <ArrowClockwise size={12} className={isResending ? "animate-spin" : ""} />
      {isResending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  const {
    user,
    isAuthenticated,
    isInitialized,
    verifyEmailAsync,
    isVerifying,
    resendVerification,
    isResending,
    logout,
  } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verified, setVerified] = useState(false);

  // ─── Route guards ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) { router.replace("/auth"); return; }
    if (user?.isEmailVerified) { router.replace("/dashboard"); }
  }, [isInitialized, isAuthenticated, user, router]);

  // Focus first box on mount
  useEffect(() => {
    const t = setTimeout(() => {
      document.querySelector('[aria-label="OTP digit 1"]')?.focus();
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const handleVerify = useCallback(async (otpValue) => {
    const code = otpValue ?? otp;
    if (code.length !== 6) return;
    setOtpError("");
    try {
      await verifyEmailAsync({ otp: code });
      setVerified(true);
    } catch {
      setOtp("");
      setOtpError("Invalid or expired code. Try again.");
      setTimeout(() => {
        document.querySelector('[aria-label="OTP digit 1"]')?.focus();
      }, 100);
    }
  }, [otp, verifyEmailAsync]);

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-osmo-dark">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-osmo-dark/95">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="w-full max-w-100 bg-osmo-dark border border-white/10 text-white rounded-xl p-8 shadow-2xl relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {verified ? (
            /* ── Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                <CheckCircle size={24} weight="fill" className="text-osmo-lime" />
              </div>
              <h2 className="text-2xl font-display font-semibold tracking-tight text-white mb-1.5">
                Email verified
              </h2>
              <p className="text-sm text-gray-400 font-sans">
                Redirecting to your dashboard…
              </p>
              <div className="mt-5 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-osmo-lime"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── OTP entry state ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header — identical structure to AuthModal */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative w-8 h-8 mb-4">
                  <Image
                    src="/Cognify-Logo.png"
                    alt="Cognify Logo"
                    fill
                    sizes="32px"
                    className="object-contain drop-shadow"
                    priority
                  />
                </div>
                <h2 className="text-2xl font-display font-semibold tracking-tight text-white">
                  Verify your email
                </h2>
                <p className="text-sm text-gray-400 mt-1.5 font-sans">
                  We sent a 6-digit code to{" "}
                  <span className="text-white font-medium">{user?.email}</span>
                </p>
              </div>

              {/* OTP Boxes */}
              <div className="mb-2">
                <OtpInput
                  value={otp}
                  onChange={(v) => { setOtp(v); setOtpError(""); }}
                  onVerify={handleVerify}
                  hasError={!!otpError}
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {otpError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center gap-1.5 text-red-400 text-xs mt-2 mb-1 font-sans"
                  >
                    <WarningCircle size={12} weight="fill" className="shrink-0" />
                    {otpError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <button
                type="button"
                onClick={() => handleVerify(otp)}
                disabled={otp.length !== 6 || isVerifying}
                className="w-full flex items-center justify-center gap-2 bg-osmo-lime hover:bg-gray-200 text-osmo-dark active:scale-[0.99] font-display font-semibold text-sm transition-all duration-200 py-3 rounded-sm hover:rounded-2xl mt-5 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isVerifying ? (
                  <span className="w-5 h-5 border-2 border-black/20 border-t-osmo-dark rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Email</span>
                    <CheckCircle size={15} weight="bold" className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="flex items-center justify-between mt-5">
                <div className="flex items-center gap-2 text-gray-300 text-xs">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span>Secure verification</span>
                </div>

                <div className="flex items-center gap-3">
                  <ResendButton onResend={resendVerification} isResending={isResending} />
                  <div className="w-px h-3 bg-white/10" />
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="inline-flex items-center gap-1 text-xs font-sans text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    <SignOut size={12} />
                    Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
