"use client";
import React from "react";
import { ChatProvider } from "../../features/chat/context/ChatContext";
import ChatSidebarWrapper from "../../features/chat/components/ChatSidebarWrapper";
import ChatCanvasWrapper from "../../features/chat/components/ChatCanvasWrapper";
import ProtectedRoute from "../../components/layout/ProtectedRoute";

export default function ChatLayout({ children }) {
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
