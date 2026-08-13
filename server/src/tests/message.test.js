import { jest } from "@jest/globals";

jest.unstable_mockModule("../services/ai.service.js", () => ({
  getTitle: jest.fn().mockResolvedValue({ chatTitle: "Mocked Title" }),
  getAIResponse: async function* () {
    yield { content: "Mocked AI response chunk 1" };
    yield { content: "Mocked AI response chunk 2" };
  }
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");
describe("Message Endpoints", () => {
  const testUser = {
    name: "Message Test User",
    email: "msghtest@example.com",
    password: "password123",
  };

  let cookies;
  let chatId;
  let messageId;

  beforeEach(async () => {
    // Register and login to get auth cookies
    await request(app).post("/api/v1/auth/register").send(testUser);
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    cookies = loginRes.headers["set-cookie"];

    // Create a chat to add messages to
    const chatRes = await request(app)
      .post("/api/v1/chats")
      .set("Cookie", cookies)
      .send({ title: "Chat for messages test" });
    chatId = chatRes.body.data.chat._id;

    // Pre-create a message for tests that need to update/delete
    const msgRes = await request(app)
      .post(`/api/v1/messages/${chatId}`)
      .set("Cookie", cookies)
      .send({ role: "user", content: "Initial message" });
    messageId = msgRes.body.data.message._id;
  });

  describe("POST /api/v1/messages/:chatId", () => {
    it("should add a message to the chat", async () => {
      const response = await request(app)
        .post(`/api/v1/messages/${chatId}`)
        .set("Cookie", cookies)
        .send({ role: "user", content: "Hello, world!" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBeDefined();
      expect(response.body.data.message.content).toBe("Hello, world!");
    });

    it("should fail validation with invalid role", async () => {
      const response = await request(app)
        .post(`/api/v1/messages/${chatId}`)
        .set("Cookie", cookies)
        .send({ role: "invalid", content: "Hello" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/messages/:chatId", () => {
    it("should retrieve messages for the chat", async () => {
      const response = await request(app)
        .get(`/api/v1/messages/${chatId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe("PATCH /api/v1/messages/:id", () => {
    it("should update a user message", async () => {
      const response = await request(app)
        .patch(`/api/v1/messages/${messageId}`)
        .set("Cookie", cookies)
        .send({ content: "Updated hello world!" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message.content).toBe("Updated hello world!");
    });
  });

  describe("DELETE /api/v1/messages/:id", () => {
    it("should delete the message", async () => {
      const response = await request(app)
        .delete(`/api/v1/messages/${messageId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
