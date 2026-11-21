"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FilePdf,
  Plus,
  MagnifyingGlass,
  ArrowClockwise,
  FolderOpen,
  Sparkle,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import DocumentCard from "../../features/documents/components/DocumentCard";
import DocumentUploadModal from "../../features/documents/components/DocumentUploadModal";
import DocumentDetailsModal from "../../features/documents/components/DocumentDetailsModal";
import * as docService from "../../features/documents/services/document.service";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const pollingRef = useRef(null);
  const searchRequestIdRef = useRef(0);
  const prefetchRequestIdRef = useRef(0);

  const fetchDocuments = useCallback(async (page = 1, search = "") => {
    const requestId = ++searchRequestIdRef.current;
    try {
      const data = await docService.getDocuments(page, 12, search);
      // Invalidate if a newer search/page request has already been issued
      if (requestId !== searchRequestIdRef.current) return;
      if (data?.documents) {
        setDocuments(data.documents);
      }
      if (data?.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      if (requestId === searchRequestIdRef.current) {
        console.error("Failed to load documents:", err);
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch documents on search query or page change
  useEffect(() => {
    let active = true;
    const reqId = ++searchRequestIdRef.current;

    docService
      .getDocuments(currentPage, 12, searchQuery)
      .then((data) => {
        if (!active || reqId !== searchRequestIdRef.current) return;
        if (data?.documents) {
          setDocuments(data.documents);
        }
        if (data?.pagination) {
          setPagination(data.pagination);
        }
      })
      .catch((err) => {
        if (active && reqId === searchRequestIdRef.current) {
          console.error("Failed to load documents:", err);
        }
      })
      .finally(() => {
        if (active && reqId === searchRequestIdRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [currentPage, searchQuery]);

  const hasProcessing = documents.some(
    (d) => d.status !== "READY" && d.status !== "FAILED"
  );

  // Polling for processing documents
  useEffect(() => {
    if (!hasProcessing) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    let pollCount = 0;
    const maxPolls = 60; // Max ~3 minutes of polling before pausing to prevent infinite background loops

    pollingRef.current = setInterval(() => {
      pollCount++;
      if (pollCount > maxPolls) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }

      const currentReqId = searchRequestIdRef.current;
      docService
        .getDocuments(currentPage, 12, searchQuery)
        .then((data) => {
          // Guard against stale response if search/page changed during poll
          if (currentReqId !== searchRequestIdRef.current) return;
          if (data?.documents) {
            setDocuments(data.documents);
            // If the selected document is open, update it while preserving its downloadUrl
            setSelectedDocument((prev) => {
              if (!prev) return null;
              const updated = data.documents.find((d) => d._id === prev._id);
              return updated
                ? { ...updated, downloadUrl: prev.downloadUrl || updated.downloadUrl }
                : prev;
            });
          }
          if (data?.pagination) {
            setPagination(data.pagination);
          }
        })
        .catch(() => {
          // Suppress background poll errors while backend is restarting
        });
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [hasProcessing, searchQuery, currentPage]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await docService.deleteDocument(id);
      toast.success("Document deleted successfully");

      // If deleting the last item on later page, step back to preceding page
      if (documents.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        setDocuments((prev) => prev.filter((d) => d._id !== id));
        fetchDocuments(currentPage, searchQuery);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  const handleSelectDocument = async (doc) => {
    const requestId = ++prefetchRequestIdRef.current;
    setSelectedDocument(doc);
    setIsDetailsOpen(true);

    try {
      const full = await docService.getDocumentById(doc._id);
      // Guard against stale response if selection changed or modal closed
      if (requestId === prefetchRequestIdRef.current && full?.document) {
        setSelectedDocument((prev) => {
          if (!prev || prev._id !== doc._id) return prev;
          return { ...prev, ...full.document };
        });
      }
    } catch (err) {
      if (requestId === prefetchRequestIdRef.current) {
        console.warn("Could not pre-fetch full document details:", err.message);
      }
    }
  };

  const handleCloseDetails = useCallback(() => {
    prefetchRequestIdRef.current++;
    setIsDetailsOpen(false);
    setSelectedDocument(null);
  }, []);

  const handleDocumentUploaded = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchDocuments(1, searchQuery);
    }
  };

  return (
    <ProtectedRoute>
      <main className="w-full flex-1 min-h-[calc(100vh-64px)] bg-[#121111] text-white p-4 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Top Bar / Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 text-osmo-lime mb-1">
                <Sparkle size={18} weight="bold" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase">
                  AI Contextual Workspace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-white">
                Document Analysis &amp; RAG
              </h1>
              <p className="text-xs text-white/50 mt-1 font-caveat text-sm">
                Upload PDFs for instant executive summaries, key takeaway extraction, and grounded vector Q&amp;A
              </p>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-osmo-lime text-osmo-dark font-semibold text-xs tracking-wider uppercase hover:bg-osmo-lime/90 active:scale-95 transition-all shadow-lg shadow-osmo-lime/10 shrink-0 cursor-pointer"
            >
              <Plus size={16} weight="bold" />
              Upload PDF
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <MagnifyingGlass
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search documents by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset to page 1 on new search
                }}
                className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime/50 transition-colors"
              />
            </div>

            <button
              onClick={() => fetchDocuments(currentPage, searchQuery)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors self-end sm:self-auto cursor-pointer"
              title="Refresh document list"
            >
              <ArrowClockwise size={14} weight="bold" />
              Refresh
            </button>
          </div>

          {/* Document Grid / Empty States */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-osmo-lime/20 border-t-osmo-lime animate-spin" />
              <p className="text-xs text-white/40 font-mono tracking-widest uppercase">
                Loading Knowledge Base...
              </p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white/[0.01] border border-white/[0.06] rounded-3xl gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <FolderOpen size={32} weight="light" className="text-white/30" />
              </div>
              <div className="max-w-sm">
                <h3 className="text-base font-semibold text-white">
                  {searchQuery ? "No matching documents" : "No documents uploaded yet"}
                </h3>
                <p className="text-xs text-white/40 mt-1">
                  {searchQuery
                    ? `No PDFs match "${searchQuery}". Clear your search query to see all documents.`
                    : "Upload a PDF document to begin automated summarization and AI question answering."}
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-osmo-lime text-osmo-dark font-semibold text-xs tracking-wider uppercase hover:bg-osmo-lime/90 transition-all shadow-lg shadow-osmo-lime/10 mt-2 cursor-pointer"
              >
                <Plus size={16} weight="bold" />
                Upload Your First PDF
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onSelect={handleSelectDocument}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Pagination Bar */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/[0.08] pt-6 text-xs text-white/50">
                  <span>
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} documents)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <CaretLeft size={14} weight="bold" /> Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage >= pagination.totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      Next <CaretRight size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Upload Modal */}
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploaded={handleDocumentUploaded}
        />

        {/* Details & Q&A Modal: Keyed by stable document ID to reset conversation state when switching documents */}
        <DocumentDetailsModal
          key={selectedDocument?._id || "none"}
          document={selectedDocument}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onRefresh={() => fetchDocuments(currentPage, searchQuery)}
        />
      </main>
    </ProtectedRoute>
  );
}
