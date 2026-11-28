"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import TextRoll from "../ui/TextRoll";
import {
  ShieldCheck,
  LockKey,
  GoogleLogo,
  Database,
  Trash,
  EnvelopeSimple,
  ArrowLeft,
  CheckCircle,
  FileText,
  UserCircle,
  Sparkle,
  BriefcaseMetal,
  PenNib,
  Graph,
  Key,
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const WORKSPACE_DATA_RULES = [
  {
    title: "AI Chat & Live Web Queries",
    icon: Sparkle,
    accent: "text-osmo-purple",
    detail:
      "Conversations and messages are stored strictly under your userId. Web search queries via Tavily transmit only the relevant query text without personal account identifiers.",
  },
  {
    title: "Document Analysis (PDF & RAG)",
    icon: FileText,
    accent: "text-osmo-lime",
    detail:
      "Uploaded PDFs are stored with private S3 access controls and indexed in Pinecone tagged strictly with userId and documentId metadata filters.",
  },
  {
    title: "Resume Studio & ATS Audits",
    icon: BriefcaseMetal,
    accent: "text-[#ffbd2e]",
    detail:
      "Resumes, parsed sections, and ATS diagnostics remain private to your account. Deleting a resume removes both the database record and underlying PDF object.",
  },
  {
    title: "AI Writing & Notes Enhancer",
    icon: PenNib,
    accent: "text-[#ff5f56]",
    detail:
      "Saved email drafts, cover letters (including attached resume references), and raw/enhanced notes are never shared across accounts or used for public model training.",
  },
];

const SECURITY_CONTROLS = [
  {
    title: "HttpOnly JWT & OAuth State",
    description:
      "Sessions use HttpOnly, SameSite cookies proxied through Next.js with refresh token rotation and OAuth state validation.",
  },
  {
    title: "Strict Ownership Isolation",
    description:
      "Every read, update, refine, and delete query validates userId server-side; client-supplied IDs are never trusted alone.",
  },
  {
    title: "Trust-Boundary Validation",
    description:
      "All payloads, queries, and file uploads pass strict Zod schemas, PDF magic-byte verification, and size limits.",
  },
  {
    title: "AI Rate Limiting & Prompt Safety",
    description:
      "Token-bucket rate limits protect AI endpoints, while untrusted documents and job descriptions are fenced against prompt injection.",
  },
];

export default function PrivacyContent() {
  const containerRef = useRef(null);
  const lastUpdated = "November 28, 2026";

  useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from(".privacy-hero-badge", {
          y: -12,
          duration: 0.45,
          clearProps: "transform",
        })
        .from(
          ".privacy-hero-title",
          { y: 24, duration: 0.55, clearProps: "transform" },
          "-=0.3"
        )
        .from(
          ".privacy-hero-sub",
          { y: 14, duration: 0.45, clearProps: "transform" },
          "-=0.3"
        );

      gsap.from(".privacy-section-card", {
        y: 22,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: ".privacy-sections-stack",
          start: "top 92%",
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full pb-16 pt-2 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="border-b border-black/10 pb-8 mb-8 space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black/50 hover:text-osmo-purple transition-colors w-fit"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Back to Home</span>
        </Link>

        <div className="privacy-hero-badge flex items-center gap-2 text-osmo-purple">
          <ShieldCheck size={20} weight="bold" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">
            Trust, Security &amp; Transparency
          </span>
        </div>

        <h1 className="privacy-hero-title text-4xl sm:text-6xl font-display font-bold uppercase tracking-tighter text-osmo-dark leading-[0.95]">
          Security &amp; Privacy<span className="text-osmo-purple">.</span>
        </h1>

        <div className="privacy-hero-sub flex flex-wrap items-center gap-3 text-xs text-black/50 font-mono">
          <span>Last Updated: {lastUpdated}</span>
          <span>•</span>
          <span>Effective Date: November 2026</span>
          <span>•</span>
          <span className="px-2.5 py-0.5 rounded-full bg-osmo-dark text-osmo-lime font-bold">
            Google OAuth Compliant
          </span>
        </div>

        <p className="privacy-hero-sub text-sm sm:text-base text-black/70 leading-relaxed max-w-3xl font-medium">
          Cognify (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is engineered for strict user-data isolation across all five AI workspaces. This policy details what data we collect, how your documents and drafts are isolated, and your deletion rights.
        </p>
      </div>

      {/* Sections Stack */}
      <div className="privacy-sections-stack flex flex-col gap-6">
        {/* Section 1: Information We Collect */}
        <section className="privacy-section-card bg-[#151515] text-white border border-white/10 rounded-lg p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-osmo-lime/15 border border-osmo-lime/30 flex items-center justify-center text-osmo-lime shrink-0">
              <GoogleLogo size={20} weight="bold" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-tight">
              1. Information We Collect
            </h2>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">
            We collect only the minimum information required to authenticate your account and power the workspace modules you choose to use:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <UserCircle size={18} className="text-osmo-lime" weight="bold" />
                Google Account Information
              </div>
              <p className="text-xs text-white/65 leading-relaxed">
                When signing in with Google OAuth 2.0, we request access only to your basic public profile: your <strong>full name</strong>, <strong>verified email address</strong>, and <strong>profile avatar URL</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Graph size={18} className="text-osmo-teal" weight="bold" />
                Workspace Inputs &amp; Artifacts
              </div>
              <p className="text-xs text-white/65 leading-relaxed">
                Chat prompts, uploaded PDF documents, resumes, writing inputs/drafts, and notes that you explicitly submit or save inside your account.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Workspace Data Handling */}
        <section className="privacy-section-card bg-[#151515] text-white border border-white/10 rounded-lg p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-osmo-purple/20 border border-osmo-purple/40 flex items-center justify-center text-osmo-purple shrink-0">
              <Database size={20} weight="bold" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-tight">
              2. Data Handling Across All 5 Workspaces
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WORKSPACE_DATA_RULES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Icon size={17} weight="bold" className={item.accent} />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-white/65 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Google API User Data Policy */}
        <section className="privacy-section-card bg-[#151515] text-white border border-osmo-lime/35 rounded-lg p-6 sm:p-8 flex flex-col gap-5 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-osmo-lime/20 border border-osmo-lime/40 flex items-center justify-center text-osmo-lime shrink-0">
              <LockKey size={20} weight="bold" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-tight">
              3. Google API Services User Data Policy
            </h2>
          </div>

          <div className="p-4 rounded-lg bg-osmo-lime/[0.06] border border-osmo-lime/25 text-xs sm:text-sm text-white/85 leading-relaxed font-mono">
            &quot;Cognify&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="text-osmo-lime underline underline-offset-2 hover:text-white transition-colors"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.&quot;
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-white/75 list-disc pl-5">
            <li>We never sell or disclose your Google user data to third parties, ad networks, or data brokers.</li>
            <li>We do not use your personal documents, resumes, notes, or drafts to train generalized AI models.</li>
            <li>Humans do not inspect private user content unless explicitly authorized by you for support or required by law.</li>
          </ul>
        </section>

        {/* Section 4: Platform Security Controls */}
        <section className="privacy-section-card bg-osmo-purple text-white border border-osmo-purple/50 rounded-lg p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/25 flex items-center justify-center text-osmo-lime shrink-0">
              <Key size={20} weight="bold" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-tight">
              4. Platform Security Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECURITY_CONTROLS.map((ctrl) => (
              <div
                key={ctrl.title}
                className="p-4 rounded-lg bg-black/20 border border-white/15 flex flex-col gap-1.5"
              >
                <strong className="text-sm font-display uppercase tracking-wide text-osmo-lime">
                  {ctrl.title}
                </strong>
                <p className="text-xs text-white/85 leading-relaxed">
                  {ctrl.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: User Rights & Deletion */}
        <section className="privacy-section-card bg-[#151515] text-white border border-white/10 rounded-lg p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-osmo-lime/15 border border-osmo-lime/30 flex items-center justify-center text-osmo-lime shrink-0">
              <Trash size={20} weight="bold" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-tight">
              5. Your Rights &amp; Data Deletion
            </h2>
          </div>

          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span>
                <strong>Instant Artifact Deletion:</strong> Delete chats, PDFs (clears MongoDB + S3 + Pinecone), resumes, writing drafts, and notes directly inside their respective workspaces at any time.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span>
                <strong>Revoking Google Access:</strong> Revoke Cognify&apos;s Google sign-in access anytime via{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-osmo-lime underline underline-offset-2 hover:text-white transition-colors"
                >
                  Google Account Security Settings
                </a>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span>
                <strong>Full Account Removal:</strong> Request permanent account deletion by contacting{" "}
                <a
                  href="mailto:lakherashashank70@gmail.com"
                  className="text-osmo-lime underline underline-offset-2"
                >
                  lakherashashank70@gmail.com
                </a>.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 6: Contact */}
        <section className="privacy-section-card bg-[#151515] text-white border border-white/10 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-display font-bold uppercase tracking-tight">
              6. Security &amp; Privacy Inquiries
            </h2>
            <p className="text-xs text-white/60">
              Maintained by Shashank Lakhera &amp; Shobhit Shrivastava
            </p>
          </div>
          <a
            href="mailto:lakherashashank70@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-osmo-lime text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all w-fit"
          >
            <EnvelopeSimple size={16} weight="bold" />
            <TextRoll>lakherashashank70@gmail.com</TextRoll>
          </a>
        </section>
      </div>
    </div>
  );
}
