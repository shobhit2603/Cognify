"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatSidebar from "./ChatSidebar";
import { useChatContext } from "../context/ChatContext";

export default function ChatSidebarWrapper() {
  const router = useRouter();
  const params = useParams();
  const activeChatId = params?.id || null;

  const {
    isSidebarOpen,
    conversations,
    togglePinChat,
    deleteChat,
    saveRenameChat,
    setIsTemporaryChat,
    triggerNewChat
  } = useChatContext();

  const [searchFilter, setSearchFilter] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredConversations = conversations.filter((c) =>
    c.title?.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const unpinnedConversations = filteredConversations.filter((c) => !c.pinned);

  const handleNewChat = useCallback(() => {
    setIsTemporaryChat(false);
    triggerNewChat();
    router.push("/chat");
  }, [router, setIsTemporaryChat, triggerNewChat]);

  // Global shortcut listener: Cmd/Ctrl + N for new thread
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewChat]);

  const handleSelectChat = (id) => {
    setIsTemporaryChat(false);
    if (id !== activeChatId) {
      router.push(`/chat/${id}`);
    }
  };

  const handleStartRename = (id, currentTitle, e) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    saveRenameChat(id, editTitle);
    setEditingChatId(null);
  };

  const handleCancelRename = (e) => {
    e?.stopPropagation();
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleTogglePin = (id, e) => {
    e.stopPropagation();
    togglePinChat(id);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteChat(id);
      if (id === activeChatId) {
        const remaining = conversations.filter((c) => c._id !== id);
        if (remaining.length > 0) {
          router.push(`/chat/${remaining[0]._id}`);
        } else {
          router.push("/chat");
        }
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  return (
    <ChatSidebar
      isSidebarOpen={isSidebarOpen}
      searchFilter={searchFilter}
      setSearchFilter={setSearchFilter}
      pinnedConversations={pinnedConversations.map((c) => ({
        id: c._id,
        title: c.title,
        date: c.createdAt,
        isPinned: c.pinned,
      }))}
      unpinnedConversations={unpinnedConversations.map((c) => ({
        id: c._id,
        title: c.title,
        date: c.createdAt,
        isPinned: c.pinned,
      }))}
      activeChatId={activeChatId}
      editingChatId={editingChatId}
      editTitle={editTitle}
      setEditTitle={setEditTitle}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onStartRename={handleStartRename}
      onSaveRename={handleSaveRename}
      onCancelRename={handleCancelRename}
      onTogglePin={handleTogglePin}
      onDelete={handleDelete}
    />
  );
}
