# Document Analysis Feature Documentation

## 1. Overview & Vision
The **Document Analysis** module (`/documents` and `/documents/[id]`) is Cognify's automated intelligence pipeline for unstructured text and document understanding. It enables users to upload PDF documents, extract and chunk textual content, vectorize information into Pinecone vector storage, and synthesize:
- **Executive Summaries**
- **Key Takeaways & Actionable Insights**
- **Grounded Semantic Q&A (RAG)** with real-time SSE token streaming and exact page citations

Users can interact with complex, dense documents (research papers, specifications, business reports, study guides, manuals) without manual skimming or token-limit bottlenecks.

---

## 2. System Architecture

```
[ User Browser ]
       │
       │ 1. Request Presigned Upload URL
       ▼
[ Express Server ] ───▶ [ AWS S3 / Local Storage ]
       │                         ▲
       │ 2. Direct Upload        │ (Fallback upload if S3 restricted)
       ▼                         │
[ S3 / Storage Provider ] ───────┘
       │
       │ 3. Processing Trigger (/api/v1/documents/:id/process)
       ▼
[ BullMQ / Document Service ]
       │ 4. Extract text via pdf-parse
       ▼
[ Text Chunking & Embedding ]
       │ 5. Recursive Character Chunking (1000 chars, 200 overlap)
       ▼
[ Pinecone Vector DB ] ◀─── Namespaced per Document (filter: documentId)
       │
       │ 6. Summarization & Key Insights Inference
       ▼
[ Mistral AI / Groq ]
       │
       │ 7. Real-Time Status Polling & Progress Indication
       ▼
[ Next.js Client Workspace (/documents/[id]) ]
       ├── Tab 1: Executive Summary & Key Takeaways
       └── Tab 2: Grounded Vector Q&A Chat (SSE Token Streaming + Citations)
```

---

## 3. Dedicated Document Analysis Workspace (`/documents/[id]`)

The `/documents/[id]` workspace provides a focused two-tab view powered by `DocumentAnalysisView.jsx`:

1. **Header Toolbar:**
   - Back navigation to `/documents` with file metadata badge (file size, page count, chunk count, processing status).
   - Direct document PDF download button with presigned S3/storage link.
   - Safe document deletion with confirmation dialog.

2. **Tab 1: Executive Summary & Key Takeaways:**
   - **Executive Summary:** A high-level synthesis capturing the document's core purpose, context, and structural outline.
   - **Key Takeaways:** Clean, bulleted list of actionable conclusions, operational metrics, and standout architectural points.

3. **Tab 2: Grounded Vector Q&A Chat:**
   - Conversational question-and-answer interface strictly grounded in the document context.
   - **Preset Prompts:** One-click quick questions (`"What is the main objective?"`, `"Summarize the key data points"`, `"What are the conclusions?"`).
   - **Real-Time Token Streaming:** Answers stream token-by-token via Server-Sent Events (`?stream=true`), eliminating UI freezing.
   - **Exact Page Citations:** Clickable page tags (e.g. `Page 4`, `Page 6`) showing the exact context excerpts retrieved and cited by the AI.

---

## 4. Core Capabilities & Workflows

### A. Resilient Document Upload Pipeline
1. **Presigned Upload URL:** The client requests an upload target from `POST /api/v1/documents/upload-url`.
2. **Direct S3 Upload:** The client directly uploads the binary file to Amazon S3 via `XMLHttpRequest` with upload progress tracking.
3. **Transparent Server Fallback:** If direct S3 upload fails due to network restrictions, strict ad-blockers, or CORS issues, the client automatically falls back to the server-assisted endpoint (`POST /api/v1/documents/local-storage/upload`), ensuring 100% upload reliability.

### B. Ingestion, Chunking & Vectorization
- **Text Extraction:** Uses `pdf-parse` to extract raw textual content from the uploaded PDF.
- **Recursive Chunking:** Splits extracted text into semantic chunks (~1,000 characters with 200-character overlap) to preserve contextual boundaries.
- **Pinecone Vector Indexing:** Chunks are converted into high-dimensional vector embeddings (`mistral-embed`) and upserted to Pinecone under metadata filter `{ documentId: documentId }`.
- **Parallel AI Synthesis:** Generates both an **Executive Summary** and **Key Insights & Takeaways** using Mistral AI / Groq.

### C. Context-Aware Grounded Document Q&A (RAG)
- **Top-$k$ Vector Retrieval:** User queries are embedded and compared against stored chunk vectors in Pinecone to find the most semantically relevant sections.
- **Holistic Document Grounding:** In addition to top-$k$ excerpts, the document's `summary` and `keyInsights` are automatically injected into the model context block (`[Document Summary]` & `[Key Takeaways & Insights]`). This guarantees that macro-level questions receive accurate answers even when individual chunks discuss fine-grained technical specifics.
- **Semantic Query Expansion (Conclusions & Summaries Safeguard):**
  - Broad or concluding questions (e.g. *"What are the conclusions?"*, *"Summarize the deliverables"*, *"Final outcomes"*) naturally spread across whole documents rather than matching a single narrow chunk.
  - The retrieval pipeline detects conclusion/overview patterns (`/\b(conclus|conclude|concluding|takeaway|takeaways|outcome|outcomes|wrap.?up|final|deliverable)\b/i`) and enriches the embedding query with semantic synonyms (`conclusion concluding remarks final summary key takeaways deliverables outcomes`).
  - Retrieval expands `topK` to 6 chunks and automatically appends the final document chunks (ending pages) from MongoDB to guarantee conclusion sections are included in the prompt context.
- **Strict Anti-Hallucination Prompting:** The LLM is instructed to synthesize answers strictly from provided context and excerpts, citing page numbers directly. Only if a specific factual detail is completely absent will it return `"Based on the provided document excerpts, this information is not mentioned."`
- **Dual Retrieval Fallback:** If Pinecone is unreachable or returns zero matches, the system automatically falls back to keyword-scored chunk retrieval directly from MongoDB, ensuring high availability.

### D. Safe Document Deletion
- Deleting a document removes:
  1. The MongoDB document metadata and chunks (`Document`, `DocumentChunk`).
  2. The physical file in S3 or local storage.
  3. All vectors in Pinecone scoped to that document's ID.

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/documents/upload-url` | Generate presigned S3 upload URL and draft document record. |
| `POST` | `/api/v1/documents/local-storage/upload` | Server-assisted fallback upload endpoint. |
| `POST` | `/api/v1/documents/:id/process` | Trigger PDF parsing, chunking, vectorization, and summary generation. |
| `GET` | `/api/v1/documents` | Fetch paginated list of user documents (supports `page`, `limit`, `search`). |
| `GET` | `/api/v1/documents/:id` | Fetch document details, parsing status, summary, key insights, and download URL. |
| `DELETE` | `/api/v1/documents/:id` | Permanently delete document, storage object, and Pinecone vectors. |
| `POST` | `/api/v1/documents/:id/ask` | Ask grounded questions about the document (supports `?stream=true` for real-time SSE token streaming). |

---

## 6. Security & Edge Case Hardening
- **Ownership Verification:** Every endpoint validates that `document.userId` matches the authenticated `req.user._id`.
- **First-Party Cookie Compatibility:** Full integration with Next.js rewrites proxy (`/api/v1/:path*`), allowing seamless operation in privacy browsers like Brave and Safari without third-party cookie restrictions.
- **Race Condition Prevention:** Status polling guards ensure background polling updates do not overwrite active user selections or reset in-progress Q&A states.
- **Pinecone / Mistral API Key Fallbacks:** Graceful degradation to MongoDB chunk search when external vector indexing credentials are not configured or encounter rate limits.
