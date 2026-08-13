import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";
import envConfig from "../config/env.config.js";

const embeddings = new MistralAIEmbeddings({
  apiKey: envConfig.MISTRAL_API_KEY,
  model: "mistral-embed",
});

const pinecone = new PineconeClient({
  apiKey: envConfig.PINECONE_API_KEY,
});

export async function ragSearch({ query, chatId }) {
  try {
    if (!chatId) throw new Error("chatId is required for RAG search.");
    const normalizedChatId = String(chatId);
    const reqId = uuidv4();
    
    console.log(`[RAG Tool] Request ${reqId} started.`);
    const startTime = Date.now();

    const index = pinecone.Index("cognify-rag"); // Assuming 'cognify-rag' is your target index name
    const vector = await embeddings.embedQuery(query);

    const queryOptions = {
      vector,
      topK: 4,
      includeMetadata: true,
      filter: { chatId: { $eq: normalizedChatId } }
    };

    const queryResult = await index.query(queryOptions);

    console.log(`[RAG Tool] Request ${reqId} completed. Found ${queryResult.matches?.length || 0} matches in ${Date.now() - startTime}ms.`);

    if (queryResult.matches && queryResult.matches.length > 0) {
      const resultText = queryResult.matches.map((match) => {
        return match.metadata?.text || JSON.stringify(match.metadata);
      });
      return resultText.join("\n\n --- \n\n");
    }

    return "No relevant information found in the documents.";
  } catch (error) {
    console.error("Error in ragSearch:", error);
    throw error;
  }
}

export async function ingestPDF(pdfPath, chatId) {
  try {
    if (!chatId) throw new Error("chatId is required for document ingestion.");
    const normalizedChatId = String(chatId);
    const reqId = uuidv4();

    console.log(`[Ingest PDF] Request ${reqId} started.`);
    const startTime = Date.now();

    // 1. Load the PDF
    const loader = new PDFLoader(pdfPath, {
      splitPages: true,
    });
    const rawDocs = await loader.load();

    // 2. Split text into manageable chunks with overlap
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);

    console.log(`Split PDF into ${docs.length} chunks.`);

    // 3. Generate embeddings
    const vectors = await embeddings.embedDocuments(
      docs.map((doc) => doc.pageContent),
    );

    // 4. Format records for Pinecone
    const records = vectors.map((vector, index) => ({
      id: uuidv4(),
      values: vector,
      metadata: {
        text: docs[index].pageContent,
        page: docs[index].metadata?.loc?.pageNumber || 1,
        chatId: normalizedChatId,
      },
    }));

    const index = pinecone.Index("cognify-rag");

    // 5. Batch upsert
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      console.log(`Upserting batch of size ${batch.length}`);
      // using records array directly for modern pinecone SDK
      await index.upsert(batch);
      console.log(`[Ingest PDF] Upserted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log(`[Ingest PDF] Request ${reqId} completed. Ingested ${records.length} chunks in ${Date.now() - startTime}ms.`);

    return { success: true, chunksIngested: records.length };
  } catch (error) {
    console.error("Error in ingestPDF:", error);
    throw error;
  }
}
