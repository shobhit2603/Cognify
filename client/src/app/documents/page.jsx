"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FilePdf,
  Plus,
  MagnifyingGlass,
  ArrowClockwise,
  FolderOpen,
  Sparkle,
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const pollingRef = useRef(null);

  const fetchDocuments = useCallback(async (search = "") => {
    try {
      const data = await docService.getDocuments(1, 50, search);
      if (data?.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    docService.getDocuments(1, 50, searchQuery)
      .then((data) => {
        if (active && data?.documents) {
          setDocuments(data.documents);
        }
      })
      .catch((err) => console.error("Failed to load documents:", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchQuery]);

  // Polling for processing documents
  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status !== "READY" && d.status !== "FAILED"
    );

    if (hasProcessing) {
      pollingRef.current = setInterval(() => {
        docService
          .getDocuments(1, 50, searchQuery)
          .then((data) => {
            if (data?.documents) {
              setDocuments(data.documents);
              // If the selected document is open, update it too
              setSelectedDocument((prev) => {
                if (!prev) return null;
                const updated = data.documents.find((d) => d._id === prev._id);
                return updated || prev;
              });
            }
          })
          .catch(() => {
            // Suppress background poll errors while backend is processing or restarting
          });
      }, 3000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [documents, searchQuery]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await docService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      toast.success("Document deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc);
    setIsDetailsOpen(true);
  };

  const handleDocumentUploaded = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    fetchDocuments();
  };

  return (
    <ProtectedRoute>
      <main className="w-full flex-1 min-h-[calc(100vh-64px)] bg-[#121111] text-white p-4 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-bold text-white/30 tracking-widest uppercase">
                  MODULE 02
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs font-caveat text-osmo-lime text-base">
                  Deep PDF Synthesis
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium uppercase tracking-tight text-white mt-1">
                Document Analysis
              </h1>
              <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xl">
                Upload dense technical papers, financial statements, and reports. Extract structured summaries, key takeaways, and chat with your files using vector retrieval.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchDocuments(searchQuery)}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white transition-colors"
                title="Refresh documents"
              >
                <ArrowClockwise size={18} weight="bold" />
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-osmo-lime text-osmo-dark font-semibold text-xs tracking-wider uppercase hover:bg-osmo-lime/90 transition-all shadow-lg shadow-osmo-lime/10"
              >
                <Plus size={16} weight="bold" />
                Upload PDF
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass
                size={18}
                weight="bold"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by name..."
                className="w-full bg-[#181717] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-osmo-lime transition-colors"
              />
            </div>
          </div>

          {/* Documents Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-48 rounded-2xl bg-[#181717]/60 border border-white/[0.04] animate-pulse"
                />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="border border-dashed border-white/[0.12] rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-osmo-lime/10 flex items-center justify-center">
                <FolderOpen size={32} weight="bold" className="text-osmo-lime" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  No documents found
                </h3>
                <p className="text-xs sm:text-sm text-white/40 mt-1 max-w-sm">
                  {searchQuery
                    ? "No documents matched your search filter."
                    : "Upload your first PDF document to experience vector-grounded analysis and Q&A."}
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-osmo-lime text-osmo-dark font-semibold text-xs tracking-wider uppercase hover:bg-osmo-lime/90 transition-all shadow-lg shadow-osmo-lime/10 mt-2"
              >
                <Plus size={16} weight="bold" />
                Upload Your First PDF
              </button>
            </div>
          ) : (
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
          )}
        </div>

        {/* Upload Modal */}
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploaded={handleDocumentUploaded}
        />

        {/* Details & Q&A Modal */}
        <DocumentDetailsModal
          document={selectedDocument}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedDocument(null);
          }}
          onRefresh={() => fetchDocuments(searchQuery)}
        />
      </main>
    </ProtectedRoute>
  );
}
