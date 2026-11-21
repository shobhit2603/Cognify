import { jest } from "@jest/globals";

// Mock S3 Storage
jest.unstable_mockModule("../services/storage/s3.storage.js", () => ({
  generatePresignedUrl: jest.fn().mockImplementation(async (userId, fileName) => ({
    documentId: "mock-doc-" + Math.random().toString(36).substring(7),
    storageKey: `documents/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}/${fileName}`,
    uploadUrl: "https://mock-s3.amazonaws.com/upload-url",
  })),
  getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from("mock pdf buffer")),
  generatePresignedDownloadUrl: jest.fn().mockResolvedValue("https://mock-s3.amazonaws.com/download-url"),
  deleteObjectFromS3: jest.fn().mockResolvedValue(true),
}));

// Mock BullMQ Queue enqueue
jest.unstable_mockModule("../services/queue/document.queue.js", () => ({
  documentQueue: null,
  enqueueDocumentProcessing: jest.fn().mockResolvedValue({ queued: true, jobId: "mock-job-1" }),
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");
const { User } = await import("../models/user.model.js");

describe("Document Analysis Endpoints", () => {
  const testUser = {
    name: "Doc Test User",
    email: "doctest@cognify.ai",
    password: "password123",
  };

  let cookies;
  let documentId;

  beforeEach(async () => {
    // Register and login to obtain cookies
    await request(app).post("/api/v1/auth/register").send(testUser);

    // Verify user email to pass requireEmailVerification
    await User.updateOne({ email: testUser.email }, { isEmailVerified: true });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    cookies = loginRes.headers["set-cookie"];

    // Create a base document for subsequent tests
    const docRes = await request(app)
      .post("/api/v1/documents/upload-url")
      .set("Cookie", cookies)
      .send({
        fileName: "test_research_paper.pdf",
        mimeType: "application/pdf",
        size: 1024 * 500, // 500 KB
      });

    documentId = docRes.body.data.document._id;
  });

  describe("POST /api/v1/documents/upload-url", () => {
    it("should generate a presigned upload URL for a valid PDF", async () => {
      const response = await request(app)
        .post("/api/v1/documents/upload-url")
        .set("Cookie", cookies)
        .send({
          fileName: "quarterly_financials.pdf",
          mimeType: "application/pdf",
          size: 204800,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.uploadUrl).toBeDefined();
      expect(response.body.data.document).toBeDefined();
      expect(response.body.data.document.status).toBe("UPLOADED");
    });

    it("should reject non-PDF files", async () => {
      const response = await request(app)
        .post("/api/v1/documents/upload-url")
        .set("Cookie", cookies)
        .send({
          fileName: "malicious.exe",
          mimeType: "application/x-msdownload",
          size: 1000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .post("/api/v1/documents/upload-url")
        .send({
          fileName: "unauthorized.pdf",
          mimeType: "application/pdf",
          size: 1000,
        });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/documents", () => {
    it("should list all documents for the user", async () => {
      const response = await request(app)
        .get("/api/v1/documents")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.documents)).toBe(true);
      expect(response.body.data.documents.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe("GET /api/v1/documents/:id", () => {
    it("should retrieve a specific document by ID", async () => {
      const response = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.document._id).toBe(documentId);
      expect(response.body.data.document.downloadUrl).toBeDefined();
    });

    it("should return 404 for a non-existent document ID", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/v1/documents/${fakeId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/documents/:id/process", () => {
    it("should mark the document as QUEUED and enqueue the job", async () => {
      const response = await request(app)
        .post(`/api/v1/documents/${documentId}/process`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("QUEUED");
    });
  });

  describe("DELETE /api/v1/documents/:id", () => {
    it("should delete the document and cleanup resources", async () => {
      const response = await request(app)
        .delete(`/api/v1/documents/${documentId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const checkResponse = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set("Cookie", cookies);

      expect(checkResponse.status).toBe(404);
    });
  });
});
