# Cognify AI

**Cognify** is a production-ready AI-powered SaaS platform and productivity workspace. 

The product vision is to provide one unified AI workspace where users can understand information, research topics, create content, and improve their work. The central product philosophy is: **Understand → Research → Create → Improve**.

---

## 🏗️ Architecture & Tech Stack

Cognify follows a decoupled Client/Server architecture.

### Client (Frontend)
- **Framework:** Next.js
- **Language:** JavaScript
- **Styling:** Tailwind CSS
- **Architecture:** Feature-based modular architecture

### Server (Backend)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Architecture:** Layered architecture with Repository-based data access
- **AI Integration:** Mistral AI

---

## 🚀 Core Product Areas (MVP Scope)

Cognify combines several AI tools into one coherent productivity platform, tailored for students, job seekers, and knowledge workers.

1. **Authentication & User Management**
   - Register, Login, Google OAuth, Session Management.
2. **AI Chat**
   - Create chats, streaming responses, markdown/code rendering, edit prompts, manage chat history.
3. **Document Analysis**
   - PDF upload & processing, summarize documents, extract key insights, and Q&A with PDFs.
4. **Resume Studio**
   - Upload and parse resumes, ATS analysis, and basic resume optimization.
5. **AI Writing**
   - Email writer and Cover Letter generation.
6. **Notes Enhancer**
   - Create and enhance notes using AI.

---

## 🔮 Future Vision (Post-MVP)

Cognify is built with extensibility in mind to support future features without requiring architectural rewrites. Future goals include:
- Real-time web search integration inside Chat.
- Advanced research & analysis workflows.
- Text-to-Voice capabilities.
- Advanced ATS optimization & Job matching.
- Team workspaces and shared documents.
- Custom AI Assistants and Browser Extensions.

---

## 🛠️ Development & Testing

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

### Testing (Backend)
The backend uses **Jest** and **Supertest** with an in-memory MongoDB server for isolated integration testing.
```bash
cd server
npm test
```

---
*This repository and documentation are maintained based on the Cognify AI Master Project Engineering Context.*
