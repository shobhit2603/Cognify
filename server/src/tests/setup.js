import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import envConfig from "../config/env.config.js"; // just to ensure environment runs
import { jest } from "@jest/globals";

jest.setTimeout(180000);

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB instance
  // Default to mongodb-memory-server dependency default, with optional MONGOMS_VERSION override or local workstation fallback
  const binaryVersion = process.env.MONGOMS_VERSION || (process.platform === "win32" ? "5.0.14" : undefined);

  mongoServer = await MongoMemoryServer.create(
    binaryVersion ? { binary: { version: binaryVersion } } : {}
  );
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
