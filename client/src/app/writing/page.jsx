"use client";
import React, { Suspense } from "react";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import WritingStudio from "../../features/writing/components/WritingStudio";

export default function WritingPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-white">
            <div className="w-8 h-8 border-4 border-[#ff5f56]/30 border-t-[#ff5f56] rounded-full animate-spin" />
          </div>
        }
      >
        <WritingStudio />
      </Suspense>
    </ProtectedRoute>
  );
}
