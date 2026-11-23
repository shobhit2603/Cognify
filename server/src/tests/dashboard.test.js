import request from "supertest";
import app from "../app.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Document } from "../models/document.model.js";
import { Note } from "../models/note.model.js";

describe("Dashboard Activity API", () => {
  const testUser = {
    name: "Dashboard User",
    email: "dashboard@cognify.ai",
    password: "Password123!",
  };

  let cookies;
  let userId;

  beforeEach(async () => {
    // Register and verify test user
    await request(app).post("/api/v1/auth/register").send(testUser);
    const userDoc = await User.findOneAndUpdate(
      { email: testUser.email },
      { isEmailVerified: true },
      { returnDocument: "after" }
    );
    userId = userDoc._id;

    // Login to obtain auth cookies
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    cookies = loginRes.headers["set-cookie"];
  });

  it("should reject unauthenticated request with 401", async () => {
    const res = await request(app).get("/api/v1/dashboard/activity");
    expect(res.status).toBe(401);
  });

  it("should return empty items when user has no activity", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/activity")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.totalCount).toBe(0);
  });

  it("should merge, sort and clamp recent items across multiple categories for category=all", async () => {
    // 1. Create a Chat
    const chat = await Chat.create({
      userId,
      title: "Chat Thread 1",
      updatedAt: new Date("2026-11-20T10:00:00Z"),
    });

    // 2. Create a Document
    const doc = await Document.create({
      userId,
      originalName: "Whitepaper.pdf",
      mimeType: "application/pdf",
      size: 1024,
      storageKey: "documents/whitepaper.pdf",
      updatedAt: new Date("2026-11-22T10:00:00Z"),
    });

    // 3. Create a Note
    const note = await Note.create({
      userId,
      title: "Architecture Decisions",
      originalContent: "Draft content",
      updatedAt: new Date("2026-11-23T10:00:00Z"),
    });

    const res = await request(app)
      .get("/api/v1/dashboard/activity?category=all&limit=8")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCount).toBe(3);
    expect(res.body.data.items).toHaveLength(3);

    // Verify sorted descending by updatedAt (Note is 23rd, Doc is 22nd, Chat is 20th)
    expect(res.body.data.items[0].id).toBe(note._id.toString());
    expect(res.body.data.items[0].categoryCode).toBe("05");
    expect(res.body.data.items[0].categoryLabel).toBe("Notes Enhancer");
    expect(res.body.data.items[0].href).toBe(`/notes?id=${note._id}`);

    expect(res.body.data.items[1].id).toBe(doc._id.toString());
    expect(res.body.data.items[1].categoryCode).toBe("02");
    expect(res.body.data.items[1].categoryLabel).toBe("Document Analysis");
    expect(res.body.data.items[1].href).toBe(`/documents/${doc._id}`);

    expect(res.body.data.items[2].id).toBe(chat._id.toString());
    expect(res.body.data.items[2].categoryCode).toBe("01");
    expect(res.body.data.items[2].categoryLabel).toBe("AI Chat");
    expect(res.body.data.items[2].href).toBe(`/chat/${chat._id}`);
  });

  it("should filter only chats when category=01", async () => {
    await Chat.create({ userId, title: "Chat A" });
    await Document.create({
      userId,
      originalName: "Report.pdf",
      mimeType: "application/pdf",
      size: 500,
      storageKey: "documents/report.pdf",
    });

    const res = await request(app)
      .get("/api/v1/dashboard/activity?category=01")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].categoryCode).toBe("01");
    expect(res.body.data.totalCount).toBe(1);
  });

  it("should filter only documents when category=02", async () => {
    await Document.create({
      userId,
      originalName: "Doc B.pdf",
      mimeType: "application/pdf",
      size: 500,
      storageKey: "documents/docb.pdf",
    });

    const res = await request(app)
      .get("/api/v1/dashboard/activity?category=02")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].categoryCode).toBe("02");
    expect(res.body.data.totalCount).toBe(1);
  });

  it("should filter only notes when category=05", async () => {
    await Note.create({ userId, title: "Meeting Note" });

    const res = await request(app)
      .get("/api/v1/dashboard/activity?category=05")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].categoryCode).toBe("05");
    expect(res.body.data.totalCount).toBe(1);
  });

  it("should return empty array gracefully for unpersisted categories 03 and 04", async () => {
    const res03 = await request(app)
      .get("/api/v1/dashboard/activity?category=03")
      .set("Cookie", cookies);
    expect(res03.status).toBe(200);
    expect(res03.body.data.items).toEqual([]);
    expect(res03.body.data.totalCount).toBe(0);

    const res04 = await request(app)
      .get("/api/v1/dashboard/activity?category=04")
      .set("Cookie", cookies);
    expect(res04.status).toBe(200);
    expect(res04.body.data.items).toEqual([]);
    expect(res04.body.data.totalCount).toBe(0);
  });

  it("should reject invalid category with 400", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/activity?category=99")
      .set("Cookie", cookies);
    expect(res.status).toBe(400);
  });
});
