# Cognify - Project Showcase Documentation

## 1. Project Overview & Purpose

**Cognify** is a production-ready AI-powered SaaS platform and unified productivity workspace designed for students, job seekers, developers, and knowledge workers.

The central product philosophy of Cognify is: **Understand → Research → Create → Improve**.

Instead of relying on a fragmented collection of disjointed AI utilities, Cognify consolidates general AI conversational intelligence, real-time live web grounding, document vector understanding, resume ATS analysis, professional writing assistance, and an interactive learning studio into one coherent, beautifully designed platform.

---

## 2. Key Features & Workspaces

### 1. Dashboard & Unified Activity Stream (`/dashboard`)
- **Central Workspace Hub:** Immediate overview of system status, quick navigation to all 5 productivity modules, and storage consumption.
- **Unified Activity Stream:** Aggregates real-time events across all modules (conversations, document uploads, notes, resume reviews, and generated letters).
- **Category Filtering:** Filter activity cards by module: `ALL`, `01 CHAT`, `02 DOCS`, `03 RESUME`, `04 WRITING`, and `05 NOTES`.
- **Interactive UI Architecture:** Smooth corner-morphing card hovers, distinct workspace color identities, and one-click resumption of past tasks.

### 2. AI Chat & Real-Time Web Intelligence (`/chat`)
- **Conversational AI:** Interactive chat powered by Groq and Mistral AI with low-latency Server-Sent Events (SSE) token streaming.
- **Real-Time Live Web Search Grounding:** Powered by Tavily Search API. Automatically triggers when questions require current information (e.g., today's gold prices, live sports, stock updates).
- **Dynamic 2-Stage Indicators:** Explicit progress banner (`Searching the web...` $\rightarrow$ `Synthesizing answer...`).
- **Source Citations:** Clickable web reference pills complete with domain favicons, source URLs, and snippet previews.
- **Developer-Friendly Output:** Full markdown formatting, LaTeX math rendering via KaTeX, inline code styles, and syntax-highlighted code blocks with 1-click clipboard copy.
- **Session Management:** Edit prompts inline, fork conversation branches, and organize chat history.

### 3. Document Analysis & Vector RAG (`/documents` & `/documents/[id]`)
- **Resilient Upload Engine:** Direct S3 binary upload with client-side progress tracking and transparent server-assisted fallback (`POST /api/v1/documents/local-storage/upload`) for 100% upload reliability.
- **Asynchronous Ingestion Pipeline:** Background job processing via BullMQ with `pdf-parse` text extraction, recursive semantic chunking, and high-dimensional vector embeddings (`mistral-embed`).
- **Pinecone Vector Database:** Chunks indexed under strict document-scoped metadata filters for precise similarity retrieval.
- **Dedicated Analysis Workspace (`/documents/[id]`):**
  - **Executive Summary & Key Takeaways:** Automated macro-level synthesis capturing purpose, findings, and structural takeaways.
  - **Grounded Vector Q&A Chat:** Real-time SSE streaming Q&A (`POST /api/v1/documents/:id/ask?stream=true`) grounded strictly in document content.
  - **Exact Page Citations:** Clickable excerpt tags indicating the source pages used to synthesize the answer.
  - **Semantic Query Expansion:** Broad conclusion/summary questions (e.g. *"What are the conclusions?"*) automatically expand vector queries with semantic synonyms and inject final document chunks, preventing false "information not mentioned" edge cases.

### 4. Notes Enhancer Studio (`/notes`)
- **Split-Screen Learning Studio:** Dedicated dual-panel layout balancing raw notes and enhanced markdown output.
- **Collapsible Enhanced Notes Panel:**
  - **Smart Default:** Closed by default on new/unenhanced notes to keep focus on the raw canvas; automatically opens on notes with existing enhancements or when clicking **Enhance**.
  - **Smooth 300ms Slide Animation:** Fluid sliding transition between 58% and 0% with persistent DOM clipping, eliminating jarring layout snaps.
  - **Notion-Like Centered Canvas:** When collapsed, the raw editor smoothly expands into a centered `max-w-4xl mx-auto` container.
  - **Draggable Split Divider:** Clamped 25%–65% split ratio persisted in `localStorage`.
- **Top-Right Workspace Action Navbar:** Elevated actions including `+ New Note` (when drawer is shut), amber `Restore Previous Version` button, teal `Discuss in Chat` button, and right-panel toggle icon with custom tooltips.
- **Zero-Friction Hybrid Enhancement:** Auto-detect intent by default, natural language steering input, and 6 customizable preset frameworks (Study Guide, Code & Tech Notes, Meeting Takeaways, Quick Polish & Summary).
- **Auto-Title Generation:** Untitled notes receive an AI-generated concise title streamed in real-time.
- **Debounced Auto-Save & Version Safeguard:** Raw edits auto-save after 800ms; previous enhancements are backed up with 1-click restoration.
- **Strict Folder Safety:** Single-level folder hierarchy with case-insensitive unique naming; folders containing notes are strictly protected against accidental deletion.
- **Export & AI Chat Bridge:** 1-click markdown copy, formatted PDF generation, and preloaded context transfer to `/chat`.

### 5. Resume Studio (`/resume`)
- **ATS Analysis Engine:** PDF resume parsing, section-by-section breakdown, keyword density audit, formatting review, and actionable bullet improvements.
- **Role Alignment Scoring:** Compares candidates against target job descriptions and provides missing skills recommendations.

### 6. AI Writing (`/writing`)
- **Email & Cover Letter Generator:** Purpose-driven templates tailored for tone, length, recipient context, and professional intent.

---

## 3. Tech Stack & Infrastructure

Cognify follows a decoupled Client/Server architecture built for horizontal scalability, data isolation, and high availability.

### Frontend (Client)
- **Framework:** Next.js (App Router)
- **Language:** JavaScript / React
- **Styling:** Tailwind CSS, Phosphor Icons, Lucide Icons
- **State & Data Fetching:** TanStack React Query (optimistic mutations, synchronous cache handoffs)
- **Typography & Markdown:** ReactMarkdown, Rehype / Remark plugins, KaTeX math rendering, Prism syntax highlighting
- **Architecture:** Feature-based modular structure (`features/auth`, `features/chat`, `features/documents`, `features/notes`, `features/resume`, `features/writing`)

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM with repository pattern abstraction)
- **Queue & Background Jobs:** BullMQ with Redis
- **Storage:** Amazon S3 (presigned URL uploads & downloads) with local storage fallback
- **Authentication:** JWT, HttpOnly Cookies, Google OAuth2, Next.js Proxy Middleware
- **Testing:** Jest & Supertest with MongoDB Memory Server for isolated integration testing

### AI & Vector Intelligence
- **LLM Providers:** Groq API (ultra-fast inference) and Mistral AI
- **Embeddings:** Mistral AI Embeddings (`mistral-embed`)
- **Vector Database:** Pinecone Vector Database (namespaced / metadata filtered)
- **Web Search Engine:** Tavily Search API
- **Orchestration:** LangChain Core

---

## 4. How It Works (System Workflows)

1. **Client Interaction:** Users interact with Next.js feature views. All state mutations and queries route through TanStack Query hooks.
2. **First-Party API Proxy:** The Next.js client uses a first-party rewrite proxy (`/api/v1/:path*` $\rightarrow$ Express backend) ensuring strict cookie security without third-party cookie restrictions across Safari, Brave, and Chromium browsers.
3. **Layered Server Processing:** Express routes delegate requests to Controllers, which execute business logic inside Services. All database operations are encapsulated in isolated Repositories with strict user ownership validation.
4. **Asynchronous RAG Pipeline:** Heavy PDF text extraction and Pinecone vectorization run asynchronously via BullMQ workers, reporting real-time progress to the UI without blocking HTTP threads.
5. **Real-Time Streaming:** Generative AI responses stream token-by-token over Server-Sent Events (`text/event-stream`), rendering live markdown directly in the client DOM.

---

## 5. Repository & Links

- **GitHub Repository:** https://github.com/shobhit2603/Cognify
- **Documentation Directory:** `docs/`
  - `docs/notes-enhancer.md`: In-depth Notes Enhancer Studio architectural specifications.
  - `docs/document-analysis.md`: In-depth Document Analysis RAG pipeline and endpoint documentation.
