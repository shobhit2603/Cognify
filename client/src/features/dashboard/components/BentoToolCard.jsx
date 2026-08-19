"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import TextRoll from "../../../components/ui/TextRoll";

export default function BentoToolCard({
  number,
  title,
  category,
  description,
  icon: Icon,
  badge,
  badgeBg = "bg-osmo-lime text-black",
  href,
  quickAction = "Launch Engine",
  bgClass = "bg-black text-white",
  accentColor = "text-osmo-lime",
  glowColor = "bg-osmo-lime/10",
  className = "",
  isHero = false
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[0.97] active:scale-[0.93] shadow-sm overflow-hidden select-none ${bgClass} ${className}`}
    >
      {/* Ambient Corner Glow on Hover */}
      <div 
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none ${glowColor}`} 
      />

      {/* Top Row: Icon, Number Tag, Badge & Arrow */}
      <div className="flex items-start justify-between relative z-10 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 bg-white/5 rounded-none transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10 ${accentColor}`}>
            {Icon && <Icon size={isHero ? 28 : 24} weight="bold" />}
          </div>
          <span className="font-mono text-xs sm:text-sm font-black text-white/40 tracking-widest uppercase">
            {number}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {badge && (
            <span className={`text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded-none tracking-wider ${badgeBg}`}>
              {badge}
            </span>
          )}
          <div className="p-1.5 bg-white/5 rounded-none text-white/50 group-hover:text-white group-hover:bg-white/15 transition-all">
            <ArrowUpRight 
              size={18} 
              weight="bold"
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
            />
          </div>
        </div>
      </div>

      {/* Center Body: Title, Category & Description */}
      <div className="relative z-10 my-auto">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className={`${isHero ? "text-2xl sm:text-3xl" : "text-lg sm:text-2xl"} font-display font-bold tracking-tight text-white group-hover:text-white transition-colors`}>
            {title}
          </h3>
          <span className={`${isHero ? "text-2xl" : "text-base sm:text-xl"} font-bold font-caveat ${accentColor}`}>
            {category}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-white/75 leading-relaxed line-clamp-2 transition-colors group-hover:text-white/90 font-medium">
          {description}
        </p>
      </div>

      {/* Bottom Footer: Quick Action Link */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between relative z-10 text-xs sm:text-sm font-bold text-white/80 group-hover:text-white transition-colors">
        <span><TextRoll>{quickAction}</TextRoll></span>
        <span className={`text-xs font-mono font-extrabold uppercase tracking-wider ${accentColor}`}>
          Launch ↗
        </span>
      </div>
    </Link>
  );
}
