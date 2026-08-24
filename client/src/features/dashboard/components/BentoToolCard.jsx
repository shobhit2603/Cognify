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
  hoverBgClass = "hover:bg-osmo-lime",
  className = "",
  isHero = false,
}) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#151414] ${className}`}
    >
      <Link
        href={href}
        className={`w-full h-full flex flex-col justify-between p-5 lg:p-6 select-none ${bgClass}`}
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
            className="text-white/30"
          />
        </div>

        {/* Center: Large Display Title & Caveat Category */}
        <div className="my-auto py-1">
          <h3
            className={`${
              isHero
                ? "text-2xl sm:text-3xl lg:text-4xl"
                : "text-lg sm:text-xl lg:text-2xl"
            } font-display font-medium tracking-tight text-white uppercase leading-tight`}
          >
            {title}
          </h3>
          <p className="text-md sm:text-lg font-caveat text-white/50 mt-0.5">
            {category}
          </p>
        </div>

        {/* Bottom: Minimal Quick Action Label */}
        <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs text-white/50">
          <span className="font-bold text-white/70">
            <TextRoll>{quickAction}</TextRoll>
          </span>
        </div>
      </Link>
    </div>
  );
}
