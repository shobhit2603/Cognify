# Document Analysis Feature Documentation

## 1. Overview & Vision
The **Document Analysis** module is Cognify's automated intelligence pipeline for unstructured text and document understanding. It enables users to upload PDF documents, extract and chunk text content, vectorize information into a vector database (Pinecone), and generate:
- **Executive Summaries**
- **Key Takeaways & Actionable Insights**
- **Context-Aware Semantic Q&A** (Retrieval-Augmented Generation / RAG)

Users interact with complex, dense documents (research papers, reports, study guides, manuals) without manual skimming or token-limit bottlenecks.

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
[ Pinecone Vector DB ] ◀─── Namespaced per Document / User
       │
       │ 6. Summarization & Key Insights Inference
       ▼
[ Mistral AI / Groq ]
       │
       │ 7. Real-Time Status Polling & WebSocket/UI Feedback
       ▼
[ Next.js Client Dashboard & Q&A Modal ]
```

---

## 3. Core Capabilities & Workflows

### A. Resilient Document Upload Pipeline
1. **Presigned Upload URL:** The client requests an upload target from `POST /api/v1/documents/upload-url`.
2. **Direct S3 Upload:** The client directly uploads the binary file to Amazon S3 via `XMLHttpRequest` with upload progress tracking.
3. **Transparent Server Fallback:** If direct S3 upload fails due to network restrictions, strict ad-blockers, or CORS issues, the client automatically falls back to the server-assisted endpoint (`POST /api/v1/documents/local-storage/upload`), ensuring 100% upload reliability.

### B. Ingestion, Chunking & Vectorization
- **Text Extraction:** Uses `pdf-parse` to extract raw textual content from the uploaded PDF.
- **Recursive Chunking:** Splits extracted text into semantic chunks (~1,000 characters with 200-character overlap) to preserve contextual boundaries.
- **Pinecone Vector Indexing:** Chunks are converted into high-dimensional vector embeddings and upserted to Pinecone under targeted namespaces (`document-<documentId>`).
- **Parallel AI Synthesis:** Generates both an **Executive Summary** and **Key Insights & Takeaways** using Mistral AI.

### C. Context-Aware Document Q&A (RAG)
- When a user asks questions about a document in the Q&A tab, the query is vectorized and searched against Pinecone for top-$k$ relevant chunks.
- The retrieved context chunks are injected into the prompt along with source attribution, ensuring accurate answers without sending the entire PDF to the model.

### D. Safe Document Deletion
- Deleting a document removes:
  1. The MongoDB document metadata and chunks (`Document`, `DocumentChunk`).
  2. The physical file in S3 or local storage.
  3. All vectors in Pinecone scoped to that document's ID using `{ ids: vectorIds }`.

---

## 4. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/documents/upload-url` | Generate presigned S3 upload URL and draft document record. |
| `POST` | `/api/v1/documents/local-storage/upload` | Server-assisted fallback upload endpoint. |
| `POST` | `/api/v1/documents/:id/process` | Trigger PDF parsing, chunking, vectorization, and summary generation. |
| `GET` | `/api/v1/documents` | Fetch paginated list of user documents (supports `page`, `limit`, `search`). |
| `GET` | `/api/v1/documents/:id` | Fetch document details, parsing status, summary, and key insights. |
| `DELETE` | `/api/v1/documents/:id` | Permanently delete document, storage object, and Pinecone vectors. |
| `POST` | `/api/v1/documents/:id/qa` | Ask questions specifically grounded in the document context. |

---

## 5. Security & Edge Case Hardening
- **Ownership Verification:** Every endpoint validates that `document.userId` matches the authenticated `req.user._id`.
- **First-Party Cookie Compatibility:** Full integration with Next.js rewrites proxy (`/api/v1/:path*`), allowing seamless operation in privacy browsers like Brave and Safari without third-party cookie restrictions.
- **Race Condition Prevention:** Modal selection guards ensure background polling updates do not overwrite active user selections or reset in-progress Q&A states.
