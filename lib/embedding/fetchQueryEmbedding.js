// route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { index } from "@/services/pinecone/index.js"; // Adjust as needed
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function searchRelevantQA(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    const embeddingResult = await model.embedContent({
      //content: userMessage,
      content: {
      parts: [{ text: userMessage }],
      },
      taskType: "retrieval_query",
    });

    const embedding = embeddingResult.embedding.values;

    const queryResult = await index.query({
      vector: embedding,
      topK: 10,
      includeMetadata: true,
    });

    // ✅ FIXED: Return metadata with question & answer
    
    const topResults = queryResult.matches.map((match) => ({
      question: match.metadata?.question || "No question found",
      answer: match.metadata?.answer || "No answer found",
      score: match.score,
    }));
    console.log("Query results:", topResults);
    return topResults;
  } catch (err) {
    console.error("Error in Pinecone search:", err);
    return [];
  }
}

