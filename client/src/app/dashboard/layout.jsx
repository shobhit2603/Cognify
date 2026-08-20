"use client";
import React from "react";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import EmailVerificationBanner from "../../features/auth/components/EmailVerificationBanner";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <EmailVerificationBanner />
      <div className="w-full bg-osmo-bg text-osmo-dark font-sans md:h-screen md:overflow-hidden md:flex md:flex-col p-2 sm:p-2.5 lg:p-2">
        {children}
      </div>
    </ProtectedRoute>
  );
}
