import { jest } from "@jest/globals";
import fs from "fs";
import path from "path";

const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn().mockResolvedValue("https://mock-s3.amazonaws.com/presigned.pdf");

const mockEnv = {
  PORT: 5000,
  NODE_ENV: "development",
  AWS_REGION: "us-east-1",
  AWS_ACCESS_KEY_ID: "AKIA_TEST_KEY",
  AWS_SECRET_ACCESS_KEY: "test_secret_key",
  AWS_S3_BUCKET_NAME: "test-bucket",
};

jest.unstable_mockModule("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send(...args) {
      return mockSend(...args);
    }
  },
  PutObjectCommand: class {
    constructor(input) {
      this.input = input;
    }
  },
  GetObjectCommand: class {
    constructor(input) {
      this.input = input;
    }
  },
  DeleteObjectCommand: class {
    constructor(input) {
      this.input = input;
    }
  },
}));

jest.unstable_mockModule("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mockGetSignedUrl,
}));

jest.unstable_mockModule("../config/env.config.js", () => ({
  default: mockEnv,
}));

const s3Storage = await import("../services/storage/s3.storage.js");

describe("S3 & Local Storage Fallback Rules", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const testKey = "resumes/test-user/test-id/original.pdf";
  const testBuffer = Buffer.from("%PDF-1.4 test resume");

  const cleanupLocalTestFile = () => {
    const localPath = path.resolve(process.cwd(), "uploads", testKey);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
    mockEnv.NODE_ENV = "development";
    mockEnv.AWS_ACCESS_KEY_ID = "AKIA_TEST_KEY";
    mockEnv.AWS_SECRET_ACCESS_KEY = "test_secret_key";
    mockEnv.AWS_S3_BUCKET_NAME = "test-bucket";
    cleanupLocalTestFile();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    cleanupLocalTestFile();
  });

  it("in production with S3 configured, uploads strictly to S3 and never writes locally", async () => {
    process.env.NODE_ENV = "production";
    mockEnv.NODE_ENV = "production";
    mockSend.mockResolvedValueOnce({});

    const result = await s3Storage.uploadBufferWithDevFallback(testKey, testBuffer);

    expect(result).toEqual({ storageProvider: "s3" });
    expect(mockSend).toHaveBeenCalledTimes(1);
    const localPath = path.resolve(process.cwd(), "uploads", testKey);
    expect(fs.existsSync(localPath)).toBe(false);
  });

  it("in production when S3 upload fails, rejects instead of writing to server/uploads", async () => {
    process.env.NODE_ENV = "production";
    mockEnv.NODE_ENV = "production";
    mockSend.mockRejectedValueOnce(new Error("S3 network failure"));

    await expect(
      s3Storage.uploadBufferWithDevFallback(testKey, testBuffer)
    ).rejects.toThrow(/Failed to upload file to S3 storage/i);

    const localPath = path.resolve(process.cwd(), "uploads", testKey);
    expect(fs.existsSync(localPath)).toBe(false);
  });

  it("in production when S3 env vars are missing, disables local mode and rejects", async () => {
    process.env.NODE_ENV = "production";
    mockEnv.NODE_ENV = "production";
    mockEnv.AWS_S3_BUCKET_NAME = "";

    expect(s3Storage.isLocalMode()).toBe(false);
    await expect(s3Storage.saveLocalBuffer(testKey, testBuffer)).rejects.toThrow(/disabled in production/i);
    await expect(
      s3Storage.uploadBufferWithDevFallback(testKey, testBuffer)
    ).rejects.toThrow(/not configured in production/i);
  });

  it("in development with S3 working, uploads only to S3 without creating a local copy", async () => {
    process.env.NODE_ENV = "development";
    mockEnv.NODE_ENV = "development";
    mockSend.mockResolvedValueOnce({});

    const result = await s3Storage.uploadBufferWithDevFallback(testKey, testBuffer);
    const url = await s3Storage.generatePresignedDownloadUrl(testKey);

    expect(result).toEqual({ storageProvider: "s3" });
    expect(url).toBe("https://mock-s3.amazonaws.com/presigned.pdf");
    const localPath = path.resolve(process.cwd(), "uploads", testKey);
    expect(fs.existsSync(localPath)).toBe(false);
  });

  it("in development when S3 fails, falls back to local disk storage", async () => {
    process.env.NODE_ENV = "development";
    mockEnv.NODE_ENV = "development";
    mockSend.mockRejectedValueOnce(new Error("Temporary S3 error"));

    const result = await s3Storage.uploadBufferWithDevFallback(testKey, testBuffer);

    expect(result).toEqual({ storageProvider: "local" });
    const localPath = path.resolve(process.cwd(), "uploads", testKey);
    expect(fs.existsSync(localPath)).toBe(true);
  });

  it("in development when S3 env vars are missing, falls back to local disk storage", async () => {
    process.env.NODE_ENV = "development";
    mockEnv.NODE_ENV = "development";
    mockEnv.AWS_ACCESS_KEY_ID = "dummy";

    expect(s3Storage.isLocalMode()).toBe(true);
    const result = await s3Storage.uploadBufferWithDevFallback(testKey, testBuffer);

    expect(result).toEqual({ storageProvider: "local" });
    const localPath = path.resolve(process.cwd(), "uploads", testKey);
    expect(fs.existsSync(localPath)).toBe(true);
  });
});
