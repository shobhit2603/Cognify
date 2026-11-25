import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import envConfig from "../config/env.config.js"; // just to ensure environment runs
import { jest } from "@jest/globals";

jest.setTimeout(180000);

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB instance
  // Use locally cached 5.0.14 on Windows; use modern 7.0.14 on Linux/CI (Ubuntu 22.04+ requires OpenSSL 3.0 / libcrypto.so.3)
  const isWindows = process.platform === "win32";
  const binaryConfig = isWindows ? { version: "5.0.14" } : { version: "7.0.14" };

  mongoServer = await MongoMemoryServer.create({
    binary: binaryConfig,
  });
  const mongoUri = mongoServer.getUri();
  
  // Prevent Mongoose from using an existing connection if tests are run in parallel
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
