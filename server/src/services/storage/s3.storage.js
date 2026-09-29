import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import envConfig from "../../config/env.config.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Initialize S3 Client
const s3Client = new S3Client({
  region: envConfig.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
  },
});

export const generatePresignedUrl = async (userId, fileName, mimeType) => {
  const documentId = uuidv4(); // Generate a new ID for the document upfront
  
  // Format: documents/{userId}/{documentId}/original.ext
  const ext = path.extname(fileName) || "";
  const storageKey = `documents/${userId}/${documentId}/original${ext}`;

  const command = new PutObjectCommand({
    Bucket: envConfig.AWS_S3_BUCKET_NAME,
    Key: storageKey,
    ContentType: mimeType,
  });

  // URL expires in 15 minutes
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return {
    documentId,
    storageKey,
    uploadUrl,
  };
};
