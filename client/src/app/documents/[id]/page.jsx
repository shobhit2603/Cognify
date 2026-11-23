"use client";
import React, { use } from "react";
import ProtectedRoute from "../../../components/layout/ProtectedRoute";
import DocumentAnalysisView from "../../../features/documents/components/DocumentAnalysisView";

export default function DocumentDetailPage({ params }) {
  const unwrappedParams = use(params);
  const documentId = unwrappedParams.id;

  return (
    <ProtectedRoute>
      <div className="w-full h-screen max-h-screen overflow-hidden flex flex-col bg-[#0d0d0f]">
        <DocumentAnalysisView documentId={documentId} />
      </div>
    </ProtectedRoute>
  );
}
