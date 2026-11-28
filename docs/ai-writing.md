# AI Writing Studio (`04`)

Cognify's **AI Writing Studio** (`/writing`) provides two production workflows inside a unified split-screen workspace:

1. **Email Writer:** Generates a crisp, editable **Subject Line** and **Email Body** from structured parameters (`purpose`, `intent`, `context`, optional `replyToEmail`, `recipientContext`, `tone`, `formality`, and `length`).
2. **Cover Letter Generator:** Tailors authentic, emoji-free cover letters using a user-owned resume from **Resume Studio** (`ResumeRepository.findResumeByIdAndUserId`) or a manual background fallback, paired with a target `jobDescription`, `targetRole`, `targetCompany`, `tone`, and `length`.

---

## Architecture & Data Flow

### Server Layers
- **Model:** `server/src/models/generatedContent.model.js` (`GeneratedContent`)
  - Stores `userId`, `type` (`"email" | "cover-letter"`), `title`, `subject`, `inputs`, `generatedContent`, editable `content`, 1-level `previousContent` / `previousSubject`, `metadata`, and `isPinned`.
  - Indexed on `{ userId: 1, isPinned: -1, updatedAt: -1 }` and `{ userId: 1, type: 1, isPinned: -1, updatedAt: -1 }`.
- **Repository:** `server/src/repositories/writing.repository.js`
  - All queries strictly scope by `userId`.
  - Exposes `findRecentWritings` and `countWritingsByUserId` consumed by `dashboard.service.js` (`category: "04"` and `"all"`).
- **Validation:** `server/src/validations/writing.validation.js`
  - Zod schemas for email generation, cover letter generation, quick refinement, draft edits, and pagination queries.
- **AI Streaming Engine:** `server/src/services/writingAI.service.js`
  - **Prompt Injection Defense:** Wraps untrusted `context`, `replyToEmail`, `resumeContext`, and `jobDescription` inside `--- UNTRUSTED SOURCE DATA START/END ---` blocks.
  - **Resilient `SUBJECT:` Stream Buffering:** Buffers initial email tokens until the first `\n` (with a 150-char fallback cap), matches `SUBJECT:` case-insensitively while stripping accidental markdown bolding/quotes, emits `{ event: "subject", subject }`, and falls back cleanly to body chunks if omitted.
  - **Provider Resilience:** Streams via Groq (`groq.provider.js`) with automatic fallback to Mistral (`mistral.provider.js`), logs `Usage` (`feature: "writing"`), and cancels cleanly on `AbortSignal`.
- **Controller & Routes:** `server/src/controllers/writing.controller.js`, `server/src/routes/writing.routes.js`
  - Protected by `requireAuth`, `requireEmailVerification`, and `aiEndpointLimiter` on AI endpoints.
  - Partial non-empty output is persisted if the user clicks **Stop Generation** mid-stream.

### API Endpoints (`/api/v1/writing`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/writing/email` | Stream Subject & Email Body (SSE), persist draft |
| `POST` | `/api/v1/writing/cover-letter` | Stream Cover Letter (SSE) using Resume Studio or manual context |
| `POST` | `/api/v1/writing/:id/refine` | Refine existing draft (`shorter`, `longer`, `more-formal`, `more-casual`, `more-persuasive`, `regenerate`, `custom`) with 1-level backup |
| `GET` | `/api/v1/writing` | List user's saved drafts with pagination, `type` filter, and `search` |
| `GET` | `/api/v1/writing/:id` | Fetch single draft |
| `PATCH` | `/api/v1/writing/:id` | Save user edits (`title`, `subject`, `content`) |
| `PATCH` | `/api/v1/writing/:id/pin` | Toggle pin state |
| `POST` | `/api/v1/writing/:id/restore` | Swap/restore 1-level previous version |
| `DELETE` | `/api/v1/writing/:id` | Permanently delete draft |

### Client Feature Module (`client/src/features/writing/`)
- `WritingStudio.jsx`: Split-screen studio with collapsible `WritingDrawer`, resizable split divider (`localStorage`), zero-flicker synchronous React Query cache handoff on stream `done`, and top-right navbar rules matching Notes Enhancer.
- `WritingComposer.jsx`: Mode toggle (`Email Writer` | `Cover Letter`), Resume Studio picker, and structured style selectors.
- `WritingEditorPane.jsx` & `RefineActionBar.jsx`: Editable Subject input + Copy Subject, Edit/Preview toggleable canvas with `userDirtyRef`-guarded 800ms debounced auto-save, `.txt`/`.md`/PDF export, and quick AI refinement chips.
