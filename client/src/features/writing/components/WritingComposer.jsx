"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  EnvelopeSimple,
  ReadCvLogo,
  Sparkle,
  StopCircle,
  CaretDown,
  CaretUp,
  BriefcaseMetal,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import {
  WRITING_MODES,
  EMAIL_PURPOSES,
  TONE_OPTIONS,
  FORMALITY_OPTIONS,
  LENGTH_OPTIONS,
} from "../constants/writingOptions";

function PillSelector({ label, options, value, onChange, disabled }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                active
                  ? "bg-[#ff5f56]/18 text-[#ff5f56] border-[#ff5f56]/50"
                  : "bg-white/[0.03] text-white/60 border-white/10 hover:text-white hover:bg-white/[0.07]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function WritingComposer({
  mode,
  onModeChange,
  emailForm,
  setEmailForm,
  coverLetterForm,
  setCoverLetterForm,
  resumes = [],
  isLoadingResumes = false,
  isStreaming = false,
  hasActiveDraft = false,
  isCentered = false,
  onGenerate,
  onStop,
}) {
  const [showReplySection, setShowReplySection] = useState(
    Boolean(emailForm.replyToEmail?.trim() || emailForm.recipientContext?.trim())
  );

  const isEmail = mode === "email";

  const canSubmit = isEmail
    ? Boolean(
        emailForm.purpose?.trim() &&
          emailForm.intent?.trim() &&
          emailForm.context?.trim().length >= 3
      )
    : Boolean(
        coverLetterForm.jobDescription?.trim().length >= 20 &&
          (coverLetterForm.resumeId ||
            coverLetterForm.userBackground?.trim())
      );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStreaming) {
      onStop();
      return;
    }
    if (!canSubmit) return;
    onGenerate();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-full flex flex-col bg-[#0d0d0f] min-h-0"
    >
      {/* Mode Switcher Bar */}
      <div className="px-4 py-3 border-b border-white/10 bg-[#0e0e11] shrink-0">
        <div
          className={`flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10 ${
            isCentered ? "max-w-2xl mx-auto" : ""
          }`}
        >
          {WRITING_MODES.map((m) => {
            const active = mode === m.id;
            const Icon = m.id === "email" ? EnvelopeSimple : ReadCvLogo;
            return (
              <button
                key={m.id}
                type="button"
                disabled={isStreaming}
                onClick={() => onModeChange(m.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 ${
                  active
                    ? "bg-[#ff5f56] text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={15} weight={active ? "fill" : "regular"} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Input Area */}
      <div
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]"
      >
        <div
          className={`space-y-4 ${
            isCentered ? "max-w-2xl mx-auto" : ""
          }`}
        >
          {isEmail ? (
            <>
              {/* Purpose */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Purpose *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {EMAIL_PURPOSES.map((purposeOpt) => {
                    const active = emailForm.purpose === purposeOpt;
                    return (
                      <button
                        key={purposeOpt}
                        type="button"
                        disabled={isStreaming}
                        onClick={() =>
                          setEmailForm((prev) => ({
                            ...prev,
                            purpose: purposeOpt === "Custom" ? "" : purposeOpt,
                          }))
                        }
                        className={`px-2 py-1 rounded-md text-[11px] border transition-colors cursor-pointer ${
                          active
                            ? "bg-[#ff5f56]/18 text-[#ff5f56] border-[#ff5f56]/45"
                            : "bg-white/[0.03] text-white/55 border-white/10 hover:text-white"
                        }`}
                      >
                        {purposeOpt}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={emailForm.purpose}
                  disabled={isStreaming}
                  onChange={(e) =>
                    setEmailForm((prev) => ({ ...prev, purpose: e.target.value }))
                  }
                  placeholder="e.g. Post-interview follow-up, Client update..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60"
                />
              </div>

              {/* Intent */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Intent / Goal *
                </label>
                <input
                  type="text"
                  value={emailForm.intent}
                  disabled={isStreaming}
                  onChange={(e) =>
                    setEmailForm((prev) => ({ ...prev, intent: e.target.value }))
                  }
                  placeholder="What outcome do you want? (e.g. Confirm timeline & schedule Friday sync)"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60"
                />
              </div>

              {/* Context */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Context & Key Points *
                </label>
                <textarea
                  rows={5}
                  value={emailForm.context}
                  disabled={isStreaming}
                  onChange={(e) =>
                    setEmailForm((prev) => ({ ...prev, context: e.target.value }))
                  }
                  placeholder="Include key facts, dates, metrics, or bullet points to cover..."
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60 resize-y leading-relaxed"
                />
              </div>

              {/* Optional Reply-to-Email & Recipient Accordion */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowReplySection((v) => !v)}
                  className="w-full px-3 py-2 flex items-center justify-between text-xs text-white/70 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <span className="font-mono text-[11px] uppercase tracking-wider">
                    Reply-to Email & Recipient (Optional)
                  </span>
                  {showReplySection ? (
                    <CaretUp size={14} />
                  ) : (
                    <CaretDown size={14} />
                  )}
                </button>

                {showReplySection && (
                  <div className="p-3 pt-1 space-y-3 border-t border-white/[0.06]">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-white/45">
                        Recipient Context
                      </label>
                      <input
                        type="text"
                        value={emailForm.recipientContext}
                        disabled={isStreaming}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            recipientContext: e.target.value,
                          }))
                        }
                        placeholder="e.g. Hiring Manager at Stripe / Senior Engineering Lead"
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-white/45">
                        Email Being Replied To
                      </label>
                      <textarea
                        rows={3}
                        value={emailForm.replyToEmail}
                        disabled={isStreaming}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            replyToEmail: e.target.value,
                          }))
                        }
                        placeholder="Paste the incoming email you are responding to..."
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60 resize-y"
                      />
                    </div>
                  </div>
                )}
              </div>

              <PillSelector
                label="Tone"
                options={TONE_OPTIONS}
                value={emailForm.tone}
                onChange={(tone) => setEmailForm((prev) => ({ ...prev, tone }))}
                disabled={isStreaming}
              />

              <PillSelector
                label="Formality"
                options={FORMALITY_OPTIONS}
                value={emailForm.formality}
                onChange={(formality) =>
                  setEmailForm((prev) => ({ ...prev, formality }))
                }
                disabled={isStreaming}
              />

              <PillSelector
                label="Length"
                options={LENGTH_OPTIONS}
                value={emailForm.length}
                onChange={(length) =>
                  setEmailForm((prev) => ({ ...prev, length }))
                }
                disabled={isStreaming}
              />
            </>
          ) : (
            <>
              {/* Resume Studio Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-white/50">
                    <BriefcaseMetal size={13} className="text-[#ffbd2e]" />
                    <span>Resume Studio Context</span>
                  </label>
                  <Link
                    href="/resume"
                    className="inline-flex items-center gap-1 text-[11px] text-[#ffbd2e]/80 hover:text-[#ffbd2e] transition-colors"
                  >
                    <span>Manage Resumes</span>
                    <ArrowSquareOut size={11} />
                  </Link>
                </div>

                <select
                  value={coverLetterForm.resumeId || ""}
                  disabled={isStreaming || isLoadingResumes}
                  onChange={(e) =>
                    setCoverLetterForm((prev) => ({
                      ...prev,
                      resumeId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#16161a] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ff5f56]/60"
                >
                  <option value="">
                    {isLoadingResumes
                      ? "Loading your resumes..."
                      : resumes.length > 0
                        ? "-- No resume selected (use manual background below) --"
                        : "-- No uploaded resumes yet (enter background below) --"}
                  </option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title || r.originalName}
                      {r.latestAudit?.overallScore
                        ? ` (ATS: ${r.latestAudit.overallScore}/100)`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual Background Fallback / Supplemental Info */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  {coverLetterForm.resumeId
                    ? "Additional Highlights / Notes (Optional)"
                    : "Your Experience & Background *"}
                </label>
                <textarea
                  rows={4}
                  value={coverLetterForm.userBackground}
                  disabled={isStreaming}
                  onChange={(e) =>
                    setCoverLetterForm((prev) => ({
                      ...prev,
                      userBackground: e.target.value,
                    }))
                  }
                  placeholder={
                    coverLetterForm.resumeId
                      ? "Optional extra context: referral name, relocation note, or specific achievement to spotlight..."
                      : "Summarize your relevant experience, key achievements, skills, and projects..."
                  }
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60 resize-y leading-relaxed"
                />
              </div>

              {/* Target Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={coverLetterForm.targetRole}
                    disabled={isStreaming}
                    onChange={(e) =>
                      setCoverLetterForm((prev) => ({
                        ...prev,
                        targetRole: e.target.value,
                      }))
                    }
                    placeholder="e.g. Full-Stack Engineer"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Target Company
                  </label>
                  <input
                    type="text"
                    value={coverLetterForm.targetCompany}
                    disabled={isStreaming}
                    onChange={(e) =>
                      setCoverLetterForm((prev) => ({
                        ...prev,
                        targetCompany: e.target.value,
                      }))
                    }
                    placeholder="e.g. Vercel"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Job Description *
                </label>
                <textarea
                  rows={6}
                  value={coverLetterForm.jobDescription}
                  disabled={isStreaming}
                  onChange={(e) =>
                    setCoverLetterForm((prev) => ({
                      ...prev,
                      jobDescription: e.target.value,
                    }))
                  }
                  placeholder="Paste the target job description here (minimum 20 characters)..."
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#ff5f56]/60 resize-y leading-relaxed"
                />
              </div>

              <PillSelector
                label="Tone"
                options={TONE_OPTIONS}
                value={coverLetterForm.tone}
                onChange={(tone) =>
                  setCoverLetterForm((prev) => ({ ...prev, tone }))
                }
                disabled={isStreaming}
              />

              <PillSelector
                label="Length"
                options={LENGTH_OPTIONS}
                value={coverLetterForm.length}
                onChange={(length) =>
                  setCoverLetterForm((prev) => ({ ...prev, length }))
                }
                disabled={isStreaming}
              />
            </>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="p-3.5 border-t border-white/10 bg-[#0e0e11] shrink-0">
        <div className={isCentered ? "max-w-2xl mx-auto" : ""}>
          {isStreaming ? (
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#ff5f56]/15 border border-[#ff5f56]/50 text-[#ff5f56] text-xs font-semibold hover:bg-[#ff5f56]/25 transition-all cursor-pointer"
            >
              <StopCircle size={16} weight="fill" />
              <span>Stop Generation (Save Partial)</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#ff5f56] text-white text-xs font-semibold hover:bg-[#ff5f56]/90 transition-all shadow-md shadow-[#ff5f56]/15 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkle size={15} weight="fill" />
              <span>
                {hasActiveDraft
                  ? isEmail
                    ? "Regenerate Email"
                    : "Regenerate Cover Letter"
                  : isEmail
                    ? "Generate Email"
                    : "Generate Cover Letter"}
              </span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
