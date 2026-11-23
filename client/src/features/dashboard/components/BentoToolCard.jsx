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
  accentColor = "text-osmo-lime",
  glowClass = "group-hover:bg-osmo-lime/15",
  hoverBorderClass = "hover:border-osmo-lime/40",
  hoverTextClass = "group-hover:text-osmo-lime",
  hoverShadowClass = "hover:shadow-[0_0_30px_rgba(218,255,0,0.1)]",
  className = "",
  isHero = false,
}) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Link
        href={href}
        className={`group relative w-full h-full flex flex-col justify-between p-5 lg:p-6 select-none bg-[#151414] border border-white/[0.08] rounded-sm hover:rounded-4xl transition-all duration-300 ease-out hover:z-20 overflow-hidden ${hoverBorderClass} ${hoverShadowClass}`}
      >
        {/* Ambient Card Corner Glow */}
        <div
          className={`absolute -top-14 -right-14 w-36 h-36 rounded-full blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none ${glowClass}`}
        />

        {/* Top Bar: Naked Icon + Number on left, Single Arrow on right */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon
                size={isHero ? 26 : 22}
                weight="bold"
                className={`${accentColor} transition-transform duration-300 transform group-hover:scale-110`}
              />
            )}
            <span className="font-display text-lg font-bold text-white/30 tracking-widest uppercase">
              {number}
            </span>
          </div>

          <ArrowUpRight
            size={isHero ? 20 : 16}
            weight="bold"
            className="text-white/30 transition-colors duration-300 group-hover:text-white"
          />
        </div>

        {/* Center: Large Display Title & Caveat Category */}
        <div className="my-auto py-1 relative z-10">
          <h3
            className={`${
              isHero
                ? "text-2xl sm:text-3xl lg:text-4xl"
                : "text-lg sm:text-xl lg:text-2xl"
            } font-display font-medium tracking-tight text-white uppercase leading-tight transition-colors group-hover:text-white`}
          >
            {title}
          </h3>
          <p
            className={`text-md sm:text-lg font-caveat text-white/50 mt-0.5 transition-colors duration-300 ${hoverTextClass}`}
          >
            {category}
          </p>
        </div>

        {/* Bottom: Minimal Quick Action Label */}
        <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs text-white/50 relative z-10">
          <span className={`font-bold transition-colors duration-300 ${hoverTextClass}`}>
            <TextRoll>{quickAction}</TextRoll>
          </span>
        </div>
      </Link>
    </div>
  );
}
