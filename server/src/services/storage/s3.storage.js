import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import envConfig from "../../config/env.config.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// Initialize S3 Client
const s3Client = new S3Client({
  region: envConfig.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID || "dummy",
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY || "dummy",
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const isLocalMode = () => {
  return (
    !envConfig.AWS_S3_BUCKET_NAME ||
    envConfig.AWS_S3_BUCKET_NAME === "dummy_bucket_name" ||
    !envConfig.AWS_ACCESS_KEY_ID ||
    envConfig.AWS_ACCESS_KEY_ID.includes("dummy")
  );
};

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

/**
 * Resolves a local file path safely within UPLOADS_DIR, rejecting path traversal attempts.
 */
export const resolveSafeLocalPath = (storageKey) => {
  const safePath = path.resolve(UPLOADS_DIR, storageKey);
  if (!safePath.startsWith(UPLOADS_DIR)) {
    throw new Error("Invalid storage key: path traversal detected");
  }
  return safePath;
};

/**
 * Saves a binary buffer to local disk safely
 */
export const saveLocalBuffer = async (storageKey, buffer) => {
  const fullPath = resolveSafeLocalPath(storageKey);
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.promises.writeFile(fullPath, buffer);
  return fullPath;
};

export const generatePresignedUrl = async (userId, fileName, mimeType, size = null) => {
  const documentId = uuidv4();
  const ext = path.extname(fileName) || "";
  const storageKey = `documents/${userId}/${documentId}/original${ext}`;

  if (isLocalMode()) {
    const serverUrl = process.env.SERVER_URL || `http://localhost:${envConfig.PORT || 5000}`;
    const uploadUrl = `${serverUrl}/api/v1/documents/local-storage/upload?key=${encodeURIComponent(storageKey)}`;
    return {
      documentId,
      storageKey,
      uploadUrl,
    };
  }

  const command = new PutObjectCommand({
    Bucket: envConfig.AWS_S3_BUCKET_NAME,
    Key: storageKey,
    ContentType: mimeType,
  });
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return {
    documentId,
    storageKey,
    uploadUrl,
  };
};

/**
 * Downloads the object as a Buffer (checks local storage first, then S3)
 */
export const getObjectBuffer = async (storageKey) => {
  const localPath = resolveSafeLocalPath(storageKey);
  if (fs.existsSync(localPath)) {
    return await fs.promises.readFile(localPath);
  }

  if (isLocalMode()) {
    throw new Error(`Local file not found for key: ${storageKey}`);
  }

  const command = new GetObjectCommand({
    Bucket: envConfig.AWS_S3_BUCKET_NAME,
    Key: storageKey,
  });

  const response = await s3Client.send(command);
  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray);
};

/**
 * Generates a presigned download URL for viewing/downloading the PDF
 */
export const generatePresignedDownloadUrl = async (storageKey) => {
  const localPath = resolveSafeLocalPath(storageKey);
  if (isLocalMode() || fs.existsSync(localPath)) {
    const serverUrl = process.env.SERVER_URL || `http://localhost:${envConfig.PORT || 5000}`;
    return `${serverUrl}/api/v1/documents/local-storage/file?key=${encodeURIComponent(storageKey)}`;
  }

  const command = new GetObjectCommand({
    Bucket: envConfig.AWS_S3_BUCKET_NAME,
    Key: storageKey,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

/**
 * Deletes an object from local storage and/or S3
 */
export const deleteObjectFromS3 = async (storageKey) => {
  try {
    const localPath = resolveSafeLocalPath(storageKey);
    if (fs.existsSync(localPath)) {
      await fs.promises.unlink(localPath);
    }
  } catch (localErr) {
    console.warn(`[Storage] Failed to delete local file for ${storageKey}:`, localErr.message);
  }

  if (!isLocalMode()) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: envConfig.AWS_S3_BUCKET_NAME,
        Key: storageKey,
      });
      await s3Client.send(command);
    } catch (s3Err) {
      const isNotFound =
        s3Err?.name === "NoSuchKey" ||
        s3Err?.name === "NotFound" ||
        s3Err?.$metadata?.httpStatusCode === 404 ||
        (typeof s3Err?.message === "string" && s3Err.message.toLowerCase().includes("not found"));

      if (isNotFound) {
        console.warn(`[Storage] S3 object ${storageKey} already absent, continuing deletion:`, s3Err.message);
      } else {
        throw s3Err;
      }
    }
  }
  return true;
};

/**
 * Directly uploads a buffer to AWS S3 (used for server-assisted upload fallback)
 */
export const uploadBufferToS3 = async (storageKey, buffer, mimeType = "application/pdf") => {
  if (isLocalMode()) return false;
  const command = new PutObjectCommand({
    Bucket: envConfig.AWS_S3_BUCKET_NAME,
    Key: storageKey,
    Body: buffer,
    ContentType: mimeType,
  });
  await s3Client.send(command);
  return true;
};

/**
 * Ensures the S3 bucket has the CORS policy configured for browser PUT uploads
 */
export const configureBucketCors = async () => {
  if (isLocalMode()) return;
  try {
    const { PutBucketCorsCommand } = await import("@aws-sdk/client-s3");
    const command = new PutBucketCorsCommand({
      Bucket: envConfig.AWS_S3_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["PUT", "POST", "GET", "HEAD", "DELETE"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    });
    await s3Client.send(command);
    console.log("[Storage] S3 Bucket CORS configured successfully.");
  } catch (err) {
    console.warn("[Storage] Could not update S3 CORS automatically:", err.message);
  }
};
