import request from "supertest";
import app from "../app.js";
import { User } from "../models/user.model.js";

describe("Chat Endpoints", () => {
  const testUser = {
    name: "Chat Test User",
    email: "starchtony06@gmail.com",
    password: "password123",
  };

  let cookies;
  let createdChatId;

  beforeEach(async () => {
    // Register and login to get auth cookies
    await request(app).post("/api/v1/auth/register").send(testUser);
    
    // Manually verify user so they can access core features
    await User.updateOne({ email: testUser.email }, { isEmailVerified: true });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    cookies = loginRes.headers["set-cookie"];

    // Pre-create a chat for tests that need it
    const response = await request(app)
      .post("/api/v1/chats")
      .set("Cookie", cookies)
      .send({ title: "Pre-created Chat" });
    createdChatId = response.body.data.chat._id;
  });

  describe("POST /api/v1/chats", () => {
    it("should create a new chat", async () => {
      const response = await request(app)
        .post("/api/v1/chats")
        .set("Cookie", cookies)
        .send({ title: "My First Chat" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.chat).toBeDefined();
      expect(response.body.data.chat.title).toBe("My First Chat");
    });

    it("should fail without auth", async () => {
      const response = await request(app)
        .post("/api/v1/chats")
        .send({ title: "No Auth Chat" });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/chats", () => {
    it("should retrieve all chats for user", async () => {
      const response = await request(app)
        .get("/api/v1/chats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.chats)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe("PATCH /api/v1/chats/:id", () => {
    it("should update the chat title", async () => {
      const response = await request(app)
        .patch(`/api/v1/chats/${createdChatId}`)
        .set("Cookie", cookies)
        .send({ title: "Updated Chat Title" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.chat.title).toBe("Updated Chat Title");
    });
  });

  describe("DELETE /api/v1/chats/:id", () => {
    it("should soft delete the chat", async () => {
      const response = await request(app)
        .delete(`/api/v1/chats/${createdChatId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const getResponse = await request(app)
        .get(`/api/v1/chats/${createdChatId}`)
        .set("Cookie", cookies);

      expect(getResponse.status).toBe(404);
    });
  });
});
