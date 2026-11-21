import React from "react";
import Link from "next/link";
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
} from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Privacy Policy ✻ Cognify",
  description: "Learn how Cognify collects, uses, and protects your information, including our Google OAuth data policy and security standards.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 21, 2026";

  return (
    <main className="w-full min-h-screen bg-[#111010] text-white selection:bg-osmo-lime selection:text-osmo-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-osmo-lime transition-colors w-fit"
          >
            <ArrowLeft size={14} weight="bold" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2 text-osmo-lime">
            <ShieldCheck size={20} weight="bold" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase">
              Trust &amp; Transparency
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-white">
            Privacy Policy
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 font-mono">
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Effective Date: November 2026</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full bg-osmo-lime/10 text-osmo-lime border border-osmo-lime/20">
              Google OAuth Compliant
            </span>
          </div>

          <p className="text-sm text-white/70 leading-relaxed max-w-2xl mt-2">
            Cognify (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and ensuring transparency in how your personal data and documents are handled. This Privacy Policy details our practices regarding information collection, storage, and usage across our AI workspace.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <section className="bg-[#171616] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-osmo-lime/10 border border-osmo-lime/20 flex items-center justify-center text-osmo-lime shrink-0">
              <GoogleLogo size={20} weight="bold" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              1. Information We Collect
            </h2>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">
            We collect only the minimum information necessary to authenticate your identity, provide our workspace features, and safeguard your account:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <UserCircle size={18} className="text-osmo-lime" weight="bold" />
                Google Account Information
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                When you sign in using Google OAuth 2.0, we request access only to your basic public profile: your <strong>full name</strong>, <strong>verified email address</strong>, and <strong>profile avatar URL</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <FileText size={18} className="text-osmo-lime" weight="bold" />
                User-Uploaded Documents &amp; Queries
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                When you use our Document Analysis or AI chat features, we process the PDF files you upload and the prompts/questions you submit to generate summaries, takeaways, and grounded vector responses.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Your Information */}
        <section className="bg-[#171616] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-osmo-lime/10 border border-osmo-lime/20 flex items-center justify-center text-osmo-lime shrink-0">
              <Sparkle size={20} weight="bold" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              2. How We Use Your Information
            </h2>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">
            The information collected is used exclusively for operational and user-facing functionality:
          </p>

          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span><strong>Account Authentication &amp; Management:</strong> To verify your identity, maintain authenticated sessions across devices, and manage your account credentials.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span><strong>Contextual Document Analysis:</strong> To parse text from your uploaded documents, generate automated executive summaries, extract key takeaways, and index document chunks for vector search (RAG).</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span><strong>Workspace Personalization:</strong> To associate your chat conversations, saved documents, and analysis history with your personal account.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span><strong>Security &amp; Abuse Prevention:</strong> To monitor system uptime, prevent denial-of-service or brute force attacks, and enforce rate limits.</span>
            </li>
          </ul>
        </section>

        {/* Section 3: Google API User Data Policy & Limited Use */}
        <section className="bg-[#171616] border border-osmo-lime/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-osmo-lime/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-osmo-lime/20 border border-osmo-lime/40 flex items-center justify-center text-osmo-lime shrink-0">
              <LockKey size={20} weight="bold" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              3. Google API Services User Data Policy Compliance
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-osmo-lime/[0.04] border border-osmo-lime/20 text-xs sm:text-sm text-white/80 leading-relaxed font-mono">
            &quot;Cognify&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
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

          <p className="text-sm text-white/70 leading-relaxed">
            Specifically:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-white/70 list-disc pl-5">
            <li>We do not transfer or disclose your Google user data to third parties, advertising platforms, data brokers, or information resellers.</li>
            <li>We do not use your Google user data to serve advertisements or personalized targeting.</li>
            <li>We do not use or transfer your personal data or document content to train generalized artificial intelligence or machine learning models.</li>
            <li>Humans do not read your private data or document contents unless you give explicit permission for technical support or when strictly required by applicable law.</li>
          </ul>
        </section>

        {/* Section 4: Data Storage, Retention & Security */}
        <section className="bg-[#171616] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-osmo-lime/10 border border-osmo-lime/20 flex items-center justify-center text-osmo-lime shrink-0">
              <Database size={20} weight="bold" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              4. Data Storage, Retention &amp; Security
            </h2>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">
            Your data is handled using enterprise-grade cloud infrastructure and security practices:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <strong className="text-white text-sm">Encrypted Storage</strong>
              <p className="text-white/60 leading-relaxed">
                Uploaded documents are saved securely in Amazon Web Services (AWS S3) with server-side encryption and restricted access policies.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <strong className="text-white text-sm">Vector Isolation</strong>
              <p className="text-white/60 leading-relaxed">
                Vector embeddings generated for document retrieval are isolated and tagged with user ownership IDs in Pinecone vector databases.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <strong className="text-white text-sm">Transport Security</strong>
              <p className="text-white/60 leading-relaxed">
                All data transmission between your browser and our servers is encrypted in transit using industry-standard TLS 1.3 / HTTPS.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: User Rights & Data Deletion */}
        <section className="bg-[#171616] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-osmo-lime/10 border border-osmo-lime/20 flex items-center justify-center text-osmo-lime shrink-0">
              <Trash size={20} weight="bold" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              5. Your Rights &amp; Data Deletion
            </h2>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">
            You retain complete control over your personal data and uploaded content:
          </p>

          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span><strong>Document Deletion:</strong> You can delete any uploaded PDF at any time directly through the Document Analysis interface. Deletion immediately removes the document record from MongoDB, deletes the file from AWS S3, and wipes all associated vector embeddings from Pinecone.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-osmo-lime shrink-0 mt-0.5" weight="fill" />
              <span><strong>Revoking Google Access:</strong> You can revoke Cognify&apos;s access to your Google Account at any time via your{' '}
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
              <span><strong>Complete Account Deletion:</strong> If you wish to permanently delete your Cognify account and all associated data, you can submit a deletion request by emailing us at{' '}
                <a href="mailto:lakherashashank70@gmail.com" className="text-osmo-lime underline underline-offset-2">
                  lakherashashank70@gmail.com
                </a>.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 6: Contact Information */}
        <section className="bg-[#171616] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-osmo-lime/10 border border-osmo-lime/20 flex items-center justify-center text-osmo-lime shrink-0">
              <EnvelopeSimple size={20} weight="bold" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              6. Contact &amp; Inquiries
            </h2>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact our team:
          </p>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div>
              <p className="font-semibold text-white">Cognify Developer &amp; Data Protection</p>
              <p className="text-white/50 text-xs mt-0.5">Shashank Lakhera</p>
            </div>
            <a
              href="mailto:lakherashashank70@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-osmo-lime text-osmo-dark font-semibold text-xs tracking-wider uppercase hover:bg-osmo-lime/90 transition-all shrink-0 w-fit"
            >
              <EnvelopeSimple size={16} weight="bold" />
              lakherashashank70@gmail.com
            </a>
          </div>
        </section>

        {/* Bottom Back Button */}
        <div className="pt-4 pb-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold tracking-wider uppercase text-white/80 hover:text-white transition-all"
          >
            <ArrowLeft size={16} weight="bold" />
            Return to Cognify Workspace
          </Link>
        </div>

      </div>
    </main>
  );
}
