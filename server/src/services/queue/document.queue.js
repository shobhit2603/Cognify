import { Queue } from "bullmq";
import redisClient from "../../config/redis.config.js";

// Create Document Processing Queue
export const documentQueue = new Queue("document-processing", {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5 seconds initial delay
    },
    removeOnComplete: true, // Keep DB clean, we track status in MongoDB
    removeOnFail: false, // Keep failed jobs for inspection
  },
});

/**
 * Enqueue a document for processing
 * @param {string} documentId - The MongoDB ID of the document
 * @param {string} userId - The ID of the user uploading the document
 * @param {string} storageKey - The S3 storage key of the document
 */
export const enqueueDocumentProcessing = async (documentId, userId, storageKey) => {
  const job = await documentQueue.add("process-document", {
    documentId,
    userId,
    storageKey,
  });
  
  return job;
};
