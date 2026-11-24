# Cognify AI

**Cognify** is a production-ready AI-powered SaaS platform and unified productivity workspace for students, job seekers, developers, and knowledge workers.

The central product philosophy of Cognify is: **Understand → Research → Create → Improve**.

---

## 🏗️ Architecture & Tech Stack

Cognify is built using a decoupled Client/Server architecture designed for scalability, data isolation, and high availability.

### Client (Frontend)
- **Framework:** Next.js (App Router)
- **Language:** JavaScript / React
- **Styling:** Tailwind CSS, Phosphor Icons, Lucide Icons
- **State & Data Fetching:** TanStack React Query (optimistic mutations, synchronous cache handoffs)
- **Typography & Markdown:** ReactMarkdown, Rehype / Remark plugins, KaTeX math rendering, Prism syntax highlighting
- **Architecture:** Feature-based modular architecture (`features/auth`, `features/chat`, `features/documents`, `features/notes`, `features/resume`, `features/writing`)

### Server (Backend)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM with repository pattern abstraction)
- **Background Jobs & Queue:** BullMQ with Redis
- **Storage:** Amazon S3 (presigned URL uploads & downloads) with local storage fallback
- **Authentication:** JWT, HttpOnly Cookies, Google OAuth2, Next.js Proxy Middleware
- **Testing:** Jest & Supertest with MongoDB Memory Server for isolated integration testing

### AI & Vector Intelligence
- **LLM Providers:** Groq API (ultra-fast inference) and Mistral AI
- **Embeddings:** Mistral AI Embeddings (`mistral-embed`)
- **Vector Database:** Pinecone Vector Database (metadata-scoped retrieval)
- **Live Web Intelligence:** Tavily Search API
- **Orchestration:** LangChain Core

---

## 🚀 Core Product Workspaces

Cognify combines five specialized AI productivity modules into one seamless platform:

### 1. Dashboard & Unified Activity Stream (`/dashboard`)
- Central hub providing storage telemetry and one-click navigation across tools.
- Multi-workspace activity stream aggregating events from Chat, Documents, Notes, Resume, and Writing.
- Instant category filtering: `ALL`, `01 CHAT`, `02 DOCS`, `03 RESUME`, `04 WRITING`, and `05 NOTES`.
- Interactive cards with corner-morphing hover animations and dedicated color identities.

### 2. AI Chat & Real-Time Web Grounding (`/chat`)
- Interactive conversations with low-latency Server-Sent Events (SSE) token streaming.
- Real-time live web search grounding via Tavily API with dynamic 2-stage status indication (`Searching the web...` $\rightarrow$ `Synthesizing answer...`).
- Clickable web reference citations with domain favicons and source previews.
- Full markdown formatting, KaTeX LaTeX math support, inline code styling, and syntax-highlighted code blocks with 1-click clipboard copy.
- Edit prompts inline, fork conversation branches, and manage chat history.

### 3. Document Analysis & Vector RAG (`/documents` & `/documents/[id]`)
- Resilient upload engine supporting direct S3 uploads with automatic server fallback.
- Asynchronous BullMQ background indexing pipeline with `pdf-parse` text extraction, recursive semantic chunking, and Pinecone vector embeddings.
- Dedicated analysis workspace (`/documents/[id]`) featuring:
  - **Executive Summary & Key Takeaways:** Automated macro synthesis and actionable takeaways.
  - **Grounded Vector Q&A Chat:** Real-time SSE streaming Q&A (`POST /api/v1/documents/:id/ask?stream=true`) grounded strictly in document context.
  - **Exact Page Citations:** Clickable excerpt tags showing exact source pages.
  - **Semantic Query Expansion:** Broad conclusion and summary questions automatically expand vector queries and inject final document chunks, preventing false negative answers.

### 4. Notes Enhancer Studio (`/notes`)
- Split-screen learning studio balancing raw notes and AI-enhanced markdown output.
- **Collapsible Enhanced Notes Panel:**
  - **Smart Default:** Closed by default on new/unenhanced notes; auto-opens on enhanced notes or upon clicking **Enhance**.
  - **Smooth 300ms Slide Transition:** Fluid sliding animation between 58% and 0% with persistent DOM clipping.
  - **Notion-Like Centered Canvas:** When collapsed, the raw editor smoothly expands into a centered `max-w-4xl mx-auto` container.
  - **Draggable Split Divider:** Clamped 25%–65% split ratio persisted in `localStorage`.
- **Top-Right Workspace Action Navbar:** Elevated actions including `+ New Note` (when drawer is shut), amber `Restore Previous Version` button, teal `Discuss in Chat` button, and panel toggle icon with custom tooltips.
- **Zero-Friction Hybrid Enhancement:** Auto-detect intent by default, natural language steering input, and 6 customizable preset frameworks.
- **Auto-Title Generation:** Untitled notes receive a concise AI-generated title streamed via SSE.
- **Debounced Auto-Save & Version Safeguard:** Raw edits auto-save after 800ms; previous enhancements are backed up with 1-click restoration.
- **Strict Folder Safety:** Single-level folder hierarchy; folders containing notes cannot be deleted until emptied.
- **Export & Chat Bridge:** 1-click markdown copy, formatted PDF generation, and preloaded context transfer to `/chat`.

### 5. Resume Studio (`/resume`)
- Upload and parse PDF resumes for automated ATS scoring.
- Comprehensive section-by-section breakdown, keyword density audit, formatting review, and actionable bullet improvements.
- Target role comparison with skills gap identification.

### 6. AI Writing (`/writing`)
- Intelligent Email Writer and Cover Letter generator tailored for tone, length, intent, and recipient context.

---

## 🛠️ Development & Testing

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas connection URI)
- Redis (for BullMQ queue processing)
- API Keys: Groq, Mistral AI, Pinecone, Tavily

### Running Locally
Cognify is split into two directories: `client` and `server`.

**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing (Backend)
The backend uses **Jest** and **Supertest** with an in-memory MongoDB server for isolated integration testing:
```bash
cd server
npm test
```

---

## 📚 Documentation
- [Notes Enhancer Documentation](file:///c:/Users/Shashank%20Lakhera/OneDrive/Desktop/Kodex/Projects/Full-Stack%20Projects/Cognify/docs/notes-enhancer.md)
- [Document Analysis Documentation](file:///c:/Users/Shashank%20Lakhera/OneDrive/Desktop/Kodex/Projects/Full-Stack%20Projects/Cognify/docs/document-analysis.md)
- [Project Showcase Documentation](file:///c:/Users/Shashank%20Lakhera/OneDrive/Desktop/Kodex/Projects/Full-Stack%20Projects/Cognify/Project_Showcase_Documentation.md)

---
*Maintained under the Cognify AI Master Project Engineering Context.*
