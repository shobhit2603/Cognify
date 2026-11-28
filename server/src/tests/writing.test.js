import { jest } from "@jest/globals";

// Configurable mock token chunks for testing real writingAI.service.js buffering & fallback
let mockStreamChunks = [
  "SUBJECT: Follow-Up on ",
  "Engineering Sync\n\n",
  "Hi Alex,\n\nThank you for ",
  "taking the time to meet today.",
];

const createMockModel = (modelName) => () => ({
  model: modelName,
  stream: jest.fn(async () => ({
    async *[Symbol.asyncIterator]() {
      for (const text of mockStreamChunks) {
        yield { content: text };
      }
    },
  })),
  invoke: jest.fn(async () => ({
    content: "Follow-Up Engineering Sync",
  })),
});

jest.unstable_mockModule("../providers/groq.provider.js", () => ({
  __esModule: true,
  default: createMockModel("mock-groq-model"),
  getGroqModelInstance: createMockModel("mock-groq-model"),
}));

jest.unstable_mockModule("../providers/mistral.provider.js", () => ({
  __esModule: true,
  default: createMockModel("mock-mistral-model"),
  defaultMistralModel: createMockModel("mock-mistral-model")(),
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");
const { User } = await import("../models/user.model.js");
const { Resume } = await import("../models/resume.model.js");
const { GeneratedContent } = await import(
  "../models/generatedContent.model.js"
);
const { Usage } = await import("../models/usage.model.js");

function parseSseEvents(rawText) {
  return rawText
    .split("\n\n")
    .map((block) => block.trim())
    .filter((block) => block.startsWith("data: "))
    .map((block) => JSON.parse(block.slice(6)));
}

describe("AI Writing Studio Endpoints", () => {
  const userA = {
    name: "Writer One",
    email: "writer1@cognify.ai",
    password: "Password123!",
  };

  const userB = {
    name: "Writer Two",
    email: "writer2@cognify.ai",
    password: "Password123!",
  };

  let cookiesA;
  let cookiesB;
  let userAId;
  let userBId;

  beforeEach(async () => {
    mockStreamChunks = [
      "SUBJECT: Follow-Up on ",
      "Engineering Sync\n\n",
      "Hi Alex,\n\nThank you for ",
      "taking the time to meet today.",
    ];

    await request(app).post("/api/v1/auth/register").send(userA);
    const uA = await User.findOneAndUpdate(
      { email: userA.email },
      { isEmailVerified: true },
      { returnDocument: "after" }
    );
    userAId = uA._id;
    const loginA = await request(app).post("/api/v1/auth/login").send({
      email: userA.email,
      password: userA.password,
    });
    cookiesA = loginA.headers["set-cookie"];

    await request(app).post("/api/v1/auth/register").send(userB);
    const uB = await User.findOneAndUpdate(
      { email: userB.email },
      { isEmailVerified: true },
      { returnDocument: "after" }
    );
    userBId = uB._id;
    const loginB = await request(app).post("/api/v1/auth/login").send({
      email: userB.email,
      password: userB.password,
    });
    cookiesB = loginB.headers["set-cookie"];
  });

  describe("Authentication & Validation Boundaries", () => {
    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/v1/writing");
      expect(res.status).toBe(401);
    });

    it("should reject email-unverified users", async () => {
      const unverified = {
        name: "Unverified Writer",
        email: "unverified-writer@cognify.ai",
        password: "Password123!",
      };
      await request(app).post("/api/v1/auth/register").send(unverified);
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: unverified.email,
        password: unverified.password,
      });

      const res = await request(app)
        .get("/api/v1/writing")
        .set("Cookie", loginRes.headers["set-cookie"]);
      expect(res.status).toBe(403);
    });

    it("should validate cover letter payload requires resumeId or userBackground", async () => {
      const res = await request(app)
        .post("/api/v1/writing/cover-letter")
        .set("Cookie", cookiesA)
        .send({
          jobDescription:
            "We are seeking a Senior Full-Stack Engineer proficient in Node.js and React.",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should validate email payload enums and required fields", async () => {
      const res = await request(app)
        .post("/api/v1/writing/email")
        .set("Cookie", cookiesA)
        .send({
          purpose: "",
          intent: "Confirm meeting",
          context: "Project timeline review",
          tone: "invalid-tone",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Cross-User Ownership Isolation", () => {
    it("should block User B from accessing, editing, pinning, restoring, refining, or deleting User A's draft", async () => {
      const draftA = await GeneratedContent.create({
        userId: userAId,
        type: "email",
        title: "Confidential Board Update",
        subject: "Q4 Board Metrics",
        content: "Confidential draft content.",
        previousContent: "Earlier confidential draft.",
      });

      const getRes = await request(app)
        .get(`/api/v1/writing/${draftA._id}`)
        .set("Cookie", cookiesB);
      expect(getRes.status).toBe(404);

      const patchRes = await request(app)
        .patch(`/api/v1/writing/${draftA._id}`)
        .set("Cookie", cookiesB)
        .send({ content: "Tampered" });
      expect(patchRes.status).toBe(404);

      const pinRes = await request(app)
        .patch(`/api/v1/writing/${draftA._id}/pin`)
        .set("Cookie", cookiesB);
      expect(pinRes.status).toBe(404);

      const restoreRes = await request(app)
        .post(`/api/v1/writing/${draftA._id}/restore`)
        .set("Cookie", cookiesB);
      expect(restoreRes.status).toBe(404);

      const refineRes = await request(app)
        .post(`/api/v1/writing/${draftA._id}/refine`)
        .set("Cookie", cookiesB)
        .send({ action: "shorter" });
      expect(refineRes.status).toBe(404);

      const delRes = await request(app)
        .delete(`/api/v1/writing/${draftA._id}`)
        .set("Cookie", cookiesB);
      expect(delRes.status).toBe(404);

      const stillExists = await GeneratedContent.findById(draftA._id);
      expect(stillExists).not.toBeNull();
      expect(stillExists.content).toBe("Confidential draft content.");
    });

    it("should prevent User B from generating a cover letter using User A's Resume ID", async () => {
      const resumeA = await Resume.create({
        userId: userAId,
        title: "User A Private Resume",
        originalName: "resume-a.pdf",
        storageKey: "resumes/a/original.pdf",
        rawText: "Alex Mercer - Staff Engineer at SecretCorp",
      });

      const res = await request(app)
        .post("/api/v1/writing/cover-letter")
        .set("Cookie", cookiesB)
        .send({
          resumeId: resumeA._id.toString(),
          jobDescription:
            "Looking for a Staff Engineer with distributed systems architecture experience.",
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/resume not found/i);
    });
  });

  describe("SSE Generation, Resilient Subject Buffering & Persistence", () => {
    it("should stream Email subject & body across chunked tokens, persist draft, and record Usage", async () => {
      mockStreamChunks = [
        "**sub",
        'ject: "Project ',
        'Launch Confirmation"**\n\n',
        "Hello Priya,\n\nWe are on track ",
        "for Friday's production release.",
      ];

      const res = await request(app)
        .post("/api/v1/writing/email")
        .set("Cookie", cookiesA)
        .send({
          purpose: "Project Update",
          intent: "Confirm Friday launch readiness",
          context: "All integration tests and QA checks are green.",
          tone: "professional",
          formality: "semi-formal",
          length: "concise",
        });

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/event-stream");

      const events = parseSseEvents(res.text);
      const subjectEvt = events.find((e) => e.event === "subject");
      const doneEvt = events.find((e) => e.event === "done");

      expect(subjectEvt).toBeDefined();
      expect(subjectEvt.subject).toBe("Project Launch Confirmation");
      expect(doneEvt).toBeDefined();
      expect(doneEvt.draft.type).toBe("email");
      expect(doneEvt.draft.subject).toBe("Project Launch Confirmation");
      expect(doneEvt.draft.content).toContain("We are on track");

      const usageRecord = await Usage.findOne({
        userId: userAId,
        feature: "writing",
      });
      expect(usageRecord).not.toBeNull();
      expect(usageRecord.status).toBe("success");
    });

    it("should fall back cleanly to body streaming when model omits SUBJECT: prefix", async () => {
      mockStreamChunks = [
        "Hi Jordan,\n\n",
        "Just following up on our architectural proposal from Tuesday.",
      ];

      const res = await request(app)
        .post("/api/v1/writing/email")
        .set("Cookie", cookiesA)
        .send({
          purpose: "Follow-Up",
          intent: "Check proposal feedback",
          context: "Sent architecture PDF on Tuesday.",
        });

      expect(res.status).toBe(200);
      const events = parseSseEvents(res.text);
      const subjectEvt = events.find((e) => e.event === "subject");
      const doneEvt = events.find((e) => e.event === "done");

      expect(subjectEvt).toBeUndefined();
      expect(doneEvt.draft.content).toContain("Hi Jordan,");
      expect(doneEvt.draft.content).toContain("architectural proposal");
    });

    it("should generate a tailored Cover Letter using user's owned Resume Studio record", async () => {
      mockStreamChunks = [
        "Dear Hiring Team,\n\n",
        "With my background building Node.js and React platforms at Apex Labs, ",
        "I am excited to contribute to Vercel.",
      ];

      const resumeA = await Resume.create({
        userId: userAId,
        title: "Principal Full-Stack Resume",
        originalName: "principal.pdf",
        storageKey: "resumes/a/principal.pdf",
        rawText: "Experience: Lead Engineer at Apex Labs. Skills: Node.js, React, MongoDB.",
        parsedSections: {
          contactInfo: { name: "Writer One" },
          skills: ["Node.js", "React", "MongoDB"],
        },
      });

      const res = await request(app)
        .post("/api/v1/writing/cover-letter")
        .set("Cookie", cookiesA)
        .send({
          resumeId: resumeA._id.toString(),
          targetCompany: "Vercel",
          targetRole: "Senior Full-Stack Engineer",
          jobDescription:
            "Build high-performance developer workflows with Next.js, Node.js, and distributed APIs.",
          tone: "confident",
          length: "medium",
        });

      expect(res.status).toBe(200);
      const events = parseSseEvents(res.text);
      const doneEvt = events.find((e) => e.event === "done");

      expect(doneEvt).toBeDefined();
      expect(doneEvt.draft.type).toBe("cover-letter");
      expect(doneEvt.draft.inputs.resumeId).toBe(resumeA._id.toString());
      expect(doneEvt.draft.inputs.resumeTitle).toBe("Principal Full-Stack Resume");
      expect(doneEvt.draft.content).toContain("Apex Labs");
    });
  });

  describe("Editable Output, Quick Refine, Version Restore & Dashboard Sync", () => {
    it("should allow editing content/subject, refining with backup, restoring previous version, and listing in Dashboard 04", async () => {
      const draft = await GeneratedContent.create({
        userId: userAId,
        type: "email",
        title: "Client Renewal",
        subject: "Renewal Proposal",
        generatedContent: "Initial AI email body.",
        content: "Initial AI email body.",
      });

      // 1. User manually edits output
      const editRes = await request(app)
        .patch(`/api/v1/writing/${draft._id}`)
        .set("Cookie", cookiesA)
        .send({
          subject: "Updated Q1 Renewal Proposal",
          content: "User manually customized email body.",
        });
      expect(editRes.status).toBe(200);
      expect(editRes.body.data.subject).toBe("Updated Q1 Renewal Proposal");
      expect(editRes.body.data.content).toBe(
        "User manually customized email body."
      );

      // 2. User refines draft via SSE (backs up user-edited version to previousContent)
      mockStreamChunks = [
        "SUBJECT: Concise Q1 Renewal\n\n",
        "Shortened executive renewal message.",
      ];
      const refineRes = await request(app)
        .post(`/api/v1/writing/${draft._id}/refine`)
        .set("Cookie", cookiesA)
        .send({ action: "shorter" });

      expect(refineRes.status).toBe(200);
      const refineEvents = parseSseEvents(refineRes.text);
      const refineDone = refineEvents.find((e) => e.event === "done");
      expect(refineDone.draft.content).toBe(
        "Shortened executive renewal message."
      );
      expect(refineDone.draft.previousContent).toBe(
        "User manually customized email body."
      );
      expect(refineDone.draft.previousSubject).toBe(
        "Updated Q1 Renewal Proposal"
      );

      // 3. Restore previous version
      const restoreRes = await request(app)
        .post(`/api/v1/writing/${draft._id}/restore`)
        .set("Cookie", cookiesA);
      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.content).toBe(
        "User manually customized email body."
      );
      expect(restoreRes.body.data.subject).toBe("Updated Q1 Renewal Proposal");
      expect(restoreRes.body.data.previousContent).toBe(
        "Shortened executive renewal message."
      );

      // 4. Verify Dashboard 04 & ALL activity feed integration
      const dash04 = await request(app)
        .get("/api/v1/dashboard/activity?category=04")
        .set("Cookie", cookiesA);
      expect(dash04.status).toBe(200);
      expect(dash04.body.data.totalCount).toBe(1);
      expect(dash04.body.data.items[0]).toMatchObject({
        id: draft._id.toString(),
        categoryCode: "04",
        categoryLabel: "AI Writing",
        subLabel: "Email",
        title: "Client Renewal",
        href: `/writing?id=${draft._id}`,
      });

      const dashAll = await request(app)
        .get("/api/v1/dashboard/activity?category=all")
        .set("Cookie", cookiesA);
      expect(dashAll.status).toBe(200);
      expect(
        dashAll.body.data.items.some((item) => item.categoryCode === "04")
      ).toBe(true);
    });

    it("should toggle pin, filter/search drafts, and delete draft cleanly", async () => {
      const emailDraft = await GeneratedContent.create({
        userId: userAId,
        type: "email",
        title: "Vendor Follow-Up",
        content: "Checking invoice timeline.",
      });
      await GeneratedContent.create({
        userId: userAId,
        type: "cover-letter",
        title: "Stripe Application",
        content: "Cover letter for backend role.",
      });

      const pinRes = await request(app)
        .patch(`/api/v1/writing/${emailDraft._id}/pin`)
        .set("Cookie", cookiesA);
      expect(pinRes.status).toBe(200);
      expect(pinRes.body.data.isPinned).toBe(true);

      const listRes = await request(app)
        .get("/api/v1/writing?type=cover-letter&search=Stripe")
        .set("Cookie", cookiesA);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.items.length).toBe(1);
      expect(listRes.body.data.items[0].title).toBe("Stripe Application");

      const delRes = await request(app)
        .delete(`/api/v1/writing/${emailDraft._id}`)
        .set("Cookie", cookiesA);
      expect(delRes.status).toBe(200);
    });

    it("should buffer long 195-char SUBJECT lines without spilling into body and increment revision on PATCH", async () => {
      const longSubject = "A".repeat(195);
      mockStreamChunks = [
        `SUBJECT: ${longSubject.slice(0, 100)}`,
        `${longSubject.slice(100)}\n\n`,
        "Body starts cleanly here.",
      ];

      const genRes = await request(app)
        .post("/api/v1/writing/email")
        .set("Cookie", cookiesA)
        .send({
          purpose: "Long Subject Check",
          intent: "Verify 240-char header buffer",
          context: "Testing header buffer capacity for 200-char subjects.",
        });

      expect(genRes.status).toBe(200);
      const events = parseSseEvents(genRes.text);
      const subjectEvt = events.find((e) => e.event === "subject");
      const doneEvt = events.find((e) => e.event === "done");

      expect(subjectEvt?.subject).toBe(longSubject);
      expect(doneEvt?.draft?.content).toBe("Body starts cleanly here.");
      expect(doneEvt?.draft?.revision).toBe(0);

      const patch1 = await request(app)
        .patch(`/api/v1/writing/${doneEvt.draft._id}`)
        .set("Cookie", cookiesA)
        .send({ content: "Edited once" });
      expect(patch1.status).toBe(200);
      expect(patch1.body.data.revision).toBe(1);
    });
  });
});
