"use client";
import React, { Suspense } from "react";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import NotesStudio from "../../features/notes/components/NotesStudio";

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-white">
            <div className="w-8 h-8 border-4 border-osmo-lime/30 border-t-osmo-lime rounded-full animate-spin" />
          </div>
        }
      >
        <NotesStudio />
      </Suspense>
    </ProtectedRoute>
  );
}
