"use client";
import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ChatTeardropDots,
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph,
  ArrowRight,
  Sparkle,
  Plus,
  SignOut,
} from "@phosphor-icons/react";
import TextRoll from "../../../components/ui/TextRoll";
import { getChats } from "../../chat/services/chat.service";
import { useAuth } from "../../auth/hooks/useAuth";

export default function RecentActivityCard() {
  const { user, logout, isLoggingOut } = useAuth();
  const userInitial = (user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();
  const {
    data: chatsData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["chats", 1, 20],
    queryFn: () => getChats(1, 20),
    staleTime: 30000,
    retry: 1,
  });

  const apiChats = chatsData?.chats || [];

  const activities = apiChats.map((chat) => {
    const timestamp = chat.updatedAt || chat.createdAt;
    return {
      id: chat._id,
      title: chat.title || "Untitled Conversation",
      tool: "AI Chat",
      toolType: "chat",
      href: `/chat/${chat._id}`,
      time: timestamp
        ? new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Recently",
      badge: "CHAT",
      badgeColor: "bg-osmo-lime/15 text-osmo-lime",
    };
  });

  const getToolIcon = (type) => {
    switch (type) {
      case "chat":
        return (
          <ChatTeardropDots
            size={15}
            weight="bold"
            className="text-osmo-purple"
          />
        );
      case "documents":
        return <FilePdf size={15} weight="bold" className="text-osmo-lime" />;
      case "resume":
        return (
          <BriefcaseMetal size={15} weight="bold" className="text-[#ffbd2e]" />
        );
      case "writing":
        return <PenNib size={15} weight="bold" className="text-[#ff5f56]" />;
      case "notes":
        return <Graph size={15} weight="bold" className="text-[#00FFFF]" />;
      default:
        return <Sparkle size={15} weight="bold" className="text-white" />;
    }
  };

  return (
    <div className="group relative w-full h-full bg-[#151414] border border-white/8 text-white p-4 lg:p-5 flex flex-col justify-between overflow-hidden select-none">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/8 shrink-0">
        <div>
          <h3 className="text-lg lg:text-xl font-display font-bold uppercase tracking-tight text-white leading-none">
            Activity
          </h3>
          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1 block">
            Session Stream
          </span>
        </div>

        <span className="px-2 py-0.5 text-[10px] font-bold text-white/70 tracking-wider">
          {activities.length} SESSIONS
        </span>
      </div>

      {/* Scrollable Stream */}
      <div
        data-lenis-prevent
        className="relative z-10 my-2.5 flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1"
      >
        {isPending && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 bg-white/2 border border-white/5 animate-pulse"
              >
                <div className="w-7 h-7 bg-white/10 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/10 w-3/4" />
                  <div className="h-2 bg-white/10 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="p-4 text-center text-[#ff5f56] text-xs font-mono border border-dashed border-[#ff5f56]/20 bg-[#ff5f56]/5">
            Unable to sync session stream
          </div>
        )}

        {!isPending && !isError && activities.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center border border-dashed border-white/10 bg-white/2">
            <Sparkle size={20} className="text-white/30 mb-2" />
            <p className="text-xs font-mono text-white/50">
              No activity sessions yet
            </p>
            <Link
              href="/chat"
              className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-osmo-lime transition-colors"
            >
              <Plus size={12} weight="bold" />
              <span>Start First Thread</span>
            </Link>
          </div>
        )}

        {!isPending &&
          !isError &&
          activities.map((act) => (
            <Link
              key={act.id}
              href={act.href}
              className="group/item flex items-center rounded-lg justify-between p-2.5 hover:bg-[#00000065] transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="shrink-0 transition-colors">
                  {getToolIcon(act.toolType)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-md font-bold text-white/90 truncate group-hover/item:text-osmo-lime transition-colors">
                    {act.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                    <span>{act.tool}</span>
                    <span>•</span>
                    <span>{act.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 ${act.badgeColor}`}
                >
                  {act.badge}
                </span>
                <ArrowRight
                  size={12}
                  weight="bold"
                  className="text-white/30 group-hover/item:text-white group-hover/item:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          ))}
      </div>

      {/* Footer: User Profile + Logout */}
      <div className="relative z-10 pt-2.5 border-t border-white/[0.08] shrink-0 space-y-2.5">
        {/* View All row */}
        <div className="flex items-center justify-between text-[10px] text-white/40">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime animate-pulse" />
            <span>Realtime Sync</span>
          </div>
          <Link
            href="/chat"
            className="text-osmo-lime hover:underline font-bold uppercase tracking-wider"
          >
            <TextRoll>View All ↗</TextRoll>
          </Link>
        </div>

        {/* User row */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.06]">
          <div className="w-8 h-8 rounded-full bg-osmo-purple flex items-center justify-center text-xs font-bold text-white shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white/90 truncate leading-tight">
              {user?.name || "Workspace User"}
            </p>
            <p className="text-[10px] text-white/35 truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="shrink-0 p-1.5 bg-white/5 hover:bg-red-500/15 text-white/40 hover:text-red-400 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40"
            title="Sign Out"
          >
            <SignOut size={13} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
