import ApiError from "../utils/apiError.util.js";
import envConfig from "../config/env.config.js";
import * as s3Storage from "./storage/s3.storage.js";
import * as documentRepository from "../repositories/document.repository.js";
import { enqueueDocumentProcessing } from "./queue/document.queue.js";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getGroqModelInstance } from "../providers/groq.provider.js";

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
 * Initiates document upload by generating an S3 presigned URL
 */
export const requestUploadUrl = async (userId, { fileName, mimeType, size }) => {
  const { storageKey, uploadUrl } = await s3Storage.generatePresignedUrl(
    userId,
    fileName,
    mimeType,
    size
  );

  const document = await documentRepository.createDocument({
    userId,
    originalName: fileName,
    mimeType,
    size,
    storageKey,
    storageProvider: "s3",
    status: "UPLOADED",
    progress: 0,
  });

  return {
    document,
    uploadUrl,
    storageKey,
  };
};

/**
 * Triggers asynchronous background processing of an uploaded document
 */
export const startProcessing = async (documentId, userId) => {
  const document = await documentRepository.findDocumentById(documentId);
  if (!document) {
    throw ApiError(404, "Document not found");
  }

  if (document.userId.toString() !== userId.toString()) {
    throw ApiError(403, "You do not have permission to access this document");
  }

  // Deduplicate active tasks; allow recovery if task lease has expired (>5 minutes without update)
  const inProcessStatuses = ["QUEUED", "PARSING", "CHUNKING", "EMBEDDING", "INDEXING"];
  if (inProcessStatuses.includes(document.status)) {
    const isStale =
      document.updatedAt &&
      Date.now() - new Date(document.updatedAt).getTime() > 5 * 60 * 1000;

    if (!isStale) {
      return {
        success: true,
        status: document.status,
        message: "Document processing is already in progress",
      };
    }
    console.warn(`[Document Service] Document ${documentId} has stale processing state (${document.status}). Redispatching job.`);
  }

  await documentRepository.updateDocument(documentId, {
    status: "QUEUED",
    progress: 5,
  });

  await enqueueDocumentProcessing(documentId, userId, document.storageKey);

  return { success: true, status: "QUEUED" };
};

/**
 * Retrieves paginated documents belonging to a user
 */
export const getDocuments = async (userId, page = 1, limit = 10, search = "") => {
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    documentRepository.findDocumentsByUserId(userId, skip, limit, search),
    documentRepository.countDocumentsByUserId(userId, search),
  ]);

  return {
    documents,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Retrieves a single document by ID with verified ownership and download URL
 */
export const getDocumentById = async (documentId, userId) => {
  const document = await documentRepository.findDocumentById(documentId);
  if (!document) {
    throw ApiError(404, "Document not found");
  }

  if (document.userId.toString() !== userId.toString()) {
    throw ApiError(403, "You do not have permission to access this document");
  }

  let downloadUrl = null;
  try {
    downloadUrl = await s3Storage.generatePresignedDownloadUrl(document.storageKey);
  } catch (err) {
    console.warn("[Document Service] Could not generate download URL:", err.message);
  }

  return {
    ...document.toObject(),
    downloadUrl,
  };
};

/**
 * Retrieves relevant context chunks for a document
 */
async function retrieveDocumentContext(documentId, question) {
  const citations = [];
  const seen = new Set();

  const addCitation = (pageNumber, text) => {
    if (!text) return;
    const key = `${pageNumber}:${text.slice(0, 80).trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push({
        pageNumber: pageNumber || 1,
        text,
      });
    }
  };

  const isConclusionQuery = /\b(conclus|conclude|concluding|takeaway|takeaways|outcome|outcomes|wrap.?up|final|deliverable)\b/i.test(question);
  const isOverviewQuery = /\b(objective|summary|summarize|overview|main goal|main point|about)\b/i.test(question);

  let embedQueryText = question;
  if (isConclusionQuery) {
    embedQueryText = `${question} conclusion concluding remarks final summary key takeaways deliverables outcomes`;
  } else if (isOverviewQuery) {
    embedQueryText = `${question} executive summary overview objectives purpose background`;
  }

  // 1. Try vector retrieval from Pinecone
  if (envConfig.PINECONE_API_KEY && envConfig.MISTRAL_API_KEY) {
    try {
      const index = pinecone.Index(envConfig.PINECONE_INDEX_NAME || "cognify-rag");
      const vector = await embeddings.embedQuery(embedQueryText);

      const queryResult = await index.query({
        vector,
        topK: isConclusionQuery || isOverviewQuery ? 6 : 4,
        includeMetadata: true,
        filter: { documentId: { $eq: String(documentId) } },
      });

      if (queryResult.matches && queryResult.matches.length > 0) {
        for (const match of queryResult.matches) {
          if (match.metadata?.text) {
            addCitation(match.metadata.pageNumber, match.metadata.text);
          }
        }
      }
    } catch (pineconeErr) {
      console.warn("[Document QA] Vector search warning:", pineconeErr.message);
    }
  }

  // If concluding query, also include the final chunk(s) from MongoDB if not already present
  if (isConclusionQuery) {
    try {
      const dbChunks = await documentRepository.findChunksByDocumentId(documentId);
      if (dbChunks && dbChunks.length > 0) {
        const lastChunk = dbChunks[dbChunks.length - 1];
        if (lastChunk?.content) {
          addCitation(lastChunk.pageNumber || 1, lastChunk.content);
        }
      }
    } catch (err) {
      // Non-fatal chunk retrieval error
    }
  }

  // 2. Fallback to MongoDB stored chunks if Pinecone returned no results
  if (citations.length === 0) {
    const dbChunks = await documentRepository.findChunksByDocumentId(documentId);
    if (dbChunks && dbChunks.length > 0) {
      const searchKeywords = embedQueryText
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .split(" ")
        .filter((w) => w.length > 2);

      const scored = dbChunks.map((chunk) => {
        const textLower = chunk.content.toLowerCase();
        const score = searchKeywords.reduce((acc, kw) => (textLower.includes(kw) ? acc + 1 : acc), 0);
        return { chunk, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const topChunks = (scored.length > 0 && scored[0].score > 0 ? scored.slice(0, 5) : dbChunks.slice(0, 4)).map(
        (s) => s.chunk || s
      );

      for (const c of topChunks) {
        addCitation(c.pageNumber || 1, c.content);
      }

      if (isConclusionQuery && dbChunks.length > 0) {
        const lastChunk = dbChunks[dbChunks.length - 1];
        if (lastChunk?.content) {
          addCitation(lastChunk.pageNumber || 1, lastChunk.content);
        }
      }
    }
  }

  return citations;
}

/**
 * Ask a question against a document (returns answer and citations)
 */
export const askDocument = async (documentId, userId, question) => {
  const document = await documentRepository.findDocumentById(documentId);
  if (!document) {
    throw ApiError(404, "Document not found");
  }

  if (document.userId.toString() !== userId.toString()) {
    throw ApiError(403, "You do not have permission to access this document");
  }

  if (document.status !== "READY") {
    throw ApiError(400, `Document is not ready for questions yet (status: ${document.status})`);
  }

  const citations = await retrieveDocumentContext(documentId, question);

  let documentOverview = "";
  if (document.summary) {
    documentOverview += `[Document Summary]:\n${document.summary}\n\n`;
  }
  if (Array.isArray(document.keyInsights) && document.keyInsights.length > 0) {
    documentOverview += `[Key Takeaways & Insights]:\n${document.keyInsights.map((ki) => `• ${ki}`).join("\n")}\n\n`;
  }

  const excerptsBlock = citations.length > 0
    ? citations.map((c, i) => `[Excerpt ${i + 1} - Page ${c.pageNumber}]:\n${c.text}`).join("\n\n---\n\n")
    : "No direct matching excerpts found in this document.";

  const fullContextBlock = documentOverview
    ? `${documentOverview}---\n\n--- DOCUMENT EXCERPTS ---\n${excerptsBlock}`
    : excerptsBlock;

  const groq = getGroqModelInstance();

  const messages = [
    new SystemMessage(
      "You are Cognify Document Analyst. Answer the user's question accurately and objectively using the provided document context, summary, and excerpts.\n" +
      "- When citing specific details, sections, or findings, reference the relevant page number or excerpt (e.g. [Page 2] or [Excerpt 1, p. 2]).\n" +
      "- If the user asks for conclusions, summary, main objective, or key takeaways, synthesize them directly from the document context, summary, and excerpts.\n" +
      "- Only if the user asks for specific factual information that is completely absent from the provided context and cannot be deduced from it, say: 'Based on the provided document excerpts, this information is not mentioned.'"
    ),
    new HumanMessage(
      `Document: "${document.originalName}"\n\n--- DOCUMENT CONTEXT ---\n${fullContextBlock}\n-------------------------\n\nUser Question: ${question}`
    ),
  ];

  const response = await groq.invoke(messages);

  return {
    question,
    answer: response.content,
    citations,
  };
};

/**
 * Stream question answer via SSE generator
 */
export async function* streamAskDocument(documentId, userId, question) {
  const document = await documentRepository.findDocumentById(documentId);
  if (!document) {
    throw ApiError(404, "Document not found");
  }

  if (document.userId.toString() !== userId.toString()) {
    throw ApiError(403, "You do not have permission to access this document");
  }

  if (document.status !== "READY") {
    throw ApiError(400, `Document is not ready for questions yet (status: ${document.status})`);
  }

  const citations = await retrieveDocumentContext(documentId, question);

  let documentOverview = "";
  if (document.summary) {
    documentOverview += `[Document Summary]:\n${document.summary}\n\n`;
  }
  if (Array.isArray(document.keyInsights) && document.keyInsights.length > 0) {
    documentOverview += `[Key Takeaways & Insights]:\n${document.keyInsights.map((ki) => `• ${ki}`).join("\n")}\n\n`;
  }

  const excerptsBlock = citations.length > 0
    ? citations.map((c, i) => `[Excerpt ${i + 1} - Page ${c.pageNumber}]:\n${c.text}`).join("\n\n---\n\n")
    : "No direct matching excerpts found in this document.";

  const fullContextBlock = documentOverview
    ? `${documentOverview}---\n\n--- DOCUMENT EXCERPTS ---\n${excerptsBlock}`
    : excerptsBlock;

  const groq = getGroqModelInstance();

  const messages = [
    new SystemMessage(
      "You are Cognify Document Analyst. Answer the user's question accurately and objectively using the provided document context, summary, and excerpts.\n" +
      "- When citing specific details, sections, or findings, reference the relevant page number or excerpt (e.g. [Page 2] or [Excerpt 1, p. 2]).\n" +
      "- If the user asks for conclusions, summary, main objective, or key takeaways, synthesize them directly from the document context, summary, and excerpts.\n" +
      "- Only if the user asks for specific factual information that is completely absent from the provided context and cannot be deduced from it, say: 'Based on the provided document excerpts, this information is not mentioned.'"
    ),
    new HumanMessage(
      `Document: "${document.originalName}"\n\n--- DOCUMENT CONTEXT ---\n${fullContextBlock}\n-------------------------\n\nUser Question: ${question}`
    ),
  ];

  // Yield citations first
  yield { type: "citations", citations };

  const stream = await groq.stream(messages);
  for await (const chunk of stream) {
    if (chunk.content) {
      yield { type: "chunk", content: chunk.content };
    }
  }
}

/**
 * Deletes a document, its S3 file, vector embeddings, and chunk rows
 */
export const deleteDocument = async (documentId, userId) => {
  const document = await documentRepository.findDocumentById(documentId);
  if (!document) {
    throw ApiError(404, "Document not found");
  }

  if (document.userId.toString() !== userId.toString()) {
    throw ApiError(403, "You do not have permission to delete this document");
  }

  // 1. Delete vectors from Pinecone using vector chunk IDs
  if (envConfig.NODE_ENV !== "test" && pinecone && envConfig.PINECONE_API_KEY) {
    try {
      const chunks = await documentRepository.findChunksByDocumentId(documentId);
      const vectorIds = chunks.map((c) => c.chunkId).filter(Boolean);
      const index = pinecone.Index(envConfig.PINECONE_INDEX_NAME || "cognify-rag");

      // Only attempt Pinecone delete if there are indexed vector IDs
      // Pass options object containing ids array as required by the Pinecone SDK
      if (vectorIds.length > 0) {
        await index.deleteMany({ ids: vectorIds });
      }
    } catch (vectorErr) {
      const isNotFound =
        vectorErr?.status === 404 ||
        vectorErr?.statusCode === 404 ||
        vectorErr?.response?.status === 404 ||
        vectorErr?.cause?.status === 404 ||
        vectorErr?.name === "PineconeNotFoundError" ||
        vectorErr?.name === "NotFoundError" ||
        (typeof vectorErr?.message === "string" &&
          (vectorErr.message.includes("404") ||
           vectorErr.message.toLowerCase().includes("not found") ||
           vectorErr.message.toLowerCase().includes("index not found")));

      if (isNotFound) {
        console.warn(
          "[Document Service] Pinecone index or vectors not found (404), proceeding with document deletion:",
          vectorErr.message
        );
      } else {
        console.error("[Document Service] Failed to delete Pinecone vectors:", vectorErr.message);
        // Propagate error to leave document record available for retry
        throw ApiError(500, `Failed to clean up vector embeddings: ${vectorErr.message}`);
      }
    }
  }

  // 2. Delete from S3 storage (propagate failure to prevent orphaned DB deletions)
  try {
    await s3Storage.deleteObjectFromS3(document.storageKey);
  } catch (storageErr) {
    console.error("[Document Service] Failed to delete file from storage:", storageErr.message);
    throw ApiError(500, `Failed to delete file from storage: ${storageErr.message}`);
  }

  // 3. Delete chunks from MongoDB
  await documentRepository.deleteChunksByDocumentId(documentId);

  // 4. Delete document record
  await documentRepository.deleteDocument(documentId);

  return { success: true, message: "Document deleted successfully" };
};
