"use client";
import React from "react";
import { BriefcaseMetal } from "@phosphor-icons/react";
import FeatureComingSoon from "../../components/ui/FeatureComingSoon";

export default function ResumePage() {
  return (
    <FeatureComingSoon
      number="03"
      title="Resume Studio"
      subtitle="ATS Optimizer"
      icon={BriefcaseMetal}
      accentColor="text-[#ffbd2e]"
      accentBg="bg-[#ffbd2e]"
      accentBorder="border-[#ffbd2e]/30"
      glowColor="bg-[#ffbd2e]/15"
      description="Resume Studio is coming soon, stay updated as we build algorithmic ATS scoring, keyword gap parsing, and recruiter-ready executive summaries."
    />
  );
}
