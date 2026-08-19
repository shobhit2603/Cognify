import React from "react";
import HeroSection from "../components/landing/HeroSection";
import PlatformShowcase from "../components/landing/PlatformShowcase";
import ToolkitFanSection from "../components/landing/ToolkitFanSection";
import WhyCognifySection from "../components/landing/WhyCognifySection";
import MetricsAndQuoteSection from "../components/landing/MetricsAndQuoteSection";
import WorkflowReelSection from "../components/landing/WorkflowReelSection";
import PricingSection from "../components/landing/PricingSection";
import CtaSection from "../components/landing/CtaSection";

export const metadata = {
  title: "Cognify ✻ Intelligent AI Workspace",
  description:
    "A unified AI SaaS platform for modern knowledge workers. High-speed reasoning, deep PDF synthesis, ATS resume studio, executive writing, and smart notes.",
};

export default function Home() {
  return (
    <div className="relative w-full flex flex-col items-center overflow-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. The Platform (Interactive Live Workspace Showcase) */}
      <div id="platform" className="w-full">
        <PlatformShowcase />
      </div>

      {/* 3. Toolkit Fan (3D Interactive Spread) */}
      <div id="toolkit" className="w-full">
        <ToolkitFanSection />
      </div>

      {/* 4. Why Cognify (Editorial Manifesto & Architecture) */}
      <div className="w-full">
        <WhyCognifySection />
      </div>

      {/* 5. Metrics Dial & Testimonial Card */}
      <div className="w-full">
        <MetricsAndQuoteSection />
      </div>

      {/* 6. Artifact Reel (Made with Cognify) */}
      <div className="w-full">
        <WorkflowReelSection />
      </div>

      {/* 7. Transparent Pricing Matrix */}
      <div id="pricing" className="w-full">
        <PricingSection />
      </div>

      {/* 8. Dual Capsule CTA */}
      <div className="w-full">
        <CtaSection />
      </div>
    </div>
  );
}
