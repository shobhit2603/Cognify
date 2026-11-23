"use client";
import React from "react";
import { PenNib } from "@phosphor-icons/react";
import FeatureComingSoon from "../../components/ui/FeatureComingSoon";

export default function WritingPage() {
  return (
    <FeatureComingSoon
      number="04"
      title="AI Writing"
      subtitle="Executive Copy"
      icon={PenNib}
      accentColor="text-[#ff5f56]"
      accentBg="bg-[#ff5f56]"
      accentBorder="border-[#ff5f56]/30"
      glowColor="bg-[#ff5f56]/15"
      description="AI Writing is coming soon, stay updated as we craft advanced reasoning-backed copy generation, multi-tone rewriting, and editorial intelligence."
    />
  );
}
