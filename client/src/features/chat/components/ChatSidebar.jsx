"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  MagnifyingGlass,
  PushPin,
  PencilSimple,
  Trash,
  X,
  Check,
  SquaresFour,
  SignOut,
  ChatDots,
  CubeIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../auth/hooks/useAuth";

export default function ChatSidebar({
  isSidebarOpen,
  searchFilter,
  setSearchFilter,
  pinnedConversations,
  unpinnedConversations,
  activeChatId,
  editingChatId,
  editTitle,
  setEditTitle,
  onNewChat,
  onSelectChat,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onTogglePin,
  onDelete,
}) {
  const { user, logout, isLoggingOut } = useAuth();
  const userInitial = (user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <aside
      className={`h-full bg-[#151414] text-white rounded-3xl overflow-hidden select-none shrink-0 z-20 shadow-2xl flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width,opacity,margin] ${
        isSidebarOpen
          ? "w-72 sm:w-80 opacity-100"
          : "w-0 opacity-0 pointer-events-none -mr-3"
      }`}
    >
      <div className="w-72 sm:w-80 h-full flex flex-col justify-between p-4 gap-4 shrink-0">
        {/* Top Section: Brand Header & New Thread & Search */}
        <div className="flex flex-col gap-3.5 shrink-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <Link
              href="/dashboard"
              className="group/brand flex items-center gap-2.5 transition-transform active:scale-95"
              title="Return to Dashboard"
            >
              <div className="relative w-7 h-7 shrink-0 transition-transform duration-500 group-hover/brand:rotate-12 group-hover/brand:scale-105">
                <Image
                  src="/Cognify-Logo.png"
                  alt="Cognify Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="font-display font-medium text-xl tracking-tight text-white leading-none block">
                  COGNIFY<span className="text-osmo-lime">.</span>
                </span>
              </div>
            </Link>
          </div>

          {/* New Thread CTA Button */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer group shadow-sm"
          >
            <span className="flex items-center gap-2.5">
              <Plus
                size={17}
                weight="bold"
                className="text-osmo-lime group-hover:rotate-90 transition-transform duration-300"
              />
              <span>New Conversation</span>
            </span>
            <span className="text-xs text-white/40 px-2 py-0.5 bg-white/5 rounded-lg">
              ⌘N
            </span>
          </button>

          {/* Search Field */}
          <div className="relative flex items-center">
            <MagnifyingGlass
              size={16}
              className="absolute left-3.5 text-white/40 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-white/5 focus:bg-white/8 text-sm text-white placeholder:text-white/30 rounded-2xl pl-10 pr-8 py-2.5 outline-none transition-all"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="absolute right-3 text-white/40 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Center: Scrollable Conversation History */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1"
        >
          {/* Pinned Threads */}
          {pinnedConversations.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-white/40 uppercase tracking-wider px-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <PushPin size={13} weight="fill" className="text-osmo-lime" />
                  <span>Pinned</span>
                </div>
                <span className="text-xs text-white/30">
                  {pinnedConversations.length}
                </span>
              </div>
              <div className="space-y-1">
                {pinnedConversations.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChatId === chat.id}
                    editingChatId={editingChatId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => onSelectChat(chat.id)}
                    onStartRename={(e) => onStartRename(chat.id, chat.title, e)}
                    onSaveRename={(e) => onSaveRename(chat.id, e)}
                    onCancelRename={onCancelRename}
                    onTogglePin={(e) => onTogglePin(chat.id, e)}
                    onDelete={(e) => onDelete(chat.id, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Workspaces */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-white/40 uppercase tracking-wider px-2 mb-2">
              <span>Recent</span>
              <span className="text-xs text-white/30">
                {unpinnedConversations.length}
              </span>
            </div>
            <div className="space-y-1">
              {unpinnedConversations.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChatId === chat.id}
                  editingChatId={editingChatId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={() => onSelectChat(chat.id)}
                  onStartRename={(e) => onStartRename(chat.id, chat.title, e)}
                  onSaveRename={(e) => onSaveRename(chat.id, e)}
                  onCancelRename={onCancelRename}
                  onTogglePin={(e) => onTogglePin(chat.id, e)}
                  onDelete={(e) => onDelete(chat.id, e)}
                />
              ))}
              {unpinnedConversations.length === 0 && searchFilter && (
                <div className="text-center py-6 px-2 text-sm text-white/40">
                  No matching conversations
                </div>
              )}
              {unpinnedConversations.length === 0 &&
                !searchFilter &&
                pinnedConversations.length === 0 && (
                  <div className="text-center py-8 px-2 text-sm text-white/40">
                    <ChatDots
                      size={20}
                      className="mx-auto text-white/30 mb-2"
                    />
                    No active conversations
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Bottom Section: User Profile & Quick Actions */}
        <div className="pt-2 shrink-0 flex items-center justify-between gap-2 bg-white/4 p-3 rounded-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-osmo-purple text-white flex items-center justify-center text-sm font-medium shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate leading-tight">
                {user?.name || "Workspace User"}
              </div>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <Link
              href="/dashboard"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
              title="Dashboard Bento"
            >
              <CubeIcon size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Sub-component for history list items
function ChatListItem({
  chat,
  isActive,
  editingChatId,
  editTitle,
  setEditTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onTogglePin,
  onDelete,
}) {
  const isEditing = editingChatId === chat.id;

  const handleRowKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  const handleDeleteWithConfirm = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${chat.title}"? This cannot be undone.`)) {
      onDelete(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleRowKeyDown}
      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm cursor-pointer transition-all duration-150 select-none ${
        isActive
          ? "bg-white/10 text-white font-medium shadow-xs"
          : "bg-transparent text-white/70 hover:bg-white/5 hover:text-white font-normal"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-1">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveRename(e);
              if (e.key === "Escape") onCancelRename?.(e);
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1e1c1c] text-white px-2.5 py-1 outline-none w-full text-sm rounded-xl font-normal"
          />
        ) : (
          <span className="truncate leading-tight">
            {chat.title || "Untitled Conversation"}
          </span>
        )}
      </div>

      {/* Action Buttons: Show on Hover / Keyboard Focus */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onTogglePin}
          className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
            chat.isPinned
              ? "text-osmo-lime opacity-100"
              : "text-white/40 hover:text-white"
          }`}
          title={chat.isPinned ? "Unpin thread" : "Pin thread"}
        >
          <PushPin size={13} weight={chat.isPinned ? "fill" : "regular"} />
        </button>

        {isEditing ? (
          <button
            onClick={onSaveRename}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-osmo-lime"
            title="Save title"
          >
            <Check size={13} weight="bold" />
          </button>
        ) : (
          <button
            onClick={onStartRename}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            title="Rename thread"
          >
            <PencilSimple size={13} />
          </button>
        )}

        <button
          onClick={handleDeleteWithConfirm}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
          title="Delete thread"
        >
          <Trash size={13} />
        </button>
      </div>
    </div>
  );
}
