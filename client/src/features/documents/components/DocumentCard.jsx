"use client";
import React from "react";
import {
  FilePdf,
  CheckCircle,
  Clock,
  WarningCircle,
  DownloadSimple,
  Trash,
  Sparkle,
  ChatCircleDots,
} from "@phosphor-icons/react";

export default function DocumentCard({
  document,
  onSelect,
  onDelete,
  onDownload,
}) {
  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isReady = document.status === "READY";
  const isFailed = document.status === "FAILED";
  const isProcessing = !isReady && !isFailed;

  const getStatusBadge = () => {
    if (isReady) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-osmo-lime/10 text-osmo-lime border border-osmo-lime/20">
          <CheckCircle size={14} weight="bold" /> Ready
        </span>
      );
    }
    if (isFailed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <WarningCircle size={14} weight="bold" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
        <Clock size={14} weight="bold" /> {document.status} ({document.progress || 10}%)
      </span>
    );
  };

  return (
    <div className="group relative bg-[#181717] hover:bg-[#1d1c1c] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <FilePdf size={22} weight="bold" className="text-red-400" />
          </div>
          {getStatusBadge()}
        </div>

        <h3
          onClick={() => onSelect(document)}
          className="text-base font-semibold text-white group-hover:text-osmo-lime transition-colors cursor-pointer line-clamp-1"
          title={document.originalName}
        >
          {document.originalName}
        </h3>

        {/* Metadata info */}
        <div className="flex items-center gap-3 text-xs text-white/40 mt-2">
          <span>{formatSize(document.size)}</span>
          {document.pageCount && (
            <>
              <span>•</span>
              <span>{document.pageCount} pages</span>
            </>
          )}
          {document.chunkCount && (
            <>
              <span>•</span>
              <span>{document.chunkCount} chunks</span>
            </>
          )}
        </div>

        {/* Summary Preview snippet */}
        {document.summary ? (
          <p className="text-xs text-white/60 line-clamp-2 mt-3 leading-relaxed">
            {document.summary}
          </p>
        ) : (
          <p className="text-xs text-white/30 italic mt-3">
            {isProcessing ? "Analyzing document content..." : "Click to view insights and ask questions."}
          </p>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
        <button
          onClick={() => onSelect(document)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-osmo-lime transition-colors"
        >
          <ChatCircleDots size={16} weight="bold" />
          {isReady ? "Analyze & Q&A" : "View Status"}
        </button>

        <div className="flex items-center gap-1">
          {document.downloadUrl && (
            <a
              href={document.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
              title="Download original PDF"
            >
              <DownloadSimple size={16} weight="bold" />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(document._id);
            }}
            className="p-1.5 text-white/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Delete document"
          >
            <Trash size={16} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
