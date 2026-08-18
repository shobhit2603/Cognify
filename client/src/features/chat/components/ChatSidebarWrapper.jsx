"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
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
    saveRenameChat
  } = useChatContext();

  const [searchFilter, setSearchFilter] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredConversations = conversations.filter((c) =>
    c.title?.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const unpinnedConversations = filteredConversations.filter((c) => !c.pinned);

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleSelectChat = (id) => {
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

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteChat(id, id === activeChatId, (remaining) => {
      if (remaining.length > 0) {
        router.push(`/chat/${remaining[0]._id}`);
      } else {
        router.push("/chat");
      }
    });
  };

  return (
    <AnimatePresence initial={false}>
      {isSidebarOpen && (
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
      )}
    </AnimatePresence>
  );
}
