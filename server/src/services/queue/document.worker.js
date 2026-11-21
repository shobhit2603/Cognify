import { Worker } from "bullmq";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";

import redisClient from "../../config/redis.config.js";
import envConfig from "../../config/env.config.js";
import * as s3Storage from "../storage/s3.storage.js";
import * as documentRepository from "../../repositories/document.repository.js";
import { getGroqModelInstance } from "../../providers/groq.provider.js";

// Initialize AI clients safely (only if respective API keys are present)
const embeddings = envConfig.MISTRAL_API_KEY
  ? new MistralAIEmbeddings({
      apiKey: envConfig.MISTRAL_API_KEY,
      model: "mistral-embed",
    })
  : null;

const pinecone = envConfig.PINECONE_API_KEY
  ? new PineconeClient({
      apiKey: envConfig.PINECONE_API_KEY,
    })
  : null;

/**
 * Validates that a buffer has a valid PDF magic header (%PDF-)
 */
function isValidPdfBuffer(buffer) {
  if (!buffer || buffer.length < 5) return false;
  // %PDF- in ASCII is 0x25, 0x50, 0x44, 0x46, 0x2D
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

/**
 * Core document processing logic
 */
export const processDocumentJob = async (job) => {
  const { documentId, userId, storageKey } = job.data;
  const startTime = Date.now();

  try {
    const document = await documentRepository.findDocumentById(documentId);
    if (!document) {
      console.warn(`[Document Worker] Document ${documentId} not found in DB.`);
      return { success: false, reason: "Document not found" };
    }

    // ── 1. Fetch file from storage and update status to PARSING ──
    await documentRepository.updateDocument(documentId, {
      status: "PARSING",
      progress: 15,
      processingJobId: job.id || "direct",
    });
    if (job.updateProgress) await job.updateProgress(15);

    console.log(`[Document Worker] Downloading document ${documentId} from S3 key: ${storageKey}`);
    const pdfBuffer = await s3Storage.getObjectBuffer(storageKey);

    // Validate PDF signature before parsing
    if (!isValidPdfBuffer(pdfBuffer)) {
      throw new Error("Invalid file content: uploaded file is not a valid PDF document");
    }

    // ── 2. Parse PDF text per page ──
    const parser = new PDFParse({ data: pdfBuffer });
    const parsedDoc = await parser.load();
    const pageCount = parsedDoc.numPages || 1;
    const textResult = await parser.getText();
    await parser.destroy();

    const pages = textResult.pages || [];
    let combinedText = "";

    // ── 3. Chunking ──
    await documentRepository.updateDocument(documentId, {
      status: "CHUNKING",
      progress: 35,
      pageCount,
    });
    if (job.updateProgress) await job.updateProgress(35);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const allChunks = [];
    let globalIndex = 0;

    for (let i = 0; i < pages.length; i++) {
      const pageNum = pages[i].num || i + 1;
      const pageText = (pages[i].text || "").trim();
      if (!pageText) continue;

      combinedText += `\n[Page ${pageNum}]\n` + pageText;

      const pageSplits = await splitter.splitText(pageText);
      for (const split of pageSplits) {
        allChunks.push({
          chunkId: uuidv4(),
          documentId,
          pageNumber: pageNum,
          chunkIndex: globalIndex++,
          content: split,
          contentType: "text",
          tokenCount: Math.ceil(split.length / 4),
        });
      }
    }

    // Fallback if no page structure was returned
    if (allChunks.length === 0 && textResult.text) {
      combinedText = textResult.text;
      const fallbackSplits = await splitter.splitText(textResult.text);
      for (const split of fallbackSplits) {
        allChunks.push({
          chunkId: uuidv4(),
          documentId,
          pageNumber: 1,
          chunkIndex: globalIndex++,
          content: split,
          contentType: "text",
          tokenCount: Math.ceil(split.length / 4),
        });
      }
    }

    console.log(`[Document Worker] Document ${documentId}: extracted ${pageCount} pages, created ${allChunks.length} chunks.`);

    // ── Pre-persistence check: Guarantee document hasn't been deleted ──
    const stillActive = await documentRepository.findDocumentById(documentId);
    if (!stillActive) {
      console.warn(`[Document Worker] Document ${documentId} was deleted during chunking. Aborting persistence.`);
      return { success: false, reason: "Document deleted" };
    }

    // ── Idempotency: Clean up any prior chunks/vectors before inserting replacements ──
    await documentRepository.deleteChunksByDocumentId(documentId);
    if (pinecone && envConfig.PINECONE_API_KEY) {
      try {
        const index = pinecone.Index(envConfig.PINECONE_INDEX_NAME || "cognify-rag");
        await index.deleteMany({
          filter: { documentId: { $eq: String(documentId) } },
        });
      } catch (cleanErr) {
        console.warn("[Document Worker] Prior vector cleanup notice:", cleanErr.message);
      }
    }

    // ── 4. Embedding & Indexing ──
    await documentRepository.updateDocument(documentId, {
      status: "EMBEDDING",
      progress: 55,
      chunkCount: allChunks.length,
    });
    if (job.updateProgress) await job.updateProgress(55);

    // Save chunks to MongoDB with chunkId
    if (allChunks.length > 0) {
      await documentRepository.createDocumentChunks(
        allChunks.map((c) => ({
          documentId,
          chunkId: c.chunkId,
          content: c.content,
          pageNumber: c.pageNumber,
        }))
      );
    }

    // Upsert to Pinecone (passing options object with records field)
    try {
      await documentRepository.updateDocument(documentId, {
        status: "INDEXING",
        progress: 75,
      });
      if (job.updateProgress) await job.updateProgress(75);

      if (allChunks.length > 0 && pinecone && envConfig.PINECONE_API_KEY && embeddings) {
        const textsToEmbed = allChunks.map((c) => c.content);
        const vectors = await embeddings.embedDocuments(textsToEmbed);

        const pineconeRecords = vectors.map((vec, idx) => ({
          id: allChunks[idx].chunkId,
          values: vec,
          metadata: {
            documentId: String(documentId),
            userId: String(userId),
            pageNumber: allChunks[idx].pageNumber,
            chunkIndex: allChunks[idx].chunkIndex,
            text: allChunks[idx].content,
          },
        }));

        const index = pinecone.Index(envConfig.PINECONE_INDEX_NAME || "cognify-rag");
        const batchSize = 100;
        for (let b = 0; b < pineconeRecords.length; b += batchSize) {
          const batch = pineconeRecords.slice(b, b + batchSize);
          await index.upsert({ records: batch });
        }
        console.log(`[Document Worker] Successfully indexed ${pineconeRecords.length} vectors into Pinecone.`);
      }
    } catch (pineconeErr) {
      console.warn("[Document Worker] Vector indexing warning (falling back to Mongo chunks):", pineconeErr.message);
    }

    // ── 5. Generate Summary and Key Insights via LLM ──
    await documentRepository.updateDocument(documentId, {
      progress: 85,
    });
    if (job.updateProgress) await job.updateProgress(85);

    let summary = "";
    let keyInsights = [];

    try {
      const excerpt = combinedText.slice(0, 7000);
      const groq = getGroqModelInstance();

      const aiResponse = await groq.invoke([
        new SystemMessage(
          "You are an expert document analyst. Analyze the following document text and output a JSON response with two keys:\n" +
          "1. 'summary': A clear, high-level executive summary of 2 to 3 paragraphs describing the document's main message, purpose, and conclusions.\n" +
          "2. 'keyInsights': An array of 5 to 7 concise bullet points highlighting the most important facts, findings, statistics, or recommendations.\n" +
          "Return ONLY valid JSON with no markdown backticks or explanation."
        ),
        new HumanMessage(`Document Content:\n\n${excerpt}\n\nJSON output:`),
      ]);

      const raw = aiResponse.content.trim();
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        summary = parsed.summary || "";
        keyInsights = Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [];
      } else {
        summary = raw;
      }
    } catch (summaryErr) {
      console.warn("[Document Worker] AI summary generation warning:", summaryErr.message);
      summary = "Summary generation failed or was unavailable.";
    }

    // ── Final verification before completing ──
    const finalDoc = await documentRepository.findDocumentById(documentId);
    if (!finalDoc) {
      console.warn(`[Document Worker] Document ${documentId} was removed before final update.`);
      return { success: false, reason: "Document removed" };
    }

    // ── 6. Mark Document as READY ──
    await documentRepository.updateDocument(documentId, {
      status: "READY",
      progress: 100,
      summary,
      keyInsights,
      pageCount,
      chunkCount: allChunks.length,
      processedAt: new Date(),
    });
    if (job.updateProgress) await job.updateProgress(100);

    const duration = Date.now() - startTime;
    console.log(`[Document Worker] Document ${documentId} processed successfully in ${duration}ms.`);

    return { success: true, pageCount, chunkCount: allChunks.length };
  } catch (error) {
    console.error(`[Document Worker] Error processing document ${documentId}:`, error);
    try {
      await documentRepository.updateDocument(documentId, {
        status: "FAILED",
        error: error.message,
      });
    } catch {}
    throw error;
  }
};

// Start BullMQ Worker when Redis is ready
export let documentWorker = null;

export const startDocumentWorker = () => {
  if (!documentWorker && redisClient && redisClient.status === "ready") {
    try {
      const workerConnection = redisClient.duplicate({ maxRetriesPerRequest: null });
      documentWorker = new Worker("document-processing", processDocumentJob, {
        connection: workerConnection,
        concurrency: 2,
      });

      documentWorker.on("completed", (job) => {
        console.log(`[BullMQ Worker] Job ${job.id} completed.`);
      });

      documentWorker.on("failed", (job, err) => {
        console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
      });

      documentWorker.on("error", (err) => {
        console.warn("[BullMQ Worker Notice]:", err.message);
      });
    } catch (workerErr) {
      console.warn("⚠️ Failed to start BullMQ worker:", workerErr.message);
      documentWorker = null;
    }
  }
  return documentWorker;
};

if (redisClient) {
  if (redisClient.status === "ready") {
    startDocumentWorker();
  } else {
    redisClient.on("ready", () => {
      startDocumentWorker();
    });
  }
}
