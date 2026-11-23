import request from "supertest";
import app from "../app.js";
import { User } from "../models/user.model.js";
import { Note } from "../models/note.model.js";
import { generateAndPersistTitleIfUntitled } from "../services/noteEnhancer.service.js";

describe("Notes and Folders Endpoints", () => {
  const testUser = {
    name: "Notes Test User",
    email: "notestest@cognify.ai",
    password: "password123",
  };

  let cookies;
  let userId;

  beforeEach(async () => {
    // 1. Register and verify user
    await request(app).post("/api/v1/auth/register").send(testUser);
    const userDoc = await User.findOneAndUpdate(
      { email: testUser.email },
      { isEmailVerified: true },
      { returnDocument: "after" }
    );
    userId = userDoc._id;

    // 2. Login to get auth cookies
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    cookies = loginRes.headers["set-cookie"];
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Note Folders Tests
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Note Folders API", () => {
    it("should create a new note folder", async () => {
      const res = await request(app)
        .post("/api/v1/note-folders")
        .set("Cookie", cookies)
        .send({ name: "Work Projects", color: "#84cc16" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Work Projects");
      expect(res.body.data.color).toBe("#84cc16");
    });

    it("should list note folders with note count", async () => {
      // Create folder
      const folderRes = await request(app)
        .post("/api/v1/note-folders")
        .set("Cookie", cookies)
        .send({ name: "College", color: "#38bdf8" });
      const folderId = folderRes.body.data._id;

      // Create note inside that folder
      await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "Lecture 1", originalContent: "Intro to Algorithms", folderId });

      const listRes = await request(app)
        .get("/api/v1/note-folders")
        .set("Cookie", cookies);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.data[0].noteCount).toBe(1);
    });

    it("should update/rename a folder", async () => {
      const folderRes = await request(app)
        .post("/api/v1/note-folders")
        .set("Cookie", cookies)
        .send({ name: "Draft Folder", color: "#fbbf24" });
      const folderId = folderRes.body.data._id;

      const updateRes = await request(app)
        .patch(`/api/v1/note-folders/${folderId}`)
        .set("Cookie", cookies)
        .send({ name: "Renamed Folder", color: "#10b981" });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.name).toBe("Renamed Folder");
      expect(updateRes.body.data.color).toBe("#10b981");
    });

    it("should strictly reject deleting a non-empty folder", async () => {
      // Create folder
      const folderRes = await request(app)
        .post("/api/v1/note-folders")
        .set("Cookie", cookies)
        .send({ name: "Protected Folder", color: "#f43f5e" });
      const folderId = folderRes.body.data._id;

      // Add a note inside
      await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "Crucial Note", originalContent: "Do not lose me", folderId });

      // Attempt to delete folder - MUST BE REJECTED
      const deleteRes = await request(app)
        .delete(`/api/v1/note-folders/${folderId}`)
        .set("Cookie", cookies);

      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.success).toBe(false);
      expect(deleteRes.body.message).toMatch(/cannot delete folder.*contains 1 note/i);
    });

    it("should delete an empty folder successfully", async () => {
      const folderRes = await request(app)
        .post("/api/v1/note-folders")
        .set("Cookie", cookies)
        .send({ name: "Empty Folder", color: "#a855f7" });
      const folderId = folderRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/v1/note-folders/${folderId}`)
        .set("Cookie", cookies);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const listRes = await request(app)
        .get("/api/v1/note-folders")
        .set("Cookie", cookies);
      expect(listRes.body.data.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Notes API CRUD & Search
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Notes API", () => {
    let testFolderId;

    beforeEach(async () => {
      const folderRes = await request(app)
        .post("/api/v1/note-folders")
        .set("Cookie", cookies)
        .send({ name: "General Notes", color: "#84cc16" });
      testFolderId = folderRes.body.data._id;
    });

    it("should create a new note", async () => {
      const res = await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({
          title: "System Design Overview",
          originalContent: "Discuss microservices, event streaming, and DB sharding.",
          folderId: testFolderId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("System Design Overview");
      expect(res.body.data.folderId).toBe(testFolderId);
    });

    it("should list notes with search filter", async () => {
      await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "Kubernetes Cluster Setup", originalContent: "Deploying helm charts" });

      await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "React Performance", originalContent: "Using useMemo and memoization" });

      const searchRes = await request(app)
        .get("/api/v1/notes?search=kubernetes")
        .set("Cookie", cookies);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBe(1);
      expect(searchRes.body.data[0].title).toBe("Kubernetes Cluster Setup");
    });

    it("should update note title and content (debounced auto-save payload)", async () => {
      const createRes = await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "Initial Title", originalContent: "Initial draft" });
      const noteId = createRes.body.data._id;

      const updateRes = await request(app)
        .patch(`/api/v1/notes/${noteId}`)
        .set("Cookie", cookies)
        .send({
          title: "Updated Title",
          originalContent: "Refined and expanded draft with extra details.",
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe("Updated Title");
      expect(updateRes.body.data.originalContent).toContain("Refined and expanded");
    });

    it("should toggle pin status of a note", async () => {
      const createRes = await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "Top Priority Note", originalContent: "Must stay on top" });
      const noteId = createRes.body.data._id;
      expect(createRes.body.data.isPinned).toBe(false);

      // Pin note
      const pinRes = await request(app)
        .patch(`/api/v1/notes/${noteId}/pin`)
        .set("Cookie", cookies);

      expect(pinRes.status).toBe(200);
      expect(pinRes.body.data.isPinned).toBe(true);

      // Unpin note
      const unpinRes = await request(app)
        .patch(`/api/v1/notes/${noteId}/pin`)
        .set("Cookie", cookies);

      expect(unpinRes.status).toBe(200);
      expect(unpinRes.body.data.isPinned).toBe(false);
    });

    it("should move note to a folder or uncategorized", async () => {
      const createRes = await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "Moving Note", originalContent: "Some thoughts" });
      const noteId = createRes.body.data._id;

      // Move to folder
      const moveRes = await request(app)
        .patch(`/api/v1/notes/${noteId}/move`)
        .set("Cookie", cookies)
        .send({ folderId: testFolderId });

      expect(moveRes.status).toBe(200);
      const movedFolderId = moveRes.body.data.folderId?._id || moveRes.body.data.folderId;
      expect(String(movedFolderId)).toBe(String(testFolderId));

      // Move back to uncategorized (null)
      const uncatRes = await request(app)
        .patch(`/api/v1/notes/${noteId}/move`)
        .set("Cookie", cookies)
        .send({ folderId: null });

      expect(uncatRes.status).toBe(200);
      expect(uncatRes.body.data.folderId).toBeNull();
    });

    it("should restore previous enhancement version when available", async () => {
      // Create note directly with previousEnhancedContent
      const noteDoc = await Note.create({
        userId,
        title: "Version Controlled Note",
        originalContent: "Original rough notes",
        enhancedContent: "Version 2 Enhanced Blueprint",
        previousEnhancedContent: "Version 1 Initial Study Guide",
        enhancedMetadata: {
          frameworkUsed: "Study Guide",
          enhancedAt: new Date(),
        },
      });

      const restoreRes = await request(app)
        .post(`/api/v1/notes/${noteDoc._id}/restore`)
        .set("Cookie", cookies);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.enhancedContent).toBe("Version 1 Initial Study Guide");
      expect(restoreRes.body.data.previousEnhancedContent).toBe("Version 2 Enhanced Blueprint");
    });

    it("should delete a note", async () => {
      const createRes = await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "To Be Deleted", originalContent: "Trash me" });
      const noteId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/v1/notes/${noteId}`)
        .set("Cookie", cookies);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const getRes = await request(app)
        .get(`/api/v1/notes/${noteId}`)
        .set("Cookie", cookies);
      expect(getRes.status).toBe(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Enhancement Validation
  // ─────────────────────────────────────────────────────────────────────────────
  describe("Note Enhancement Validation", () => {
    it("should reject enhancement if originalContent is empty", async () => {
      const createRes = await request(app)
        .post("/api/v1/notes")
        .set("Cookie", cookies)
        .send({ title: "Empty Note", originalContent: "" });
      const noteId = createRes.body.data._id;

      const enhanceRes = await request(app)
        .post(`/api/v1/notes/${noteId}/enhance`)
        .set("Cookie", cookies)
        .send({});

      expect(enhanceRes.status).toBe(400);
      expect(enhanceRes.body.success).toBe(false);
      expect(enhanceRes.body.message).toMatch(/content is empty/i);
    });

    it("should auto-generate and persist a title for an untitled note", async () => {
      const noteDoc = await Note.create({
        userId,
        title: "Untitled Note",
        originalContent: "Discuss Docker container orchestration and Kubernetes pods scaling.",
      });

      const title = await generateAndPersistTitleIfUntitled({ note: noteDoc, userId });
      expect(title).toBeDefined();
      expect(typeof title).toBe("string");
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe("Untitled Note");

      // Verify persistence in DB
      const updatedInDb = await Note.findById(noteDoc._id);
      expect(updatedInDb.title).toBe(title);
    });

    it("should NOT overwrite a title if user has already set a custom title", async () => {
      const noteDoc = await Note.create({
        userId,
        title: "Custom User Chosen Title",
        originalContent: "Some meeting notes.",
      });

      const title = await generateAndPersistTitleIfUntitled({ note: noteDoc, userId });
      expect(title).toBeNull();

      // In DB, title must remain unchanged
      const inDb = await Note.findById(noteDoc._id);
      expect(inDb.title).toBe("Custom User Chosen Title");
    });
  });
});
