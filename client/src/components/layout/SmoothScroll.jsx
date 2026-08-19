"use client";
import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";

function LenisRouteHandler() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const isFixedAppRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/chat");

    if (isFixedAppRoute) {
      // Pause window-level lenis on fixed viewport apps so internal scrolling is never hijacked
      lenis.stop();
    } else {
      lenis.start();
      // Reset scroll position to top immediately on route change
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return null;
}

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.25, // Snappier, faster responsive scrolling
        touchMultiplier: 1.8,
        infinite: false,
        autoRaf: true,
      }}
    >
      <LenisRouteHandler />
      {children}
    </ReactLenis>
  );
}
