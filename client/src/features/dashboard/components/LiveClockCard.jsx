"use client";
import React, { useSyncExternalStore } from "react";
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

export default function LiveClockCard() {
  const { user } = useAuth();
  const timestamp = useSyncExternalStore(subscribeToClock, getClockSnapshot, getClockServerSnapshot);
  const time = timestamp ? new Date(timestamp * 1000) : null;

  const getGreeting = () => {
    if (!time) return "Welcome";
    const hour = time.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  const formatHoursMinutes = () => {
    if (!time) return { hoursStr: "--", minutes: "--", seconds: "--", period: "--", dayString: "Loading...", dateString: "" };
    
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const seconds = String(time.getSeconds()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const dayString = days[time.getDay()];
    const dateString = `${months[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;

    return {
      hoursStr,
      minutes,
      seconds,
      period,
      dayString,
      dateString
    };
  };

  const { hoursStr, minutes, seconds, period, dayString, dateString } = formatHoursMinutes();

  return (
    <div className="relative w-full h-full bg-osmo-dark text-white rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden flex flex-col justify-between group select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
      {/* Ambient Radial Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-osmo-purple/40 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />

      {/* Top Row: Greeting Label & Handwriting Accent */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-lg sm:text-xl font-mono font-extrabold uppercase tracking-widest text-osmo-lime">
          {getGreeting()}
        </span>
        <span className="text-lg sm:text-xl font-medium text-white/70 font-caveat">
          High-Context Reasoning
        </span>
      </div>

      {/* Center: Large User Name & Digital Clock Matrix */}
      <div className="my-2 relative z-10">
        <h2 className="text-4xl sm:text-5xl font-display font-medium text-white tracking-tight leading-none mb-3">
          {firstName}<span className="text-osmo-lime">.</span>
        </h2>

        {/* Big Readable Digital Clock */}
        <div className="bg-white/5 px-4 py-3 rounded-none flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1 font-mono text-2xl sm:text-3xl font-black tracking-wider text-white">
            <span>{hoursStr}</span>
            <span className="animate-pulse text-osmo-lime">:</span>
            <span>{minutes}</span>
            <span className="animate-pulse text-osmo-lime">:</span>
            <span className="text-white/60 text-xl sm:text-2xl">{seconds}</span>
            <span className="text-xs font-black text-osmo-lime ml-2 uppercase px-1.5 py-0.5 bg-osmo-lime/10">
              {period}
            </span>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-white">{dayString}</div>
            <div className="text-xs font-mono text-white/50">{dateString}</div>
          </div>
        </div>
      </div>

      {/* Bottom Status Row */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between relative z-10 text-xs font-mono text-white/60">
        <span className="font-bold text-white/80">5 AI Engines Online</span>
        <span className="text-osmo-lime font-bold">Fast Inference</span>
      </div>
    </div>
  );
}
