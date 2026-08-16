import React from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, ArrowLeft, ArrowClockwise } from "@phosphor-icons/react";

export default function ChatHeader({ isSidebarOpen, onToggleSidebar, onClearCanvas }) {
  return (
    <div className="h-14 shrink-0 border-b border-black/6 flex items-center justify-between px-4 sm:px-6 bg-white/60 backdrop-blur-md z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-black/5 rounded-xl transition-colors text-gray-600 cursor-pointer flex items-center justify-center"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <CaretLeft size={16} weight="bold" /> : <CaretRight size={16} weight="bold" />}
        </button>
        
        <div className="w-px h-4 bg-black/10 hidden sm:block" />
        
        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-black transition-colors px-2.5 py-1.5 rounded-lg hover:bg-black/5"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-400 font-mono hidden md:inline-block">
          Context: Unified Productivity
        </span>
        <button 
          onClick={onClearCanvas}
          className="text-xs text-gray-500 hover:text-brand-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-white transition-all cursor-pointer shadow-2xs font-medium"
          title="Reset conversation window"
        >
          <ArrowClockwise size={13} />
          <span>Clear Canvas</span>
        </button>
      </div>
    </div>
  );
}
