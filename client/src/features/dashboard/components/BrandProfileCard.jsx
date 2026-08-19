"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, SignOut, ArrowUpRight } from "@phosphor-icons/react";
import TextRoll from "../../../components/ui/TextRoll";
import { useAuth } from "../../auth/hooks/useAuth";

export default function BrandProfileCard() {
  const { user, logout, isLoggingOut } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "User";
  const userInitial = firstName.charAt(0).toUpperCase();

  return (
    <div className="relative w-full h-full bg-osmo-dark text-white rounded-lg p-5 shadow-sm flex flex-col justify-between select-none">
      {/* Top: Brand Logo & Landing Page Link */}
      <div className="flex items-start justify-between relative z-10">
        <Link
          href="/"
          className="group/brand flex items-center gap-3 transition-transform active:scale-98"
          title="Return to Landing Page"
        >
          <div className="relative w-10 h-10 shrink-0 transition-transform duration-300 group-hover/brand:rotate-12 group-hover/brand:scale-110">
            <Image
              src="/Cognify-Logo.png"
              alt="Cognify Logo"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="font-display font-bold text-2xl sm:text-3xl tracking-tighter text-white leading-none">
              COGNIFY<span className="text-osmo-lime">.</span>
            </div>
            <span className="text-xs font-mono font-semibold text-white/50 group-hover/brand:text-osmo-lime transition-colors flex items-center gap-1 mt-1">
              <span>Return to Home</span>
              <ArrowUpRight size={13} weight="bold" />
            </span>
          </div>
        </Link>

        {/* Live System Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-xs font-mono text-white/70 font-bold rounded-none">
          <span className="w-2 h-2 rounded-full bg-osmo-lime animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Middle: Clean Statement / Tagline */}
      <div className="my-auto py-2">
        <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-widest block mb-1">
          Intelligent AI Workspace
        </span>
        <p className="text-lg font-sans font-medium text-white/70 leading-snug">
          Unified environment for research, documents, writing, and structured thought.
        </p>
      </div>

      {/* Bottom: User Profile & Quick Actions */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
        {/* User Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-none bg-osmo-purple text-white flex items-center justify-center text-sm font-black font-mono shrink-0 shadow">
            {userInitial}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">
              {user?.name || "Workspace"}
            </div>
            <div className="text-xs font-mono text-white/40 truncate">
              {user?.email || "Pro Plan"}
            </div>
          </div>
        </div>

        {/* Action Buttons: New Chat & Logout */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/chat"
            className="flex items-center gap-1 px-3.5 py-2 bg-osmo-lime text-black font-bold text-xs rounded-none hover:bg-white transition-all shadow-sm active:scale-95"
            title="Start New Chat"
          >
            <Plus size={14} weight="bold" />
            <span><TextRoll>New Chat</TextRoll></span>
          </Link>

          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-none transition-colors cursor-pointer disabled:opacity-50"
            title="Sign Out"
          >
            <SignOut size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
