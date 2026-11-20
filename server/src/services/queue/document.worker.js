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

// Initialize AI clients
const embeddings = new MistralAIEmbeddings({
  apiKey: envConfig.MISTRAL_API_KEY,
  model: "mistral-embed",
});

const pinecone = new PineconeClient({
  apiKey: envConfig.PINECONE_API_KEY,
});

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

    // ── 4. Embedding & Indexing ──
    await documentRepository.updateDocument(documentId, {
      status: "EMBEDDING",
      progress: 55,
      chunkCount: allChunks.length,
    });
    if (job.updateProgress) await job.updateProgress(55);

    // Save chunks to MongoDB
    if (allChunks.length > 0) {
      await documentRepository.createDocumentChunks(
        allChunks.map((c) => ({
          documentId,
          content: c.content,
          pageNumber: c.pageNumber,
        }))
      );
    }

    // Upsert to Pinecone
    try {
      await documentRepository.updateDocument(documentId, {
        status: "INDEXING",
        progress: 75,
      });
      if (job.updateProgress) await job.updateProgress(75);

      if (allChunks.length > 0 && envConfig.PINECONE_API_KEY && envConfig.MISTRAL_API_KEY) {
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

        const index = pinecone.Index("cognify-rag");
        const batchSize = 100;
        for (let b = 0; b < pineconeRecords.length; b += batchSize) {
          const batch = pineconeRecords.slice(b, b + batchSize);
          await index.upsert(batch);
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
        summary = raw.slice(0, 1000);
      }
    } catch (summaryErr) {
      console.warn("[Document Worker] AI summary generation warning:", summaryErr.message);
      summary = "Summary generation unavailable. Document text was successfully processed and indexed for Q&A.";
      keyInsights = ["Document parsed and ready for questions."];
    }

    // ── 6. Finalize Document Status ──
    const duration = Date.now() - startTime;
    await documentRepository.updateDocument(documentId, {
      status: "READY",
      progress: 100,
      pageCount,
      chunkCount: allChunks.length,
      processingDurationMs: duration,
      summary,
      keyInsights,
      chunks: allChunks.map((c) => ({
        chunkId: c.chunkId,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        contentType: c.contentType,
        tokenCount: c.tokenCount,
      })),
    });
    if (job.updateProgress) await job.updateProgress(100);

    console.log(`[Document Worker] Document ${documentId} processed successfully in ${duration}ms.`);
    return { success: true, pageCount, chunkCount: allChunks.length };
  } catch (error) {
    console.error(`[Document Worker] Error processing document ${documentId}:`, error);
    await documentRepository.updateDocument(documentId, {
      status: "FAILED",
      error: error.message,
    });
    throw error;
  }
};

// Start BullMQ Worker only if Redis is confirmed ready
export let documentWorker = null;

if (redisClient && redisClient.status === "ready") {
  try {
    documentWorker = new Worker("document-processing", processDocumentJob, {
      connection: redisClient,
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
