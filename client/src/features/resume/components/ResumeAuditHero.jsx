"use client";
import React from "react";
import {
  ChartBar,
  CaretDown,
  CaretUp,
  WarningCircle,
  CheckCircle,
  Lightbulb,
  ArrowClockwise,
  Target,
  CircleNotch,
  Sparkle,
} from "@phosphor-icons/react";

export default function ResumeAuditHero({
  audit,
  isExpanded = true,
  onToggleExpand,
  onReAudit,
  isAuditing = false,
}) {
  if (!audit) {
    return null;
  }

  const isPendingAudit = !audit.analyzedAt;
  const score = audit.overallScore || 0;
  const sub = audit.subScores || {
    formatting: 0,
    impactAndMetrics: 0,
    skillsAndKeywords: 0,
    sectionStructure: 0,
  };

  const getScoreColor = (val) => {
    if (val >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (val >= 60) return "text-[#ffbd2e] border-[#ffbd2e]/40 bg-[#ffbd2e]/10";
    return "text-red-400 border-red-500/40 bg-red-500/10";
  };

  const getScoreText = (val) => {
    if (val >= 85) return "Recruiter-Ready";
    if (val >= 70) return "Strong ATS Candidate";
    if (val >= 50) return "Moderate Optimization Needed";
    return "Significant Revision Advised";
  };

  // ── Collapsed Sticky Pill View ──
  if (!isExpanded) {
    return (
      <div
        onClick={onToggleExpand}
        className="sticky top-0 z-20 px-4 py-2.5 bg-[#121215]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#16161a] transition-all select-none shadow-md"
      >
        <div className="flex items-center gap-3 min-w-0">
          {isAuditing ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#ffbd2e]/40 bg-[#ffbd2e]/10 text-xs font-mono font-bold text-[#ffbd2e] shrink-0">
              <CircleNotch size={14} className="animate-spin text-[#ffbd2e]" />
              <span>Analyzing...</span>
            </div>
          ) : isPendingAudit ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/20 bg-white/5 text-xs font-mono font-bold text-white/60 shrink-0">
              <ChartBar size={14} />
              <span>ATS Ready</span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold shrink-0 ${getScoreColor(
                score
              )}`}
            >
              <ChartBar size={14} weight="bold" />
              <span>ATS {score}%</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-white/70 truncate">
            {isAuditing ? (
              <span className="text-[#ffbd2e] animate-pulse">Running 4-D ATS diagnostic...</span>
            ) : isPendingAudit ? (
              <span className="text-white/60">Audit ready to be executed</span>
            ) : (
              <>
                <span className="font-medium text-white/90">{getScoreText(score)}</span>
                <span className="text-white/20">•</span>
                <span className="text-white/50 truncate">
                  {audit.keyProblems?.length || 0} issues detected ·{" "}
                  {audit.actionableRecommendations?.length || 0} recommendations
                </span>
                {audit.targetRole && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="text-[#ffbd2e] truncate font-medium">
                      Target: {audit.targetRole}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#ffbd2e] hover:bg-[#ffbd2e]/10 border border-[#ffbd2e]/20 transition-colors shrink-0"
        >
          <span>Expand Report</span>
          <CaretDown size={13} weight="bold" />
        </button>
      </div>
    );
  }

  // ── Expanded Full Audit Card ──
  return (
    <div className="border-b border-white/10 bg-[#121215] p-5 sm:p-6 space-y-6 animate-fadeIn select-none">
      {/* ── Top Bar: Gauge & Headline ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Radial Score Meter */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            {isAuditing ? (
              <CircleNotch size={36} className="animate-spin text-[#ffbd2e]" />
            ) : isPendingAudit ? (
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#ffbd2e]/50 flex items-center justify-center text-xs font-mono font-bold text-white/60">
                — / 100
              </div>
            ) : (
              <>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      score >= 80 ? "text-emerald-400" : score >= 60 ? "text-[#ffbd2e]" : "text-red-400"
                    }
                    strokeDasharray={`${score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold font-mono text-white leading-none">{score}</span>
                  <span className="text-[9px] text-white/40 uppercase font-mono mt-0.5">/100</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                ATS Optimization Diagnostic
              </h3>
              {isAuditing ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#ffbd2e]/40 bg-[#ffbd2e]/10 text-[#ffbd2e] animate-pulse">
                  Analyzing...
                </span>
              ) : isPendingAudit ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 bg-white/5 text-white/60">
                  Ready to Audit
                </span>
              ) : (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getScoreColor(
                    score
                  )}`}
                >
                  {getScoreText(score)}
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              {isAuditing
                ? "Running algorithmic evaluation across formatting, metrics, skills density, and section structure..."
                : isPendingAudit
                ? "Click 'Run Audit' to evaluate this resume against recruiter standards and ATS parseability."
                : "Optimization signal based on recruiter parseability, metric density, and keyword alignment."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onReAudit}
            disabled={isAuditing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPendingAudit
                ? "bg-[#ffbd2e] text-black font-semibold hover:bg-[#ffbd2e]/90"
                : "text-white/70 hover:text-white hover:bg-white/5 border border-white/10 disabled:opacity-40"
            }`}
          >
            {isAuditing ? (
              <CircleNotch size={13} className="animate-spin text-[#ffbd2e]" />
            ) : isPendingAudit ? (
              <Sparkle size={13} weight="fill" />
            ) : (
              <ArrowClockwise size={13} />
            )}
            <span>{isAuditing ? "Auditing..." : isPendingAudit ? "Run Audit" : "Re-run Audit"}</span>
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#ffbd2e] hover:bg-[#ffbd2e]/10 border border-[#ffbd2e]/30 transition-colors"
          >
            <span>Collapse</span>
            <CaretUp size={13} weight="bold" />
          </button>
        </div>
      </div>

      {/* ── 4 Sub-Scores Breakdown ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">📐 Formatting</span>
            <span className="font-mono font-semibold text-white">
              {isPendingAudit && !isAuditing ? "—" : `${sub.formatting}/25`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-[#ffbd2e] transition-all duration-500 ${
                isAuditing ? "animate-pulse w-2/3" : ""
              }`}
              style={!isAuditing ? { width: `${(sub.formatting / 25) * 100}%` } : undefined}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">⚡ Impact & Verbs</span>
            <span className="font-mono font-semibold text-white">
              {isPendingAudit && !isAuditing ? "—" : `${sub.impactAndMetrics}/25`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-[#ffbd2e] transition-all duration-500 ${
                isAuditing ? "animate-pulse w-3/4" : ""
              }`}
              style={!isAuditing ? { width: `${(sub.impactAndMetrics / 25) * 100}%` } : undefined}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">🔑 Keywords</span>
            <span className="font-mono font-semibold text-white">
              {isPendingAudit && !isAuditing ? "—" : `${sub.skillsAndKeywords}/25`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-[#ffbd2e] transition-all duration-500 ${
                isAuditing ? "animate-pulse w-1/2" : ""
              }`}
              style={!isAuditing ? { width: `${(sub.skillsAndKeywords / 25) * 100}%` } : undefined}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">🏗️ Structure</span>
            <span className="font-mono font-semibold text-white">
              {isPendingAudit && !isAuditing ? "—" : `${sub.sectionStructure}/25`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-[#ffbd2e] transition-all duration-500 ${
                isAuditing ? "animate-pulse w-4/5" : ""
              }`}
              style={!isAuditing ? { width: `${(sub.sectionStructure / 25) * 100}%` } : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── Key Problems & Recommendations Grid ── */}
      {(!isPendingAudit || (audit.keyProblems && audit.keyProblems.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Key Problems */}
          {audit.keyProblems && audit.keyProblems.length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/[0.03] border border-red-500/20 space-y-2.5">
              <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                <WarningCircle size={15} weight="bold" />
                <span className="uppercase font-mono text-[11px] tracking-wider">Critical Flaws Detected</span>
              </div>
              <ul className="space-y-1.5 text-white/80 leading-relaxed list-disc list-inside">
                {audit.keyProblems.map((p, idx) => (
                  <li key={idx} className="marker:text-red-400">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Recommendations */}
          {audit.actionableRecommendations && audit.actionableRecommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-[#ffbd2e]/[0.03] border border-[#ffbd2e]/20 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[#ffbd2e] font-semibold">
                <Lightbulb size={15} weight="bold" />
                <span className="uppercase font-mono text-[11px] tracking-wider">
                  Immediate Recommendations
                </span>
              </div>
              <ol className="space-y-1.5 text-white/80 leading-relaxed list-decimal list-inside">
                {audit.actionableRecommendations.map((r, idx) => (
                  <li key={idx} className="marker:text-[#ffbd2e] marker:font-semibold">
                    {r}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ── Section Evaluation Badges ── */}
      {((audit.strongSections && audit.strongSections.length > 0) ||
        (audit.weakSections && audit.weakSections.length > 0)) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Strong Sections */}
          {audit.strongSections && audit.strongSections.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/15 space-y-2">
              <span className="text-[10px] font-mono font-semibold uppercase text-emerald-400 flex items-center gap-1">
                <CheckCircle size={13} weight="bold" /> Strong Sections
              </span>
              <div className="space-y-1.5">
                {audit.strongSections.map((s, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white/90">{s.name}</span>
                    <span className="text-white/50 text-[11px] text-right flex-1">{s.feedback}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Sections */}
          {audit.weakSections && audit.weakSections.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/[0.02] border border-amber-500/15 space-y-2">
              <span className="text-[10px] font-mono font-semibold uppercase text-[#ffbd2e] flex items-center gap-1">
                <WarningCircle size={13} weight="bold" /> Needs Improvement
              </span>
              <div className="space-y-1.5">
                {audit.weakSections.map((w, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white/90">{w.name}</span>
                    <span className="text-white/50 text-[11px] text-right flex-1">{w.feedback}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Missing & Matched Keywords ── */}
      {audit.missingKeywords && audit.missingKeywords.length > 0 && (
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-white/70 font-semibold font-mono text-[11px] uppercase">
            <Target size={14} className="text-[#ffbd2e]" weight="bold" />
            <span>Keyword Gap Audit</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {audit.missingKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-medium"
              >
                + Missing: {kw}
              </span>
            ))}
            {audit.matchedKeywords &&
              audit.matchedKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium"
                >
                  ✓ {kw}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
