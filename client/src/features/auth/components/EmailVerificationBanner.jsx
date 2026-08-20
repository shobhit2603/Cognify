"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WarningCircle, X, ShieldCheck } from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";

export default function EmailVerificationBanner() {
  const { user, verifyEmail, isVerifying, resendVerification, isResending } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otp, setOtp] = useState("");

  if (!user || user.isEmailVerified) {
    return null;
  }

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      verifyEmail({ otp });
    }
  };

  return (
    <>
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-red-50 border-b border-red-200 text-red-600 px-4 py-3 flex items-center justify-between text-sm md:text-base font-medium z-40 relative shadow-sm"
      >
        <div className="flex items-center gap-2">
          <WarningCircle size={20} weight="fill" />
          <span>Please verify your email address to access all core features like Chat and Progress Tracking.</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-4 whitespace-nowrap bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 transition-colors shadow-sm"
        >
          Verify Now
        </button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-3">
                  <ShieldCheck size={24} weight="fill" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Verify Your Email</h3>
                <p className="text-sm text-gray-500 mt-2">
                  We've sent a 6-digit code to <strong>{user.email}</strong>. 
                  Enter it below to unlock all features.
                </p>
              </div>

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />

                <button
                  type="submit"
                  disabled={otp.length !== 6 || isVerifying}
                  className="w-full bg-osmo-dark text-white py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
                >
                  {isVerifying ? "Verifying..." : "Verify Email"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                Didn't receive the code?{" "}
                <button
                  onClick={() => resendVerification()}
                  disabled={isResending}
                  className="text-osmo-dark font-medium hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
