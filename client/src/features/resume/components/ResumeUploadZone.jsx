"use client";
import React, { useState, useRef } from "react";
import {
  UploadSimple,
  FilePdf,
  CheckCircle,
  Sparkle,
  Target,
  ChartBar,
  CircleNotch,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function ResumeUploadZone({ onUpload, isUploading = false }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customTitle, setCustomTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
    if (!customTitle) {
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    try {
      await onUpload({
        file: selectedFile,
        title: customTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, ""),
        targetRole: targetRole.trim(),
      });
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-8 animate-fadeIn">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Recruiter-Ready Resume Intelligence
        </h1>
        <p className="text-sm text-white/60 max-w-lg mx-auto leading-relaxed">
          Upload a PDF resume for instant ATS scoring, keyword gap analysis, and bullet rewrites.
        </p>
      </div>

      {/* ── Upload Card ── */}
      <div className="rounded-2xl border border-white/10 bg-[#121215] p-6 sm:p-8 shadow-xl space-y-6">
        <button
          type="button"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full relative border-2 border-dashed rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffbd2e] ${
            dragOver
              ? "border-[#ffbd2e] bg-[#ffbd2e]/5 shadow-lg shadow-[#ffbd2e]/10"
              : selectedFile
              ? "border-[#ffbd2e]/50 bg-white/[0.02]"
              : "border-white/15 bg-white/[0.01] hover:border-white/30 hover:bg-white/[0.03]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => validateAndSetFile(e.target.files?.[0])}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-[#ffbd2e]/10 border border-[#ffbd2e]/30 flex items-center justify-center text-[#ffbd2e] shadow-inner">
            {selectedFile ? (
              <FilePdf size={32} weight="duotone" />
            ) : (
              <UploadSimple size={30} weight="bold" />
            )}
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                <span>{selectedFile.name}</span>
                <CheckCircle size={16} weight="fill" className="text-[#ffbd2e]" />
              </p>
              <p className="text-xs text-white/40 font-mono">
                {(selectedFile.size / 1024).toFixed(1)} KB · Click to choose a different PDF
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                Click to browse or drag & drop resume PDF
              </p>
              <p className="text-xs text-white/40">
                Standard 1–3 page PDF document (up to 10MB)
              </p>
            </div>
          )}
        </button>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Resume Title <span className="text-white/40">(Optional)</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Lead Software Architect"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ffbd2e] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Target Position / Role <span className="text-white/40">(Optional)</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ffbd2e] transition-colors"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          className="w-full py-3 rounded-xl bg-[#ffbd2e] text-black font-semibold text-xs sm:text-sm hover:bg-[#ffbd2e]/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md shadow-[#ffbd2e]/10"
        >
          {isUploading ? (
            <>
              <CircleNotch size={16} className="animate-spin" />
              <span>Extracting PDF & Initializing Studio...</span>
            </>
          ) : (
            <>
              <Sparkle size={16} weight="fill" />
              <span>Launch Resume Studio</span>
            </>
          )}
        </button>
      </div>

      {/* ── Value Props Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70">
          <ChartBar size={16} className="text-[#ffbd2e] shrink-0" weight="bold" />
          <span className="font-medium text-white/85">4-D ATS Scoring</span>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70">
          <Target size={16} className="text-[#ffbd2e] shrink-0" weight="bold" />
          <span className="font-medium text-white/85">JD Gap Analysis</span>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70">
          <Sparkle size={16} className="text-[#ffbd2e] shrink-0" weight="bold" />
          <span className="font-medium text-white/85">X-Y-Z Rewrites</span>
        </div>
      </div>
    </div>
  );
}
