import React from "react";
import { ChatProvider } from "../../features/chat/context/ChatContext";

export default function ChatLayout({ children }) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
}
