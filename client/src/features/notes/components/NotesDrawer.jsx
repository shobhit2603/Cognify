"use client";
import React, { useState } from "react";
import {
  MagnifyingGlass,
  Plus,
  FolderSimple,
  FolderPlus,
  PushPin,
  DotsThreeVertical,
  CaretRight,
  CaretDown,
  Trash,
  PencilSimple,
  FileText,
} from "@phosphor-icons/react";
import CreateFolderModal from "./CreateFolderModal";
import MoveNoteModal from "./MoveNoteModal";

export default function NotesDrawer({
  notes = [],
  folders = [],
  activeNoteId = null,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onTogglePin,
  onMoveNote,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  searchQuery,
  setSearchQuery,
  isOpen = true,
  onToggleDrawer,
}) {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [folderToEdit, setFolderToEdit] = useState(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [noteToMove, setNoteToMove] = useState(null);
  const [activeMenuNoteId, setActiveMenuNoteId] = useState(null);
  const [activeMenuFolderId, setActiveMenuFolderId] = useState(null);

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Group notes into: Pinned, Folder-specific, Uncategorized
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const uncategorizedNotes = notes.filter((n) => !n.folderId && !n.isPinned);

  // Grouped by folderId
  const notesByFolder = folders.reduce((acc, folder) => {
    acc[folder._id] = notes.filter(
      (n) => n.folderId?._id === folder._id || n.folderId === folder._id
    );
    return acc;
  }, {});

  // Active note folder resolution
  const activeNote = notes.find((n) => n._id === activeNoteId);
  const activeNoteFolderId = activeNote?.folderId?._id || activeNote?.folderId || null;

  const isSearching = !!searchQuery.trim();

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
              <FileText size={20} className="text-osmo-teal" weight="duotone" />
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
                Notes
              </h2>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">
                {notes.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(true)}
                title="New Folder"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <FolderPlus size={18} />
              </button>
              <button
                type="button"
                onClick={() => onCreateNote()}
                title="New Note"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-osmo-teal text-black font-semibold text-xs hover:bg-osmo-teal/90 transition-all shadow-sm"
              >
                <Plus size={14} weight="bold" />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-osmo-teal/60 focus:bg-white/[0.08] transition-colors"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Notes Tree & List ── */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* SEARCH MODE: Flat filtered list */}
          {isSearching ? (
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase text-white/40 px-2 mb-1.5">
                Search Results ({notes.length})
              </p>
              {notes.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  No notes match &quot;{searchQuery}&quot;
                </div>
              ) : (
                notes.map((note) => (
                  <NoteItem
                    key={note._id}
                    note={note}
                    isActive={activeNoteId === note._id}
                    onSelect={() => onSelectNote(note._id)}
                    onTogglePin={() => onTogglePin(note._id)}
                    onMove={() => setNoteToMove(note)}
                    onDelete={() => onDeleteNote(note._id)}
                    isMenuOpen={activeMenuNoteId === note._id}
                    setMenuOpen={(val) => setActiveMenuNoteId(val ? note._id : null)}
                    showFolderBadge={true}
                  />
                ))
              )}
            </div>
          ) : (
            <>
              {/* PINNED SECTION */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-white/40">
                    <PushPin size={13} weight="fill" className="text-amber-400" />
                    <span>Pinned ({pinnedNotes.length})</span>
                  </div>
                  {pinnedNotes.map((note) => (
                    <NoteItem
                      key={note._id}
                      note={note}
                      isActive={activeNoteId === note._id}
                      onSelect={() => onSelectNote(note._id)}
                      onTogglePin={() => onTogglePin(note._id)}
                      onMove={() => setNoteToMove(note)}
                      onDelete={() => onDeleteNote(note._id)}
                      isMenuOpen={activeMenuNoteId === note._id}
                      setMenuOpen={(val) => setActiveMenuNoteId(val ? note._id : null)}
                    />
                  ))}
                </div>
              )}

              {/* FOLDERS SECTION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 text-[11px] font-mono uppercase tracking-wider text-white/40">
                  <span>Folders ({folders.length})</span>
                </div>

                {folders.map((folder) => {
                  const isExpanded = !!expandedFolders[folder._id];
                  const folderNotes = notesByFolder[folder._id] || [];
                  const isFolderMenuOpen = activeMenuFolderId === folder._id;
                  const isParentOfActiveNote = activeNoteFolderId === folder._id;

                  return (
                    <div key={folder._id} className="space-y-0.5">
                      {/* Folder Row */}
                      <div
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs ${
                          isParentOfActiveNote && !isExpanded
                            ? "bg-osmo-teal/10 border border-osmo-teal/30 text-white font-medium shadow-sm"
                            : "hover:bg-white/5 border border-transparent text-white/90"
                        }`}
                      >
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggleFolder(folder._id)}
                          className="flex items-center gap-2 flex-1 truncate text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-osmo-teal/60 rounded"
                        >
                          {isExpanded ? (
                            <CaretDown size={13} className="text-white/40 shrink-0" />
                          ) : (
                            <CaretRight size={13} className="text-white/40 shrink-0" />
                          )}
                          <FolderSimple
                            size={16}
                            weight="fill"
                            className="shrink-0"
                            style={{ color: folder.color || "#84cc16" }}
                          />
                          <span className="truncate font-medium text-white/90">
                            {folder.name}
                          </span>
                          <span className="text-[10px] font-mono text-white/40 shrink-0">
                            ({folderNotes.length})
                          </span>
                        </button>

                        {/* Folder Action Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuFolderId(isFolderMenuOpen ? null : folder._id);
                            }}
                            className="p-1 rounded text-white/30 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <DotsThreeVertical size={14} weight="bold" />
                          </button>

                          {isFolderMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-44 bg-[#1f1f23] border border-white/15 rounded-xl shadow-xl p-1 z-30 text-xs"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuFolderId(null);
                                  onCreateNote({ folderId: folder._id });
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white/90"
                              >
                                <Plus size={14} />
                                <span>New Note in Folder</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuFolderId(null);
                                  setFolderToEdit(folder);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white/90"
                              >
                                <PencilSimple size={14} />
                                <span>Rename Folder</span>
                              </button>
                              <div className="h-px bg-white/10 my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuFolderId(null);
                                  onDeleteFolder(folder._id, folderNotes.length);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                              >
                                <Trash size={14} />
                                <span>Delete Folder</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Folder Notes Sub-list */}
                      {isExpanded && (
                        <div className="pl-5 space-y-0.5 border-l border-white/5 ml-3 my-0.5">
                          {folderNotes.length === 0 ? (
                            <p className="text-[11px] text-white/30 italic py-1 px-2">
                              No notes in this folder
                            </p>
                          ) : (
                            folderNotes.map((note) => (
                              <NoteItem
                                key={note._id}
                                note={note}
                                isActive={activeNoteId === note._id}
                                onSelect={() => onSelectNote(note._id)}
                                onTogglePin={() => onTogglePin(note._id)}
                                onMove={() => setNoteToMove(note)}
                                onDelete={() => onDeleteNote(note._id)}
                                isMenuOpen={activeMenuNoteId === note._id}
                                setMenuOpen={(val) =>
                                  setActiveMenuNoteId(val ? note._id : null)
                                }
                              />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* UNCATEGORIZED NOTES */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 text-[11px] font-mono uppercase tracking-wider text-white/40">
                  <span>General ({uncategorizedNotes.length})</span>
                </div>
                {uncategorizedNotes.length === 0 ? (
                  <p className="text-[11px] text-white/30 italic py-1 px-2">
                    No general notes
                  </p>
                ) : (
                  uncategorizedNotes.map((note) => (
                    <NoteItem
                      key={note._id}
                      note={note}
                      isActive={activeNoteId === note._id}
                      onSelect={() => onSelectNote(note._id)}
                      onTogglePin={() => onTogglePin(note._id)}
                      onMove={() => setNoteToMove(note)}
                      onDelete={() => onDeleteNote(note._id)}
                      isMenuOpen={activeMenuNoteId === note._id}
                      setMenuOpen={(val) => setActiveMenuNoteId(val ? note._id : null)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen || !!folderToEdit}
        onClose={() => {
          setIsCreateFolderOpen(false);
          setFolderToEdit(null);
        }}
        initialFolder={folderToEdit}
        onSubmit={async (data) => {
          if (folderToEdit) {
            await onUpdateFolder(folderToEdit._id, data);
          } else {
            await onCreateFolder(data);
          }
        }}
      />

      {noteToMove && (
        <MoveNoteModal
          key={noteToMove._id}
          isOpen={!!noteToMove}
          onClose={() => setNoteToMove(null)}
          folders={folders}
          currentFolderId={noteToMove?.folderId?._id || noteToMove?.folderId}
          onMove={async (folderId) => {
            if (noteToMove) {
              await onMoveNote(noteToMove._id, folderId);
            }
          }}
        />
      )}
    </>
  );
}

// ── Subcomponent: Individual Note Row Item ──
function NoteItem({
  note,
  isActive,
  onSelect,
  onTogglePin,
  onMove,
  onDelete,
  isMenuOpen,
  setMenuOpen,
  showFolderBadge = false,
}) {
  return (
    <div
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
        isActive
          ? "bg-osmo-teal/10 border border-osmo-teal/40 text-white font-medium"
          : "hover:bg-white/5 border border-transparent text-white/80"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 min-w-0 text-left truncate pr-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-osmo-teal/60 rounded"
      >
        <div className="flex items-center gap-1.5">
          {note.isPinned && (
            <PushPin size={12} weight="fill" className="text-amber-400 shrink-0" />
          )}
          <span className="truncate text-white font-medium">
            {note.title || "Untitled Note"}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-white/40">
            {new Date(note.updatedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </span>
          {showFolderBadge && note.folderId?.name && (
            <span
              className="text-[9px] px-1.5 py-0.2 rounded font-mono truncate max-w-[90px]"
              style={{
                backgroundColor: `${note.folderId.color || "#84cc16"}20`,
                color: note.folderId.color || "#84cc16",
              }}
            >
              {note.folderId.name}
            </span>
          )}
          {note.enhancedMetadata?.frameworkUsed && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono truncate max-w-[100px]">
              {note.enhancedMetadata.frameworkUsed}
            </span>
          )}
        </div>
      </button>

      {/* 3-Dot Dropdown Menu */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!isMenuOpen);
          }}
          className="p-1 rounded text-white/30 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <DotsThreeVertical size={14} weight="bold" />
        </button>

        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-1 w-36 bg-[#1f1f23] border border-white/15 rounded-xl shadow-xl p-1 z-30 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onTogglePin();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white/90"
            >
              <PushPin size={13} />
              <span>{note.isPinned ? "Unpin Note" : "Pin to Top"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onMove();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white/90"
            >
              <FolderSimple size={13} />
              <span>Move Note</span>
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
            >
              <Trash size={13} />
              <span>Delete Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
