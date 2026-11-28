import React from "react";
import ApiDocsContent from "../../components/api-docs/ApiDocsContent";

export const metadata = {
  title: "API Reference ✻ Cognify AI Workspace",
  description:
    "REST and Server-Sent Events (SSE) API documentation across Auth, AI Chat, Documents, Resumes, AI Writing, and Notes.",
};

export default function ApiDocsPage() {
  return <ApiDocsContent />;
}
