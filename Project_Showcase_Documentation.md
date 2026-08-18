# Cognify - Project Showcase Documentation

## 1. Project Overview & Purpose

**Cognify** is a production-ready AI-powered SaaS platform and productivity workspace designed for students, job seekers, developers, and knowledge workers.

The core vision of Cognify is to provide one unified AI workspace where users can seamlessly:

- **Understand** information
- **Research** topics
- **Create** content
- **Improve** their work

Instead of relying on a fragmented collection of unrelated AI tools, Cognify brings general AI interaction, document understanding, resume analysis, professional writing, and learning assistance into a single, coherent platform.

## 2. Key Features (MVP Scope)

Cognify consists of several major product areas integrated into one platform:

- **Authentication & Security:** Secure registration, login, Google OAuth, and robust session management.
- **AI Chat:** Interactive chat featuring streaming responses, markdown/code rendering, chat history, and the ability to edit prompts.
- **Document Analysis:** Upload PDFs for automated text extraction, document chunking, summarization, key insights, and context-aware Q&A without sending the entire document to the AI.
- **Resume Studio:** Resume parsing and ATS analysis considering keyword coverage, skills, formatting, and readability, along with targeted resume optimization.
- **AI Writing:** Intelligent Email Writer and Cover Letter generator that uses context, intent, and tone.
- **Notes Enhancer:** A learning tool where users enter short or incomplete notes, and the AI enhances them into structured, clear learning resources (adding explanations, examples, and important concepts).

## 3. Tech Stack

Cognify is built using a decoupled Client/Server architecture to ensure scalability and maintainability.

**Frontend (Client)**

- **Framework:** Next.js
- **Language:** JavaScript
- **Styling:** Tailwind CSS
- **Architecture:** Feature-based modular architecture (isolated components, hooks, and services per feature)

**Backend (Server)**

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Architecture:** Layered architecture (Routes → Controllers → Services → Repositories → MongoDB)

**AI & Integrations**

- **AI Model:** Mistral AI
- **AI Architecture:** Centralized AI service abstraction to manage prompts, token limits, streaming, and provider errors securely.

## 4. How It Works

The application separates the user interface from the business logic:

1. **Client Layer:** Users interact with the Next.js frontend, which is organized into distinct feature modules (e.g., Auth, Chat, Documents).
2. **Server Layer:** The frontend sends REST API requests to the Express.js backend. Controllers handle the HTTP requests and delegate business logic to isolated Services.
3. **Database Layer:** Services interact with Repositories, which abstract the MongoDB persistence layer, ensuring clean data access and security (verifying resource ownership).
4. **AI Layer:** For AI features, the backend's AI Service orchestrates prompt building and securely communicates with Mistral AI, streaming the responses back through the backend to the client in real-time.

## 5. Current Progress

Cognify is currently in active development focusing on the core MVP scope.

- The foundational feature-based frontend architecture and layered backend architecture are established.
- Core database schemas and repository patterns are implemented.
- Active integration of the centralized AI streaming service and the Mistral Provider is underway, along with the foundational authentication module.

## 6. Links

- **GitHub Repository:** https://github.com/shobhit2603/Cognify
