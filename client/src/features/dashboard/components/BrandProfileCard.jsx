"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, SignOut } from "@phosphor-icons/react";
import TextRoll from "../../../components/ui/TextRoll";
import { useAuth } from "../../auth/hooks/useAuth";

export default function BrandProfileCard() {
  const { user, logout, isLoggingOut } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "Creator";
  const userInitial = (user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  return (
    <div className="group relative w-full h-full bg-[#151414] border border-white/8 hover:border-white/20 text-white rounded-lg p-4 lg:p-5 flex flex-col justify-between overflow-hidden select-none">
      {/* Top: Brand Header */}
      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="group/brand flex items-center gap-2.5 transition-transform active:scale-95"
          title="Return to Landing Page"
        >
          <div className="relative w-7 h-7 lg:w-8 lg:h-8 shrink-0 transition-transform duration-500 group-hover/brand:rotate-12 group-hover/brand:scale-105">
            <Image
              src="/Cognify-Logo.png"
              alt="Cognify Logo"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-display font-bold text-xl lg:text-2xl tracking-tighter text-white leading-none block">
              COGNIFY<span className="text-osmo-lime">.</span>
            </span>
          </div>
        </Link>

        {/* <div className="flex items-center gap-1.5 px-2 py-0.5 bg-osmo-lime/10 border border-osmo-lime/25 text-[10px] font-bold text-osmo-lime uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime animate-pulse" />
          <span>Active</span>
        </div> */}
      </div>

      {/* Middle: Editorial Greeting */}
      <div className="relative z-10 my-auto py-1">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
          Cognitive Workspace
        </span>
        <h2 className="font-display text-xl sm:text-2xl lg:text-4xl font-medium text-white leading-tight">
          Good {getGreetingTime()},{" "}
          <span className="text-white/90">{firstName}</span>
          <span className="text-osmo-lime">.</span>
        </h2>
        <p className="text-sm text-white/50 font-medium leading-relaxed mt-1 line-clamp-2">
          Which tool you want to begin with Today?
        </p>

        {/* Handwritten Note */}
        <div className="absolute -top-2 md:-top-4 right-0 rotate-[4deg] text-osmo-lime font-caveat text-xl opacity-90 pointer-events-none">
          Ready to start
        </div>
      </div>

      {/* Bottom: User Card & Quick Action */}
      <div className="relative z-10 pt-3 border-t border-white/8 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-osmo-purple text-white flex items-center justify-center text-md font-bold shrink-0 shadow-sm">
            {userInitial}
          </div>
          <div className="min-w-0">
            <div className="text-md font-bold text-white truncate leading-tight">
              {user?.name || "Workspace User"}
            </div>
            <div className="text-sm text-white/40 truncate">
              {user?.email || "Pro Plan"}
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="p-2 bg-white/8 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50 rounded-lg"
          title="Sign Out"
        >
          <SignOut size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
