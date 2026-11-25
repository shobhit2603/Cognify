"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  BriefcaseMetal,
  MagnifyingGlass,
  Plus,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  FilePdf,
} from "@phosphor-icons/react";
import RenameResumeModal from "./RenameResumeModal";

export default function ResumeDrawer({
  resumes = [],
  activeResumeId = null,
  onSelectResume,
  onStartUpload,
  onDeleteResume,
  onRenameResume,
  searchQuery = "",
  setSearchQuery,
  isOpen = true,
  onToggleDrawer,
}) {
  const [activeMenuResumeId, setActiveMenuResumeId] = useState(null);
  const [resumeToRename, setResumeToRename] = useState(null);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const menuRef = useRef(null);

  // Close 3-dot menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuResumeId(null);
      }
    }
    if (activeMenuResumeId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuResumeId]);

  const filteredResumes = resumes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.originalName && r.originalName.toLowerCase().includes(q))
    );
  });

  const getScoreBadge = (score) => {
    if (!score || score <= 0) return null;
    let colorClasses = "bg-[#ffbd2e]/10 text-[#ffbd2e] border-[#ffbd2e]/30";
    if (score >= 80) {
      colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    } else if (score < 60) {
      colorClasses = "bg-red-500/10 text-red-400 border-red-500/30";
    }
    return (
      <span
        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${colorClasses}`}
      >
        {score}%
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <aside
        className={`h-full border-r border-white/10 bg-[#0e0e11] flex flex-col transition-all duration-200 select-none ${
          isOpen ? "w-[230px] min-w-[230px]" : "w-0 min-w-0 overflow-hidden border-none"
        }`}
      >
        {/* ── Top Header & Actions ── */}
        <div className="p-3.5 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BriefcaseMetal size={20} className="text-[#ffbd2e]" weight="duotone" />
              <h2 className="text-xs font-semibold tracking-wider text-white uppercase font-mono">
                Resumes
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">
                {resumes.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onStartUpload}
              title="Upload New Resume"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#ffbd2e] text-black font-semibold text-xs hover:bg-[#ffbd2e]/90 transition-all shadow-sm"
            >
              <Plus size={14} weight="bold" />
              <span>Upload</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#ffbd2e]/60 focus:bg-white/[0.08] transition-colors"
            />
          </div>
        </div>

        {/* ── Chronological Resume List ── */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-2 py-2 space-y-1">
          {filteredResumes.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-white/40 space-y-2">
              {searchQuery ? (
                <p>No resumes match &quot;{searchQuery}&quot;</p>
              ) : (
                <>
                  <p>No resumes uploaded yet.</p>
                  <button
                    type="button"
                    onClick={onStartUpload}
                    className="text-[#ffbd2e] hover:underline font-medium text-xs"
                  >
                    + Upload your first resume
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredResumes.map((resume) => {
              const isActive = resume._id === activeResumeId;
              const isMenuOpen = activeMenuResumeId === resume._id;

              return (
                <div
                  key={resume._id}
                  className={`group relative flex items-center justify-between p-2 rounded-xl text-left border transition-all ${
                    isActive
                      ? "bg-[#ffbd2e]/10 border-[#ffbd2e]/40 text-white shadow-sm"
                      : "bg-transparent border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectResume(resume._id)}
                    className="flex items-center gap-2 min-w-0 pr-1 flex-1 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ffbd2e] rounded-lg"
                  >
                    <FilePdf
                      size={18}
                      className={isActive ? "text-[#ffbd2e]" : "text-white/40 group-hover:text-white/70"}
                      weight="duotone"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate leading-tight">
                        {resume.title || resume.originalName || "Untitled Resume"}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5 font-mono">
                        {formatDate(resume.updatedAt || resume.createdAt)}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {getScoreBadge(resume.latestAudit?.overallScore)}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuResumeId((prev) => (prev === resume._id ? null : resume._id))
                        }
                        className={`p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors ${
                          isMenuOpen ? "text-white bg-white/10" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <DotsThreeVertical size={15} weight="bold" />
                      </button>

                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-[#18181c] border border-white/10 shadow-xl py-1 z-30 animate-fadeIn"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuResumeId(null);
                              setResumeToRename(resume);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <PencilSimple size={13} />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuResumeId(null);
                              setResumeToDelete(resume);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Rename Modal */}
      {resumeToRename && (
        <RenameResumeModal
          isOpen={!!resumeToRename}
          onClose={() => setResumeToRename(null)}
          currentTitle={resumeToRename.title}
          onRename={(newTitle) => onRenameResume(resumeToRename._id, newTitle)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {resumeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm bg-[#131316] border border-white/10 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-white mb-2">Delete Resume?</h3>
            <p className="text-xs text-white/60 mb-5 leading-relaxed">
              Are you sure you want to delete &ldquo;
              <span className="text-white font-medium">{resumeToDelete.title}</span>
              &rdquo;? This will permanently remove its audit data and conversation history.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setResumeToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDeleteResume(resumeToDelete._id);
                  setResumeToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
