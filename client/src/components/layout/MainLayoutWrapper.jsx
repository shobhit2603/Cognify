"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function MainLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAppRoute = pathname?.startsWith("/chat") || pathname?.startsWith("/dashboard");

  return (
    <main className={isAppRoute ? "w-full h-full min-h-0 flex flex-col" : "grow pt-28 sm:pt-32"}>
      {children}
    </main>
  );
}
