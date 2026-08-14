"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeSlash, GoogleLogo, CaretLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement authentication flow
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-105 bg-brand-black text-brand-white rounded-4xl p-8 shadow-2xl border border-white/10 relative"
    >
      {/* Back button (mostly for UI aesthetic based on the design) */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <Link
          href="/"
          className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white transition-colors"
        >
          <CaretLeft size={16} />
          Back
        </Link>
      </div>

      <h2 className="text-4xl font-display font-medium text-center mb-8">
        {isLogin ? "Sign in" : "Sign up"}
      </h2>

      {/* Google Button */}
      <button 
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all py-3.5 rounded-2xl mb-8 group cursor-not-allowed opacity-50"
      >
        <GoogleLogo size={22} weight="bold" className="text-brand-orange group-hover:scale-110 transition-transform" />
        <span className="font-medium">Continue with Google</span>
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-white/10 flex-1"></div>
        <span className="text-gray-500 text-sm">or</span>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>

      {/* Form */}
      <form key={isLogin ? 'login' : 'signup'} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <div className="relative">
            <label htmlFor="fullName" className="sr-only">Full name</label>
            <input 
              id="fullName"
              name="fullName"
              type="text" 
              placeholder="Full name" 
              className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all"
            />
          </div>
        )}

        <div className="relative">
          <label htmlFor="email" className="sr-only">Email address</label>
          <input 
            id="email"
            name="email"
            type="email" 
            placeholder="Email address" 
            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all"
          />
        </div>

        <div className="relative flex items-center">
          <label htmlFor="password" className="sr-only">Password</label>
          <input 
            id="password"
            name="password"
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-6 text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {isLogin && (
          <div className="text-center mt-2">
            <button
              type="button"
              disabled
              className="text-gray-500 text-sm hover:text-white underline decoration-white/30 underline-offset-4 transition-colors cursor-not-allowed opacity-50"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button 
          type="submit" 
          className="w-full flex items-center justify-center bg-brand-orange hover:bg-[#e05e00] active:scale-[0.98] text-white font-medium transition-all py-4 rounded-2xl mt-4 cursor-pointer"
        >
          {isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="text-center mt-8 text-gray-500 text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-brand-orange hover:text-[#e05e00] underline decoration-brand-orange/30 underline-offset-4 transition-colors font-medium cursor-pointer"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>
    </motion.div>
  );
}
