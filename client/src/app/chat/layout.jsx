"use client";
import React from "react";
import { ChatProvider } from "../../features/chat/context/ChatContext";
import ChatSidebarWrapper from "../../features/chat/components/ChatSidebarWrapper";
import ChatCanvasWrapper from "../../features/chat/components/ChatCanvasWrapper";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import EmailVerificationBanner from "../../features/auth/components/EmailVerificationBanner";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function ChatLayout({ children }) {
  const { user, isInitialized } = useAuth();

  if (isInitialized && user && !user.isEmailVerified) {
    return (
      <ProtectedRoute>
        <EmailVerificationBanner forceOpen={true} />
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FBFBFA]">
           <h2 className="text-2xl font-bold mb-2 text-brand-black">Feature Locked</h2>
           <p className="text-gray-500">Please verify your email to access the Chat feature.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ChatProvider>
        <div className="-mt-24 flex h-screen w-full bg-[#FBFBFA] text-brand-black overflow-hidden relative selection:bg-brand-orange selection:text-white">
          <ChatSidebarWrapper />
          <ChatCanvasWrapper />
          {children}
        </div>
      </ChatProvider>
    </ProtectedRoute>
  );
}
