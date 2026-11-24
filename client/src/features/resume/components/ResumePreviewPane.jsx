"use client";
import React, { useState } from "react";
import {
  FilePdf,
  DownloadSimple,
  TextAa,
  User,
  EnvelopeSimple,
  Phone,
  LinkedinLogo,
  GithubLogo,
  Buildings,
  GraduationCap,
  Sparkle,
} from "@phosphor-icons/react";

export default function ResumePreviewPane({ resume, isDragging = false }) {
  const [activeTab, setActiveTab] = useState("pdf"); // "pdf" | "parsed"

  if (!resume) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-xs text-white/40">
        <p>No resume selected for preview.</p>
      </div>
    );
  }

  const parsed = resume.parsedSections || {};
  const contact = parsed.contactInfo || {};

  // Construct secure file URL for the iframe
  const serverOrigin =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000")
      : "";
  const pdfViewUrl = resume._id
    ? `${serverOrigin}/api/v1/resumes/${resume._id}/file`
    : resume.fileUrl;

  return (
    <div className="h-full flex flex-col bg-[#0e0e11] select-none md:select-text overflow-hidden">
      {/* ── Top Header Bar ── */}
      <div className="h-11 px-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#121215]">
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "pdf"
                ? "bg-[#ffbd2e] text-black shadow-sm font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <FilePdf size={14} weight={activeTab === "pdf" ? "bold" : "regular"} />
            <span>Original PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("parsed")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "parsed"
                ? "bg-[#ffbd2e] text-black shadow-sm font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <TextAa size={14} weight={activeTab === "parsed" ? "bold" : "regular"} />
            <span>Parsed Structure</span>
          </button>
        </div>

        {/* Download Button */}
        {pdfViewUrl && (
          <a
            href={pdfViewUrl}
            target="_blank"
            rel="noreferrer"
            download={resume.originalName || "resume.pdf"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            title="Download PDF Document"
          >
            <DownloadSimple size={14} weight="bold" />
            <span className="hidden sm:inline">Download</span>
          </a>
        )}
      </div>

      {/* ── Pane Body ── */}
      <div
        className={`flex-1 min-h-0 overflow-hidden relative ${
          isDragging ? "pointer-events-none" : ""
        }`}
      >
        {activeTab === "pdf" ? (
          pdfViewUrl ? (
            <iframe
              src={`${pdfViewUrl}#toolbar=0&navpanes=0`}
              title="Resume PDF Document"
              className="w-full h-full border-none bg-[#111114]"
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center text-xs text-white/40">
              <p>PDF URL is not available.</p>
            </div>
          )
        ) : (
          /* Parsed Structure Tab */
          <div className="h-full overflow-y-auto p-5 space-y-6 text-white text-xs leading-relaxed">
            {/* Contact Information */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#ffbd2e]">
                <User size={15} weight="bold" />
                <span>Contact Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/80">
                {contact.name && (
                  <p className="font-semibold text-white col-span-full">{contact.name}</p>
                )}
                {contact.email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <EnvelopeSimple size={13} className="text-white/40" />
                    <span>{contact.email}</span>
                  </p>
                )}
                {contact.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="text-white/40" />
                    <span>{contact.phone}</span>
                  </p>
                )}
                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#ffbd2e] hover:underline truncate"
                  >
                    <LinkedinLogo size={13} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {contact.github && (
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#ffbd2e] hover:underline truncate"
                  >
                    <GithubLogo size={13} />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>

            {/* Summary */}
            {parsed.summary && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-white/90 uppercase font-mono tracking-wider">
                  Summary / Objective
                </h4>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white/70 leading-relaxed">
                  {parsed.summary}
                </div>
              </div>
            )}

            {/* Skills */}
            {parsed.skills && parsed.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white/90 uppercase font-mono tracking-wider">
                  Skills & Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-md bg-[#ffbd2e]/10 border border-[#ffbd2e]/20 text-[#ffbd2e] text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Extracted Text */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="text-xs font-semibold text-white/70 uppercase font-mono tracking-wider">
                Raw Extracted Content
              </h4>
              <pre className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-white/60 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {resume.rawText || "No raw text available."}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
