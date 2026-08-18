"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import * as chatService from "../services/chat.service";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    chatService
      .getChats(1, 100)
      .then((data) => {
        if (data?.chats) {
          setConversations(data.chats);
        }
      })
      .catch(console.error);
  }, [user]);

  const refreshChatTitle = useCallback(async (chatId) => {
    try {
      await new Promise((r) => setTimeout(r, 2000)); // give server time to gen title
      const data = await chatService.getChatById(chatId);
      if (!data?.chat) return;
      
      const newTitle = data.chat.title;
      if (newTitle && newTitle !== "New Chat" && newTitle !== "New Conversation") {
        setConversations((prev) =>
          prev.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c))
        );
      }
    } catch (err) {
      console.warn("[Title refresh] failed:", err);
    }
  }, []);

  const value = {
    conversations,
    setConversations,
    isSidebarOpen,
    setIsSidebarOpen,
    refreshChatTitle
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
