"use client";
import React from "react";

export default function Tooltip({
  content,
  position = "top",
  children,
  className = "",
}) {
  if (!content) return children;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    "bottom-end": "top-full right-0 mt-2",
    "bottom-start": "top-full left-0 mt-2",
    "top-end": "bottom-full right-0 mb-2",
    "top-start": "bottom-full left-0 mb-2",
  };

  return (
    <div className={`relative group/tooltip inline-flex ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`absolute ${
          positionClasses[position] || positionClasses.top
        } pointer-events-none z-50 whitespace-nowrap px-2.5 py-1 rounded bg-[#1e1d1d] border border-white/15 text-[11px] font-sans font-medium text-white shadow-2xl backdrop-blur-md transition-all duration-150 ease-out opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 will-change-transform`}
      >
        {content}
      </div>
    </div>
  );
}
