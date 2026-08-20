"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import TextRoll from "../../../components/ui/TextRoll";

export default function BentoToolCard({
  number,
  title,
  category,
  icon: Icon,
  href,
  quickAction = "Launch",
  bgClass = "bg-[#151414] text-white border border-white/[0.08]",
  accentColor = "text-osmo-lime",
  className = "",
  isHero = false
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between p-5 lg:p-6 rounded-4xl transition-all duration-400 ease-out hover:scale-[0.95] active:scale-[0.92] hover:rounded-sm hover:bg-black select-none ${bgClass} ${className}`}
    >
      {/* Top Bar: Naked Icon + Number on left, Single Arrow on right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              size={isHero ? 26 : 22}
              weight="bold"
              className={`${accentColor} transition-transform duration-200`}
            />
          )}
          <span className="font-display text-lg font-bold text-white/30 tracking-widest uppercase">
            {number}
          </span>
        </div>

        <ArrowUpRight
          size={isHero ? 20 : 16}
          weight="bold"
          className="text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
        />
      </div>

      {/* Center: Large Display Title & Caveat Category */}
      <div className="my-auto py-1">
        <h3
          className={`${
            isHero ? "text-2xl sm:text-3xl lg:text-4xl" : "text-lg sm:text-xl lg:text-2xl"
          } font-display font-bold tracking-tight text-white uppercase leading-tight`}
        >
          {title}
        </h3>
        <p className="text-md sm:text-lg font-caveat text-white/50 group-hover:text-white/80 transition-colors mt-0.5">
          {category}
        </p>
      </div>

      {/* Bottom: Minimal Quick Action Label */}
      <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs text-white/50">
        <span className="font-bold text-white/70 group-hover:text-white transition-colors">
          <TextRoll>{quickAction}</TextRoll>
        </span>
        <span className={`font-bold uppercase tracking-wider ${accentColor} text-[11px]`}>
          Launch
        </span>
      </div>
    </Link>
  );
}

