"use client";
import React from "react";
import { ChatProvider } from "../../features/chat/context/ChatContext";
import ChatSidebarWrapper from "../../features/chat/components/ChatSidebarWrapper";
import ChatCanvas from "../../features/chat/components/ChatCanvas";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import EmailVerificationBanner from "../../features/auth/components/EmailVerificationBanner";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function ChatLayout({ children }) {
  const { user, isInitialized } = useAuth();

  if (isInitialized && user && !user.isEmailVerified) {
    return (
      <ProtectedRoute>
        <EmailVerificationBanner forceOpen={true} />
        <div className="h-screen w-full flex flex-col items-center justify-center bg-osmo-bg text-osmo-dark font-sans">
          <div className="bg-[#151414] text-white p-8 max-w-md text-center rounded-3xl shadow-2xl">
            <span className="text-xs font-medium text-osmo-lime uppercase tracking-wider block mb-2">
              Authentication Required
            </span>
            <h2 className="text-2xl font-display font-medium uppercase tracking-tight text-white mb-2">
              Feature Locked
            </h2>
            <p className="text-sm text-white/60 font-normal">
              Please verify your email address to access the Cognify Chat intelligence engine.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ChatProvider>
        <div className="w-full bg-osmo-bg text-osmo-dark font-sans h-screen max-h-screen overflow-hidden flex p-2 sm:p-3 lg:p-3.5 gap-3 selection:bg-osmo-lime selection:text-osmo-dark">
          <ChatSidebarWrapper />
          <ChatCanvas />
          {children}
        </div>
      </ChatProvider>
    </ProtectedRoute>
  );
}
