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
});

const isLocalMode = () => {
  return (
    !envConfig.AWS_S3_BUCKET_NAME ||
    envConfig.AWS_S3_BUCKET_NAME === "dummy_bucket_name" ||
    !envConfig.AWS_ACCESS_KEY_ID ||
    envConfig.AWS_ACCESS_KEY_ID.includes("dummy")
  );
};

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

/**
 * Saves a binary buffer to local disk
 */
export const saveLocalBuffer = async (storageKey, buffer) => {
  const fullPath = path.join(UPLOADS_DIR, storageKey);
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.promises.writeFile(fullPath, buffer);
  return fullPath;
};

export const generatePresignedUrl = async (userId, fileName, mimeType) => {
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
  const localPath = path.join(UPLOADS_DIR, storageKey);
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
  const localPath = path.join(UPLOADS_DIR, storageKey);
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
    const localPath = path.join(UPLOADS_DIR, storageKey);
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
    } catch (error) {
      console.error(`[S3 Storage] Failed to delete object ${storageKey}:`, error.message);
      return false;
    }
  }
  return true;
};
