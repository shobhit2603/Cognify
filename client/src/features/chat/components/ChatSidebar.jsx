import React from "react";
import { motion } from "motion/react";
import { Plus, MagnifyingGlass, PushPin, ChatTeardropDots, PencilSimple, Trash, X, Check } from "@phosphor-icons/react";

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
  onDelete
}) {
  return (
    <motion.aside
      key="chat-sidebar"
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full bg-white border-r border-black/8 flex flex-col shrink-0 overflow-hidden z-20 shadow-xs w-77.5"
    >
      {/* Sidebar Header & Brand Meta */}
      <div className="p-4 pb-3 flex flex-col gap-3 border-b border-black/6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="text-xs font-display font-bold uppercase tracking-wider text-gray-500">
              Cognify Threads
            </span>
          </div>
          <span className="text-[10px] font-mono bg-black/5 px-2 py-0.5 rounded-full text-gray-500 font-medium">
            Mistral 2.0
          </span>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center justify-between bg-brand-black hover:bg-brand-orange text-white py-2.5 px-4 rounded-xl text-xs font-display font-semibold transition-all shadow-xs cursor-pointer group"
        >
          <span className="flex items-center gap-2">
            <Plus size={15} weight="bold" className="group-hover:rotate-90 transition-transform" />
            <span>New Intelligence Thread</span>
          </span>
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-300">⌘N</kbd>
        </button>

        {/* Minimal Search Field */}
        <div className="relative flex items-center">
          <MagnifyingGlass size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-[#F4F4F3] border border-transparent focus:border-black/20 focus:bg-white rounded-xl pl-8 pr-3 py-2 text-xs text-brand-black placeholder:text-gray-400 outline-none transition-all font-sans"
          />
        </div>
      </div>

      {/* Scrollable Conversation History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Pinned Threads */}
        {pinnedConversations.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              <PushPin size={11} weight="fill" className="text-brand-orange" />
              <span>Pinned</span>
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

        {/* Recent History */}
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
            Recent Workspaces
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
              <p className="text-xs text-gray-400 px-2 mt-2">No conversations found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer Context */}
      <div className="p-3 border-t border-black/6 flex items-center justify-between text-xs text-gray-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Session Isolated</span>
        </span>
        <span>v1.0</span>
      </div>
    </motion.aside>
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
  onDelete
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
      className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 ${
        isActive ? "bg-black/[0.07] text-brand-black font-semibold" : "text-gray-600 hover:bg-black/3 hover:text-brand-black"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
        <ChatTeardropDots size={14} className={isActive ? "text-brand-orange" : "text-gray-400"} weight={isActive ? "fill" : "regular"} />
        
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
            className="bg-white border border-black/20 rounded px-1.5 py-0.5 outline-none w-full text-brand-black"
          />
        ) : (
          <span className="truncate">{chat.title}</span>
        )}
      </div>

      {/* Show on hover OR when the row/any child has keyboard focus */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onTogglePin}
          className={`p-1 rounded hover:bg-black/10 transition-colors ${chat.isPinned ? "text-brand-orange opacity-100" : "text-gray-400"}`}
          title={chat.isPinned ? "Unpin chat" : "Pin chat"}
        >
          <PushPin size={13} weight={chat.isPinned ? "fill" : "regular"} />
        </button>

        {isEditing ? (
          <button onClick={onSaveRename} className="p-1 rounded hover:bg-black/10 transition-colors text-emerald-600">
            <Check size={13} />
          </button>
        ) : (
          <button onClick={onStartRename} className="p-1 rounded hover:bg-black/10 transition-colors text-gray-400">
            <PencilSimple size={13} />
          </button>
        )}

        <button onClick={handleDeleteWithConfirm} className="p-1 rounded hover:bg-red-100 transition-colors text-gray-400 hover:text-red-500">
          <Trash size={13} />
        </button>
      </div>
    </div>
  );
}
