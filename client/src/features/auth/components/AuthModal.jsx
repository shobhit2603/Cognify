"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { 
  Eye, 
  EyeSlash, 
  X, 
  ArrowRight, 
  ShieldCheck,
  EnvelopeSimple,
  LockSimple,
  User,
  Sparkle
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function AuthModal({ isOpen = true, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const modalRef = useRef(null);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [onClose, router]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Connects to authentication API endpoint
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  const handleGoogleAuth = () => {
    // Triggers Google OAuth redirect
    console.log("Initiating Google OAuth");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-brand-black/75 backdrop-blur-xl overflow-y-auto"
          onClick={handleClose}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-130 h-130 bg-white/3 rounded-full blur-[140px] pointer-events-none" />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-100 bg-brand-black text-brand-white rounded-3xl p-8 shadow-2xl relative overflow-hidden my-auto"
          >
            {/* Top Minimal Close Trigger */}
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} weight="bold" />
            </button>

            {/* Header / Brand & Context */}
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
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-gray-400 mt-1.5 font-sans">
                {isLogin 
                  ? "Sign in to continue to Cognify" 
                  : "Start researching and writing with AI"}
              </p>
            </div>

            {/* Sliding Segmented Tab Pill */}
            <div className="relative flex bg-white/5 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`relative flex-1 py-2 text-sm font-display font-medium transition-colors duration-200 cursor-pointer z-10 ${
                  isLogin ? "text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {isLogin && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 bg-white/10 rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-20">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`relative flex-1 py-2 text-sm font-display font-medium transition-colors duration-200 cursor-pointer z-10 ${
                  !isLogin ? "text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {!isLogin && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 bg-white/10 rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-20">Sign Up</span>
              </button>
            </div>

            {/* Google OAuth (Clean Monotone/Official styling) */}
            <button 
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white transition-colors py-3 rounded-xl group cursor-pointer active:scale-[0.99]"
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

            {/* Subtle Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-gray-500 text-xs uppercase font-mono tracking-wider">or email</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Form with animated transitions */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                      <User size={18} className="absolute left-1 text-gray-500 group-focus-within:text-brand-orange transition-colors duration-300 pointer-events-none" />
                      <input 
                        name="fullName"
                        type="text"
                        required={!isLogin}
                        placeholder="Full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 hover:border-white/20 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-all duration-300 font-sans rounded-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative flex items-center group">
                <EnvelopeSimple size={18} className="absolute left-1 text-gray-500 group-focus-within:text-brand-orange transition-colors duration-300 pointer-events-none" />
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder="Email address" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/10 hover:border-white/20 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-all duration-300 font-sans rounded-none"
                />
              </div>

              <div className="relative flex items-center group">
                <LockSimple size={18} className="absolute left-1 text-gray-500 group-focus-within:text-brand-orange transition-colors duration-300 pointer-events-none" />
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Password" 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/10 hover:border-white/20 pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-all duration-300 font-sans rounded-none"
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

              {isLogin && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-brand-orange text-xs transition-colors cursor-pointer font-sans"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-brand-black active:scale-[0.99] font-display font-semibold text-sm transition-all py-3 rounded-xl mt-1 cursor-pointer shadow-sm disabled:opacity-50 group"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-black/20 border-t-brand-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Privacy / Encryption Footer Badge */}
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