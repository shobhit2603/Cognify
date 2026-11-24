"use client";
import React, { Suspense } from "react";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import ResumeStudio from "../../features/resume/components/ResumeStudio";

export default function ResumePage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-white">
            <div className="w-8 h-8 border-4 border-[#ffbd2e]/30 border-t-[#ffbd2e] rounded-full animate-spin" />
          </div>
        }
      >
        <ResumeStudio />
      </Suspense>
    </ProtectedRoute>
  );
}
