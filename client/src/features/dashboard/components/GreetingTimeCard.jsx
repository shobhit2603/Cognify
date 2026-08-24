"use client";
import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../auth/hooks/useAuth";

function subscribeToClock(callback) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}
function getClockSnapshot() {
  return Math.floor(Date.now() / 1000);
}
function getClockServerSnapshot() {
  return null;
}

export default function GreetingTimeCard() {
  const { user } = useAuth();
  const timestamp = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot
  );

  const time = timestamp ? new Date(timestamp * 1000) : null;
  const firstName = user?.name ? user.name.split(" ")[0] : "Creator";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatTime = () => {
    if (!time) return { timeStr: "00:00", seconds: "00", period: "AM", day: "Today", date: "" };
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const seconds = String(time.getSeconds()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
      timeStr: `${String(hours).padStart(2, "0")}:${minutes}`,
      seconds,
      period,
      day: days[time.getDay()],
      date: `${months[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`,
    };
  };

  const { timeStr, seconds, period, day, date } = formatTime();

  return (
    <div className="w-full h-full bg-[#151414] border border-white/[0.08] text-white px-5 py-3 flex items-center justify-between gap-4 overflow-hidden select-none">
      {/* LEFT: Brand + Greeting */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Link
          href="/"
          className="shrink-0 group/brand flex items-center gap-2 transition-transform active:scale-95"
          title="Return to Landing"
        >
          <div className="relative w-7 h-7 transition-transform duration-500 group-hover/brand:rotate-12 group-hover/brand:scale-110">
            <Image
              src="/Cognify-Logo.png"
              alt="Cognify"
              fill
              sizes="28px"
              className="object-contain"
              priority
            />
          </div>
          <span className="font-display font-bold text-lg tracking-tighter text-white leading-none hidden sm:block">
            COGNIFY<span className="text-osmo-lime">.</span>
          </span>
        </Link>

        <div className="w-px h-6 bg-white/10 shrink-0" />

        <div className="min-w-0">
          <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest leading-none mb-0.5">
            Cognitive Workspace
          </p>
          <h2 className="font-display text-base sm:text-lg lg:text-xl font-medium text-white leading-tight truncate">
            {getGreeting()},{" "}
            <span className="text-white/85">{firstName}</span>
            <span className="text-osmo-lime">.</span>
          </h2>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-px h-8 bg-white/10 shrink-0 hidden md:block" />

      {/* RIGHT: Live Clock */}
      <div className="shrink-0 flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[9px] font-bold text-osmo-lime uppercase tracking-widest leading-none mb-0.5">
            Live Clock
          </p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">
            {day} &middot; {date}
          </p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl sm:text-3xl font-bold text-white leading-none tabular-nums">
            {timeStr}
          </span>
          <span className="text-sm text-white/35 tabular-nums leading-none">{seconds}</span>
          <span className="text-[9px] font-bold text-osmo-lime ml-0.5 px-1 py-0.5 bg-osmo-lime/10 border border-osmo-lime/20 leading-none">
            {period}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime animate-pulse" />
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider hidden lg:block">
            Online
          </span>
        </div>
      </div>
    </div>
  );
}
