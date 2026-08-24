"use client";
import React from "react";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import EmailVerificationBanner from "../../features/auth/components/EmailVerificationBanner";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      {/* Fixed bottom-right notification card — outside the stacking layout flow */}
      <EmailVerificationBanner />
      <div className="w-full bg-osmo-bg text-osmo-dark font-sans h-screen max-h-screen overflow-hidden flex flex-col selection:bg-osmo-lime selection:text-osmo-dark">
        {children}
      </div>
    </ProtectedRoute>
  );
}