"use client";
import React, { useState, useRef } from "react";
import {
  X,
  UploadSimple,
  FilePdf,
  CheckCircle,
  WarningCircle,
  SpinnerGap,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import * as docService from "../services/document.service";

export default function DocumentUploadModal({ isOpen, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Lock background body scroll while upload modal is open
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAndSetFile = (selected) => {
    if (!selected) return;

    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document.");
      return;
    }

    if (selected.size > 25 * 1024 * 1024) {
      toast.error("File size exceeds maximum allowed limit of 25MB.");
      return;
    }

    setFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleStartUpload = async () => {
    if (!file || isUploading) return;

    setIsUploading(true);
    setProgress(5);
    setStatusText("Requesting secure upload authorization...");

    try {
      // 1. Get Presigned S3 URL & create document record
      const { document, uploadUrl, storageKey } = await docService.getUploadUrl({
        fileName: file.name,
        mimeType: "application/pdf",
        size: file.size,
      });

      setProgress(20);
      setStatusText("Uploading document to storage...");

      // 2. Direct upload to S3 with progress tracking (with server fallback if direct S3 blocked)
      await docService.uploadFileToS3(
        uploadUrl,
        file,
        (percent) => {
          const scaled = Math.min(80, 20 + Math.round(percent * 0.6));
          setProgress(scaled);
        },
        document?.storageKey || storageKey
      );

      setProgress(85);
      setStatusText("Enqueuing document for AI extraction & indexing...");

      // 3. Trigger processing worker
      await docService.processDocument(document._id);

      setProgress(100);
      setStatusText("Document uploaded! AI synthesis started.");
      toast.success("Document uploaded successfully! Analysis in progress.");

      setTimeout(() => {
        setIsUploading(false);
        setFile(null);
        setProgress(0);
        setStatusText("");
        onUploaded(document);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload document");
      setIsUploading(false);
      setProgress(0);
      setStatusText("");
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setFile(null);
    setProgress(0);
    setStatusText("");
    onClose();
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-lg bg-[#181717] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-semibold text-white">
              Upload Document
            </h2>
            <p className="text-xs text-white/50 mt-1 font-caveat text-sm">
              Upload PDFs for instant summarization, vector indexing, and Q&A
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 text-white/40 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors disabled:opacity-40"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Dropzone */}
        {!file ? (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer focus:outline-none focus:border-osmo-lime transition-all duration-200 ${
              isDragOver
                ? "border-osmo-lime bg-osmo-lime/5"
                : "border-white/[0.12] hover:border-white/[0.25] bg-white/[0.02]"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-osmo-lime/10 flex items-center justify-center">
              <UploadSimple size={28} weight="bold" className="text-osmo-lime" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                Click to browse or drag & drop PDF
              </p>
              <p className="text-xs text-white/40 mt-1">
                Standard PDF documents up to 25MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => validateAndSetFile(e.target.files?.[0])}
              className="hidden"
            />
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <FilePdf size={22} weight="bold" className="text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-white/40">{formatSize(file.size)}</p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => setFile(null)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} weight="bold" />
              </button>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70 flex items-center gap-1.5">
                <SpinnerGap size={14} className="animate-spin text-osmo-lime" />
                {statusText}
              </span>
              <span className="font-semibold text-osmo-lime">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-osmo-lime transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={!file || isUploading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-osmo-lime text-osmo-dark hover:bg-osmo-lime/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-osmo-lime/10"
          >
            {isUploading ? "Uploading..." : "Upload & Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}
