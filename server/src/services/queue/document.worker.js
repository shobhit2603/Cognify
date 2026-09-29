import { Worker } from "bullmq";
import redisClient from "../../config/redis.config.js";
import { Document } from "../../models/document.model.js";

// Ensure mongoose is connected if this is run as a separate process
// import "../../config/db.config.js";

const processDocumentJob = async (job) => {
  const { documentId, userId, storageKey } = job.data;
  
  try {
    // 1. Update status to QUEUED / PARSING
    await Document.findByIdAndUpdate(documentId, { 
      status: "PARSING", 
      progress: 10,
      processingJobId: job.id
    });
    
    // Placeholder for actual processing (Phase 2 & 3)
    console.log(`Processing document ${documentId} for user ${userId}`);
    await job.updateProgress(20);
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Finalize
    await Document.findByIdAndUpdate(documentId, { 
      status: "READY", 
      progress: 100 
    });
    
    console.log(`Document ${documentId} processed successfully.`);
    return { success: true };
    
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    
    await Document.findByIdAndUpdate(documentId, { 
      status: "FAILED", 
      error: error.message 
    });
    
    throw error; // Let BullMQ handle retries
  }
};

export const documentWorker = new Worker("document-processing", processDocumentJob, {
  connection: redisClient,
  concurrency: 1, // Start with 1 concurrent job to avoid overload
});

documentWorker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has been completed`);
});

documentWorker.on("failed", (job, err) => {
  console.log(`Job with id ${job.id} has failed with ${err.message}`);
});
