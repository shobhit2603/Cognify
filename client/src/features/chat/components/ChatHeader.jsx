"use client";
import React from "react";
import { CaretLeft, CaretRight, Ghost } from "@phosphor-icons/react";
import { useChatContext } from "../context/ChatContext";

export default function ChatHeader({
  isSidebarOpen,
  onToggleSidebar,
  activeChatTitle = "New Conversation",
}) {
  const { isTemporaryChat, setIsTemporaryChat } = useChatContext();
  const isNewChat = activeChatTitle === "New Conversation" || activeChatTitle === "New Chat";

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-transparent z-10 select-none text-white">
      {/* Left: Sidebar Toggle & Thread Title */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center bg-white/5"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <CaretLeft size={18} weight="bold" />
          ) : (
            <CaretRight size={18} weight="bold" />
          )}
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base sm:text-lg font-medium text-white/90 truncate">
            {activeChatTitle || "New Conversation"}
          </span>
        </div>
      </div>

      {/* Right: Actions & AI Status */}
      <div className="flex items-center gap-4">
        {isNewChat && (
          <button
            onClick={() => setIsTemporaryChat(!isTemporaryChat)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              isTemporaryChat 
                ? "bg-white text-black" 
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
            title="When active, messages are not saved to history"
          >
            <Ghost size={16} weight={isTemporaryChat ? "fill" : "bold"} />
            {isTemporaryChat ? "Temporary Mode On" : "Temporary Chat"}
          </button>
        )}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-white/40 font-normal">
          <span className="w-2 h-2 rounded-full bg-osmo-lime animate-pulse" />
          <span className="hidden sm:inline">Active</span>
        </div>
      </div>
    </header>
  );
}
