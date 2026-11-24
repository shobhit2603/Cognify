# Notes Enhancer Feature Documentation

## 1. Overview & Vision
The **Notes Enhancer** is Cognify's smart synthesis studio designed for students, developers, and knowledge workers. It bridges the gap between chaotic, raw shorthand (meeting notes, lecture thoughts, quick code snippets) and structured, high-retention learning resources and action blueprints.

### Core Product Philosophy
> **"Optimize for learning usefulness, clarity, and original intent — not bloated text generation."**  
> Notes Enhancer preserves the user's authentic thought process while enriching it with clear structure, practical examples, and actionable takeaways, keeping output strictly proportional to the raw input.

---

## 2. Studio Workspace Architecture (`/notes`)

The Notes Enhancer is built as a **Split-Screen Studio** with fluid collapsible panels and dedicated workspace navigation:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Header: [Toggle Drawer] [← Dashboard] / [Note Title]   [+ Note] [↺ Restore] [💬 Discuss] │ [Toggle Panel]│
├────────────────┬───────────────────────────────────────┬───┬───────────────────────────────────────────┤
│ Left Drawer    │ Center: Raw Notes Panel               │ ⁝ │ Right: Enhanced Notes Panel               │
│ Compact        │ (Default ~42% width, resizable 25–65%,│   │ (Default ~58% width, collapsible to 0%,   │
│ [230px]        │  expands to centered max-w-4xl canvas)│ D │  smooth 300ms ease-in-out slide)          │
│                │ ┌───────────────────────────────────┐ │ R │ ┌───────────────────────────────────────┐ │
│ [Search Notes] │ │ Title & Debounced Auto-Save Dot   │ │ A │ │ [Enhanced] [Mode Pill]   [👁][📋][📄] │ │
│ [+ Note] [+Dir]│ ├───────────────────────────────────┤ │ G │ ├───────────────────────────────────────┤ │
│                │ │                                   │ │   │ │                                       │ │
│ 📌 Pinned      │ │ Raw Textarea Canvas               │ │ D │ │ Enhanced Markdown Reading View        │ │
│ 📁 Folders     │ │ (Automatic scrollbar on overflow) │ │ I │ │ (Automatic scrollbar on overflow,     │ │
│   (active tint)│ │                                   │ │ V │ │  extends to bottom of viewport)       │ │
│ 📝 General     │ ├───────────────────────────────────┤ │ I │ │                                       │ │
│                │ │ Scoped Single-Row Action Bar      │ │ D │ │ • Full table wrapping (no clipping)   │ │
│                │ │ [Mode ▾] [Custom Prompt] [Enhance]│ │ E │ │ • Clean inline `code` vs ``` blocks   │ │
│                │ └───────────────────────────────────┘ │ R │ │ • Proportional, scannable output      │ │
│                │                                       │   │ └───────────────────────────────────────┘ │
└────────────────┴───────────────────────────────────────┴───┴───────────────────────────────────────────┘
```

### Key UI/UX Layout Rules
- **Color Identity (Notes Teal `#00FFFF`):** Distinct from Document Analysis (Lime Green `#a1ff62`), Notes Enhancer uses an electric teal theme token (`--color-osmo-teal: #00ffff`) across headers, active note cards, active collapsed folder rows, action bar mode triggers, and the primary CTA.
- **Collapsible Enhanced Notes Panel with Smart Default:**
  - **Smart Default:** Closed by default when creating a new note or opening an unenhanced note to keep focus on the raw canvas; automatically opens when opening a note with existing enhancement or upon clicking **Enhance**.
  - **Smooth Sliding Transition:** Animates smoothly between `58%` and `0%` over 300ms with persistent DOM clipping (`min-w-[360px]` inner container), completely eliminating layout snapping.
  - **Centered Raw Canvas When Collapsed:** When the right panel is closed, the divider hides and the Raw Notes editor + scoped bottom action bar smoothly center into a comfortable `max-w-4xl mx-auto` container like Notion.
  - **Draggable Pointer-Events Splitter:** Centers between raw notes and enhanced reading view with safe clamped boundaries ($25\% - 65\%$, default $42\% / 58\%$). Split ratio is persisted in `localStorage`. Transitions are automatically disabled during active dragging for zero-latency cursor tracking.
- **Top-Right Workspace Action Navbar:**
  - `[+ New Note]`: Rendered when the left drawer is collapsed.
  - `[Restore Previous Version]`: Amber icon button with custom tooltip, visible when the Enhanced panel is open and a previous version exists.
  - `[Discuss in Chat]`: Teal accent button with custom tooltip, visible when enhanced content exists.
  - `[Enhanced Panel Toggle]`: Mirrored `SidebarSimple` (`rotate-180`, weight `fill` when open) anchored at the far right with `"Show/Hide Enhanced Panel"` tooltip.
- **Decluttered Enhanced Notes Header:** Confined strictly to **`ENHANCED` + Mode Chip** on the left and the 3 document-level icons (**Preview/Edit**, **Copy Markdown**, **Save as PDF**) on the right.
- **Mode Chip Text Overflow Safeguard:** Framework chips use `whitespace-nowrap font-mono text-[10px] px-2.5 py-0.5 rounded-full` with relaxed width caps and a `title={frameworkName}` tooltip fallback.
- **Active Parent Folder Cue:** When an active note resides inside a collapsed folder, the folder row receives a subtle teal background and border highlight (`bg-osmo-teal/10 border-osmo-teal/30`) so users instantly spot where the active note belongs.
- **Clean Typography Info Cards:** Empty state info cards (`Zero Friction` & `Version Safe`) render with clean typography without emoji or flash/shield icons.

---

## 3. Key Capabilities & Technical Mechanics

### A. Zero-Friction Hybrid Enhancement
1. **Auto-Detect by Default:** If no preset is selected, clicking **"Enhance Note"** automatically detects note intent and selects the optimal structure.
2. **Natural Language Action Bar:** An optional instruction input (e.g., *"add TypeScript types"*, *"keep it concise"*) allows ad-hoc steering.
3. **Simple, Human-Friendly Presets (Capped at 6):**
   - **Study Guide:** Core concepts, plain-English explanations, real-world analogies, common pitfalls/mistakes, and quick self-test questions.
   - **Code & Tech Notes:** Logic breakdown, implementation snippets, edge cases, and performance constraints.
   - **Meeting Takeaways:** Discussion context, decisions agreed upon, and next action items with owners.
   - **Quick Polish & Summary:** Polishes grammar and flow, extracting punchy bullet takeaways.
4. **Customizable Frameworks:** Users can customize system prompts or add custom presets (up to 6 total) via `EditPresetModal`.

### B. AI Auto-Title Generation
- If a note is untitled (empty or `"Untitled Note"`), the backend generates a short, meaningful title ($max\_tokens: 30$, quotes/newlines stripped) alongside the enhancement process.
- The title is saved to the database and streamed over SSE as `event: "title"`, updating the breadcrumb, editor header, and left drawer simultaneously.
- Title generation runs in its own try/catch boundary so title failures never block or fail note enhancement.

### C. 2-Stage Progress & Real-Time SSE Token Streaming
- When triggered, a 2-stage progress banner indicates:
  1. `Analyzing note intent...`
  2. `Synthesizing blueprint...`
- The system streams tokens in real-time via Server-Sent Events (`text/event-stream`), rendering Markdown live through ReactMarkdown.

### D. Flicker-Free Stream Completion Handoff
- **Synchronous Cache Handoff:** On `event: "done"`, the final accumulated enhanced content and metadata are written synchronously into the TanStack Query cache (`queryClient.setQueriesData` and `queryClient.setQueryData`) **before** resetting streaming state.
- **Single Unified Markdown Branch:** Both streaming tokens and finalized markdown render through the exact same `<ReactMarkdown>` DOM container, eliminating unmount/remount blinks and maintaining scroll position.
- **Silent Completion:** Completion toast notifications were removed to ensure an uninterrupted, distraction-free reading experience.

### E. Automatic Independent Scrollbars & Lenis Integration
- **Lenis Route Pausing:** Window-level Lenis smooth-scrolling is paused on `/notes` (`isFixedAppRoute` in `SmoothScroll.jsx`), allowing native mouse wheel and touch event routing to inner scroll panes.
- **Automatic Scrollbars:** Using scoped `:not(.custom-scrollbar)::-webkit-scrollbar { display: none; }` rules, scrollbars are suppressed globally across the site but activate on `.custom-scrollbar` containers strictly when content height exceeds container height (`overflow-y: auto`). Short notes produce zero scrollbars.

### F. Markdown AST Rendering Safeguards
- **List Marker Alignment:** Uses `list-outside ml-5` with a custom `li` override (`[&>p]:inline [&>p]:my-0` and `marker:text-osmo-lime/70`) preventing ReactMarkdown `<p>` tags from breaking onto a separate line and creating orphaned bullet dots.
- **Code Block Isolation:** Clean inline `code` vs fenced `pre > code` differentiation using language and newline detection rather than deprecated props.
- **Responsive Tables:** Wrapped in horizontal overflow containers (`overflow-x-auto custom-scrollbar`) to prevent wide tables from clipping.

### G. Debounced Auto-Save & Version Safeguard
- **Raw Input:** Automatically saves to the database 800ms after typing ceases, indicated by a subtle status dot (`"Saving..."` / `"Saved"`).
- **Enhanced Output:** Automatically persists upon stream completion. Any manual tweaks made in edit mode auto-save.
- **Version Safeguard:** Re-enhancing never destroys the raw note. Prior enhanced content is backed up in `previousEnhancedContent`, offering a 1-click **"Restore Previous Enhancement"** icon button in the toolbar.

### H. Organization & Strict Folder Safety
- **Search:** Top search bar dynamically flattens the drawer into matching notes with folder attribution pills.
- **Pinned Notes:** Pinned items stay surfaced in a dedicated top section for one-click access.
- **Single-Level Flat Folders:** Clean organization without complicated nested hierarchies.
- **Strict Folder Deletion Rule:** **A folder cannot be deleted while it contains notes.** Users must move or delete the notes inside first, preventing accidental data loss.

### I. Export & AI Chat Bridge
- **One-Click Copy Markdown:** Instant clipboard copy with toast confirmation.
- **Save as PDF:** Clean, print-formatted PDF generation containing title and rendered markdown.
- **Discuss in AI Chat:** Spawns a dedicated session in `/chat` preloaded with the enhanced note injected as context.

### J. Resilience, Concurrency & Security Hardening
- **Optimistic Concurrency & Safe Restores:** Enhancement restorations conditionally check snapshot content to prevent concurrent overwrite races.
- **Atomic Folder Naming & Integrity:** Case-insensitive unique indexing prevents duplicate folder names per user (`collation: { locale: "en", strength: 2 }`), mapping conflicts to HTTP 409. Regex searches sanitize special characters.
- **Sanitized PDF Export:** Custom HTML escaping and safe DOM creation prevent HTML sink injection during PDF compilation.
- **Keyboard-Operable Semantic Navigation:** Drawer notes and folders use semantic `<button>` elements with `aria-expanded` and keyboard navigation support, decoupling action menus from selection clicks.
- **Debounced Save Queue & Sequence Tracking:** Unsaved drafts are flushed on component unmount to prevent keystroke loss, while monotonically increasing request counters reject stale in-flight save responses.
- **Custom Preset Instructions Injection:** Both built-in and user-defined preset instructions (`presetInstructions`) are validated and passed seamlessly into Groq model prompt templates.

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
| `POST` | `/api/v1/notes/:id/enhance` | SSE streaming endpoint (`stage` $\rightarrow$ `title` $\rightarrow$ `chunk` $\rightarrow$ `done`). |
| `GET` | `/api/v1/note-folders` | List all user folders with note counts. |
| `POST` | `/api/v1/note-folders` | Create a new folder. |
| `PATCH` | `/api/v1/note-folders/:id` | Rename or update folder. |
| `DELETE` | `/api/v1/note-folders/:id` | Delete folder (**Blocked if folder contains any notes**). |

---

## 6. Frontend Architecture & State Management

- **Routing:** `/notes` protected via Next.js Proxy Middleware and client-side `ProtectedRoute`.
- **Query & Mutation Management:** TanStack React Query (`useNotes`, `useNoteFolders`, `useNoteMutations`) providing optimistic updates, synchronous cache handoffs, and responsive UI synchronization.
- **SSE Stream Processing:** `note.service.js` uses a native `ReadableStream` reader with `TextDecoder` that flushes parsed server events:
  - `onStage`: Updates UI progress banner (`detecting` $\rightarrow$ `synthesizing`).
  - `onTitle`: Updates note title in React Query cache and local component state.
  - `onChunk`: Accumulates live Markdown tokens in the preview pane.
  - `onDone`: Synchronously writes completed note state to cache before clearing stream variables.
  - `onError`: Handles network drops or abort signal cancellations gracefully.
- **Cross-Module AI Chat Bridge:** Clicking **"Discuss in AI Chat"** injects the note title, framework attribution, and formatted markdown into `sessionStorage` and seamlessly preloads conversational context into `/chat`.
- **Clean PDF Generation:** Formatted HTML export with bespoke print stylesheet ensuring styled headings, code blocks, tables, and callouts.

---

## 7. Verification & Automated Test Coverage

The Notes Enhancer suite is validated by comprehensive Jest integration tests (`server/src/tests/note.test.js`):
- **Folder Protection:** Enforces non-empty folder deletion rejection with HTTP 400 and clear warning message.
- **Folder Lifecycle:** Validates creation, listing with note counts, and renaming.
- **Note Lifecycle:** Covers creation, debounced auto-save updates, full-text search, moving between folders, pinning/unpinning, and deletion.
- **Version Safeguard:** Verifies atomic restoration of `previousEnhancedContent`.
- **Enhancement Validation:** Verifies empty note validation rejection before model inference.
- **Test Result:** **15/15 passing integration tests**.
