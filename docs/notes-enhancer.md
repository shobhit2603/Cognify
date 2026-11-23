# Notes Enhancer Feature Documentation

## 1. Overview & Vision
The **Notes Enhancer** is Cognify's smart synthesis studio designed for students, developers, and knowledge workers. It bridges the gap between chaotic, raw shorthand (meeting notes, lecture thoughts, quick code snippets) and structured, high-retention learning resources and action blueprints.

### Core Product Philosophy
> **"Optimize for learning usefulness, clarity, and original intent — not bloated text generation."**  
> Notes Enhancer preserves the user's authentic thought process while enriching it with clear structure, practical examples, and actionable takeaways.

---

## 2. Studio Workspace Architecture (`/notes`)

The Notes Enhancer is built as a **Split-Screen Studio**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Top Bar: [Toggle Drawer] [← Dashboard] / [Note Title]               [+ New Note (only if drawer shut)] │
├────────────────┬───────────────────────────────────────┬───┬───────────────────────────────────────────┤
│ Left Drawer    │ Center: Raw Notes Panel               │ ⁝ │ Right: Enhanced Notes Panel               │
│ Compact        │ (Default ~42% width, resizable 25–65%)│   │ (Default ~58% width, fills remaining)     │
│ [230px]        │                                       │ D │                                           │
│                │ ┌───────────────────────────────────┐ │ R │ ┌───────────────────────────────────────┐ │
│ [Search Notes] │ │ Title & Debounced Auto-Save Dot   │ │ A │ │ [Enhanced] [Mode Pill]   [👁][📋][📄][💬]│ │
│ [+ Note] [+Dir]│ ├───────────────────────────────────┤ │ G │ ├───────────────────────────────────────┤ │
│                │ │                                   │ │   │ │                                       │ │
│ 📌 Pinned      │ │ Raw Notes Textarea Canvas         │ │ D │ │ Enhanced Markdown Reading View        │ │
│ 📁 Folders     │ │ (Independent scrollbar)           │ │ I │ │ (Independent scrollbar, extends to    │ │
│ 📝 General     │ │                                   │ │ V │ │  bottom of viewport)                  │ │
│                │ ├───────────────────────────────────┤ │ I │ │                                       │ │
│                │ │ Scoped Bottom Action Bar          │ │ D │ │ • Full table wrapping (no clipping)   │ │
│                │ │ [Mode Chips (horizontal scroll)]  │ │ E │ │ • Clean inline `code` vs ``` blocks   │ │
│                │ │ [Custom Prompt Input] [Enhance]   │ │ R │ │ • Proportional, concise output       │ │
│                │ └───────────────────────────────────┘ │   │ └───────────────────────────────────────┘ │
└────────────────┴───────────────────────────────────────┴───┴───────────────────────────────────────────┘
```

---

## 3. Key Capabilities & Behavioral Rules

### A. Zero-Friction Hybrid Enhancement
1. **Auto-Detect by Default:** If no preset is selected, clicking **"Enhance Note"** automatically detects note intent and selects the optimal structure.
2. **Natural Language Action Bar:** An optional instruction input (e.g., *"add TypeScript types"*, *"keep it under 200 words"*) allows ad-hoc steering.
3. **Simple, Human-Friendly Presets (Capped at 6):**
   - **Study Guide:** Core concepts, plain-English explanations, real-world analogies, common pitfalls/mistakes, and quick self-test questions.
   - **Code & Tech Notes:** Logic breakdown, implementation snippets, edge cases, and performance constraints.
   - **Meeting Takeaways:** Discussion context, decisions agreed upon, and next action items with owners.
   - **Quick Polish & Summary:** Polishes grammar and flow, extracting punchy bullet takeaways.
4. **Editable Presets:** Users can click a pencil icon on any preset chip to customize its title and system instructions in a lightweight modal.

### B. 2-Stage Progress & Real-Time SSE Token Streaming
- When triggered, the right pane displays an animated 2-step progress card:
  1. `Analyzing note intent...`
  2. `Synthesizing blueprint...`
- The system then immediately begins **streaming tokens in real-time** via Server-Sent Events (`text/event-stream`), rendering Markdown live.
- When finished, an attribution badge appears (`"Enhanced using: <Framework>"`).

### C. Debounced Auto-Save & Version Safeguard
- **Raw Input:** Automatically saves to the database 800ms after typing ceases, indicated by a subtle status dot (`"Saving..."` / `"Saved"`).
- **Enhanced Output:** Automatically persists upon stream completion. Any manual tweaks made in edit mode auto-save.
- **Version Safeguard:** Re-enhancing never destroys the raw note. Prior enhanced content is backed up in `previousEnhancedContent`, offering a 1-click **"Restore Previous Enhancement"** button.

### D. Organization & Strict Folder Safety
- **Search:** Top search bar dynamically flattens the drawer into matching notes with folder attribution pills.
- **Pinned Notes:** Pinned items stay surfaced in a dedicated top section for one-click access.
- **Single-Level Flat Folders:** Clean organization without complicated nested hierarchies.
- **Strict Folder Deletion Rule:** **A folder cannot be deleted while it contains notes.** Users must move or delete the notes inside first, preventing accidental data loss.

### E. Export & AI Chat Bridge
- **One-Click Copy Markdown:** Instant clipboard copy with toast confirmation.
- **Save as PDF:** Clean, print-formatted PDF generation containing title and rendered markdown.
- **Discuss in AI Chat:** Spawns a dedicated session in `/chat` preloaded with the enhanced note injected as context.

---

## 4. Data Models

### NoteFolder Model (`server/src/models/noteFolder.model.js`)
```javascript
{
  userId: ObjectId,       // ref: 'User'
  name: String,           // Folder name, max 60 chars
  color: String,          // Accent color
  timestamps: true
}
```

### Note Model (`server/src/models/note.model.js`)
```javascript
{
  userId: ObjectId,                  // ref: 'User'
  folderId: ObjectId | null,         // ref: 'NoteFolder'
  title: String,                     // Default "Untitled Note"
  originalContent: String,           // Raw input
  enhancedContent: String,           // AI generated / edited
  previousEnhancedContent: String,   // Backup for 1-click restore
  enhancedMetadata: {
    frameworkUsed: String,           // e.g. 'Study Guide'
    enhancedAt: Date
  },
  isPinned: Boolean,                 // Top pinning flag
  timestamps: true
}
```

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/notes` | Get all notes for user (supports search query `?search=`). |
| `POST` | `/api/v1/notes` | Create a new note (optional `folderId`, `title`, `originalContent`). |
| `GET` | `/api/v1/notes/:id` | Fetch specific note details. |
| `PATCH` | `/api/v1/notes/:id` | Update note title, raw content, or enhanced content (auto-save). |
| `DELETE` | `/api/v1/notes/:id` | Permanently delete a note. |
| `PATCH` | `/api/v1/notes/:id/pin` | Toggle pinned state (`isPinned`). |
| `PATCH` | `/api/v1/notes/:id/move` | Move note to another folder or set to uncategorized (`folderId: null`). |
| `POST` | `/api/v1/notes/:id/restore` | Restore previous enhanced content from safeguard backup. |
| `POST` | `/api/v1/notes/:id/enhance` | SSE streaming endpoint (`stage` events $\rightarrow$ `chunk` tokens $\rightarrow$ `done`). |
| `GET` | `/api/v1/note-folders` | List all user folders with note counts. |
| `POST` | `/api/v1/note-folders` | Create a new folder. |
| `PATCH` | `/api/v1/note-folders/:id` | Rename or update folder. |
| `DELETE` | `/api/v1/note-folders/:id` | Delete folder (**Blocked if folder contains any notes**). |

---

## 6. Frontend Architecture & State Management

- **Routing:** `/notes` protected via Next.js Proxy Middleware and client-side `ProtectedRoute`.
- **Query & Mutation Management:** TanStack React Query (`useNotes`, `useNoteFolders`, `useNoteMutations`) providing instant cache invalidation and responsive UI updates.
- **SSE Stream Processing:** `note.service.js` uses a native `ReadableStream` reader with `TextDecoder` that flushes parsed server events:
  - `onStage`: Updates UI progress banner (`detecting` $\rightarrow$ `synthesizing`).
  - `onChunk`: Accumulates live Markdown tokens in the preview pane.
  - `onDone`: Finalizes note state and triggers confirmation toast.
  - `onError`: Handles network drops or abort signal cancellations gracefully.
- **Cross-Module AI Chat Bridge:** Clicking **"Discuss in AI Chat"** injects the note title, framework attribution, and formatted markdown into `sessionStorage` and seamlessly preloads the conversational context into `/chat`.
- **Clean PDF Generation:** Formatted HTML export with bespoke print stylesheet ensuring styled headings, code blocks, tables, and Cornell callouts.

---

## 7. Verification & Automated Test Coverage

The Notes Enhancer suite is validated by comprehensive Jest integration tests (`server/src/tests/note.test.js`):
- **Folder Protection:** Enforces non-empty folder deletion rejection with HTTP 400 and clear warning message.
- **Folder Lifecycle:** Validates creation, listing with note counts, and renaming.
- **Note Lifecycle:** Covers creation, debounced auto-save updates, full-text search, moving between folders, pinning/unpinning, and deletion.
- **Version Safeguard:** Verifies atomic restoration of `previousEnhancedContent`.
- **Enhancement Validation:** Verifies empty note validation rejection before model inference.
- **Client Build:** Verified with Next.js Turbopack (`npm run build`) and ESLint with 0 errors or warnings.
