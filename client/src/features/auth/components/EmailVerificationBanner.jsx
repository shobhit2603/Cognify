"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EnvelopeSimple, X, ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";

/**
 * EmailVerificationBanner
 *
 * A prominent bottom-right notification card that prompts unverified users
 * to verify their email. Dismissible, links to /verify-email.
 */
export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isEmailVerified || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 28, delay: 1.5 }}
        className="fixed bottom-5 right-5 z-50 w-80 bg-osmo-dark border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
        role="status"
        aria-label="Email verification required"
      >
        {/* Lime accent bar at top */}
        <div className="h-0.5 w-full bg-osmo-lime" />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-osmo-lime/10 border border-osmo-lime/20 flex items-center justify-center shrink-0">
                <EnvelopeSimple size={16} weight="fill" className="text-osmo-lime" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-white leading-tight">
                  Verify your email
                </p>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  Action required
                </p>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="w-6 h-6 rounded-full text-gray-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5"
            >
              <X size={13} weight="bold" />
            </button>
          </div>

          {/* Body */}
          <p className="text-xs text-gray-400 font-sans leading-relaxed mb-4">
            Unlock all features including AI Chat and Progress Tracking by verifying{" "}
            <span className="text-white font-medium">{user.email}</span>.
          </p>

          {/* CTA */}
          <Link
            href="/verify-email"
            className="flex items-center justify-center gap-2 w-full bg-osmo-lime hover:bg-gray-200 text-osmo-dark font-display font-semibold text-xs transition-all duration-200 py-2.5 rounded-sm hover:rounded-xl cursor-pointer group"
          >
            <span>Verify Now</span>
            <ArrowRight size={13} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
