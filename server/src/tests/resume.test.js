import { jest } from "@jest/globals";

// Mock S3 Storage
const mockPdfBuffer = Buffer.from("%PDF-1.4 valid mock pdf binary content for resume test");

jest.unstable_mockModule("../services/storage/s3.storage.js", () => ({
  saveLocalBuffer: jest.fn().mockResolvedValue("/mock/uploads/resumes/test.pdf"),
  getObjectBuffer: jest.fn().mockResolvedValue(mockPdfBuffer),
  generatePresignedDownloadUrl: jest
    .fn()
    .mockResolvedValue("https://mock-storage.cognify.ai/resumes/test.pdf"),
  deleteObjectFromS3: jest.fn().mockResolvedValue(true),
  uploadBufferToS3: jest.fn().mockResolvedValue(true),
  isLocalMode: jest.fn().mockReturnValue(true),
  resolveSafeLocalPath: jest.fn().mockReturnValue("/mock/uploads/resumes/test.pdf"),
}));

// Mock pdf-parse
jest.unstable_mockModule("pdf-parse", () => ({
  PDFParse: class {
    constructor() {}
    async load() {
      return { numPages: 2 };
    }
    async getText() {
      return {
        text: "Alex Mercer\nalex@example.com | (555) 234-5678\nlinkedin.com/in/alexmercer\n\nSUMMARY\nSenior Full-Stack Engineer with 6+ years experience building cloud software.\n\nEXPERIENCE\nLead Full Stack Engineer at Apex Labs\n- Spearheaded GraphQL gateway reducing network hops by 35%.\n\nSKILLS\nTypeScript, Node.js, React, MongoDB, AWS",
        pages: [
          {
            num: 1,
            text: "Alex Mercer\nalex@example.com | (555) 234-5678\nlinkedin.com/in/alexmercer\n\nSUMMARY\nSenior Full-Stack Engineer with 6+ years experience building cloud software.",
          },
          {
            num: 2,
            text: "EXPERIENCE\nLead Full Stack Engineer at Apex Labs\n- Spearheaded GraphQL gateway reducing network hops by 35%.\n\nSKILLS\nTypeScript, Node.js, React, MongoDB, AWS",
          },
        ],
      };
    }
    async destroy() {}
  },
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");
const { User } = await import("../models/user.model.js");

describe("Resume Studio Endpoints (Phase 1)", () => {
  const userA = {
    name: "Candidate One",
    email: "candidate1@cognify.ai",
    password: "Password123!",
  };

  const userB = {
    name: "Candidate Two",
    email: "candidate2@cognify.ai",
    password: "Password123!",
  };

  let cookiesA;
  let cookiesB;

  beforeEach(async () => {
    // Register and verify User A
    await request(app).post("/api/v1/auth/register").send(userA);
    await User.updateOne({ email: userA.email }, { isEmailVerified: true });
    const loginA = await request(app).post("/api/v1/auth/login").send({
      email: userA.email,
      password: userA.password,
    });
    cookiesA = loginA.headers["set-cookie"];

    // Register and verify User B
    await request(app).post("/api/v1/auth/register").send(userB);
    await User.updateOne({ email: userB.email }, { isEmailVerified: true });
    const loginB = await request(app).post("/api/v1/auth/login").send({
      email: userB.email,
      password: userB.password,
    });
    cookiesB = loginB.headers["set-cookie"];
  });

  describe("POST /api/v1/resumes/upload", () => {
    it("should reject upload with empty body", async () => {
      const res = await request(app)
        .post("/api/v1/resumes/upload")
        .set("Cookie", cookiesA)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-PDF binary data", async () => {
      const res = await request(app)
        .post("/api/v1/resumes/upload")
        .set("Cookie", cookiesA)
        .set("Content-Type", "application/pdf")
        .send(Buffer.from("PLAIN TEXT NOT A PDF"));

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/valid PDF/i);
    });

    it("should successfully upload, extract, and persist a valid PDF resume", async () => {
      const res = await request(app)
        .post("/api/v1/resumes/upload?title=Senior%20Software%20Engineer&fileName=Alex_Mercer_CV.pdf")
        .set("Cookie", cookiesA)
        .set("Content-Type", "application/pdf")
        .send(mockPdfBuffer);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data.title).toBe("Senior Software Engineer");
      expect(res.body.data.originalName).toBe("Alex_Mercer_CV.pdf");
      expect(res.body.data.rawText).toContain("Alex Mercer");
      expect(res.body.data.parsedSections.contactInfo.email).toBe("alex@example.com");
      expect(res.body.data.pageCount).toBe(2);
    });
  });

  describe("Resume CRUD & Ownership Security", () => {
    let resumeId;

    beforeEach(async () => {
      const uploadRes = await request(app)
        .post("/api/v1/resumes/upload?title=My%20Primary%20Resume&fileName=Resume_2026.pdf")
        .set("Cookie", cookiesA)
        .set("Content-Type", "application/pdf")
        .send(mockPdfBuffer);

      resumeId = uploadRes.body.data._id;
    });

    it("should list user's resumes with pagination", async () => {
      const res = await request(app)
        .get("/api/v1/resumes")
        .set("Cookie", cookiesA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resumes.length).toBe(1);
      expect(res.body.data.resumes[0]._id).toBe(resumeId);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it("should filter resumes by search query", async () => {
      const matchRes = await request(app)
        .get("/api/v1/resumes?search=Primary")
        .set("Cookie", cookiesA);

      expect(matchRes.status).toBe(200);
      expect(matchRes.body.data.resumes.length).toBe(1);

      const noMatchRes = await request(app)
        .get("/api/v1/resumes?search=NonExistentTitleXYZ")
        .set("Cookie", cookiesA);

      expect(noMatchRes.status).toBe(200);
      expect(noMatchRes.body.data.resumes.length).toBe(0);
    });

    it("should retrieve single resume by ID for the owner", async () => {
      const res = await request(app)
        .get(`/api/v1/resumes/${resumeId}`)
        .set("Cookie", cookiesA);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(resumeId);
      expect(res.body.data.title).toBe("My Primary Resume");
    });

    it("should deny access to non-owner (User B cannot read User A's resume)", async () => {
      const res = await request(app)
        .get(`/api/v1/resumes/${resumeId}`)
        .set("Cookie", cookiesB);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/access denied/i);
    });

    it("should serve PDF file inline with ownership check", async () => {
      const res = await request(app)
        .get(`/api/v1/resumes/${resumeId}/file`)
        .set("Cookie", cookiesA);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/pdf");
      expect(res.headers["content-disposition"]).toContain("inline");
      expect(res.body).toEqual(mockPdfBuffer);
    });

    it("should rename resume title", async () => {
      const res = await request(app)
        .patch(`/api/v1/resumes/${resumeId}`)
        .set("Cookie", cookiesA)
        .send({ title: "Updated Staff Engineer CV" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Staff Engineer CV");
    });

    it("should deny renaming resume by non-owner", async () => {
      const res = await request(app)
        .patch(`/api/v1/resumes/${resumeId}`)
        .set("Cookie", cookiesB)
        .send({ title: "Malicious Rename" });

      expect(res.status).toBe(403);
    });

    it("should delete resume successfully", async () => {
      const delRes = await request(app)
        .delete(`/api/v1/resumes/${resumeId}`)
        .set("Cookie", cookiesA);

      expect(delRes.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/resumes/${resumeId}`)
        .set("Cookie", cookiesA);

      expect(getRes.status).toBe(404);
    });
  });

  describe("Dashboard Activity Feed Integration", () => {
    it("should include resume under category 03 and category all in dashboard activity", async () => {
      await request(app)
        .post("/api/v1/resumes/upload?title=Dashboard%20Activity%20Resume&fileName=Dashboard_Test.pdf")
        .set("Cookie", cookiesA)
        .set("Content-Type", "application/pdf")
        .send(mockPdfBuffer);

      // Check category 03
      const cat03Res = await request(app)
        .get("/api/v1/dashboard/activity?category=03")
        .set("Cookie", cookiesA);

      expect(cat03Res.status).toBe(200);
      expect(cat03Res.body.data.items.length).toBe(1);
      expect(cat03Res.body.data.items[0].categoryCode).toBe("03");
      expect(cat03Res.body.data.items[0].categoryLabel).toBe("Resume Studio");
      expect(cat03Res.body.data.items[0].title).toBe("Dashboard Activity Resume");
      expect(cat03Res.body.data.items[0].href).toMatch(/^\/resume\?id=/);

      // Check category all
      const allRes = await request(app)
        .get("/api/v1/dashboard/activity?category=all")
        .set("Cookie", cookiesA);

      expect(allRes.status).toBe(200);
      const resumeItem = allRes.body.data.items.find((item) => item.categoryCode === "03");
      expect(resumeItem).toBeDefined();
      expect(resumeItem.title).toBe("Dashboard Activity Resume");
    });
  });
});
