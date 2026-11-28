"use client";
import React from "react";
import {
  MagnifyingGlass,
  Plus,
  PushPin,
  Trash,
  PenNib,
  EnvelopeSimple,
  ReadCvLogo,
} from "@phosphor-icons/react";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "email", label: "Emails" },
  { id: "cover-letter", label: "Cover Letters" },
];

export default function WritingDrawer({
  drawerRef = null,
  drafts = [],
  activeDraftId = null,
  onSelectDraft,
  onNewDraft,
  onDeleteDraft,
  onTogglePin,
  typeFilter = "all",
  setTypeFilter,
  searchQuery = "",
  setSearchQuery,
  isOpen = true,
  isLoading = false,
  isError = false,
  onRetry,
}) {
  const pinnedDrafts = drafts.filter((d) => d.isPinned);
  const regularDrafts = drafts.filter((d) => !d.isPinned);

  const formatShortDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const renderDraftRow = (draft) => {
    const isActive = draft._id === activeDraftId;
    const isEmail = draft.type === "email";

    return (
      <div
        key={draft._id}
        className={`group relative flex items-start gap-1.5 px-2 py-1.5 rounded-lg transition-all border ${
          isActive
            ? "bg-[#ff5f56]/12 border-[#ff5f56]/35 text-white"
            : "bg-transparent border-transparent text-white/70 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        <button
          type="button"
          onClick={() => onSelectDraft(draft._id)}
          className="flex items-start gap-2.5 min-w-0 flex-1 text-left py-0.5 px-0.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff5f56]/70 cursor-pointer"
        >
          <div className="mt-0.5 shrink-0">
            {isEmail ? (
              <EnvelopeSimple
                size={15}
                weight={isActive ? "fill" : "regular"}
                className={isActive ? "text-[#ff5f56]" : "text-white/40"}
              />
            ) : (
              <ReadCvLogo
                size={15}
                weight={isActive ? "fill" : "regular"}
                className={isActive ? "text-[#ff5f56]" : "text-white/40"}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate leading-snug">
              {draft.title || draft.subject || "Untitled Draft"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-white/40 font-mono">
              <span>{isEmail ? "Email" : "Cover Letter"}</span>
              {draft.updatedAt && (
                <>
                  <span>•</span>
                  <span>{formatShortDate(draft.updatedAt)}</span>
                </>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-0.5 shrink-0 pt-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            aria-label={draft.isPinned ? "Unpin draft" : "Pin draft"}
            title={draft.isPinned ? "Unpin draft" : "Pin draft"}
            onClick={() => onTogglePin(draft._id)}
            className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
              draft.isPinned ? "text-[#ff5f56]" : "text-white/40 hover:text-white"
            }`}
          >
            <PushPin size={12} weight={draft.isPinned ? "fill" : "regular"} />
          </button>
          <button
            type="button"
            aria-label="Delete draft"
            title="Delete draft"
            onClick={() => onDeleteDraft(draft._id)}
            className="p-1 rounded text-white/40 hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors cursor-pointer"
          >
            <Trash size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside
      ref={drawerRef}
      inert={!isOpen}
      aria-hidden={!isOpen}
      className={`h-full border-r border-white/10 bg-[#0e0e11] flex flex-col transition-all duration-200 select-none ${
        isOpen
          ? "w-[250px] min-w-[250px]"
          : "w-0 min-w-0 overflow-hidden border-none"
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 border-b border-white/10 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenNib size={18} className="text-[#ff5f56]" weight="duotone" />
            <h2 className="text-xs font-semibold tracking-wider text-white uppercase font-mono">
              Writing
            </h2>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">
              {drafts.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onNewDraft}
            title="Start New Draft"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ff5f56] text-white font-semibold text-xs hover:bg-[#ff5f56]/90 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={13} weight="bold" />
            <span>New</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlass
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#ff5f56]/60 focus:bg-white/[0.08] transition-colors"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1">
          {FILTER_TABS.map((tab) => {
            const active = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-[#ff5f56]/20 text-[#ff5f56] border border-[#ff5f56]/40"
                    : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/80 hover:bg-white/[0.06]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Draft List */}
      <div
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]"
      >
        {isLoading && (
          <div className="space-y-2 p-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 rounded-lg bg-white/[0.04] animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="py-8 px-3 text-center space-y-2.5 border border-dashed border-[#ff5f56]/25 bg-[#ff5f56]/5 rounded-xl">
            <p className="text-xs text-[#ff5f56] font-medium">
              Failed to load writing drafts
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry()}
                className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 text-xs text-white transition-colors cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && drafts.length === 0 && (
          <div className="py-10 px-3 text-center space-y-2">
            <PenNib size={24} className="mx-auto text-white/20" />
            <p className="text-xs text-white/45">
              {searchQuery.trim()
                ? "No matching drafts found"
                : "No writing drafts yet"}
            </p>
            {!searchQuery.trim() && (
              <p className="text-[11px] text-white/30">
                Draft an email or cover letter using the composer.
              </p>
            )}
          </div>
        )}

        {!isLoading && pinnedDrafts.length > 0 && (
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-white/35">
              Pinned
            </p>
            <div className="space-y-0.5">{pinnedDrafts.map(renderDraftRow)}</div>
          </div>
        )}

        {!isLoading && regularDrafts.length > 0 && (
          <div className="space-y-1">
            {pinnedDrafts.length > 0 && (
              <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-white/35">
                Recent
              </p>
            )}
            <div className="space-y-0.5">{regularDrafts.map(renderDraftRow)}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
