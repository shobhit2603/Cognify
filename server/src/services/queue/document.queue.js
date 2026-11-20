import { Queue } from "bullmq";
import redisClient, { isRedisAvailable } from "../../config/redis.config.js";

// Initialize BullMQ Queue only if Redis is confirmed active
export let documentQueue = null;

if (redisClient && isRedisAvailable) {
  try {
    documentQueue = new Queue("document-processing", {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    documentQueue.on("error", (err) => {
      console.warn("[BullMQ Queue Notice]:", err.message);
    });
  } catch (error) {
    console.warn("⚠️ Failed to initialize document processing BullMQ queue:", error.message);
    documentQueue = null;
  }
}

/**
 * Enqueue a document for processing
 * @param {string} documentId - The MongoDB ID of the document
 * @param {string} userId - The ID of the user uploading the document
 * @param {string} storageKey - The S3 storage key of the document
 */
export const enqueueDocumentProcessing = async (documentId, userId, storageKey) => {
  // If Redis is online and ready, use BullMQ
  if (documentQueue && redisClient && redisClient.status === "ready") {
    try {
      const job = await documentQueue.add("process-document", {
        documentId,
        userId,
        storageKey,
      });
      return { queued: true, jobId: job.id };
    } catch (err) {
      console.warn("[BullMQ] Failed to enqueue job, falling back to direct async worker:", err.message);
    }
  }

  // Direct Async Fallback: runs safely in-process without blocking HTTP requests
  import("./document.worker.js")
    .then(({ processDocumentJob }) => {
      setImmediate(async () => {
        try {
          await processDocumentJob({
            data: { documentId, userId, storageKey },
            updateProgress: async () => {},
          });
        } catch (err) {
          console.error("[Async Document Worker Fallback Error]:", err.message);
        }
      });
    })
    .catch((err) => console.error("Worker import error:", err));

  return { queued: true, direct: true };
};
