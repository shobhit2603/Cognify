"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  MagnifyingGlass, 
  Plus, 
  SignOut, 
  ArrowLeft,
  Sparkle,
  Cpu
} from "@phosphor-icons/react";
import TextRoll from "../../../components/ui/TextRoll";
import { useAuth } from "../../auth/hooks/useAuth";

export default function DashboardHeader({ searchQuery, setSearchQuery, onNewChat }) {
  const { user, logout, isLoggingOut } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "User";
  const userInitial = firstName.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-osmo-dark text-white rounded-none px-4 py-3 sm:px-5 sm:py-3.5 mb-3 sm:mb-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
      {/* Left: Brand Identity & Landing Page Link */}
      <div className="flex items-center justify-between md:justify-start gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform active:scale-98"
          title="Return to Landing Page"
        >
          <div className="relative w-7 h-7 shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
            <Image
              src="/Cognify-Logo.png"
              alt="Cognify Logo"
              fill
              sizes="28px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tighter leading-none text-white">
              COGNIFY<span className="text-osmo-lime">.</span>
            </span>
            <span className="text-[9px] font-mono font-medium tracking-wider text-white/40 uppercase group-hover:text-osmo-lime transition-colors">
              ✻ Return to Home
            </span>
          </div>
        </Link>

        {/* System Active Live Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-none text-[11px] font-mono text-white/70">
          <span className="w-2 h-2 rounded-full bg-osmo-lime animate-pulse" />
          <span className="font-semibold text-white/90">System Online</span>
        </div>
      </div>

      {/* Center: Command & Search Launcher */}
      <div className="relative flex-1 max-w-md mx-0 md:mx-4">
        <div className="relative flex items-center">
          <MagnifyingGlass size={16} className="absolute left-3.5 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tools, notes, recent sessions... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 focus:bg-white/10 text-white placeholder:text-white/40 text-xs font-medium pl-9 pr-8 py-2 rounded-none outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-white/40 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick Action & User Profile Capsule */}
      <div className="flex items-center justify-between md:justify-end gap-2.5">
        {/* Quick New Chat Button */}
        <Link
          href="/chat"
          className="group flex items-center gap-1.5 px-3.5 py-2 bg-osmo-lime text-black font-semibold text-xs rounded-none hover:bg-white transition-all shadow-sm active:scale-98"
        >
          <Plus size={14} weight="bold" />
          <span><TextRoll>New Chat</TextRoll></span>
        </Link>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-none">
          <div className="w-6 h-6 rounded-none bg-osmo-purple text-white flex items-center justify-center text-xs font-bold font-mono">
            {userInitial}
          </div>
          <span className="text-xs font-medium text-white/90 truncate max-w-24 sm:max-w-32">
            {user?.name || "Workspace"}
          </span>
        </div>

        {/* Logout Action */}
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="p-2 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-none transition-colors cursor-pointer disabled:opacity-50"
          title="Sign Out of Workspace"
        >
          <SignOut size={16} weight="bold" />
        </button>
      </div>
    </header>
  );
}
