"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function MainLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAppRoute =
    pathname?.startsWith("/chat") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/notes") ||
    pathname?.startsWith("/documents") ||
    pathname?.startsWith("/document");

  return (
    <main
      className={
        isAppRoute
          ? "w-full h-screen max-h-screen overflow-hidden flex flex-col bg-[#0d0d0f]"
          : "grow pt-28 sm:pt-32"
      }
    >
      {children}
    </main>
  );
}
