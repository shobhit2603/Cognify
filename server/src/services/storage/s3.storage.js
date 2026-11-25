import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StatusCodes } from "http-status-codes";
import envConfig from "../../config/env.config.js";
import ApiError from "../../utils/apiError.util.js";
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

const isProductionEnv = () => (process.env.NODE_ENV || envConfig.NODE_ENV) === "production";

export const isS3Configured = () => {
  return Boolean(
    envConfig.AWS_S3_BUCKET_NAME &&
      envConfig.AWS_S3_BUCKET_NAME !== "dummy_bucket_name" &&
      envConfig.AWS_ACCESS_KEY_ID &&
      !envConfig.AWS_ACCESS_KEY_ID.includes("dummy") &&
      envConfig.AWS_SECRET_ACCESS_KEY &&
      !envConfig.AWS_SECRET_ACCESS_KEY.includes("dummy")
  );
};

export const isLocalMode = () => {
  // Local disk fallback is strictly disabled in production
  if (isProductionEnv()) return false;
  return !isS3Configured();
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
 * Saves a binary buffer to local disk safely (disabled in production)
 */
export const saveLocalBuffer = async (storageKey, buffer) => {
  if (isProductionEnv()) {
    throw ApiError(
      StatusCodes.FORBIDDEN,
      "Local file storage is disabled in production"
    );
  }
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

  if (!isS3Configured()) {
    throw ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "AWS S3 storage is not configured in production"
    );
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
 * Downloads the object as a Buffer (strictly S3 in production; local fallback only outside production)
 */
export const getObjectBuffer = async (storageKey) => {
  if (!isProductionEnv()) {
    const localPath = resolveSafeLocalPath(storageKey);
    if (fs.existsSync(localPath)) {
      return await fs.promises.readFile(localPath);
    }

    if (isLocalMode()) {
      throw new Error(`Local file not found for key: ${storageKey}`);
    }
  } else if (!isS3Configured()) {
    throw ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "AWS S3 storage is not configured in production"
    );
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
  if (!isProductionEnv()) {
    const localPath = resolveSafeLocalPath(storageKey);
    if (isLocalMode() || fs.existsSync(localPath)) {
      const serverUrl = process.env.SERVER_URL || `http://localhost:${envConfig.PORT || 5000}`;
      return `${serverUrl}/api/v1/documents/local-storage/file?key=${encodeURIComponent(storageKey)}`;
    }
  } else if (!isS3Configured()) {
    throw ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "AWS S3 storage is not configured in production"
    );
  }

  const command = new GetObjectCommand({
    Bucket: envConfig.AWS_S3_BUCKET_NAME,
    Key: storageKey,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

/**
 * Deletes an object from S3 (and local storage outside production)
 */
export const deleteObjectFromS3 = async (storageKey) => {
  if (!isProductionEnv()) {
    try {
      const localPath = resolveSafeLocalPath(storageKey);
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
      }
    } catch (localErr) {
      console.warn(`[Storage] Failed to delete local file for ${storageKey}:`, localErr.message);
    }
  }

  if (isS3Configured()) {
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
 * Directly uploads a buffer to AWS S3
 */
export const uploadBufferToS3 = async (storageKey, buffer, mimeType = "application/pdf") => {
  if (!isS3Configured()) {
    if (isProductionEnv()) {
      throw ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "AWS S3 storage is not configured in production"
      );
    }
    return false;
  }
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
 * Uploads buffer to S3 strictly in production.
 * In development/test, writes to server/uploads only if S3 env vars are missing or S3 fails.
 */
export const uploadBufferWithDevFallback = async (
  storageKey,
  buffer,
  mimeType = "application/pdf"
) => {
  const isProd = isProductionEnv();

  if (!isLocalMode()) {
    try {
      const uploaded = await uploadBufferToS3(storageKey, buffer, mimeType);
      if (!uploaded) {
        throw new Error("AWS S3 upload did not complete");
      }
      return { storageProvider: "s3" };
    } catch (s3Err) {
      if (isProd) {
        throw ApiError(
          s3Err?.statusCode || StatusCodes.BAD_GATEWAY,
          `Failed to upload file to S3 storage: ${s3Err.message}`
        );
      }
      console.warn(
        `[Storage] S3 upload failed in ${process.env.NODE_ENV || envConfig.NODE_ENV}, falling back to local storage:`,
        s3Err.message
      );
      await saveLocalBuffer(storageKey, buffer);
      return { storageProvider: "local" };
    }
  }

  if (isProd) {
    throw ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "AWS S3 storage is not configured in production"
    );
  }

  await saveLocalBuffer(storageKey, buffer);
  return { storageProvider: "local" };
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
