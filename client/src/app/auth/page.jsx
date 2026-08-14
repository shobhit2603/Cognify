import React from "react";
import AuthModal from "../../features/auth/components/AuthModal";

export const metadata = {
  title: "Authentication | Cognify",
  description: "Sign in or create your Cognify AI account",
};

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-brand-white">
      <AuthModal isOpen={true} />
    </div>
  );
}