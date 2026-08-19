"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeSlash,
  X,
  ArrowRight,
  ShieldCheck,
  EnvelopeSimple,
  LockSimple,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../../../config/env";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// ─── Field Error Component ─────────────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-sans"
    >
      <WarningCircle size={12} weight="fill" className="shrink-0" />
      {message}
    </motion.p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuthModal({ isOpen = true, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const { loginAsync, registerAsync, isLoggingIn, isRegistering } = useAuth();

  const isLoading = isLoggingIn || isRegistering;

  // ─── Form setup ─────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    mode: "onTouched",
  });

  // ─── Modal accessibility ─────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [onClose, router]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      
      const handleKeyDown = (e) => {
        if (e.key === "Escape") handleClose();
        
        if (e.key === "Tab" && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      
      // Focus modal container
      setTimeout(() => {
        if (modalRef.current) modalRef.current.focus();
      }, 50);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, handleClose]);

  // ─── Form submission ─────────────────────────────────────────────────────────

  const onSubmit = async (data) => {
    try {
      if (isLogin) {
        await loginAsync({ email: data.email, password: data.password });
      } else {
        await registerAsync({ name: data.name, email: data.email, password: data.password });
      }
      // Navigation is handled in useAuth's onSuccess callbacks
    } catch {
      // Errors are surfaced via toast in the hook; no extra handling needed here
    }
  };

  // ─── Google OAuth ─────────────────────────────────────────────────────────────

  const handleGoogleAuth = () => {
    // Redirect the browser to the server-side OAuth initiation endpoint.
    // The server will handle the Google redirect and set cookies, then
    // redirect back to /dashboard on success.
    window.location.href = `${API_URL}/auth/google`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-osmo-dark/95"
          onClick={handleClose}
        >

          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-100 bg-osmo-dark-surface border border-white/10 text-white rounded-none p-8 shadow-2xl relative overflow-hidden my-auto focus:outline-none"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} weight="bold" />
            </button>

            {/* Header */}
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
              <h2 id="auth-modal-title" className="text-2xl font-display font-semibold tracking-tight text-white">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-gray-400 mt-1.5 font-sans">
                {isLogin
                  ? "Sign in to continue to Cognify"
                  : "Start researching and writing with AI"}
              </p>
            </div>

            {/* Login / Register tab switcher */}
            <div className="relative flex bg-white/5 p-1 rounded-none mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  reset();
                  setShowPassword(false);
                }}
                className={`relative flex-1 py-2 text-sm font-display font-medium transition-colors duration-200 cursor-pointer z-10 ${
                  isLogin ? "text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {isLogin && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 bg-white/10 rounded-none shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-20">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  reset();
                  setShowPassword(false);
                }}
                className={`relative flex-1 py-2 text-sm font-display font-medium transition-colors duration-200 cursor-pointer z-10 ${
                  !isLogin ? "text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {!isLogin && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 bg-white/10 rounded-none shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-20">Sign Up</span>
              </button>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white transition-colors py-3 rounded-none group cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"/>
              </svg>
              <span className="font-display font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                Continue with Google
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-gray-500 text-xs uppercase font-mono tracking-wider">or email</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <AnimatePresence mode="popLayout" initial={false}>
                {!isLogin && (
                  <motion.div
                    key="fullname-input"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="relative flex items-center group mt-1">
                      <User
                        size={18}
                        className={`absolute left-1 transition-colors duration-300 pointer-events-none ${
                          errors.name ? "text-red-400" : "text-gray-500 group-focus-within:text-osmo-lime"
                        }`}
                      />
                      <input
                        {...register("name")}
                        type="text"
                        placeholder="Full name"
                        autoComplete="name"
                        className={`w-full bg-transparent border-b pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-300 font-sans rounded-none ${
                          errors.name
                            ? "border-red-400/70 hover:border-red-400"
                            : "border-white/10 hover:border-white/20 focus:border-osmo-lime"
                        }`}
                      />
                    </div>
                    <FieldError message={errors.name?.message} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email field */}
              <div>
                <div className="relative flex items-center group">
                  <EnvelopeSimple
                    size={18}
                    className={`absolute left-1 transition-colors duration-300 pointer-events-none ${
                      errors.email ? "text-red-400" : "text-gray-500 group-focus-within:text-osmo-lime"
                    }`}
                  />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    className={`w-full bg-transparent border-b pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-300 font-sans rounded-none ${
                      errors.email
                        ? "border-red-400/70 hover:border-red-400"
                        : "border-white/10 hover:border-white/20 focus:border-osmo-lime"
                    }`}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password field */}
              <div>
                <div className="relative flex items-center group">
                  <LockSimple
                    size={18}
                    className={`absolute left-1 transition-colors duration-300 pointer-events-none ${
                      errors.password ? "text-red-400" : "text-gray-500 group-focus-within:text-osmo-lime"
                    }`}
                  />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className={`w-full bg-transparent border-b pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-300 font-sans rounded-none ${
                      errors.password
                        ? "border-red-400/70 hover:border-red-400"
                        : "border-white/10 hover:border-white/20 focus:border-osmo-lime"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 text-gray-500 hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              {/* Forgot password */}
              {isLogin && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-osmo-lime text-xs transition-colors cursor-pointer font-sans"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-osmo-dark active:scale-[0.99] font-display font-semibold text-sm transition-all py-3 rounded-none mt-1 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-black/20 border-t-osmo-dark rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight
                      size={16}
                      weight="bold"
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Security footer */}
            <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-xs text-center">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span>Isolated session encryption</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}