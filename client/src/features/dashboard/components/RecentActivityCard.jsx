"use client";
import React, { useState } from "react";
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
import { getDashboardActivity } from "../services/dashboard.service";
import { useAuth } from "../../auth/hooks/useAuth";

const CATEGORIES = [
  { id: "all", label: "ALL", tooltip: "All Workspaces" },
  { id: "01", label: "01", tooltip: "01 • AI Chat" },
  { id: "02", label: "02", tooltip: "02 • Document Analysis" },
  { id: "03", label: "03", tooltip: "03 • Resume Studio" },
  { id: "04", label: "04", tooltip: "04 • AI Writing" },
  { id: "05", label: "05", tooltip: "05 • Notes Enhancer" },
];

const VIEW_ALL_MAP = {
  "01": { label: "VIEW ALL CHAT ↗", href: "/chat" },
  "02": { label: "VIEW ALL DOCS ↗", href: "/documents" },
  "03": { label: "VIEW ALL RESUME ↗", href: "/resume" },
  "04": { label: "VIEW ALL WRITING ↗", href: "/writing" },
  "05": { label: "VIEW ALL NOTES ↗", href: "/notes" },
};

export default function RecentActivityCard() {
  const { user, logout, isLoggingOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);

  const userInitial = (user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  const {
    data: activityData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["dashboard-activity", activeCategory],
    queryFn: () => getDashboardActivity(activeCategory, 8),
    staleTime: 30000,
    retry: 1,
  });

  const items = activityData?.items || [];
  const totalCount = activityData?.totalCount ?? 0;

  const getCounterText = () => {
    if (isPending) return "— ITEMS";
    switch (activeCategory) {
      case "01":
        return `${totalCount} CHATS`;
      case "02":
        return `${totalCount} DOCS`;
      case "03":
        return `${totalCount} RESUMES`;
      case "04":
        return `${totalCount} WRITING`;
      case "05":
        return `${totalCount} NOTES`;
      default:
        return `${totalCount} ITEMS`;
    }
  };

  const getPillActiveClass = (id) => {
    switch (id) {
      case "all":
        return "bg-white/15 text-white border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.08)]";
      case "01":
        return "bg-osmo-purple/20 text-[#a855f7] border-osmo-purple/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]";
      case "02":
        return "bg-osmo-lime/20 text-osmo-lime border-osmo-lime/40 shadow-[0_0_10px_rgba(218,255,0,0.15)]";
      case "03":
        return "bg-[#ffbd2e]/20 text-[#ffbd2e] border-[#ffbd2e]/40 shadow-[0_0_10px_rgba(255,189,46,0.15)]";
      case "04":
        return "bg-[#ff5f56]/20 text-[#ff5f56] border-[#ff5f56]/40 shadow-[0_0_10px_rgba(255,95,86,0.15)]";
      case "05":
        return "bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/40 shadow-[0_0_10px_rgba(0,255,255,0.15)]";
      default:
        return "bg-white/15 text-white border-white/30";
    }
  };

  const getToolIcon = (code) => {
    switch (code) {
      case "01":
        return (
          <ChatTeardropDots
            size={16}
            weight="bold"
            className="text-osmo-purple"
          />
        );
      case "02":
        return <FilePdf size={16} weight="bold" className="text-osmo-lime" />;
      case "03":
        return (
          <BriefcaseMetal size={16} weight="bold" className="text-[#ffbd2e]" />
        );
      case "04":
        return <PenNib size={16} weight="bold" className="text-[#ff5f56]" />;
      case "05":
        return <Graph size={16} weight="bold" className="text-[#00FFFF]" />;
      default:
        return <Sparkle size={16} weight="bold" className="text-white" />;
    }
  };

  const getBadgeStyle = (code) => {
    switch (code) {
      case "01":
        return {
          label: "01 CHAT",
          className: "bg-osmo-purple/15 text-[#a855f7] border border-osmo-purple/25",
        };
      case "02":
        return {
          label: "02 DOCS",
          className: "bg-osmo-lime/15 text-osmo-lime border border-osmo-lime/25",
        };
      case "03":
        return {
          label: "03 RESUME",
          className: "bg-[#ffbd2e]/15 text-[#ffbd2e] border border-[#ffbd2e]/25",
        };
      case "04":
        return {
          label: "04 WRITE",
          className: "bg-[#ff5f56]/15 text-[#ff5f56] border border-[#ff5f56]/25",
        };
      case "05":
        return {
          label: "05 NOTES",
          className: "bg-[#00FFFF]/15 text-[#00FFFF] border border-[#00FFFF]/25",
        };
      default:
        return {
          label: "ITEM",
          className: "bg-white/10 text-white/70 border border-white/20",
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  const getEmptyStateConfig = () => {
    switch (activeCategory) {
      case "01":
        return {
          icon: <ChatTeardropDots size={22} className="text-osmo-purple/50 mb-2" />,
          title: "No chat sessions yet",
          ctaText: "Start First Thread",
          ctaHref: "/chat",
        };
      case "02":
        return {
          icon: <FilePdf size={22} className="text-osmo-lime/50 mb-2" />,
          title: "No documents analyzed yet",
          ctaText: "Upload Document",
          ctaHref: "/documents",
        };
      case "03":
        return {
          icon: <BriefcaseMetal size={22} className="text-[#ffbd2e]/50 mb-2" />,
          title: "Resume Studio coming soon",
          ctaText: "Audit Resume",
          ctaHref: "/resume",
        };
      case "04":
        return {
          icon: <PenNib size={22} className="text-[#ff5f56]/50 mb-2" />,
          title: "AI Writing coming soon",
          ctaText: "Draft Copy",
          ctaHref: "/writing",
        };
      case "05":
        return {
          icon: <Graph size={22} className="text-[#00FFFF]/50 mb-2" />,
          title: "No notes structured yet",
          ctaText: "Create First Note",
          ctaHref: "/notes",
        };
      default:
        return {
          icon: <Sparkle size={22} className="text-white/30 mb-2" />,
          title: "No activity sessions yet",
          ctaText: "Start First Thread",
          ctaHref: "/chat",
        };
    }
  };

  return (
    <div className="group relative w-full h-full bg-[#151414] border border-white/8 text-white p-4 lg:p-5 flex flex-col justify-between overflow-hidden select-none">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/8 shrink-0">
        <div>
          <h3 className="text-lg lg:text-xl font-display font-bold uppercase tracking-tight text-white leading-none">
            Activity
          </h3>
          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1 block">
            Session Stream
          </span>
        </div>

        <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-white/70 tracking-wider">
          {getCounterText()}
        </span>
      </div>

      {/* Numbered Category Filter Bar [ALL] [01] [02] [03] [04] [05] */}
      <div className="relative z-10 py-2 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-1 w-full">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                title={cat.tooltip}
                className={`relative group/pill flex-1 py-1 text-center font-mono text-[10px] font-bold tracking-wider rounded border transition-all duration-150 cursor-pointer ${
                  isActive
                    ? getPillActiveClass(cat.id)
                    : "bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80"
                }`}
              >
                <span>{cat.label}</span>

                {/* Sleek Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pill:flex pointer-events-none z-30 whitespace-nowrap px-2 py-0.5 rounded bg-[#1e1d1d] border border-white/15 text-[10px] font-sans font-medium text-white shadow-2xl backdrop-blur-md">
                  {cat.tooltip}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Stream */}
      <div
        data-lenis-prevent
        className="relative z-10 my-2 flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {isPending && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 bg-white/2 border border-white/5 animate-pulse rounded-lg"
              >
                <div className="w-7 h-7 bg-white/10 shrink-0 rounded" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/10 w-3/4 rounded" />
                  <div className="h-2 bg-white/10 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="p-4 text-center text-[#ff5f56] text-xs font-mono border border-dashed border-[#ff5f56]/20 bg-[#ff5f56]/5 rounded-lg">
            Unable to sync activity stream
          </div>
        )}

        {!isPending && !isError && items.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center border border-dashed border-white/10 bg-white/2 rounded-xl">
            {getEmptyStateConfig().icon}
            <p className="text-xs font-mono text-white/50">
              {getEmptyStateConfig().title}
            </p>
            <Link
              href={getEmptyStateConfig().ctaHref}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-osmo-lime transition-colors rounded-lg"
            >
              <Plus size={12} weight="bold" />
              <span>{getEmptyStateConfig().ctaText}</span>
            </Link>
          </div>
        )}

        {!isPending &&
          !isError &&
          items.map((act) => {
            const badge = getBadgeStyle(act.categoryCode);
            return (
              <Link
                key={act.id}
                href={act.href}
                className="group/item flex items-center rounded-lg justify-between p-2.5 hover:bg-[#00000065] transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="shrink-0 transition-colors">
                    {getToolIcon(act.categoryCode)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-white/90 truncate group-hover/item:text-osmo-lime transition-colors">
                      {act.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                      <span>{act.subLabel || act.categoryLabel}</span>
                      <span>•</span>
                      <span>{formatDate(act.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span
                    className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <ArrowRight
                    size={12}
                    weight="bold"
                    className="text-white/30 group-hover/item:text-white group-hover/item:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            );
          })}
      </div>

      {/* Footer: User Profile + Context-Aware View All */}
      <div className="relative z-10 pt-2.5 border-t border-white/[0.08] shrink-0 space-y-2.5">
        {/* View All row */}
        <div className="flex items-center justify-between text-[10px] text-white/40">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-osmo-lime animate-pulse" />
            <span>Realtime Sync</span>
          </div>

          {activeCategory === "all" ? (
            <div className="relative">
              <button
                onClick={() => setIsQuickJumpOpen(!isQuickJumpOpen)}
                className="text-osmo-lime hover:underline font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <TextRoll>View All ↗</TextRoll>
              </button>

              {isQuickJumpOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsQuickJumpOpen(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#181717] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
                    <div className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-white/40 border-b border-white/[0.06] mb-1">
                      Jump to Workspace
                    </div>
                    <Link
                      href="/chat"
                      onClick={() => setIsQuickJumpOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                    >
                      <ChatTeardropDots size={14} className="text-osmo-purple" />
                      <span>01 • AI Chat</span>
                    </Link>
                    <Link
                      href="/documents"
                      onClick={() => setIsQuickJumpOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                    >
                      <FilePdf size={14} className="text-osmo-lime" />
                      <span>02 • Documents</span>
                    </Link>
                    <Link
                      href="/resume"
                      onClick={() => setIsQuickJumpOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                    >
                      <BriefcaseMetal size={14} className="text-[#ffbd2e]" />
                      <span>03 • Resume Studio</span>
                    </Link>
                    <Link
                      href="/writing"
                      onClick={() => setIsQuickJumpOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                    >
                      <PenNib size={14} className="text-[#ff5f56]" />
                      <span>04 • AI Writing</span>
                    </Link>
                    <Link
                      href="/notes"
                      onClick={() => setIsQuickJumpOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                    >
                      <Graph size={14} className="text-[#00FFFF]" />
                      <span>05 • Notes Enhancer</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href={VIEW_ALL_MAP[activeCategory]?.href || "/chat"}
              className="text-osmo-lime hover:underline font-bold uppercase tracking-wider"
            >
              <TextRoll>
                {VIEW_ALL_MAP[activeCategory]?.label || "VIEW ALL ↗"}
              </TextRoll>
            </Link>
          )}
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
