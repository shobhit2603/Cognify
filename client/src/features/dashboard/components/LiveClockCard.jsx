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

  const formatTime = () => {
    if (!time) {
      return { timeStr: "00:00", seconds: "00", period: "AM", day: "Today", date: "Syncing..." };
    }
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const seconds = String(time.getSeconds()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return {
      timeStr: `${String(hours).padStart(2, "0")}:${minutes}`,
      seconds,
      period,
      day: days[time.getDay()],
      date: `${months[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`
    };
  };

  const { timeStr, seconds, period, day, date } = formatTime();

  return (
    <div className="group relative w-full h-full bg-[#151414] border border-white/8 hover:border-white/20 text-white rounded-lg p-4 lg:p-5 flex flex-col justify-between overflow-hidden select-none">

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-osmo-lime">
          CURRENT TIME
        </span>
        <span className="text-lg font-caveat text-white/50 group-hover:text-white/80 transition-colors">
          Flow Mode
        </span>
      </div>

      {/* Center: Monospace Digital Time & Date */}
      <div className="relative z-10 my-auto py-1">
        <div className="flex items-baseline gap-1.5 text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-none">
          <span>{timeStr}</span>
          <span className="text-lg text-white/40">{seconds}</span>
          <span className="text-[10px] font-bold text-osmo-lime ml-1 px-1.5 py-0.5 bg-osmo-lime/10 border border-osmo-lime/20">
            {period}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="font-bold text-white/90">{day}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/40 uppercase tracking-wider text-[11px]">{date}</span>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="relative z-10 pt-2.5 border-t border-white/8 flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime animate-pulse" />
          <span>5 Engines Online</span>
        </div>
        {/* <span className="text-osmo-lime font-bold">less than 45ms Latency</span> */}
      </div>
    </div>
  );
}
