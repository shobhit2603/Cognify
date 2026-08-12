# Cognify AI — Master Project Context & Engineering Instructions

You are the primary AI software engineer responsible for designing and building **Cognify**, a production-ready AI-powered SaaS platform.

Before writing implementation code, you must fully understand the product, architecture, engineering constraints, security requirements, performance goals, and development philosophy described below.

Treat this document as the authoritative engineering context for the project.

Do not immediately start generating large amounts of code.

First inspect the existing project structure, understand the environment, identify what has already been implemented, and produce a concrete implementation plan. If the repository is empty, design the architecture before implementation.

The objective is not simply to make the application work.

The objective is to build Cognify as a maintainable, scalable, secure, performant, production-grade SaaS application that can evolve significantly beyond its MVP without requiring an architectural rewrite.

---

# 1. PRODUCT CONTEXT

Product name:

**Cognify**

Product type:

**AI-powered SaaS / AI Productivity Workspace**

Primary technology stack:

- Next.js
- JavaScript
- Tailwind CSS
- Node.js
- Express.js
- MongoDB
- Mistral AI

Architecture:

**Client and Server are separate applications.**

Client:

**Feature-based architecture**

Server:

**Layered architecture with Repository-based data access**

The product vision is to provide one unified AI workspace where users can understand information, research topics, create content, and improve their work.

The central product philosophy is:

**Understand → Research → Create → Improve**

Cognify should not feel like a collection of unrelated AI tools.

The features must feel like parts of one coherent AI productivity platform.

---

# 2. PRODUCT VISION

Cognify is intended for:

- Students
- Job seekers
- Developers
- Technology professionals
- Knowledge workers
- General professionals

Users should be able to perform common AI-assisted tasks without constantly switching between different applications.

Cognify combines:

- General AI interaction
- Document understanding
- Resume analysis
- Professional writing
- Learning assistance

The long-term goal is to evolve Cognify into a broader AI productivity platform.

Therefore, every architectural decision must consider future extensibility.

Do not create feature-specific implementations that make future expansion difficult.

---

# 3. CORE PRODUCT AREAS

Cognify consists of five major product areas:

1. AI Chat
2. Document Analysis
3. Resume Studio
4. AI Writing
5. Notes Enhancer

Authentication and user management form the foundation of the entire application.

---

# 4. MVP SCOPE

The MVP consists of the following.

## Authentication

- Register
- Login
- Google OAuth
- Logout
- User profile
- Session management
- Password management
- Authentication state persistence

## AI Chat

- Create chat
- Send messages
- Streaming responses
- Markdown rendering
- Code rendering
- Copy message
- Edit prompt
- Stop generation
- Chat history
- Rename chat
- Delete chat

## Document Analysis

- PDF upload
- PDF processing
- PDF summary
- Key insights
- Q&A with PDF

## Resume Studio

- Resume upload
- Resume parsing
- ATS analysis
- Resume analysis
- Basic resume optimization

## AI Writing

- Email Writer
- Cover Letter

## Notes Enhancer

- Create note
- Enhance note using AI
- Save enhanced note

---

# 5. POST-MVP FEATURES

Do not implement these as part of the initial MVP unless explicitly instructed.

The architecture should, however, make them possible later.

Post-MVP features include:

- Real-time web search inside Chat
- Research and Analysis
- Blog Writer
- Text-to-Voice
- Multiple AI models
- Advanced resume optimization
- Additional document formats
- Advanced analytics
- Billing/subscriptions
- Team/workspace functionality
- Advanced RAG
- Resume/job matching
- Job description analysis
- AI presentation generation
- AI spreadsheet analysis
- Shared documents
- Saved AI workflows
- Custom AI assistants
- Browser extension
- API access

Do not prematurely implement these features.

Build extension points where they naturally belong, but avoid unnecessary abstraction and speculative code.

---

# 6. MOST IMPORTANT ENGINEERING PRINCIPLE

The central architectural principle is:

**Build the platform once, then add AI capabilities on top of it.**

Authentication, authorization, user ownership, conversations, documents, AI services, usage tracking, security, observability, and the frontend design system should form the reusable platform foundation.

Individual AI features must consume these shared capabilities instead of implementing their own independent versions.

Avoid duplicated business logic.

Avoid duplicated API clients.

Avoid duplicated authentication logic.

Avoid duplicated error handling.

Avoid duplicated AI provider logic.

Avoid duplicated validation.

---

# 7. CLIENT ARCHITECTURE

The client must use a **feature-based architecture**.

Conceptually:

client/

- app/
- features/
- components/
- lib/
- hooks/
- services/
- utils/
- types/

Major features should have isolated modules:

features/

- auth/
- chat/
- documents/
- resume/
- writing/
- notes/

A feature should own its feature-specific:

- Components
- Hooks
- API interactions
- Types
- Utilities
- State
- Feature logic

Avoid creating a giant global components/business-logic structure.

Shared components should only exist when they are genuinely reusable.

Do not move feature-specific components into global folders simply to make the folder structure look cleaner.

---

# 8. SERVER ARCHITECTURE

The server must use a layered architecture.

Expected conceptual flow:

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

MongoDB

The server should conceptually contain:

server/

- routes/
- controllers/
- services/
- repositories/
- models/
- middlewares/
- providers/
- utils/
- config/

Responsibilities must remain clearly separated.

## Routes

Routes define HTTP endpoints and connect them to controllers.

Routes should not contain business logic.

## Controllers

Controllers handle HTTP concerns:

- Request
- Response
- Status codes
- Calling services

Controllers should remain thin.

Do not put business logic inside controllers.

## Services

Services contain application/business logic.

Examples:

- AuthService
- ChatService
- DocumentService
- ResumeService
- WritingService
- NotesService
- AIService

Services should coordinate application behavior.

## Repositories

Repositories are responsible for database persistence.

Examples:

- UserRepository
- ConversationRepository
- MessageRepository
- DocumentRepository
- ResumeRepository
- NoteRepository
- UsageRepository

Do not put business logic inside repositories.

Repositories should abstract MongoDB persistence from the rest of the application.

## Providers

External integrations must be isolated.

Examples:

- MistralProvider
- StorageProvider
- OAuthProvider
- Future WebSearchProvider

Mistral-specific implementation must never be scattered throughout the application.

---

# 9. AI ARCHITECTURE

Do not call Mistral AI directly from individual feature controllers.

Use a centralized AI abstraction.

Expected conceptual architecture:

Feature

↓

Feature Service

↓

AI Service

↓

Prompt / Context Builder

↓

Model Provider

↓

Mistral AI

The AI layer should centralize:

- Model configuration
- Token limits
- Prompt management
- Streaming
- Error handling
- Retry behavior
- Usage tracking
- AI safety controls

Feature-specific prompt construction should remain separate from the low-level Mistral provider implementation.

For example:

ChatService should understand chat behavior.

AIService should understand AI orchestration.

MistralProvider should understand how to communicate with Mistral.

Do not mix these responsibilities.

The architecture must allow additional AI providers/models to be introduced later without rewriting the feature layer.

---

# 10. AI STREAMING

Streaming is a core requirement for AI Chat.

AI responses should be streamed to the client rather than waiting for the entire response to finish.

The implementation must correctly handle:

- Stream start
- Partial chunks
- Stream completion
- User cancellation
- Network interruption
- Provider errors
- Client disconnect
- Persisting the final assistant response

The Stop Generation functionality must actually cancel the underlying generation/request where technically possible.

Do not merely stop rendering the response while allowing the backend AI request to continue consuming resources.

---

# 11. DOCUMENT ANALYSIS ARCHITECTURE

Initial supported format:

**PDF**

Expected conceptual flow:

PDF Upload

↓

File Validation

↓

Storage

↓

Text Extraction

↓

Document Processing

↓

Chunking

↓

Context Retrieval

↓

Mistral AI

↓

Result

For document Q&A, do not send the entire document to Mistral for every question.

The architecture must support retrieving only the relevant context.

This is important for:

- Latency
- Token usage
- Cost
- Scalability

Large document processing should eventually be compatible with asynchronous background jobs.

Do not block normal API requests for expensive processing.

---

# 12. DOCUMENT SECURITY

Uploaded files are untrusted input.

Validate:

- File type
- MIME type
- File extension
- File size
- Upload authorization

Never assume that a file is safe simply because its extension is `.pdf`.

Do not allow uploaded files to become executable content.

Ensure that users can only access their own documents.

A document belonging to User A must never become accessible through User B's request, even if User B knows the document ID.

---

# 13. RESUME STUDIO

Resume Studio provides:

- Resume upload
- Resume parsing
- ATS analysis
- Resume analysis
- Resume optimization

ATS analysis should consider:

- Keyword coverage
- Skills
- Experience
- Education
- Structure
- Section completeness
- Formatting signals
- Job-description alignment
- Readability

The ATS result must not be represented as a guaranteed prediction of whether a company will accept the resume.

It is an analysis/optimization score.

The UI should communicate:

Score

↓

Problems

↓

Why it matters

↓

Recommendation

↓

Improvement

Resume optimization should allow users to improve individual sections rather than blindly rewriting the entire resume.

---

# 14. AI WRITING

MVP writing capabilities:

## Email Writer

Inputs may include:

- Context
- Intent
- Tone
- Length
- Formality
- Purpose

## Cover Letter

The system should be able to use:

- Resume context
- Job description
- User-provided information

Generated content must remain editable by the user.

Do not treat AI-generated output as immutable.

---

# 15. NOTES ENHANCER

The user can enter short or incomplete notes.

Cognify should enhance them into a clearer learning resource.

The AI must preserve the user's original intent.

It should not unnecessarily generate unrelated information.

The output can contain:

- Explanation
- Structure
- Examples
- Common mistakes
- Important concepts

The feature should optimize for learning usefulness, not maximum text generation.

---

# 16. DATABASE ARCHITECTURE

MongoDB is the primary database.

Initial entities include:

- User
- Conversation
- Message
- Document
- DocumentChunk
- Resume
- ResumeAnalysis
- Note
- GeneratedContent
- Usage
- Session

Future entities may include:

- Subscription
- Payment
- AIModel
- ActivityLog
- WebSearch

Every user-owned resource must contain an ownership relationship.

Examples:

conversation.userId

document.userId

resume.userId

note.userId

Authorization must verify ownership before:

- Reading
- Updating
- Deleting
- Processing

Do not trust IDs supplied by the client.

---

# 17. DATABASE PERFORMANCE

MongoDB queries must be designed intentionally.

Use indexes based on actual access patterns.

Do not add random indexes everywhere.

Important access patterns will likely include:

- User → conversations
- User → documents
- User → resumes
- User → notes
- Conversation → messages
- Document → chunks
- User → usage

Pagination must be used for potentially large collections.

Do not load unlimited chat history, messages, documents, or activity records into a single request.

Avoid N+1 query patterns.

Avoid unnecessary database round trips.

---

# 18. AUTHENTICATION AND AUTHORIZATION

Authentication must be designed as a security-critical subsystem.

Requirements include:

- Secure password hashing
- Secure sessions
- HTTP-only cookies where appropriate
- Secure cookie configuration
- Authentication expiration
- Refresh/session rotation
- OAuth state validation
- Session fixation protection
- Authentication middleware
- Authorization middleware

The client must never be trusted for authorization decisions.

The server must independently verify:

1. Who is making the request?
2. What resource are they accessing?
3. Does that resource belong to them?
4. Are they authorized to perform this operation?

---

# 19. API SECURITY

Implement defense in depth.

Requirements:

- Authentication middleware
- Authorization checks
- Request validation
- Rate limiting
- CORS configuration
- Security headers
- Input sanitization where appropriate
- Request size limits
- Secure error responses
- No sensitive stack traces in production
- Protection against NoSQL injection
- Protection against abusive AI endpoints

Use a schema validation strategy consistently across the API.

Do not trust:

- Request body
- Query parameters
- URL parameters
- Headers
- Uploaded files

Everything crossing the trust boundary must be validated.

---

# 20. AI SECURITY

AI endpoints must be treated as security-sensitive and potentially expensive.

Consider:

- Prompt injection
- Malicious document content
- Untrusted web content
- Sensitive information exposure
- Context leakage
- Cross-user data leakage
- Excessive token consumption
- Abuse of AI endpoints

Never allow content retrieved from one user or document to leak into another user's AI context.

Only provide the minimum context required for a particular AI operation.

Do not blindly trust instructions contained inside uploaded documents.

When future web search is implemented, web content must be treated as untrusted external data.

---

# 21. USER DATA PRIVACY

Cognify handles potentially sensitive:

- Resumes
- Documents
- Conversations
- Notes
- Generated content

Treat all of this as private user data.

Data isolation must be enforced server-side.

Do not expose sensitive information unnecessarily in:

- API responses
- Logs
- Error messages
- Browser storage
- URLs
- Client-side state

Do not log:

- Passwords
- Authentication tokens
- Session secrets
- Private document contents
- Full conversation contents unless explicitly justified and safely handled

---

# 22. PERFORMANCE REQUIREMENTS

Performance is a first-class requirement.

Prioritize:

- Fast initial page load
- Low API latency
- Streaming AI responses
- Efficient database queries
- Database indexing
- Pagination
- Lazy loading
- Minimal unnecessary client-side JavaScript
- Optimistic UI where appropriate
- Skeleton states
- Efficient rendering

Use Next.js capabilities appropriately.

Do not automatically make everything a Client Component.

Prefer server-side rendering/server components where they provide a real benefit.

Only introduce client-side state and JavaScript where interaction requires it.

Do not optimize prematurely, but do not introduce obvious performance problems.

---

# 23. FRONTEND UX PRINCIPLES

Cognify should feel like a polished modern SaaS product.

Design goals:

- Minimal
- Professional
- Fast
- Clear
- Responsive
- Accessible
- Consistent

Avoid excessive:

- Gradients
- Glassmorphism
- Decorative animations
- Large visual effects
- Unnecessary motion

Visual effects should support usability rather than distract from productivity.

The UI should prioritize:

- Information hierarchy
- Readability
- Fast interaction
- Clear states
- Predictable navigation
- Strong empty states
- Strong loading states
- Strong error states

---

# 24. APPLICATION LAYOUT

Primary application structure:

Sidebar

↓

Workspace

Sidebar navigation should include:

- Dashboard
- AI Chat
- Documents
- Resume Studio
- AI Writing
- Notes
- History
- Settings

All product areas should feel like part of the same application.

Do not design every feature as if it belongs to a different product.

---

# 25. AI CHAT UX

Chat should support:

- Streaming text
- Markdown
- Code blocks
- Copy controls
- Edit prompt
- Stop generation
- Loading states
- Empty states
- Chat search
- Pinned conversations
- Rename
- Delete

The streaming experience should feel continuous.

Do not render a large completed response only after the AI request finishes.

Handle partial responses gracefully.

The UI should remain responsive while AI generation is happening.

---

# 26. DOCUMENT UX

Document state must be explicit.

Expected flow:

Upload

↓

Processing

↓

Ready

↓

Analyze

↓

Ask Questions

The user must always know the current document state.

Examples of useful states:

- Uploading
- Processing
- Ready
- Failed
- Analyzing

Do not leave the user staring at an indefinite spinner.

---

# 27. ERROR HANDLING

Use centralized backend error handling.

Errors should be categorized appropriately.

Examples:

- Validation error
- Authentication error
- Authorization error
- Resource not found
- Rate limit
- AI provider error
- File processing error
- Database error
- Internal server error

The API should return consistent error structures.

The frontend should translate technical failures into useful user-facing messages.

Never expose internal implementation details to users.

---

# 28. RELIABILITY

Gracefully handle:

- AI provider failures
- Network failures
- Invalid files
- Malformed requests
- Rate limits
- Database failures
- Streaming interruptions
- AI timeouts

External services are unreliable.

Do not assume Mistral or another provider will always respond successfully.

Implement sensible:

- Timeouts
- Retries where safe
- Error classification
- Cancellation
- Fallback behavior where appropriate

Do not retry operations blindly when doing so could duplicate side effects or increase cost.

---

# 29. OBSERVABILITY

Production Cognify must be observable.

Track at minimum:

- API latency
- Error rates
- AI request failures
- AI token usage
- Document processing failures
- Authentication failures
- Database performance
- Background job failures

Use structured logging.

Logs must be useful for debugging without leaking sensitive user data.

Prepare the application for an error monitoring system such as Sentry or an equivalent production monitoring solution.

---

# 30. AI USAGE AND COST TRACKING

AI usage must be tracked from the beginning.

Track information such as:

- User
- Feature
- Model
- Input tokens
- Output tokens
- Request count
- Processing duration
- Request status

This will allow future implementation of:

Free plan

↓

Usage limits

↓

Upgrade

↓

Paid plan

Do not implement billing in the MVP unless explicitly requested.

However, do not architect the AI system in a way that makes usage-based billing difficult later.

---

# 31. BACKGROUND PROCESSING

Potential long-running operations include:

- PDF processing
- Large document parsing
- Embedding generation
- Resume parsing
- Large-scale document analysis

These operations should eventually be compatible with asynchronous processing.

The API should not unnecessarily keep HTTP requests open for expensive operations.

The architecture should be compatible with:

Redis

+

Job Queue

+

Worker

when scale requires it.

Do not introduce Redis or a queue merely for the sake of adding infrastructure. Introduce it when there is an actual workload that benefits from asynchronous processing.

---

# 32. API DESIGN

Use REST-oriented APIs initially.

Examples:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/users/me

POST /api/chats

GET /api/chats

GET /api/chats/:id

POST /api/chats/:id/messages

PATCH /api/chats/:id

DELETE /api/chats/:id

POST /api/documents

GET /api/documents

POST /api/documents/:id/analyze

POST /api/documents/:id/questions

POST /api/resumes

POST /api/resumes/:id/analyze

POST /api/resumes/:id/optimize

POST /api/writing/email

POST /api/writing/cover-letter

POST /api/notes

POST /api/notes/:id/enhance

These are conceptual API boundaries.

Do not blindly implement them if the final domain model indicates a better API design.

API design should remain consistent and resource-oriented.

---

# 33. CODE QUALITY RULES

Write code as if another senior engineer will maintain this project for several years.

Prioritize:

- Clear naming
- Small focused functions
- Single responsibility
- Explicit dependencies
- Low coupling
- High cohesion
- Reusable abstractions where justified
- Predictable control flow
- Consistent error handling
- Consistent validation
- Consistent API contracts

Avoid:

- Giant components
- Giant controllers
- Giant service classes
- God objects
- Circular dependencies
- Deep unnecessary abstractions
- Copy-pasted business logic
- Magic strings
- Magic numbers
- Unused dependencies
- Dead code
- Premature abstraction
- Over-engineering

Do not create abstractions merely because abstraction is theoretically possible.

Create abstractions when they represent a real domain boundary or prevent meaningful duplication.

---

# 34. CONFIGURATION MANAGEMENT

All secrets and environment-specific configuration must come from environment variables.

Never hard-code:

- API keys
- Database credentials
- OAuth secrets
- JWT/session secrets
- Storage credentials
- Production URLs
- Provider credentials

Provide an example environment file documenting required variables without exposing real secrets.

Validate required environment variables when the application starts.

Fail fast when critical configuration is missing.

---

# 35. DEVELOPMENT WORKFLOW

Before implementing a major feature:

1. Understand the feature requirements.
2. Inspect related existing code.
3. Identify affected layers.
4. Design the data flow.
5. Design the API contract.
6. Identify security boundaries.
7. Identify failure scenarios.
8. Implement the backend.
9. Implement the frontend.
10. Test the complete workflow.
11. Review performance.
12. Review security.
13. Refactor obvious technical debt.

Do not implement isolated UI screens without connecting them to the actual architecture.

Do not build fake/mock workflows and consider the feature complete.

---

# 36. CHANGE MANAGEMENT

Before making significant architectural changes, explain:

- What is changing
- Why it is changing
- What problem it solves
- What files/layers are affected
- What tradeoffs exist

Do not silently introduce major architectural patterns that conflict with the established architecture.

If the PRD is ambiguous, identify the ambiguity before making a consequential decision.

If a requirement appears technically problematic, explain the problem and propose the better engineering approach.

Do not blindly follow an instruction that would create an insecure or fundamentally flawed architecture.

---

# 37. TESTING EXPECTATIONS

The application must be tested at multiple levels where appropriate.

Important areas include:

- Authentication
- Authorization
- User ownership
- API validation
- Repository behavior
- AI service behavior
- File validation
- Document processing
- Chat streaming
- Resume analysis
- Error handling

Especially test security boundaries.

For example:

A user must not be able to access another user's conversation merely by changing an ID in the request.

A user must not be able to access another user's document.

A user must not be able to invoke expensive AI functionality without appropriate authorization/rate limits.

---

# 38. MVP DEFINITION OF DONE

A feature is NOT complete merely because the UI works locally.

A feature is complete only when:

- Frontend workflow works end-to-end
- API is validated
- Authentication is enforced
- Authorization is enforced
- Resource ownership is verified
- Errors are handled
- Loading states exist
- Empty states exist
- Failure states exist
- AI failures are handled gracefully
- Database queries are properly indexed
- Sensitive information is not exposed
- Expensive endpoints are rate-limited
- Logs are available
- Environment configuration is secure
- Feature can run in production
- Feature has been tested under realistic usage

---

# 39. IMPLEMENTATION ORDER

Follow this broad development sequence unless there is a strong technical reason to change it.

## Phase 1 — Foundation

Build:

- Repository structure
- Client/server setup
- Environment configuration
- MongoDB connection
- Core application configuration
- Error handling
- Validation system
- Security middleware
- Authentication
- User model
- Session handling
- Frontend design system
- Application shell
- Dashboard
- Deployment foundation

## Phase 2 — AI Chat

Build:

- Conversation model
- Message model
- Chat APIs
- AI service
- Mistral provider
- Streaming
- Chat UI
- Markdown rendering
- Code rendering
- Edit
- Copy
- Stop generation
- History
- Rename
- Delete

## Phase 3 — Document Analysis

Build:

- File upload
- File validation
- Storage
- PDF extraction
- Document processing
- Document model
- Document chunks
- Summary
- Key insights
- Q&A

## Phase 4 — Resume Studio

Build:

- Resume upload
- Resume parsing
- Resume model
- ATS analysis
- Resume analysis
- Resume optimization

## Phase 5 — AI Writing

Build:

- Email Writer
- Cover Letter

## Phase 6 — Notes Enhancer

Build:

- Note creation
- Note persistence
- AI enhancement
- Editing

## Phase 7 — Production Hardening

Perform:

- Security review
- Performance review
- Database optimization
- Rate-limit review
- Logging review
- Monitoring
- Error tracking
- Load testing
- Backup strategy
- Deployment hardening
- Production configuration review

Only after the MVP is stable should post-MVP features be introduced.

---

# 40. FIRST TASK — DO NOT CODE YET

Before writing implementation code, perform a project architecture analysis.

If the repository already contains code:

- Inspect the entire existing structure.
- Identify the current framework setup.
- Identify installed dependencies.
- Identify existing architecture.
- Identify configuration.
- Identify environment handling.
- Identify existing UI components.
- Identify existing API code.
- Identify technical debt.
- Identify architectural conflicts.

If the repository is empty:

Design the initial architecture based on this specification.

Then provide a concise architecture proposal containing:

1. Recommended directory structure
2. Client architecture
3. Server architecture
4. Database architecture
5. Authentication architecture
6. AI architecture
7. File/document architecture
8. API architecture
9. Security architecture
10. Error-handling architecture
11. Observability strategy
12. Development phases
13. Key architectural decisions
14. Important risks and tradeoffs

Do not start implementing the complete application until this architecture has been reviewed.

---

# 41. ENGINEERING DECISION STANDARD

For every important implementation decision, optimize for this order:

1. Correctness
2. Security
3. Maintainability
4. Reliability
5. Performance
6. Scalability
7. Developer experience
8. Implementation simplicity

Do not sacrifice security for convenience.

Do not sacrifice maintainability for speed of initial implementation.

Do not introduce distributed-system complexity before the workload requires it.

Do not optimize prematurely.

But also do not create obvious architectural bottlenecks simply because they are easier to implement.

---

# 42. FINAL INSTRUCTION

You are not building a demo.

You are building the foundation of a real SaaS product.

Assume Cognify may eventually have:

- Thousands or millions of users
- Large document volumes
- High AI request volume
- Multiple AI providers
- Paid subscriptions
- Background workers
- Multiple storage providers
- Web search
- Team workspaces
- Advanced RAG
- Additional AI capabilities

However, do not build all of that now.

Build the MVP with a clean architecture that can grow into that system.

Every feature should be:

**Secure → Correct → Maintainable → Observable → Performant → Scalable**

The final application should feel like a coherent, polished SaaS product rather than a collection of AI API integrations.

Most importantly:

**Do not rush into implementation. Understand the product, design the architecture, establish the foundation, and then build each feature systematically.**