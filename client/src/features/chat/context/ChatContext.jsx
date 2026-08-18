"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import * as chatService from "../services/chat.service";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize conversations
  useEffect(() => {
    let active = true;
    if (!user?._id) {
      setConversations([]);
      return;
    }

    chatService
      .getChats(1, 100)
      .then((data) => {
        if (data?.chats && active) {
          setConversations(data.chats);
        }
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [user?._id]);

  const refreshChatTitle = useCallback(async (chatId) => {
    let attempts = 0;
    while (attempts < 3) {
      try {
        await new Promise((r) => setTimeout(r, 1500));
        const data = await chatService.getChatById(chatId);
        if (!data?.chat) break;
        
        const newTitle = data.chat.title;
        if (newTitle && newTitle !== "New Chat" && newTitle !== "New Conversation") {
          setConversations((prev) =>
            prev.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c))
          );
          break; // Successfully got the title
        }
      } catch (err) {
        console.warn("[Title refresh] failed:", err);
      }
      attempts++;
    }
  }, []);

  const togglePinChat = useCallback(async (id) => {
    let oldPinned = false;
    setConversations((prev) => {
      const chat = prev.find((c) => c._id === id);
      if (chat) oldPinned = chat.pinned;
      return prev.map((c) => (c._id === id ? { ...c, pinned: !c.pinned } : c));
    });
    try {
      await chatService.updateChat(id, { pinned: !oldPinned });
    } catch (err) {
      console.error(err);
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, pinned: oldPinned } : c)),
      );
    }
  }, []);

  const deleteChat = useCallback(async (id, isActive, onDeletedActive) => {
    try {
      await chatService.deleteChat(id);
      setConversations((prev) => {
        const remaining = prev.filter((c) => c._id !== id);
        if (isActive && onDeletedActive) {
          onDeletedActive(remaining);
        }
        return remaining;
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const saveRenameChat = useCallback(async (id, newTitle) => {
    if (!newTitle.trim()) return;
    let oldTitle = "";
    setConversations((prev) => {
      const chat = prev.find((c) => c._id === id);
      if (chat) oldTitle = chat.title;
      return prev.map((c) => (c._id === id ? { ...c, title: newTitle.trim() } : c));
    });
    try {
      await chatService.updateChat(id, { title: newTitle.trim() });
    } catch (err) {
      console.error(err);
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, title: oldTitle } : c)),
      );
    }
  }, []);

  const value = useMemo(() => ({
    conversations,
    setConversations,
    isSidebarOpen,
    setIsSidebarOpen,
    refreshChatTitle,
    togglePinChat,
    deleteChat,
    saveRenameChat
  }), [
    conversations,
    isSidebarOpen,
    refreshChatTitle,
    togglePinChat,
    deleteChat,
    saveRenameChat
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
