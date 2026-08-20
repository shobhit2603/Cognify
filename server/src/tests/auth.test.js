import request from "supertest";
import app from "../app.js";

describe("Auth Endpoints", () => {
  const testUser = {
    name: "Test User",
    email: "starchtony06@gmail.com",
    password: "password123",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      // Ensure sanitized fields are not present
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should fail to register with an existing email", async () => {
      // First registration
      await request(app).post("/api/v1/auth/register").send(testUser);
      
      // Second registration attempt
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Email is already registered/);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Check for cookies (Refresh and Access Tokens)
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes("accessToken"))).toBe(true);
      expect(cookies.some((c) => c.includes("refreshToken"))).toBe(true);
    });

    it("should fail login with incorrect password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Email Verification", () => {
    let cookies;

    beforeEach(async () => {
      // Register and login to get auth cookies
      await request(app).post("/api/v1/auth/register").send({
        ...testUser,
        email: "starchtony06+verify@gmail.com", // use different email to avoid conflicts
      });
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "starchtony06+verify@gmail.com",
          password: testUser.password,
        });
      cookies = res.headers["set-cookie"];
    });

    it("should resend verification email and fail to verify with invalid OTP", async () => {
      // Test resend
      const resendResponse = await request(app)
        .post("/api/v1/auth/resend-verification")
        .set("Cookie", cookies);

      expect(resendResponse.status).toBe(200);
      expect(resendResponse.body.success).toBe(true);
      expect(resendResponse.body.message).toMatch(/Verification email sent successfully/);

      // Test invalid OTP
      const verifyResponse = await request(app)
        .post("/api/v1/auth/verify-email")
        .set("Cookie", cookies)
        .send({ otp: "000000" });

      expect(verifyResponse.status).toBe(400);
      expect(verifyResponse.body.success).toBe(false);
      expect(verifyResponse.body.message).toMatch(/Invalid OTP/);
    });
  });
});
