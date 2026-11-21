import { Queue } from "bullmq";
import redisClient from "../../config/redis.config.js";

// BullMQ Queue instance
export let documentQueue = null;

export const getDocumentQueue = () => {
  if (!documentQueue && redisClient && redisClient.status === "ready") {
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
      console.warn("⚠️ Failed to initialize BullMQ queue:", error.message);
      documentQueue = null;
    }
  }
  return documentQueue;
};

// Listen on redisClient ready event to initialize queue
if (redisClient) {
  if (redisClient.status === "ready") {
    getDocumentQueue();
  } else {
    redisClient.on("ready", () => {
      getDocumentQueue();
    });
  }
}

/**
 * In-memory set of currently running processing tasks (for deduplication in fallback path)
 */
const activeProcessingSet = new Set();

/**
 * Enqueue a document for processing
 * @param {string} documentId - The MongoDB ID of the document
 * @param {string} userId - The ID of the user uploading the document
 * @param {string} storageKey - The S3 storage key of the document
 */
export const enqueueDocumentProcessing = async (documentId, userId, storageKey) => {
  const queue = getDocumentQueue();

  // If Redis is online and ready, use BullMQ with deterministic jobId to deduplicate
  if (queue && redisClient && redisClient.status === "ready") {
    try {
      const jobId = `doc-${documentId}`;

      // Clean up existing terminal (failed or completed) jobs before adding replacement
      const existingJob = await queue.getJob(jobId);
      if (existingJob) {
        const state = await existingJob.getState();
        if (state === "failed" || state === "completed") {
          await existingJob.remove();
        } else {
          // Active or waiting job already processing
          return { queued: true, jobId: existingJob.id, alreadyRunning: true };
        }
      }

      const job = await queue.add(
        "process-document",
        {
          documentId,
          userId,
          storageKey,
        },
        {
          jobId, // Prevents duplicate jobs from being queued simultaneously
        }
      );
      return { queued: true, jobId: job.id };
    } catch (err) {
      console.warn("[BullMQ] Failed to enqueue job, falling back to direct async worker:", err.message);
    }
  }

  // Deduplicate direct in-process processing
  const docKey = String(documentId);
  if (activeProcessingSet.has(docKey)) {
    return { queued: true, direct: true, alreadyRunning: true };
  }
  activeProcessingSet.add(docKey);

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
        } finally {
          activeProcessingSet.delete(docKey);
        }
      });
    })
    .catch((err) => {
      activeProcessingSet.delete(docKey);
      console.error("Worker import error:", err);
    });

  return { queued: true, direct: true };
};
