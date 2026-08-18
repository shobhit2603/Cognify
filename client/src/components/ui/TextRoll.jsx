"use client";
import React from "react";

export default function TextRoll({ children }) {
  return (
    <div className="relative overflow-hidden inline-flex group cursor-pointer">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
        {children}
      </span>
      <span className="absolute top-full left-0 block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full" aria-hidden="true">
        {children}
      </span>
    </div>
  );
}
