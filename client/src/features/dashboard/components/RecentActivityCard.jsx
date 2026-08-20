"use client";
import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ClockCounterClockwise,
  ChatTeardropDots,
  FilePdf,
  BriefcaseMetal,
  PenNib,
  Graph,
  ArrowRight,
  Sparkle
} from "@phosphor-icons/react";
import { getChats } from "../../chat/services/chat.service";

export const FALLBACK_ACTIVITIES = [
  {
    id: "f-1",
    title: "Distributed Microservices & Latency Tuning",
    tool: "AI Chat",
    toolType: "chat",
    href: "/chat",
    time: "12m ago",
    badge: "Chat",
    badgeColor: "bg-osmo-lime text-black"
  },
  {
    id: "f-2",
    title: "Quarterly_Engineering_Strategy_2026.pdf",
    tool: "Documents",
    toolType: "documents",
    href: "/documents",
    time: "2h ago",
    badge: "PDF",
    badgeColor: "bg-osmo-purple text-white"
  },
  {
    id: "f-3",
    title: "Staff AI Engineer Resume ATS Audit",
    tool: "Resume",
    toolType: "resume",
    href: "/resume",
    time: "5h ago",
    badge: "94% ATS",
    badgeColor: "bg-[#ffbd2e] text-black"
  },
  {
    id: "f-4",
    title: "Executive Board Update & Strategic Pitch",
    tool: "Writing",
    toolType: "writing",
    href: "/writing",
    time: "Yesterday",
    badge: "Copy",
    badgeColor: "bg-[#ff5f56] text-white"
  },
  {
    id: "f-5",
    title: "System Design Blueprint: Event-Driven Kafka",
    tool: "Notes",
    toolType: "notes",
    href: "/notes",
    time: "2 days ago",
    badge: "Notes",
    badgeColor: "bg-[#27c93f] text-black"
  },
  {
    id: "f-6",
    title: "Mistral Reasoning Benchmark & Quantization",
    tool: "AI Chat",
    toolType: "chat",
    href: "/chat",
    time: "3 days ago",
    badge: "Chat",
    badgeColor: "bg-osmo-lime text-black"
  }
];

export default function RecentActivityCard() {
  // Query actual user chats from the API
  const { data: chatsData, isPending, isError } = useQuery({
    queryKey: ["chats", 1, 20],
    queryFn: () => getChats(1, 20),
    staleTime: 30000,
    retry: 1
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
        ? new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Recently",
      badge: "Chat",
      badgeColor: "bg-osmo-lime text-black"
    };
  });

  const getToolIcon = (type) => {
    switch (type) {
      case "chat":
        return <ChatTeardropDots size={18} weight="bold" className="text-osmo-lime" />;
      case "documents":
        return <FilePdf size={18} weight="bold" className="text-osmo-purple" />;
      case "resume":
        return <BriefcaseMetal size={18} weight="bold" className="text-[#ffbd2e]" />;
      case "writing":
        return <PenNib size={18} weight="bold" className="text-[#ff5f56]" />;
      case "notes":
        return <Graph size={18} weight="bold" className="text-[#27c93f]" />;
      default:
        return <Sparkle size={18} weight="bold" className="text-white" />;
    }
  };

  return (
    <div className="relative w-full h-full bg-osmo-dark text-white rounded-lg p-4 sm:p-5 shadow-sm flex flex-col justify-between overflow-hidden select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-lg sm:text-3xl font-display font-bold tracking-tight text-white leading-none">
              Recent Activity
            </h3>
            <span className="text-xs font-mono text-white/50 uppercase mt-0.5 block">
              Internal Workspace Stream
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-white/5 text-xs font-mono text-white/80 rounded-none font-bold">
          {activities.length} Sessions
        </span>
      </div>

      {/* Internal Scrollable Activity Stream Container */}
      <div data-lenis-prevent className="my-2.5 flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {isPending && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/3">
                <div className="w-9 h-9 bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 w-2/3" />
                  <div className="h-3 bg-white/10 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}
        {isError && (
          <div className="p-4 text-center text-[#ff5f56]/70 text-sm font-mono border border-dashed border-[#ff5f56]/20">
            Failed to load activity
          </div>
        )}
        {!isPending && !isError && activities.length === 0 && (
          <div className="p-4 text-center text-white/50 text-sm font-mono border border-dashed border-white/10">
            No recent activity
          </div>
        )}
        {!isPending && !isError && activities.map((act) => (
          <Link
            key={act.id}
            href={act.href}
            className="group flex items-center justify-between p-3 bg-white/3 hover:bg-white/8 rounded-none transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 bg-white/5 rounded-none shrink-0 group-hover:scale-105 transition-transform">
                {getToolIcon(act.toolType)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white/95 truncate group-hover:text-white transition-colors">
                  {act.title}
                </h4>
                <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-0.5">
                  <span className="text-white/70 font-semibold">{act.tool}</span>
                  <span>•</span>
                  <span>{act.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className={`text-[10px] sm:text-xs font-mono font-black uppercase px-2 py-0.5 rounded-none ${act.badgeColor}`}>
                {act.badge}
              </span>
              <ArrowRight 
                size={16} 
                weight="bold" 
                className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" 
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Footer Link */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50 shrink-0">
        <span>Internal scroll active</span>
        <Link
          href="/chat"
          className="text-osmo-lime hover:underline font-bold flex items-center gap-1"
        >
          View all ↗
        </Link>
      </div>
    </div>
  );
}
