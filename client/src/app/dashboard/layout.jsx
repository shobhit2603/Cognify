"use client";
import React from "react";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import EmailVerificationBanner from "../../features/auth/components/EmailVerificationBanner";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      {/* Fixed bottom-right notification card — outside the stacking layout flow */}
      <EmailVerificationBanner />
      <div className="w-full bg-osmo-bg text-osmo-dark font-sans h-screen max-h-screen overflow-hidden flex flex-col p-2 sm:p-3 lg:p-3.5 selection:bg-osmo-lime selection:text-osmo-dark">
        {children}
      </div>
    </ProtectedRoute>
  );
}