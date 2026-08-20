"use client";
import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useAuth } from "../../auth/hooks/useAuth";

export default function ChatEmptyState() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12 max-w-xl mx-auto select-none"
    >
      {/* Cognify Brand Logo Avatar */}
      <div className="relative w-15 h-15 flex items-center justify-center mb-6">
        <Image
          src="/Cognify-Logo.png"
          alt="Cognify Logo"
          fill
          sizes="50px"
          className="object-contain p-2"
          priority
        />
      </div>

      {/* Hi, User Headline */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight text-white mb-4">
        Hi, {firstName}<span className="text-osmo-lime">.</span>
      </h2>

      {/* Warm, Minimal Welcome & Description */}
      <p className="text-base sm:text-lg text-white/65 font-normal leading-relaxed mb-3">
        Welcome to your workspace.
      </p>
      
      <p className="text-sm sm:text-base text-white/45 font-normal leading-relaxed max-w-md">
        Ask anything to reason through complex problems, synthesize research documents, draft high-impact copy, or explore ideas.
      </p>
    </motion.div>
  );
}
